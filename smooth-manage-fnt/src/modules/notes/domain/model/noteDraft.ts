import type { Note } from './Note';

export const MAX_TITLE_LENGTH = 255;

const stripHeading = (line: string) =>
  line.replace(/^\s*#{1,6}\s+/, '').trim();

const normalizeTitle = (value: string) =>
  value.replace(/\s+/g, ' ').trim().toLowerCase();

export const contentWithoutTitle = (title: string, content: string): string => {
  if (!content) return '';

  const lines = content.split('\n');
  const first = stripHeading(lines[0] ?? '');

  if (title && normalizeTitle(first) === normalizeTitle(title)) {
    lines.shift();
    while (lines.length && lines[0].trim() === '') lines.shift();
  }

  return lines.join('\n').replace(/^\n+/, '');
};

export const noteToDraft = (note: Note): string => {
  const content = contentWithoutTitle(note.name, note.body);
  return `# ${note.name}${content ? `\n\n${content}` : '\n\n'}`;
};

export const draftToNote = (
  value: string,
  fallbackTitle: string
): { title: string; content: string } => {
  const lines = value.split('\n');
  const rawTitle = stripHeading(lines[0] ?? '').replace(/\s+/g, ' ');
  const title = (rawTitle || fallbackTitle || 'Untitled').slice(0, MAX_TITLE_LENGTH);
  const overflow = rawTitle.slice(MAX_TITLE_LENGTH);
  const contentLines = lines.slice(1);

  if (overflow) {
    contentLines.unshift(overflow);
  }

  const content = contentLines.join('\n').replace(/^\n+/, '');
  return { title, content };
};
