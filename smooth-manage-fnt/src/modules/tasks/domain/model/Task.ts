export type TaskStatus = 'pend' | 'prog' | 'blk' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: 0 | 1 | 2;
  dueDate: string | null;
  listId: string;
  description: string;
}

export interface TaskProps {
  id?: string;
  title: string;
  status?: 'pend' | 'prog' | 'blk' | 'done';
  priority?: 0 | 1 | 2;
  dueDate?: string | null;
  listId?: string;
  description?: string;
}

export class TaskEntity {
  private props: Task;

  constructor(props: TaskProps) {
    this.props = {
      id: props.id ?? Math.random().toString(36).substr(2, 9),
      title: props.title,
      status: props.status ?? 'pend',
      priority: props.priority ?? 1,
      dueDate: props.dueDate ?? null,
      listId: props.listId ?? '',
      description: props.description ?? '',
    };
  }

  getId(): string {
    return this.props.id;
  }

  getTitle(): string {
    return this.props.title;
  }

  getStatus(): 'pend' | 'prog' | 'blk' | 'done' {
    return this.props.status;
  }

  getPriority(): 0 | 1 | 2 {
    return this.props.priority;
  }

  getDueDate(): string | null {
    return this.props.dueDate;
  }

  getListId(): string {
    return this.props.listId;
  }

  getDescription(): string {
    return this.props.description;
  }

  setTitle(title: string): void {
    this.props.title = title;
  }

  setStatus(status: 'pend' | 'prog' | 'blk' | 'done'): void {
    this.props.status = status;
  }

  setPriority(priority: 0 | 1 | 2): void {
    this.props.priority = priority;
  }

  setDueDate(dueDate: string | null): void {
    this.props.dueDate = dueDate;
  }

  setListId(listId: string): void {
    this.props.listId = listId;
  }

  setDescription(description: string): void {
    this.props.description = description;
  }

  toPlain(): Task {
    return { ...this.props };
  }
}
