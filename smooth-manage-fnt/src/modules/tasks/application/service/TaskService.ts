import type { TaskRepository } from '../port/out/TaskRepository';
import type { TaskUseCase } from '../port/in/TaskUseCase';
import type { Task } from '../../domain/model/Task';
import type { TaskList } from '../../domain/model/List';

export class TaskService implements TaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async createTask(title: string, listId: string, description: string = ''): Promise<string> {
    return this.taskRepository.createTask(title, listId, description);
  }

  async restoreTask(task: Task): Promise<string> {
    return this.taskRepository.restoreTask(task);
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
    await this.taskRepository.updateTask(id, title, status, priority, dueDate, listId, description);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.deleteTask(id);
  }

  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepository.getTaskById(id);
  }

  async getTasksByList(listId: string): Promise<Task[]> {
    return this.taskRepository.getTasksByList(listId);
  }

  async getAllTasks(): Promise<Task[]> {
    return this.taskRepository.getAllTasks();
  }

  async createList(name: string): Promise<string> {
    return this.taskRepository.createList(name);
  }

  async restoreList(list: TaskList): Promise<string> {
    return this.taskRepository.restoreList(list);
  }

  async deleteList(id: string): Promise<void> {
    await this.taskRepository.deleteList(id);
  }

  async renameList(id: string, name: string): Promise<void> {
    await this.taskRepository.renameList(id, name);
  }

  async getAllLists(): Promise<TaskList[]> {
    return this.taskRepository.getAllLists();
  }
}
