import type { Task } from '../../domain/model/Task';
import type { TaskList } from '../../domain/model/List';
import type { TaskRepository } from '../../application/port/out/TaskRepository';

export class TaskLocalStorageAdapter implements TaskRepository {
  private readonly STORAGE_KEY = 'sm-tasks-v1';

  constructor() {
    this.loadFromStorage();
  }

  private tasks: Map<string, Task> = new Map();
  private lists: Map<string, TaskList> = new Map();

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.tasks) {
          for (const [id, task] of Object.entries(parsed.tasks)) {
            this.tasks.set(id, task as Task);
          }
        }
        if (parsed.lists) {
          for (const [id, list] of Object.entries(parsed.lists)) {
            this.lists.set(id, list as TaskList);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load tasks from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        tasks: Object.fromEntries(this.tasks),
        lists: Object.fromEntries(this.lists),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save tasks to localStorage', e);
    }
  }

  async createTask(title: string, listId: string, description: string = ''): Promise<string> {
    // Ensure list exists
    if (!this.lists.has(listId)) {
      throw new Error(`List ${listId} not found`);
    }
    const id = Math.random().toString(36).substr(2, 9);
    const task: Task = {
      id,
      title,
      status: 'pend',
      priority: 1, // medium default? In sketch default priority is medium (index 1)
      dueDate: null,
      listId,
      description,
    };
    this.tasks.set(id, task);
    this.saveToStorage();
    return id;
  }

  async restoreTask(task: Task): Promise<string> {
    this.tasks.set(task.id, { ...task });
    this.saveToStorage();
    return task.id;
  }

  async updateTask(
    id: string,
    title: string,
    status: 'pend' | 'prog' | 'blk' | 'done',
    priority: 0 | 1 | 2,
    dueDate: string | null,
    listId: string,
    description: string
  ): Promise<void> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    // Ensure list exists
    if (!this.lists.has(listId)) {
      throw new Error(`List ${listId} not found`);
    }
    const updated: Task = {
      id,
      title,
      status,
      priority,
      dueDate,
      listId,
      description,
    };
    this.tasks.set(id, updated);
    this.saveToStorage();
  }

  async deleteTask(id: string): Promise<void> {
    if (this.tasks.has(id)) {
      this.tasks.delete(id);
      this.saveToStorage();
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    const task = this.tasks.get(id);
    return task ?? null;
  }

  async getTasksByList(listId: string): Promise<Task[]> {
    const result: Task[] = [];
    for (const task of this.tasks.values()) {
      if (task.listId === listId) {
        result.push(task);
      }
    }
    return result;
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createList(name: string): Promise<string> {
    const id = Math.random().toString(36).substr(2, 9);
    const list: TaskList = { id, name };
    this.lists.set(id, list);
    this.saveToStorage();
    return id;
  }

  async restoreList(list: TaskList): Promise<string> {
    this.lists.set(list.id, { ...list });
    this.saveToStorage();
    return list.id;
  }

  async deleteList(id: string): Promise<void> {
    // Delete tasks belonging to this list
    for (const [taskId, task] of Array.from(this.tasks.entries())) {
      if (task.listId === id) {
        this.tasks.delete(taskId);
      }
    }
    this.lists.delete(id);
    this.saveToStorage();
  }

  async renameList(id: string, name: string): Promise<void> {
    const list = this.lists.get(id);
    if (!list) {
      throw new Error(`List ${id} not found`);
    }
    list.name = name;
    this.lists.set(id, list);
    this.saveToStorage();
  }

  async getAllLists(): Promise<TaskList[]> {
    return Array.from(this.lists.values());
  }
}
