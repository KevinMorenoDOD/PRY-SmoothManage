import type { Task, TaskStatus } from '../../domain/model/Task';
import type { TaskList } from '../../domain/model/List';
import type { TaskRepository } from '../../application/port/out/TaskRepository';
import { api, ApiError } from '@shared/infrastructure/api';

interface TasksDto {
  id: number;
  parentId: number | null;
  type: 'LIST' | 'TASK';
  title: string;
  description: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  tasksStatus: 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
}

const STATUS_FROM: Record<TasksDto['tasksStatus'], TaskStatus> = {
  TODO: 'pend',
  IN_PROGRESS: 'prog',
  BLOCKED: 'blk',
  DONE: 'done',
};

const STATUS_TO: Record<TaskStatus, TasksDto['tasksStatus']> = {
  pend: 'TODO',
  prog: 'IN_PROGRESS',
  blk: 'BLOCKED',
  done: 'DONE',
};

const PRIORITY_FROM: Record<TasksDto['priority'], 0 | 1 | 2> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

const PRIORITY_TO: Array<TasksDto['priority']> = ['LOW', 'MEDIUM', 'HIGH'];

const dateFrom = (value: string | null): string | null =>
  value ? value.slice(0, 10) : null;

const dateTo = (value: string | null): string | null =>
  value ? new Date(`${value}T12:00:00Z`).toISOString() : null;

export class TasksHttpAdapter implements TaskRepository {
  private toTask(dto: TasksDto): Task {
    return {
      id: String(dto.id),
      title: dto.title,
      status: STATUS_FROM[dto.tasksStatus],
      priority: PRIORITY_FROM[dto.priority],
      dueDate: dateFrom(dto.dueDate),
      listId: dto.parentId != null ? String(dto.parentId) : '',
      description: dto.description ?? '',
    };
  }

  private toList(dto: TasksDto): TaskList {
    return { id: String(dto.id), name: dto.title };
  }

  async createTask(title: string, listId: string, description: string = ''): Promise<string> {
    const dto = await api.post<TasksDto>('/tasks', {
      type: 'TASK',
      parentId: Number(listId),
      title,
      description,
      priority: 'MEDIUM',
    });
    return String(dto.id);
  }

  async restoreTask(task: Task): Promise<string> {
    const dto = await api.post<TasksDto>('/tasks', {
      type: 'TASK',
      parentId: task.listId ? Number(task.listId) : null,
      title: task.title,
      description: task.description,
      priority: PRIORITY_TO[task.priority],
      dueDate: dateTo(task.dueDate),
    });

    if (task.status !== 'pend') {
      await api.put(`/tasks/${dto.id}`, { status: STATUS_TO[task.status] });
    }

    return String(dto.id);
  }

  async updateTask(
    id: string,
    title: string,
    status: TaskStatus,
    priority: 0 | 1 | 2,
    dueDate: string | null,
    listId: string,
    description: string
  ): Promise<void> {
    await api.put(`/tasks/${id}`, {
      parentId: Number(listId),
      title,
      description,
      priority: PRIORITY_TO[priority],
      dueDate: dateTo(dueDate),
      status: STATUS_TO[status],
    });
  }

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      const dto = await api.get<TasksDto>(`/tasks/${id}`);
      return dto.type === 'TASK' ? this.toTask(dto) : null;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  async getTasksByList(listId: string): Promise<Task[]> {
    const dtos = await api.get<TasksDto[]>(`/tasks/parent/${listId}`);
    return dtos.filter((dto) => dto.type === 'TASK').map((dto) => this.toTask(dto));
  }

  async getAllTasks(): Promise<Task[]> {
    const dtos = await api.get<TasksDto[]>('/tasks');
    return dtos.filter((dto) => dto.type === 'TASK').map((dto) => this.toTask(dto));
  }

  async createList(name: string): Promise<string> {
    const dto = await api.post<TasksDto>('/tasks', { type: 'LIST', title: name });
    return String(dto.id);
  }

  async restoreList(list: TaskList): Promise<string> {
    const dto = await api.post<TasksDto>('/tasks', { type: 'LIST', title: list.name });
    return String(dto.id);
  }

  async deleteList(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }

  async renameList(id: string, name: string): Promise<void> {
    await api.put(`/tasks/${id}`, { title: name });
  }

  async getAllLists(): Promise<TaskList[]> {
    const dtos = await api.get<TasksDto[]>('/tasks');
    return dtos.filter((dto) => dto.type === 'LIST').map((dto) => this.toList(dto));
  }
}
