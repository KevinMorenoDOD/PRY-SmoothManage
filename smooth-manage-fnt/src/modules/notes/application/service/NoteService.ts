import type { NoteRepository } from '../port/out/NoteRepository';
import type { NoteUseCase } from '../port/in/NoteUseCase';
import type { Note } from '../../domain/model/Note';
import { NoteEntity } from '../../domain/model/Note';

export class NoteService implements NoteUseCase {
  constructor(private readonly noteRepository: NoteRepository) {}

  async createNote(name: string, folderPath: string, body: string): Promise<string> {
    const noteEntity = new NoteEntity({ name, folderPath, body });
    return this.noteRepository.save(noteEntity.toPlain());
  }

  async restoreNote(note: Note): Promise<string> {
    return this.noteRepository.save(note);
  }

  async updateNote(id: string, name: string, folderPath: string, body: string): Promise<void> {
    const existing = await this.noteRepository.findById(id);
    if (!existing) {
      throw new Error(`Note with id ${id} not found`);
    }
    const noteEntity = new NoteEntity({
      id,
      name,
      folderPath,
      body,
    });
    await this.noteRepository.save(noteEntity.toPlain());
  }

  async deleteNote(id: string): Promise<void> {
    await this.noteRepository.deleteById(id);
  }

  async searchNotes(query: string): Promise<Note[]> {
    return this.noteRepository.search(query);
  }

  async getNoteById(id: string): Promise<Note | null> {
    return this.noteRepository.findById(id);
  }

  async getNotesByFolder(folderPath: string): Promise<Note[]> {
    return this.noteRepository.findByFolder(folderPath);
  }

  async getAllFolders(): Promise<string[]> {
    return this.noteRepository.getAllFolders();
  }

  async createFolder(path: string): Promise<void> {
    await this.noteRepository.addFolder(path);
  }

  async deleteFolder(path: string): Promise<void> {
    await this.noteRepository.deleteFolder(path);
  }

  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    await this.noteRepository.renameFolder(oldPath, newPath);
  }
}