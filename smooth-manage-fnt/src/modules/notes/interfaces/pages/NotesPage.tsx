import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  DragEvent as ReactDragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import type { Note } from '../../domain/model/Note';
import {
  MAX_TITLE_LENGTH,
  draftToNote,
  noteToDraft,
} from '../../domain/model/noteDraft';
import { NoteService } from '../../application/service/NoteService';
import { NotesHttpAdapter } from '../../infrastructure/api/NotesHttpAdapter';
import { NotesIcon } from '../components/NotesIcon';
import { MarkdownToolbar } from '../components/MarkdownToolbar';
import {
  applyMarkdownAction,
  type MarkdownAction,
} from '../helpers/markdownEditor';
import { MarkdownView } from '@shared/design-system';
import './NotesPage.css';

const noteRepository = new NotesHttpAdapter();
const noteService = new NoteService(noteRepository);

type Mode = 'ed' | 'rd';
type Renaming = { type: 'n' | 'f'; key: string } | null;
type DragNode =
  | { kind: 'note'; id: string }
  | { kind: 'folder'; path: string };

const DRAG_MIME = 'application/x-smoothmanage-note-node';

interface Snapshot {
  notes: { note: Note; openIndex: number }[];
  folders: string[];
  current: string | null;
  selectedFolder: string;
  open: string[];
}

interface TreeNode {
  folders: Map<string, TreeNode>;
  notes: Note[];
}

const createNode = (): TreeNode => ({ folders: new Map(), notes: [] });

const uniqueName = (base: string, taken: (name: string) => boolean) => {
  let name = base;
  let i = 2;
  while (taken(name)) name = `${base} ${i++}`;
  return name;
};

