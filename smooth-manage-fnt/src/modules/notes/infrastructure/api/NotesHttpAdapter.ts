import type { Note } from '../../domain/model/Note';
import type { NoteRepository } from '../../application/port/out/NoteRepository';
import { api, ApiError } from '@shared/infrastructure/api';
import { contentWithoutTitle } from '../../domain/model/noteDraft';

interface NotesDto {
  id: number;
  parentId: number | null;
  type: 'FOLDER' | 'NOTE';
  title: string;
  content: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export class NotesHttpAdapter implements NoteRepository {
  private async fetchAll(): Promise<NotesDto[]> {
    return api.get<NotesDto[]>('/notes');
  }

  private index(nodes: NotesDto[]): Map<number, NotesDto> {
    return new Map(nodes.map((node) => [node.id, node]));
  }

  private parentPath(node: NotesDto, byId: Map<number, NotesDto>): string {
    const segments: string[] = [];
    const seen = new Set<number>();
    let parentId = node.parentId;

    while (parentId != null && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = byId.get(parentId);
      if (!parent) break;
      segments.unshift(parent.title);
      parentId = parent.parentId;
    }

    return segments.join('/');
  }

  private ownPath(node: NotesDto, byId: Map<number, NotesDto>): string {
    const parent = this.parentPath(node, byId);
    return parent ? `${parent}/${node.title}` : node.title;
  }

  private toNote(node: NotesDto, byId: Map<number, NotesDto>): Note {
    return {
      id: String(node.id),
      name: node.title,
      folderPath: this.parentPath(node, byId),
      body: contentWithoutTitle(node.title, node.content ?? ''),
    };
  }

  private async ensureFolderPath(path: string): Promise<number | null> {
    const segments = path
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (!segments.length) return null;

    let nodes = await this.fetchAll();
    let parentId: number | null = null;

    for (const title of segments) {
      const found = nodes.find(
        (node) => node.type === 'FOLDER' && node.parentId === parentId && node.title === title
      );
      if (found) {
        parentId = found.id;
        continue;
      }
      const created: NotesDto = await api.post<NotesDto>('/notes/folders', { parentId, title });
      nodes = [...nodes, created];
      parentId = created.id;
    }

    return parentId;
  }

  private async findFolderId(path: string): Promise<number | null> {
    const nodes = await this.fetchAll();
    const byId = this.index(nodes);
    const folder = nodes.find(
      (node) => node.type === 'FOLDER' && this.ownPath(node, byId) === path
    );
    return folder?.id ?? null;
  }

  async save(note: Note): Promise<string> {
    const content = contentWithoutTitle(note.name, note.body);

    if (/^\d+$/.test(note.id)) {
      try {
        const parentId = await this.ensureFolderPath(note.folderPath);
        await api.put(`/notes/${note.id}`, {
          title: note.name,
          content,
          parentId: parentId ?? -1,
        });
        return note.id;
      } catch (error) {
        const missing =
          error instanceof ApiError &&
          (error.status === 404 ||
            (error.status === 400 && /not found/i.test(error.message)));
        if (!missing) throw error;
      }
    }

    const parentId = await this.ensureFolderPath(note.folderPath);
    const created = await api.post<NotesDto>('/notes', { parentId, title: note.name });
    if (content) {
      await api.put(`/notes/${created.id}`, { title: note.name, content });
    }
    return String(created.id);
  }

  async findById(id: string): Promise<Note | null> {
    try {
      const node = await api.get<NotesDto>(`/notes/${id}`);
      if (node.type !== 'NOTE') return null;
      const nodes = await this.fetchAll();
      return this.toNote(node, this.index(nodes));
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  }

  async findByFolder(folderPath: string): Promise<Note[]> {
    const nodes = await this.fetchAll();
    const byId = this.index(nodes);
    return nodes
      .filter((node) => node.type === 'NOTE' && this.parentPath(node, byId) === folderPath)
      .map((node) => this.toNote(node, byId));
  }

  async deleteById(id: string): Promise<void> {
    await api.delete(`/notes/${id}`);
  }

  async search(query: string): Promise<Note[]> {
    const nodes = await this.fetchAll();
    const byId = this.index(nodes);
    const term = query.trim().toLowerCase();

    return nodes
      .filter((node) => node.type === 'NOTE')
      .filter(
        (node) =>
          !term ||
          node.title.toLowerCase().includes(term) ||
          (node.content ?? '').toLowerCase().includes(term)
      )
      .map((node) => this.toNote(node, byId));
  }

  async getAllFolders(): Promise<string[]> {
    const nodes = await this.fetchAll();
    const byId = this.index(nodes);
    return nodes
      .filter((node) => node.type === 'FOLDER')
      .map((node) => this.ownPath(node, byId))
      .sort((a, b) => a.localeCompare(b, 'en'));
  }

  async addFolder(path: string): Promise<void> {
    await this.ensureFolderPath(path);
  }

  async deleteFolder(path: string): Promise<void> {
    const id = await this.findFolderId(path);
    if (id != null) {
      await api.delete(`/notes/${id}`);
    }
  }

  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    const id = await this.findFolderId(oldPath);
    if (id == null) return;

    const slash = newPath.lastIndexOf('/');
    const parentPath = slash >= 0 ? newPath.slice(0, slash) : '';
    const title = slash >= 0 ? newPath.slice(slash + 1) : newPath;
    const parentId = await this.ensureFolderPath(parentPath);

    await api.put(`/notes/${id}`, { title, parentId: parentId ?? -1 });
  }
}
