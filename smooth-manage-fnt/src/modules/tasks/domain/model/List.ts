export interface TaskList {
  id: string;
  name: string;
}

export interface TaskListProps {
  id?: string;
  name: string;
}

export class TaskListEntity {
  private props: TaskList;

  constructor(props: TaskListProps) {
    this.props = {
      id: props.id ?? Math.random().toString(36).substr(2, 9),
      name: props.name,
    };
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  setName(name: string): void {
    this.props.name = name;
  }

  toPlain(): TaskList {
    return { ...this.props };
  }
}