export const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('ed');
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState('');
  const [renaming, setRenaming] = useState<Renaming>(null);
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const dragNodeRef = useRef<DragNode | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLElement>(null);
  const resizingRef = useRef(false);
  const lastRef = useRef<Snapshot | null>(null);
  const toastTimer = useRef<number | null>(null);
  const bootstrapped = useRef(false);
  const focusBodyRef = useRef(false);

  const currentNote = notes.find((n) => n.id === current) ?? null;

  const refresh = async () => {
    const [allNotes, allFolders] = await Promise.all([
      noteService.searchNotes(''),
      noteService.getAllFolders(),
    ]);
    setNotes(allNotes);
    setFolders(allFolders);
  };

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const bootstrap = async () => {
      const [allNotes, allFolders] = await Promise.all([
        noteService.searchNotes(''),
        noteService.getAllFolders(),
      ]);

      setNotes(allNotes);
      setFolders(allFolders);
      const initialOpen = allNotes.slice(0, 2).map((n) => n.id);
      setOpen(initialOpen);
      setCurrent(initialOpen[0] ?? null);
      setSelectedFolder(allNotes[0]?.folderPath ?? '');
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    const nextDraft = currentNote ? noteToDraft(currentNote) : '';
    setDraft(nextDraft);

    if (focusBodyRef.current) {
      focusBodyRef.current = false;
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.focus();
        const end = el.value.length;
        el.setSelectionRange(end, end);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  useEffect(() => {
    const el = titleRef.current;
    if (!el || document.activeElement === el) return;
    el.textContent = currentNote?.name ?? '';
  }, [currentNote?.name, currentNote?.id]);

  useEffect(() => {
    const stored = Number(localStorage.getItem('notas-sw'));
    if (stored && containerRef.current) {
      containerRef.current.style.setProperty('--sw', `${Math.max(200, Math.min(stored, 560))}px`);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList?.contains('rn') || target.id === 'bt') return;
      if (e.key === 'F2' && current && !renaming) {
        e.preventDefault();
        setRenaming({ type: 'n', key: current });
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setMode((m) => (m === 'ed' ? 'rd' : 'ed'));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [current, renaming]);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      lastRef.current = null;
    }, 8000);
  };

  const toggleCollapse = (path: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const openNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    setOpen((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setCurrent(id);
    if (note) setSelectedFolder(note.folderPath || '');
  };

  const closeTab = (id: string) => {
    const nextOpen = open.filter((x) => x !== id);
    setOpen(nextOpen);
    if (current === id) setCurrent(nextOpen[nextOpen.length - 1] ?? null);
  };

  const newNote = async () => {
    const name = uniqueName('Untitled', (value) =>
      notes.some((n) => n.name === value && (n.folderPath || '') === selectedFolder)
    );
    const id = await noteService.createNote(name, selectedFolder, '');
    await refresh();
    setOpen((prev) => [...prev, id]);
    setMode('ed');
    focusBodyRef.current = true;
    setCurrent(id);
  };

  const newFolder = async () => {
    const name = uniqueName('New folder', (value) =>
      folders.includes(selectedFolder ? `${selectedFolder}/${value}` : value)
    );
    const path = selectedFolder ? `${selectedFolder}/${name}` : name;
    await noteService.createFolder(path);
    await refresh();
    setSelectedFolder(path);
    setRenaming({ type: 'f', key: path });
  };

  const commitRename = async (value: string) => {
    if (!renaming) return;
    const target = renaming;
    setRenaming(null);

    const clean = (value || '')
      .replace(/\s+/g, ' ')
      .replace(/[/"]/g, '-')
      .trim()
      .slice(0, MAX_TITLE_LENGTH);
    if (!clean) return;

    if (target.type === 'n') {
      const note = notes.find((n) => n.id === target.key);
      if (note && clean !== note.name) {
        const content =
          note.id === current ? draftToNote(draft, note.name).content : note.body;
        await noteService.updateNote(note.id, clean, note.folderPath, content);
        if (note.id === current) setDraft(noteToDraft({ ...note, name: clean, body: content }));
        await refresh();
      }
      return;
    }

    const parent = target.key.includes('/')
      ? target.key.slice(0, target.key.lastIndexOf('/'))
      : '';
    const nextPath = parent ? `${parent}/${clean}` : clean;
    if (nextPath === target.key || folders.includes(nextPath)) return;

    await noteService.renameFolder(target.key, nextPath);
    setCollapsed((prev) => {
      const next = new Set<string>();
      prev.forEach((p) => {
        next.add(
          p === target.key || p.startsWith(target.key + '/')
            ? nextPath + p.slice(target.key.length)
            : p
        );
      });
      return next;
    });
    setSelectedFolder((prev) =>
      prev === target.key || prev.startsWith(target.key + '/')
        ? nextPath + prev.slice(target.key.length)
        : prev
    );
    await refresh();
  };

  const handleRenameKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
    if (e.key === 'Escape') {
      setRenaming(null);
      e.currentTarget.blur();
    }
  };

  const updateBody = async (value: string) => {
    setDraft(value);
    if (!currentNote) return;
    const { title, content } = draftToNote(value, currentNote.name);
    await noteService.updateNote(currentNote.id, title, currentNote.folderPath, content);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === currentNote.id ? { ...n, name: title, body: content } : n
      )
    );
  };

  const applyMarkdown = (action: MarkdownAction) => {
    const textarea = textareaRef.current;
    if (!textarea || !currentNote) return;

    const result = applyMarkdownAction(
      draft,
      textarea.selectionStart,
      textarea.selectionEnd,
      action
    );

    void updateBody(result.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const renameFromTitle = async (value: string) => {
    if (!currentNote) return;

    const [first, ...rest] = (value || '').split(/\r?\n/);
    const sanitized = (first || '')
      .replace(/\s+/g, ' ')
      .replace(/[/"]/g, '-')
      .trim();
    const clean = sanitized.slice(0, MAX_TITLE_LENGTH);
    const overflow = sanitized.slice(MAX_TITLE_LENGTH).trim();

    if (!clean || clean === currentNote.name) {
      if (titleRef.current) titleRef.current.textContent = currentNote.name;
      return;
    }

    const pasted = rest.join('\n').replace(/^\n+/, '');
    const content = [overflow, pasted, currentNote.body]
      .filter((part) => part && part.trim())
      .join('\n');

    await noteService.updateNote(currentNote.id, clean, currentNote.folderPath, content);
    setNotes((prev) =>
      prev.map((n) =>
        n.id === currentNote.id ? { ...n, name: clean, body: content } : n
      )
    );
    setDraft(noteToDraft({ ...currentNote, name: clean, body: content }));
  };

  const deleteNote = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;

    lastRef.current = {
      notes: [{ note, openIndex: open.indexOf(id) }],
      folders: [],
      current,
      selectedFolder,
      open: [...open],
    };

    await noteService.deleteNote(id);

    const index = open.indexOf(id);
    const nextOpen = open.filter((x) => x !== id);
    setOpen(nextOpen);
    if (current === id) setCurrent(nextOpen[Math.min(index, nextOpen.length - 1)] ?? null);
    await refresh();
    showToast(`Note “${note.name}” deleted`);
  };

  const deleteFolder = async (path: string) => {
    const inside = notes.filter((n) => {
      const f = n.folderPath || '';
      return f === path || f.startsWith(path + '/');
    });
    const ids = new Set(inside.map((n) => n.id));

    lastRef.current = {
      notes: inside.map((n) => ({ note: n, openIndex: open.indexOf(n.id) })),
      folders: folders.filter((f) => f === path || f.startsWith(path + '/')),
      current,
      selectedFolder,
      open: [...open],
    };

    await noteService.deleteFolder(path);

    const index = current ? open.indexOf(current) : -1;
    const nextOpen = open.filter((x) => !ids.has(x));
    setOpen(nextOpen);
    if (current && ids.has(current)) {
      setCurrent(nextOpen[Math.min(index, nextOpen.length - 1)] ?? null);
    }
    if (selectedFolder === path || selectedFolder.startsWith(path + '/')) {
      setSelectedFolder('');
    }
    await refresh();
    const count = inside.length;
    showToast(
      `Folder “${path.split('/').pop()}” deleted${
        count ? ` with ${count} ${count === 1 ? 'note' : 'notes'}` : ''
      }`
    );
  };

  const undo = async () => {
    const snapshot = lastRef.current;
    if (!snapshot) return;
    lastRef.current = null;
    if (toastTimer.current) window.clearTimeout(toastTimer.current);

    for (const folder of snapshot.folders) {
      await noteService.createFolder(folder);
    }
    const restored = [...snapshot.notes].sort((a, b) => a.openIndex - b.openIndex);
    const idMap = new Map<string, string>();
    for (const { note } of restored) {
      idMap.set(note.id, await noteService.restoreNote(note));
    }

    const nextOpen = snapshot.open.map((id) => idMap.get(id) ?? id);
    const mappedCurrent = snapshot.current
      ? idMap.get(snapshot.current) ?? snapshot.current
      : null;
    setOpen(nextOpen);
    setCurrent(
      mappedCurrent && nextOpen.includes(mappedCurrent)
        ? mappedCurrent
        : nextOpen[nextOpen.length - 1] ?? null
    );
    setSelectedFolder(snapshot.selectedFolder);
    await refresh();
    setToast(null);
  };

  const onResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizingRef.current = true;
    setResizing(true);
  };

  const onResizeMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    const container = containerRef.current;
    const aside = container?.querySelector('aside');
    if (!container || !aside) return;
    const rect = aside.getBoundingClientRect();
    const width = Math.max(200, Math.min(e.clientX - rect.left, 560, window.innerWidth - 420));
    container.style.setProperty('--sw', `${width}px`);
  };

  const onResizeEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    setResizing(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const container = containerRef.current;
    const aside = container?.querySelector('aside');
    if (aside) localStorage.setItem('notas-sw', String(Math.round(aside.getBoundingClientRect().width)));
  };

  const resetWidth = () => {
    containerRef.current?.style.setProperty('--sw', '270px');
    localStorage.removeItem('notas-sw');
  };

  const readDragNode = (e: ReactDragEvent): DragNode | null => {
    const raw =
      e.dataTransfer.getData(DRAG_MIME) || e.dataTransfer.getData('text/plain');
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as DragNode;
        if (parsed.kind === 'note' || parsed.kind === 'folder') return parsed;
      } catch {
        // ignore malformed payloads
      }
    }
    return dragNodeRef.current;
  };

  const handleDragStart = (e: ReactDragEvent<HTMLDivElement>, node: DragNode) => {
    e.dataTransfer.effectAllowed = 'move';
    const payload = JSON.stringify(node);
    e.dataTransfer.setData(DRAG_MIME, payload);
    e.dataTransfer.setData('text/plain', payload);
    dragNodeRef.current = node;
  };

  const handleDragEnd = () => {
    dragNodeRef.current = null;
    setDropTarget(null);
  };

  const canDropInto = (node: DragNode, targetParent: string) => {
    if (node.kind === 'folder') {
      if (targetParent === node.path || targetParent.startsWith(`${node.path}/`)) {
        return false;
      }
      const name = node.path.split('/').filter(Boolean).pop();
      if (!name) return false;
      const candidate = targetParent ? `${targetParent}/${name}` : name;
      return candidate !== node.path;
    }
    const note = notes.find((item) => item.id === node.id);
    return !note || (note.folderPath || '') !== targetParent;
  };

  const moveNoteIntoFolder = async (id: string, targetFolder: string) => {
    const note = notes.find((item) => item.id === id);
    if (!note || (note.folderPath || '') === targetFolder) return;

    await noteService.updateNote(note.id, note.name, targetFolder, note.body);
    await refresh();
    setSelectedFolder(targetFolder);
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.delete(targetFolder);
      return next;
    });
  };

  const moveFolderIntoParent = async (sourcePath: string, targetParent: string) => {
    if (!sourcePath) return;
    if (targetParent === sourcePath || targetParent.startsWith(`${sourcePath}/`)) {
      return;
    }

    const name = sourcePath.split('/').filter(Boolean).pop();
    if (!name) return;

    let candidate = targetParent ? `${targetParent}/${name}` : name;
    if (candidate === sourcePath) return;

    let counter = 2;
    while (folders.includes(candidate)) {
      candidate = targetParent
        ? `${targetParent}/${name} ${counter}`
        : `${name} ${counter}`;
      counter += 1;
    }

    await noteService.renameFolder(sourcePath, candidate);

    const remap = (value: string) =>
      value === sourcePath || value.startsWith(`${sourcePath}/`)
        ? candidate + value.slice(sourcePath.length)
        : value;

    setSelectedFolder((prev) => remap(prev));
    setCollapsed((prev) => {
      const next = new Set<string>();
      prev.forEach((folder) => next.add(remap(folder)));
      next.delete(targetParent);
      next.delete(candidate);
      return next;
    });

    await refresh();
  };

  const moveNode = async (node: DragNode, targetParent: string) => {
    if (node.kind === 'note') {
      await moveNoteIntoFolder(node.id, targetParent);
    } else {
      await moveFolderIntoParent(node.path, targetParent);
    }
  };

  const handleDragOverTarget = (
    e: ReactDragEvent,
    targetParent: string
  ) => {
    const node = dragNodeRef.current;
    if (!node || !canDropInto(node, targetParent)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(targetParent);
  };

  const handleDropInto = async (e: ReactDragEvent, targetParent: string) => {
    e.preventDefault();
    e.stopPropagation();
    const node = readDragNode(e);
    dragNodeRef.current = null;
    setDropTarget(null);
    if (!node || !canDropInto(node, targetParent)) return;
    await moveNode(node, targetParent);
  };

  const tree = useMemo(() => {
    const root = createNode();
    const ensure = (path: string) => {
      let node = root;
      for (const segment of path.split('/').filter(Boolean)) {
        let child = node.folders.get(segment);
        if (!child) {
          child = createNode();
          node.folders.set(segment, child);
        }
        node = child;
      }
      return node;
    };

    const normalized = query.trim().toLowerCase();
    if (!normalized) folders.forEach(ensure);
    for (const note of notes) {
      if (normalized && !`${note.name} ${note.body}`.toLowerCase().includes(normalized)) {
        continue;
      }
      ensure(note.folderPath || '').notes.push(note);
    }
    return root;
  }, [folders, notes, query]);

  const renderTree = (node: TreeNode, depth: number, path: string): ReactNode[] => {
    const rows: ReactNode[] = [];
    const sortedFolders = Array.from(node.folders.entries()).sort(([a], [b]) =>
      a.localeCompare(b, 'en')
    );

    for (const [name, child] of sortedFolders) {
      const folderPath = path ? `${path}/${name}` : name;
      const isCollapsed = collapsed.has(folderPath) && !query.trim();
      const isRenaming = renaming?.type === 'f' && renaming.key === folderPath;

      rows.push(
        <div
          key={`f:${folderPath}`}
          className={`r f${selectedFolder === folderPath ? ' sel' : ''}${
            dropTarget === folderPath ? ' drop' : ''
          }`}
          style={{ paddingLeft: 8 + depth * 16 }}
          draggable={!isRenaming}
          onDragStart={(e) => handleDragStart(e, { kind: 'folder', path: folderPath })}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOverTarget(e, folderPath)}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            setDropTarget((prev) => (prev === folderPath ? null : prev));
          }}
          onDrop={(e) => void handleDropInto(e, folderPath)}
          onClick={() => {
            setSelectedFolder(folderPath);
            toggleCollapse(folderPath);
          }}
          onDoubleClick={() => setRenaming({ type: 'f', key: folderPath })}
        >
          <span className={`ch${isCollapsed ? '' : ' o'}`}>
            <NotesIcon name="chev" size={14} />
          </span>
          <span style={{ color: 'var(--ac)', display: 'flex' }}>
            <NotesIcon name="folder" size={16} />
          </span>
          {isRenaming ? (
            <input
              className="rn"
              autoFocus
              maxLength={MAX_TITLE_LENGTH}
              defaultValue={name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => void commitRename(e.target.value)}
              onKeyDown={handleRenameKey}
            />
          ) : (
            <span className="nx" title={folderPath}>
              {name}
            </span>
          )}
          {!renaming && (
            <span
              className="rb"
              title="Rename (double-click or F2)"
              onClick={(e) => {
                e.stopPropagation();
                setRenaming({ type: 'f', key: folderPath });
              }}
            >
              <NotesIcon name="pencil" size={13} />
            </span>
          )}
          {!renaming && (
            <span
              className="rb dl"
              title="Delete folder"
              onClick={(e) => {
                e.stopPropagation();
                void deleteFolder(folderPath);
              }}
            >
              <NotesIcon name="trash" size={13} />
            </span>
          )}
        </div>
      );

      if (!isCollapsed) rows.push(...renderTree(child, depth + 1, folderPath));
    }

    const sortedNotes = [...node.notes].sort((a, b) => a.name.localeCompare(b.name, 'en'));
    for (const note of sortedNotes) {
      const isRenaming = renaming?.type === 'n' && renaming.key === note.id;
      rows.push(
        <div
          key={`n:${note.id}`}
          className={`r${current === note.id ? ' on' : ''}`}
          style={{ paddingLeft: 8 + depth * 16 + 22 }}
          draggable={!isRenaming}
          onDragStart={(e) => handleDragStart(e, { kind: 'note', id: note.id })}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
          onClick={() => openNote(note.id)}
          onDoubleClick={() => setRenaming({ type: 'n', key: note.id })}
        >
          <NotesIcon name="note" size={16} />
          {isRenaming ? (
            <input
              className="rn"
              autoFocus
              maxLength={MAX_TITLE_LENGTH}
              defaultValue={note.name}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => void commitRename(e.target.value)}
              onKeyDown={handleRenameKey}
            />
          ) : (
            <span className="nx" title={note.name}>
              {note.name}
            </span>
          )}
          {!renaming && (
            <span
              className="rb"
              title="Rename (double-click or F2)"
              onClick={(e) => {
                e.stopPropagation();
                setRenaming({ type: 'n', key: note.id });
              }}
            >
              <NotesIcon name="pencil" size={13} />
            </span>
          )}
          {!renaming && (
            <span
              className="rb dl"
              title="Delete note"
              onClick={(e) => {
                e.stopPropagation();
                void deleteNote(note.id);
              }}
            >
              <NotesIcon name="trash" size={13} />
            </span>
          )}
        </div>
      );
    }

    return rows;
  };

  const treeRows = renderTree(tree, 0, '');
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  const breadcrumb = currentNote?.folderPath
    ? `${currentNote.folderPath.split('/').join(' › ')} › `
    : '';

  const handleDocClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target.classList.contains('wl')) return;
    const title = target.dataset.t;
    if (!title) return;
    const found = notes.find((n) => n.name.toLowerCase() === title.toLowerCase());
    if (found) {
      openNote(found.id);
      return;
    }
    void (async () => {
      const id = await noteService.createNote(title, '', '');
      await refresh();
      setOpen((prev) => [...prev, id]);
      setCurrent(id);
    })();
  };

  return (
    <div className="notes-app" ref={containerRef}>

      <aside className="box">
        <div className="hd">
          <div className="lg">S</div>
          <b>SmoothManage</b>
          <span className="sp" />
          <button className="ib" id="new" title="New note" onClick={() => void newNote()}>
            <NotesIcon name="nplus" size={20} />
          </button>
          <button className="ib" id="nf" title="New folder" onClick={() => void newFolder()}>
            <NotesIcon name="fplus" size={20} />
          </button>
        </div>
        <label className="sr">
          <NotesIcon name="search" size={18} />
          <input
            id="q"
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div
          id="tree"
          className={dropTarget === '' ? 'drop-root' : undefined}
          onDragOver={(e) => handleDragOverTarget(e, '')}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
            setDropTarget((prev) => (prev === '' ? null : prev));
          }}
          onDrop={(e) => void handleDropInto(e, '')}
        >
          {treeRows.length === 0 ? (
            <div className="em">
              {query
                ? 'No results'
                : 'Nothing here yet. Create a note or a folder with the buttons above.'}
            </div>
          ) : (
            treeRows
          )}
        </div>
      </aside>

      <div
        id="rz"
        className={resizing ? 'on' : ''}
        title="Drag to resize (double-click to reset)"
        onPointerDown={onResizeStart}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
        onDoubleClick={resetWidth}
      />

      <main>
        <div id="tabs" className="tabs">
          {open.map((id) => {
            const note = notes.find((n) => n.id === id);
            if (!note) return null;
            return (
              <div
                key={id}
                className={`tab${current === id ? ' on' : ''}`}
                title={note.name}
                onClick={() => openNote(id)}
              >
                <span className="tn">{note.name}</span>
                <span
                  className="cx"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(id);
                  }}
                >
                  <NotesIcon name="x" size={14} />
                </span>
              </div>
            );
          })}
        </div>

        <div className="box ed">
          <div className="bar">
            <span id="bc">
              {breadcrumb}
              {currentNote && (
                <b
                  id="bt"
                  key={currentNote.id}
                  ref={titleRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  title="Click to rename"
                  onInput={(e) => {
                    const el = e.currentTarget;
                    const text = el.textContent ?? '';
                    if (text.length <= MAX_TITLE_LENGTH) return;
                    el.textContent = text.slice(0, MAX_TITLE_LENGTH);
                    const range = document.createRange();
                    range.selectNodeContents(el);
                    range.collapse(false);
                    const selection = window.getSelection();
                    selection?.removeAllRanges();
                    selection?.addRange(range);
                  }}
                  onBlur={(e) => void renameFromTitle(e.currentTarget.textContent || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                    if (e.key === 'Escape') {
                      e.currentTarget.textContent = currentNote.name;
                      e.currentTarget.blur();
                    }
                  }}
                />
              )}
            </span>
            <span className="sp" />
            <div className="seg">
              <button
                data-m="ed"
                className={mode === 'ed' ? 'on' : ''}
                onClick={() => setMode('ed')}
              >
                Edit
              </button>
              <button
                data-m="rd"
                className={mode === 'rd' ? 'on' : ''}
                onClick={() => setMode('rd')}
              >
                Read
              </button>
            </div>
            {currentNote && (
              <button
                className="ib"
                id="dn"
                title="Delete note"
                onClick={() => void deleteNote(currentNote.id)}
              >
                <NotesIcon name="trash" size={18} />
              </button>
            )}
          </div>

          {mode === 'ed' && currentNote && (
            <MarkdownToolbar onAction={applyMarkdown} />
          )}

          <div id="doc" className="doc" onClick={handleDocClick}>
            {!currentNote ? (
              <div className="em">
                Open a note from the tree or create a new one with the note button
              </div>
            ) : mode === 'ed' ? (
              <textarea
                id="ta"
                ref={textareaRef}
                spellCheck={false}
                value={draft}
                onChange={(e) => void updateBody(e.target.value)}
              />
            ) : (
              <MarkdownView text={draft} />
            )}
          </div>

          <div id="st" className="stt">
            {currentNote ? `${words} words · ${draft.length} characters · Markdown` : ''}
          </div>
        </div>
      </main>

      {toast && (
        <div className="toast">
          <span>{toast}</span>
          <button onClick={() => void undo()}>Undo</button>
        </div>
      )}
    </div>
  );
};
