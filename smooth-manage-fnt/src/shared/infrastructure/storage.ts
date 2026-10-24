export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
  keys(): string[];
}

export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'smoothmanage:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keys = this.keys();
    keys.forEach((key) => localStorage.removeItem(key));
  }

  keys(): string[] {
    const prefix = this.prefix;
    const result: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        result.push(key.slice(prefix.length));
      }
    }
    return result;
  }
}

export class SessionStorageAdapter implements StorageAdapter {
  private prefix: string;

  constructor(prefix = 'smoothmanage:') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  get<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.getKey(key));
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to sessionStorage:', error);
    }
  }

  remove(key: string): void {
    sessionStorage.removeItem(this.getKey(key));
  }

  clear(): void {
    const keys = this.keys();
    keys.forEach((key) => sessionStorage.removeItem(key));
  }

  keys(): string[] {
    const prefix = this.prefix;
    const result: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(prefix)) {
        result.push(key.slice(prefix.length));
      }
    }
    return result;
  }
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, unknown>();

  get<T>(key: string): T | null {
    return (this.store.get(key) as T) ?? null;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

export const createStorageAdapter = (type: 'local' | 'session' | 'memory' = 'local', prefix?: string): StorageAdapter => {
  switch (type) {
    case 'session':
      return new SessionStorageAdapter(prefix);
    case 'memory':
      return new MemoryStorageAdapter();
    case 'local':
    default:
      return new LocalStorageAdapter(prefix);
  }
};