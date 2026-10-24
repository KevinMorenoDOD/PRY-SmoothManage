import type { Note } from '../../../domain/model/Note';

export interface NoteRepository {
  save(note: Note): Promise<string>;
  findById(id: string): Promise<Note | null>;
  findByFolder(folderPath: string): Promise<Note[]>;
  deleteById(id: string): Promise<void>;
  search(query: string): Promise<Note[]>;
  getAllFolders(): Promise<string[]>;
  addFolder(path: string): Promise<void>;
  deleteFolder(path: string): Promise<void>;
  renameFolder(oldPath: string, newPath: string): Promise<void>;
}
