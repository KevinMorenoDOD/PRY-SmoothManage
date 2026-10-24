import type { Task } from '../../../domain/model/Task';
import type { TaskList } from '../../../domain/model/List';

export interface TaskRepository {
  createTask(title: string, listId: string, description: string): Promise<string>;
  restoreTask(task: Task): Promise<string>;
  updateTask(id: string, title: string, status: 'pend' | 'prog' | 'blk' | 'done', priority: 0 | 1 | 2, dueDate: string | null, listId: string, description: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  getTaskById(id: string): Promise<Task | null>;
  getTasksByList(listId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createList(name: string): Promise<string>;
  restoreList(list: TaskList): Promise<string>;
  deleteList(id: string): Promise<void>;
  renameList(id: string, name: string): Promise<void>;
  getAllLists(): Promise<TaskList[]>;
}
