const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const inline = (value: string) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\*([^*]+)\*/g, '<i>$1</i>')
    .replace(/\[\[([^\]]+)\]\]/g, '<a class="wl" data-t="$1">$1</a>')
    .replace(/(^|\s)#([\wáéíóúñ-]+)/gi, '$1<span class="tg">#$2</span>');

export const renderMarkdown = (text: string): string => {
  let html = '';
  let inList = false;

  const closeList = () => {
    if (inList) {
      html += '</ul>';
      inList = false;
    }
  };

  for (const line of text.split('\n')) {
    let match: RegExpMatchArray | null;

    if ((match = line.match(/^(#{1,3}) (.*)/))) {
      closeList();
      const level = match[1].length;
      html += `<h${level}>${inline(match[2])}</h${level}>`;
    } else if ((match = line.match(/^- \[( |x)\] (.*)/))) {
      if (!inList) {
        html += '<ul class="tl">';
        inList = true;
      }
      const done = match[1] === 'x';
      html += `<li class="${done ? 'dn' : ''}"><i></i>${inline(match[2])}</li>`;
    } else if ((match = line.match(/^- (.*)/))) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${inline(match[1])}</li>`;
    } else if ((match = line.match(/^> (.*)/))) {
      closeList();
      html += `<blockquote>${inline(match[1])}</blockquote>`;
    } else {
      closeList();
      if (line.trim()) {
        html += `<p>${inline(line)}</p>`;
      }
    }
  }

  closeList();
  return html;
};
