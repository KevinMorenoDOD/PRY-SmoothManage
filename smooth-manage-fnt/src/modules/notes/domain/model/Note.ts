export interface Note {
  id: string;
  name: string;
  folderPath: string;
  body: string;
}

export interface NoteProps {
  id?: string;
  name: string;
  folderPath: string;
  body: string;
}

export class NoteEntity {
  private props: Note;

  constructor(props: NoteProps) {
    this.props = {
      id: props.id ?? Math.random().toString(36).substr(2, 9),
      name: props.name,
      folderPath: props.folderPath,
      body: props.body,
    };
  }

  getId(): string {
    return this.props.id;
  }

  getName(): string {
    return this.props.name;
  }

  getFolderPath(): string {
    return this.props.folderPath;
  }

  getBody(): string {
    return this.props.body;
  }

  setName(name: string): void {
    this.props.name = name;
  }

  setFolderPath(folderPath: string): void {
    this.props.folderPath = folderPath;
  }

  setBody(body: string): void {
    this.props.body = body;
  }

  toPlain(): Note {
    return { ...this.props };
  }
}