export type MarkdownAction =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'inlineCode'
  | 'link'
  | 'image'
  | 'ul'
  | 'ol'
  | 'task'
  | 'quote'
  | 'codeBlock'
  | 'table'
  | 'hr';

export interface MarkdownEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const lineBounds = (value: string, start: number, end: number) => {
  const from = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
  const nextBreak = value.indexOf('\n', end);
  const to = nextBreak === -1 ? value.length : nextBreak;
  return { from, to, block: value.slice(from, to) };
};

const wrapSelection = (
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
  placeholder: string
): MarkdownEdit => {
  const selected = value.slice(start, end);
  const text = selected || placeholder;
  const next = value.slice(0, start) + before + text + after + value.slice(end);
  const selectionStart = start + before.length;

  return {
    value: next,
    selectionStart,
    selectionEnd: selectionStart + text.length,
  };
};

const insertLink = (
  value: string,
  start: number,
  end: number,
  image: boolean
): MarkdownEdit => {
  const selected = value.slice(start, end);
  const text = selected || (image ? 'alt text' : 'link text');
  const open = image ? '![' : '[';
  const inserted = `${open}${text}](https://)`;
  const next = value.slice(0, start) + inserted + value.slice(end);
  const urlStart = start + open.length + text.length + 2;
  const urlEnd = urlStart + 'https://'.length;

  return { value: next, selectionStart: urlStart, selectionEnd: urlEnd };
};

const insertBlock = (
  value: string,
  start: number,
  end: number,
  block: string,
  selectFrom = block.length,
  selectTo = block.length
): MarkdownEdit => {
  const before = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
  const after = end < value.length && value[end] !== '\n' ? '\n' : '';
  const next = value.slice(0, start) + before + block + after + value.slice(end);
  const base = start + before.length;

  return {
    value: next,
    selectionStart: base + selectFrom,
    selectionEnd: base + selectTo,
  };
};

const applyHeading = (value: string, start: number, end: number): MarkdownEdit => {
  const { from, to, block } = lineBounds(value, start, end);
  const collapsed = start === end;
  const empty = block.trim() === '';
  const source = empty ? 'Heading' : block;
  const lines = source.split('\n').map((line) => {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      return match[1].length === 2 ? match[2] : `## ${match[2]}`;
    }
    return `## ${line}`;
  });
  const nextBlock = lines.join('\n');
  const next = value.slice(0, from) + nextBlock + value.slice(to);

  if (empty) {
    const offset = nextBlock.indexOf('Heading');
    return {
      value: next,
      selectionStart: from + offset,
      selectionEnd: from + offset + 'Heading'.length,
    };
  }

  if (collapsed) {
    const cursor = from + nextBlock.length;
    return { value: next, selectionStart: cursor, selectionEnd: cursor };
  }

  return {
    value: next,
    selectionStart: from,
    selectionEnd: from + nextBlock.length,
  };
};

const prefixLines = (
  value: string,
  start: number,
  end: number,
  prefix: string | ((index: number) => string),
  placeholder: string
): MarkdownEdit => {
  const { from, to, block } = lineBounds(value, start, end);
  const collapsed = start === end;
  const empty = block.trim() === '';
  const source = empty ? placeholder : block;
  const lines = source.split('\n').map((line, index) => {
    const marker = typeof prefix === 'function' ? prefix(index) : prefix;
    return line ? `${marker}${line}` : marker;
  });
  const nextBlock = lines.join('\n');
  const next = value.slice(0, from) + nextBlock + value.slice(to);
  const firstMarker = typeof prefix === 'function' ? prefix(0) : prefix;

  if (collapsed) {
    if (empty) {
      return {
        value: next,
        selectionStart: from + firstMarker.length,
        selectionEnd: from + nextBlock.length,
      };
    }
    const cursor = from + nextBlock.length;
    return { value: next, selectionStart: cursor, selectionEnd: cursor };
  }

  return {
    value: next,
    selectionStart: from,
    selectionEnd: from + nextBlock.length,
  };
};

export const applyMarkdownAction = (
  value: string,
  start: number,
  end: number,
  action: MarkdownAction
): MarkdownEdit => {
  switch (action) {
    case 'bold':
      return wrapSelection(value, start, end, '**', '**', 'bold text');
    case 'italic':
      return wrapSelection(value, start, end, '*', '*', 'italic text');
    case 'strike':
      return wrapSelection(value, start, end, '~~', '~~', 'strikethrough');
    case 'inlineCode':
      return wrapSelection(value, start, end, '`', '`', 'code');
    case 'link':
      return insertLink(value, start, end, false);
    case 'image':
      return insertLink(value, start, end, true);
    case 'heading':
      return applyHeading(value, start, end);
    case 'ul':
      return prefixLines(value, start, end, '- ', 'List item');
    case 'ol':
      return prefixLines(value, start, end, (index) => `${index + 1}. `, 'List item');
    case 'task':
      return prefixLines(value, start, end, '- [ ] ', 'Task');
    case 'quote':
      return prefixLines(value, start, end, '> ', 'Quote');
    case 'codeBlock': {
      const selected = value.slice(start, end);
      const code = selected || 'code';
      const block = `\`\`\`\n${code}\n\`\`\``;
      return insertBlock(value, start, end, block, 4, 4 + code.length);
    }
    case 'table': {
      const block =
        '| Column 1 | Column 2 | Column 3 |\n' +
        '| --- | --- | --- |\n' +
        '| Cell | Cell | Cell |';
      const offset = block.indexOf('Column 1');
      return insertBlock(value, start, end, block, offset, offset + 'Column 1'.length);
    }
    case 'hr':
      return insertBlock(value, start, end, '---');
    default:
      return { value, selectionStart: start, selectionEnd: end };
  }
};
