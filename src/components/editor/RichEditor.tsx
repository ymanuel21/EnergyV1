'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorToolbar } from './EditorToolbar';
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
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
