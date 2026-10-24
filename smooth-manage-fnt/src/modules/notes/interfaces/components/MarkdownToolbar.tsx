import { Fragment } from 'react';
import { NotesIcon } from './NotesIcon';
import type { MarkdownAction } from '../helpers/markdownEditor';

interface Tool {
  action: MarkdownAction;
  icon: string;
  label: string;
}

const groups: Tool[][] = [
  [
    { action: 'heading', icon: 'heading', label: 'Heading' },
    { action: 'bold', icon: 'bold', label: 'Bold' },
    { action: 'italic', icon: 'italic', label: 'Italic' },
    { action: 'strike', icon: 'strike', label: 'Strikethrough' },
    { action: 'inlineCode', icon: 'code', label: 'Inline code' },
  ],
  [
    { action: 'link', icon: 'link', label: 'Link' },
    { action: 'image', icon: 'image', label: 'Image' },
  ],
  [
    { action: 'ul', icon: 'list', label: 'Bullet list' },
    { action: 'ol', icon: 'olist', label: 'Numbered list' },
    { action: 'task', icon: 'task', label: 'Task list' },
  ],
  [
    { action: 'quote', icon: 'quote', label: 'Quote' },
    { action: 'codeBlock', icon: 'blockcode', label: 'Code block' },
    { action: 'table', icon: 'table', label: 'Table' },
    { action: 'hr', icon: 'rule', label: 'Divider' },
  ],
];

interface MarkdownToolbarProps {
  onAction: (action: MarkdownAction) => void;
}

export const MarkdownToolbar = ({ onAction }: MarkdownToolbarProps) => (
  <div className="md-toolbar" role="toolbar" aria-label="Markdown formatting">
    {groups.map((group, groupIndex) => (
      <Fragment key={groupIndex}>
        {groupIndex > 0 && <span className="md-sep" aria-hidden="true" />}
        {group.map((tool) => (
          <button
            key={tool.action}
            type="button"
            className="md-tool"
            title={tool.label}
            aria-label={tool.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onAction(tool.action)}
          >
            <NotesIcon name={tool.icon} size={16} />
          </button>
        ))}
      </Fragment>
    ))}
  </div>
);
