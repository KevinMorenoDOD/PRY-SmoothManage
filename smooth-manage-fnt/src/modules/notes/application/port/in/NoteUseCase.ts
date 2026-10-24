import type { Note } from '../../../domain/model/Note';

export interface NoteUseCase {
  createNote(name: string, folderPath: string, body: string): Promise<string>;
  restoreNote(note: Note): Promise<string>;
  updateNote(id: string, name: string, folderPath: string, body: string): Promise<void>;
  deleteNote(id: string): Promise<void>;
  searchNotes(query: string): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | null>;
  getNotesByFolder(folderPath: string): Promise<Note[]>;
  getAllFolders(): Promise<string[]>;
  createFolder(path: string): Promise<void>;
  deleteFolder(path: string): Promise<void>;
  renameFolder(oldPath: string, newPath: string): Promise<void>;
}
