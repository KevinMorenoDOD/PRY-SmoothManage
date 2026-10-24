import type { Note } from '../../domain/model/Note';
import type { NoteRepository } from '../../application/port/out/NoteRepository';

export class NoteLocalStorageAdapter implements NoteRepository {
  private readonly STORAGE_KEY = 'sm-notes-v1';

  constructor() {
    this.loadFromStorage();
  }

  private notes: Map<string, Note> = new Map();
  private folders: Set<string> = new Set();

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.notes) {
          for (const [id, note] of Object.entries(parsed.notes)) {
            this.notes.set(id, note as Note);
          }
        }
        if (parsed.folders) {
          for (const folder of parsed.folders) {
            this.addFolderPath(folder);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load notes from localStorage', e);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        notes: Object.fromEntries(this.notes),
        folders: Array.from(this.folders),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save notes to localStorage', e);
    }
  }

  private addFolderPath(path: string) {
    if (!path) return;
    let current = '';
    for (const part of path.split('/')) {
      current = current ? `${current}/${part}` : part;
      this.folders.add(current);
    }
  }

  async save(note: Note): Promise<string> {
    this.notes.set(note.id, note);
    this.addFolderPath(note.folderPath);
    this.saveToStorage();
    return note.id;
  }

  async findById(id: string): Promise<Note | null> {
    const note = this.notes.get(id);
    return note ? note : null;
  }

  async findByFolder(folderPath: string): Promise<Note[]> {
    const result: Note[] = [];
    for (const note of this.notes.values()) {
      if (note.folderPath === folderPath) {
        result.push(note);
      }
    }
    return result;
  }

  async deleteById(id: string): Promise<void> {
    const note = this.notes.get(id);
    if (note) {
      this.notes.delete(id);
      this.saveToStorage();
    }
  }

  async search(query: string): Promise<Note[]> {
    if (!query) {
      return Array.from(this.notes.values());
    }
    const lowerQuery = query.toLowerCase();
    const result: Note[] = [];
    for (const note of this.notes.values()) {
      if (
        note.name.toLowerCase().includes(lowerQuery) ||
        note.body.toLowerCase().includes(lowerQuery)
      ) {
        result.push(note);
      }
    }
    return result;
  }

  async getAllFolders(): Promise<string[]> {
    return Array.from(this.folders).sort();
  }

  async addFolder(path: string): Promise<void> {
    this.addFolderPath(path);
    this.saveToStorage();
  }

  async deleteFolder(path: string): Promise<void> {
    for (const folder of Array.from(this.folders)) {
      if (folder === path || folder.startsWith(path + '/')) {
        this.folders.delete(folder);
      }
    }
    for (const [id, note] of Array.from(this.notes.entries())) {
      const folderPath = note.folderPath || '';
      if (folderPath === path || folderPath.startsWith(path + '/')) {
        this.notes.delete(id);
      }
    }
    this.saveToStorage();
  }

  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    const swap = (value: string) =>
      value === oldPath || value.startsWith(oldPath + '/')
        ? newPath + value.slice(oldPath.length)
        : value;

    const nextFolders = new Set<string>();
    for (const folder of this.folders) {
      this.addPathToSet(nextFolders, swap(folder));
    }
    this.folders = nextFolders;

    for (const note of this.notes.values()) {
      note.folderPath = swap(note.folderPath || '');
    }
    this.saveToStorage();
  }

  private addPathToSet(target: Set<string>, path: string) {
    if (!path) return;
    let current = '';
    for (const part of path.split('/')) {
      current = current ? `${current}/${part}` : part;
      target.add(current);
    }
  }
}
