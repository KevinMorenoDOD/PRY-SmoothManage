import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { Task } from '../../domain/model/Task';
import type { TaskList } from '../../domain/model/List';
import { TaskService } from '../../application/service/TaskService';
import { TasksHttpAdapter } from '../../infrastructure/api/TasksHttpAdapter';
import { TasksIcon } from '../components/TasksIcon';
import { statusIcon, type TaskStatus } from '../helpers/statusIcon';
import { MarkdownView } from '@shared/design-system';
import './TasksPage.css';

const taskRepository = new TasksHttpAdapter();
const taskService = new TaskService(taskRepository);

const STATUS_ORDER: TaskStatus[] = ['pend', 'prog', 'blk', 'done'];
const STATUS_LABELS: Record<TaskStatus, string> = {
  pend: 'Pending',
  prog: 'In progress',
  blk: 'Blocked',
  done: 'Done',
};

const PRIORITY_LABELS = ['Low', 'Medium', 'High'] as const;
const PRIORITY_COLORS = ['var(--mu)', 'var(--am)', 'var(--rd)'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const todayStr = () => new Date().toISOString().slice(0, 10);
const formatDate = (d: string | null) =>
  d ? `${MONTHS[Number(d.slice(5, 7)) - 1]} ${Number(d.slice(8))}` : '';

export const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [draftTask, setDraftTask] = useState<Partial<Task>>({});
  const [mode, setMode] = useState<'view' | 'edit' | 'new'>('view');
  const [view, setView] = useState<'lista' | 'tab'>('lista');
  const [sideFilter, setSideFilter] = useState<'all' | 'today' | string>('all');
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set());
  const [newTaskInput, setNewTaskInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState<string | null>(null);
  const [badTitle, setBadTitle] = useState(false);
  const [booted, setBooted] = useState(false);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const undoRef = useRef<(() => Promise<void>) | null>(null);
  const toastTimer = useRef<number | null>(null);
  const bootstrapped = useRef(false);

  const currentTask = tasks.find((t) => t.id === currentTaskId) ?? null;

  const visibleTasks = useMemo(() => {
    if (sideFilter === 'today') return tasks.filter((t) => t.dueDate === todayStr());
    if (sideFilter !== 'all') return tasks.filter((t) => t.listId === sideFilter);
    return tasks;
  }, [tasks, sideFilter]);

  const openCount = tasks.filter((t) => t.status !== 'done').length;
  const todayOpen = tasks.filter((t) => t.status !== 'done' && t.dueDate === todayStr()).length;

  const refresh = async () => {
    const [allTasks, allLists] = await Promise.all([
      taskService.getAllTasks(),
      taskService.getAllLists(),
    ]);
    setTasks(allTasks);
    setLists(allLists);
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      const allLists = await taskService.getAllLists();

      if (allLists.length === 0) {
        await taskService.createList('My List');
      }

      await refresh();
      setBooted(true);
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string, undo: () => Promise<void>) => {
    undoRef.current = undo;
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      undoRef.current = null;
    }, 7000);
  };

  const runUndo = async () => {
    const fn = undoRef.current;
    undoRef.current = null;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setToast(null);
    if (fn) await fn();
  };

  const defaultListId = () => {
    if (
      typeof sideFilter === 'string' &&
      sideFilter !== 'all' &&
      sideFilter !== 'today' &&
      lists.some((l) => l.id === sideFilter)
    ) {
      return sideFilter;
    }
    return lists[0]?.id ?? '';
  };

  const resetDrawer = () => {
    setCurrentTaskId(null);
    setDraftTask({});
    setMode('view');
    setBadTitle(false);
  };

  const selectSideFilter = (value: 'all' | 'today' | string) => {
    setSideFilter(value);
    resetDrawer();
  };

  const createList = async () => {
    const name = `New list ${lists.length + 1}`;
    const id = await taskService.createList(name);
    await refresh();
    setSideFilter(id);
    setBooted(true);
    setTimeout(() => {
      const el = titleRef.current;
      if (!el) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }, 0);
  };

  const renameList = async (id: string, value: string) => {
    const list = lists.find((l) => l.id === id);
    const clean = (value || '').trim();
    if (!list || !clean || clean === list.name) return;
    await taskService.renameList(id, clean);
    await refresh();
  };

  const deleteListById = async (id: string) => {
    const list = lists.find((l) => l.id === id);
    if (!list) return;
    const removedTasks = tasks.filter((t) => t.listId === id);

    await taskService.deleteList(id);
    if (sideFilter === id) setSideFilter('all');
    if (currentTaskId && removedTasks.some((t) => t.id === currentTaskId)) resetDrawer();
    await refresh();

    const extra = removedTasks.length
      ? ` with ${removedTasks.length} ${removedTasks.length === 1 ? 'task' : 'tasks'}`
      : '';
    showToast(`List “${list.name}” deleted${extra}`, async () => {
      const newListId = await taskService.restoreList(list);
      for (const t of removedTasks) {
        await taskService.restoreTask({ ...t, listId: newListId });
      }
      await refresh();
      setSideFilter(newListId);
    });
  };

  const quickAddTask = async () => {
    const title = newTaskInput.trim();
    if (!title) return;
    const listId = defaultListId();
    if (!listId) return;
    const id = await taskService.createTask(title, listId);
    if (sideFilter === 'today') {
      await taskService.updateTask(id, title, 'pend', 1, todayStr(), listId, '');
    }
    setNewTaskInput('');
    await refresh();
  };

  const startNewTask = () => {
    setDraftTask({
      title: '',
      status: 'pend',
      priority: 1,
      dueDate: sideFilter === 'today' ? todayStr() : null,
      listId: defaultListId(),
      description: '',
    });
    setMode('new');
    setCurrentTaskId(null);
    setBadTitle(false);
  };

  const openTask = (task: Task) => {
    setCurrentTaskId(task.id);
    setDraftTask({});
    setMode('view');
    setBadTitle(false);
  };

  const startEditTask = (task: Task) => {
    setDraftTask({ ...task });
    setCurrentTaskId(task.id);
    setMode('edit');
    setBadTitle(false);
  };

  const cancelTask = () => {
    if (mode === 'new') {
      resetDrawer();
      return;
    }
    setDraftTask({});
    setMode('view');
    setBadTitle(false);
  };

  const saveTask = async () => {
    const title = (draftTask.title ?? '').trim();
    if (!title) {
      setBadTitle(true);
      return;
    }
    const listId = draftTask.listId || lists[0]?.id || '';
    if (!listId) return;

    const status = draftTask.status ?? 'pend';
    const priority = draftTask.priority ?? 1;
    const dueDate = draftTask.dueDate ?? null;
    const description = draftTask.description ?? '';

    let savedId = draftTask.id;
    if (savedId) {
      await taskService.updateTask(savedId, title, status, priority, dueDate, listId, description);
    } else {
      savedId = await taskService.createTask(title, listId, description);
      await taskService.updateTask(savedId, title, status, priority, dueDate, listId, description);
    }

    setCurrentTaskId(savedId);
    setDraftTask({});
    setMode('view');
    await refresh();
  };

  const deleteTask = async (task: Task) => {
    await taskService.deleteTask(task.id);
    if (currentTaskId === task.id) resetDrawer();
    await refresh();
    showToast('Task deleted', async () => {
      const restoredId = await taskService.restoreTask(task);
      await refresh();
      setCurrentTaskId(restoredId);
      setMode('view');
    });
  };

  const cycleStatus = async (task: Task) => {
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length];
    await taskService.updateTask(task.id, task.title, next, task.priority, task.dueDate, task.listId, task.description);
    await refresh();
  };

  const changeStatus = async (taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    await taskService.updateTask(task.id, task.title, status, task.priority, task.dueDate, task.listId, task.description);
    await refresh();
  };

  const toggleCollapse = (status: TaskStatus) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  const isListView = sideFilter !== 'all' && sideFilter !== 'today';
  const drawerOpen = mode !== 'view' || !!currentTask;
  const selectedList = isListView ? lists.find((l) => l.id === sideFilter) : null;

  if (!booted) {
    return <div className="tasks-app" />;
  }

  const renderDrawer = () => {
    if (mode === 'view' && currentTask) {
      return (
        <>
          <div className="hd2">
            <h3 className="vt">{currentTask.title}</h3>
            <button className="ib" title="Close" onClick={resetDrawer}>
              <TasksIcon name="x" size={16} />
            </button>
          </div>
          <dl className="dl">
            <dt>Status</dt>
            <dd className="sv">
              {statusIcon(currentTask.status, 16)} {STATUS_LABELS[currentTask.status]}
            </dd>
            <dt>Priority</dt>
            <dd style={{ color: PRIORITY_COLORS[currentTask.priority], fontWeight: 600 }}>
              {PRIORITY_LABELS[currentTask.priority]}
            </dd>
            <dt>Due date</dt>
            <dd>{currentTask.dueDate ? formatDate(currentTask.dueDate) : 'No date'}</dd>
            <dt>List</dt>
            <dd>{lists.find((l) => l.id === currentTask.listId)?.name ?? ''}</dd>
          </dl>
          <div className="vx">
            <small>Description</small>
            {currentTask.description ? (
              <MarkdownView text={currentTask.description} />
            ) : (
              <p style={{ color: 'var(--mu)' }}>No description</p>
            )}
          </div>
          <div className="acts">
            <button className="btn g d" onClick={() => void deleteTask(currentTask)}>
              <TasksIcon name="trash" size={15} /> Delete
            </button>
            <button className="btn p" onClick={() => startEditTask(currentTask)}>
              <TasksIcon name="pencil" size={15} /> Edit
            </button>
          </div>
        </>
      );
    }

    const isNew = mode === 'new';
    const selectedListId = draftTask.listId ?? (lists[0]?.id ?? '');

    return (
      <>
        <h3>{isNew ? 'New task' : 'Edit task'}</h3>
        <label>
          Title
          <input
            className={badTitle ? 'bad' : ''}
            placeholder="What needs to be done?"
            value={draftTask.title ?? ''}
            onChange={(e) => {
              setDraftTask((p) => ({ ...p, title: e.target.value }));
              setBadTitle(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void saveTask();
              }
            }}
          />
        </label>
        <label>
          Status
          <div className="sts">
            {STATUS_ORDER.map((s) => (
              <button
                type="button"
                key={s}
                className={draftTask.status === s ? 'on' : ''}
                onClick={() => setDraftTask((p) => ({ ...p, status: s }))}
              >
                {statusIcon(s, 16)}
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </label>
        <label>
          Priority
          <select
            value={draftTask.priority ?? 1}
            onChange={(e) =>
              setDraftTask((p) => ({ ...p, priority: Number(e.target.value) as 0 | 1 | 2 }))
            }
          >
            {PRIORITY_LABELS.map((label, i) => (
              <option key={label} value={i}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Due date
          <input
            type="date"
            value={draftTask.dueDate ?? ''}
            onChange={(e) =>
              setDraftTask((p) => ({ ...p, dueDate: e.target.value || null }))
            }
          />
        </label>
        <label>
          List
          <select
            value={selectedListId}
            onChange={(e) => setDraftTask((p) => ({ ...p, listId: e.target.value }))}
          >
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Description (markdown)
          <textarea
            value={draftTask.description ?? ''}
            onChange={(e) => setDraftTask((p) => ({ ...p, description: e.target.value }))}
          />
        </label>
        <div className="acts">
          <button className="btn g" onClick={cancelTask}>
            Cancel
          </button>
          <button className="btn p" onClick={() => void saveTask()}>
            {isNew ? 'Create task' : 'Save changes'}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="tasks-app">

      <aside className="l box">
        <h4>Views</h4>
        <div
          className={`r${sideFilter === 'all' ? ' on' : ''}`}
          onClick={() => selectSideFilter('all')}
        >
          <TasksIcon name="all" size={16} />
          <span style={{ flex: 1 }}>All</span>
          <em>{openCount}</em>
        </div>
        <div
          className={`r${sideFilter === 'today' ? ' on' : ''}`}
          onClick={() => selectSideFilter('today')}
        >
          <TasksIcon name="sun" size={16} />
          <span style={{ flex: 1 }}>Today</span>
          <em>{todayOpen}</em>
        </div>

        <h4>
          Lists
          <button className="ib" title="New list" onClick={() => void createList()}>
            <TasksIcon name="plus" size={16} />
          </button>
        </h4>
        {lists.map((l) => (
          <div
            key={l.id}
            className={`r${sideFilter === l.id ? ' on' : ''}`}
            onDoubleClick={() => {
              setSideFilter(l.id);
              setTimeout(() => titleRef.current?.focus(), 0);
            }}
            onClick={() => setSideFilter(l.id)}
          >
            <TasksIcon name="list" size={16} />
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {l.name}
            </span>
            <em>{tasks.filter((t) => t.listId === l.id && t.status !== 'done').length}</em>
            <button
              className="rm"
              title="Delete list"
              onClick={(e) => {
                e.stopPropagation();
                void deleteListById(l.id);
              }}
            >
              <TasksIcon name="trash" size={15} />
            </button>
          </div>
        ))}
      </aside>

      <main>
        <div className="top">
          <h1
            key={isListView ? sideFilter : 'static'}
            ref={titleRef}
            contentEditable={isListView}
            suppressContentEditableWarning
            title={isListView ? 'Click to rename list' : undefined}
            onBlur={(e) => {
              if (isListView && typeof sideFilter === 'string') {
                void renameList(sideFilter, e.currentTarget.textContent || '');
              }
            }}
            onKeyDown={(e: ReactKeyboardEvent<HTMLHeadingElement>) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
            }}
            style={{ padding: '1px 6px' }}
          >
            {sideFilter === 'today' ? 'Today' : sideFilter === 'all' ? 'All tasks' : selectedList?.name ?? ''}
          </h1>
          <span className="sp" />
          {isListView && (
            <button id="dlb" title="Delete list" onClick={() => void deleteListById(sideFilter)}>
              <TasksIcon name="trash" size={16} />
              <span>Delete list</span>
            </button>
          )}
          <div className="seg">
            <button className={view === 'lista' ? 'on' : ''} onClick={() => setView('lista')}>
              <TasksIcon name="list" size={14} /> List
            </button>
            <button className={view === 'tab' ? 'on' : ''} onClick={() => setView('tab')}>
              <TasksIcon name="tab" size={14} /> Board
            </button>
          </div>
          <button className="btn p" onClick={startNewTask}>
            <TasksIcon name="plus" size={16} /> New task
          </button>
        </div>

        <label className="add">
          <TasksIcon name="plus" size={16} />
          <input
            placeholder="New task, then press Enter"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void quickAddTask();
              }
            }}
          />
        </label>

        <div id="body">
          {view === 'lista' ? (
            visibleTasks.length === 0 ? (
              <div className="em">No tasks here. Type above to create the first one.</div>
            ) : (
              STATUS_ORDER.map((s) => {
                const group = visibleTasks.filter((t) => t.status === s);
                if (!group.length) return null;
                const isCollapsed = collapsed.has(s);
                return (
                  <section key={s}>
                    <div className="gh" onClick={() => toggleCollapse(s)}>
                      <span className={`ch${isCollapsed ? '' : ' o'}`}>
                        <TasksIcon name="chev" size={14} />
                      </span>
                      {statusIcon(s, 16)}
                      {STATUS_LABELS[s]}
                      <em>{group.length}</em>
                    </div>
                    {!isCollapsed &&
                      group.map((t) => (
                        <div
                          key={t.id}
                          className={`tr${t.id === currentTaskId ? ' on' : ''}`}
                          onClick={() => openTask(t)}
                        >
                          <button
                            className="sb"
                            title="Change status"
                            onClick={(e) => {
                              e.stopPropagation();
                              void cycleStatus(t);
                            }}
                          >
                            {statusIcon(t.status, 14)}
                          </button>
                          <span className={`tt${t.status === 'done' ? ' dn' : ''}`}>{t.title}</span>
                          {(sideFilter === 'all' || sideFilter === 'today') && (
                            <span className="lc">
                              {lists.find((l) => l.id === t.listId)?.name ?? ''}
                            </span>
                          )}
                          <span className="pr" style={{ color: PRIORITY_COLORS[t.priority] }}>
                            {PRIORITY_LABELS[t.priority]}
                          </span>
                          <span className="dt">{formatDate(t.dueDate)}</span>
                          <button
                            className="rm"
                            title="Delete task"
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteTask(t);
                            }}
                          >
                            <TasksIcon name="trash" size={15} />
                          </button>
                        </div>
                      ))}
                  </section>
                );
              })
            )
          ) : (
            <div className="bd">
              {STATUS_ORDER.map((s) => {
                const group = visibleTasks.filter((t) => t.status === s);
                return (
                  <div
                    key={s}
                    className="cl"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('ov');
                    }}
                    onDragLeave={(e) => e.currentTarget.classList.remove('ov')}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ov');
                      if (dragTask) void changeStatus(dragTask, s);
                      setDragTask(null);
                    }}
                  >
                    <h5>
                      {statusIcon(s, 16)}
                      {STATUS_LABELS[s]}
                      <em>{group.length}</em>
                    </h5>
                    {group.map((t) => (
                      <div
                        key={t.id}
                        className={`cd${t.id === currentTaskId ? ' on' : ''}${dragTask === t.id ? ' drag' : ''}`}
                        draggable
                        onDragStart={() => setDragTask(t.id)}
                        onDragEnd={() => setDragTask(null)}
                        onClick={() => openTask(t)}
                      >
                        <span className={t.status === 'done' ? 'dn' : ''}>{t.title}</span>
                        <span style={{ display: 'flex', gap: 8, fontSize: 12, alignItems: 'center' }}>
                          <b style={{ color: PRIORITY_COLORS[t.priority] }}>
                            {PRIORITY_LABELS[t.priority]}
                          </b>
                          <span style={{ color: 'var(--mu)' }}>{formatDate(t.dueDate)}</span>
                          <button
                            className="rm"
                            title="Delete task"
                            style={{ marginLeft: 'auto' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteTask(t);
                            }}
                          >
                            <TasksIcon name="trash" size={15} />
                          </button>
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <aside
        className="dp box"
        hidden={!drawerOpen}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && mode !== 'view') {
            e.stopPropagation();
            cancelTask();
          }
        }}
      >
        {drawerOpen && renderDrawer()}
      </aside>

      {toast && (
        <div id="ts">
          <span>{toast}</span>
          <button onClick={() => void runUndo()}>Undo</button>
        </div>
      )}
    </div>
  );
};
