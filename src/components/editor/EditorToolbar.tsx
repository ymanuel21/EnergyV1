'use client';

import type { Editor } from '@tiptap/react';
import { useCallback } from 'react';

interface EditorToolbarProps { editor: Editor; }

const BTN = 'rounded border border-border px-2 py-1 text-xs font-medium text-muted hover:bg-surface hover:text-primary transition disabled:opacity-30 disabled:cursor-not-allowed';
const ACTIVE = 'bg-primary/10 text-primary border-primary/30';

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addImage = useCallback(() => {
    const url = window.prompt('Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const btn = (action: () => void, label: string, active: boolean, disabled?: boolean) => (
    <button type="button" onClick={action} disabled={disabled}
      className={`${BTN} ${active ? ACTIVE : ''}`}>{label}</button>
  );

  return (
    <>
      {btn(() => editor.chain().focus().undo().run(), '↩', false, !editor.can().undo())}
      {btn(() => editor.chain().focus().redo().run(), '↪', false, !editor.can().redo())}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().setParagraph().run(), '¶', editor.isActive('paragraph'))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 1 }).run(), 'H1', editor.isActive('heading', { level: 1 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(), 'H2', editor.isActive('heading', { level: 2 }))}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(), 'H3', editor.isActive('heading', { level: 3 }))}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().toggleBold().run(), 'B', editor.isActive('bold'))}
      {btn(() => editor.chain().focus().toggleItalic().run(), 'I', editor.isActive('italic'))}
      {btn(() => editor.chain().focus().toggleUnderline().run(), 'U', editor.isActive('underline'))}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().toggleBulletList().run(), '• List', editor.isActive('bulletList'))}
      {btn(() => editor.chain().focus().toggleOrderedList().run(), '1. List', editor.isActive('orderedList'))}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().toggleBlockquote().run(), '"', editor.isActive('blockquote'))}
      {btn(() => editor.chain().focus().toggleCodeBlock().run(), '<>', editor.isActive('codeBlock'))}
      {btn(() => editor.chain().focus().setHorizontalRule().run(), '—', false)}
      {btn(addLink, '🔗', editor.isActive('link'))}
      {btn(addImage, '🖼', false)}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), '⊞ Table', editor.isActive('table'))}
      {btn(() => editor.chain().focus().deleteTable().run(), '⌫ Table', false, !editor.can().deleteTable())}
      <span className="w-px h-5 bg-border mx-1" />
      {btn(() => editor.chain().focus().unsetAllMarks().clearNodes().run(), '✕ Clear', false)}
    </>
  );
}
