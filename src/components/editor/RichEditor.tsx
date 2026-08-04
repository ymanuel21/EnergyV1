'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import Dropcursor from '@tiptap/extension-dropcursor';
import { EditorToolbar } from './EditorToolbar';
import { SpacingControls } from './SpacingControls';
import { ParagraphSpacing } from './ParagraphSpacing';
import { GridPicker } from './GridPicker';
import { TableMenu } from './TableMenu';
import { cn } from '@/lib/utils/cn';

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichEditor({ content, onChange, placeholder = 'Start writing...', className }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      LinkExtension,
      ImageExtension,
      Table.configure({ resizable: true }),
      TableRow, TableCell, TableHeader,
      Placeholder.configure({ placeholder }),
      Gapcursor,
      Dropcursor,
      ParagraphSpacing,
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: cn('prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3', className),
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-border bg-surface/50 rounded-t-lg">
        <EditorToolbar editor={editor} />
        <span className="w-px h-5 bg-border mx-1" />
        <GridPicker onSelect={(r, c) => editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()} />
        <span className="w-px h-5 bg-border mx-1" />
        <SpacingControls editor={editor} />
      </div>
      <EditorContent editor={editor} />
      <TableMenu editor={editor} />
    </div>
  );
}
