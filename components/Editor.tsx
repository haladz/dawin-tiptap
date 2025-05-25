import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { useEffect, useState } from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import styles from '../styles/editor.module.css';

interface Mark {
  start: number;
  end: number;
  type: 'grammar' | 'style';
  explanation: string;
  suggestion: string;
}

export default function Editor() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [pendingText, setPendingText] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({
      multicolor: true,
    })],
    content: '',
    onUpdate({ editor }) {
      const text = editor.getText();
      setPendingText(text);
    },
  });

  async function checkText(text: string) {
    if (!text.trim()) {
      setMarks([]);
      return;
    }
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setMarks(data.marks || []);
    } catch (err) {
      console.error(err);
    }
  }

  // Debounce text checks so we don't spam the API
  useEffect(() => {
    if (!pendingText) return;
    const handle = setTimeout(() => {
      checkText(pendingText);
    }, 600);
    return () => clearTimeout(handle);
  }, [pendingText]);

  useEffect(() => {
    if (!editor) return;
    // Clear existing highlights
    editor.commands.unsetHighlight();

    marks.forEach((mark) => {
      editor.commands.setTextSelection({ from: mark.start, to: mark.end });
      const color = mark.type === 'grammar' ? 'rgba(255,0,0,0.4)' : 'rgba(255,200,0,0.4)';
      editor.commands.setHighlight({ color });

      const dom = editor.view.domAtPos(mark.start).node as HTMLElement;
      const tooltipContent = `<div class="tooltip"><p>${mark.explanation}</p><p><strong>Suggestion:</strong> ${mark.suggestion}</p></div>`;
      tippy(dom, {
        content: tooltipContent,
        allowHTML: true,
        trigger: 'mouseenter focus',
      });
    });
    editor.commands.setTextSelection(editor.state.selection.to);
  }, [editor, marks]);

  return <EditorContent editor={editor} className={styles.editor} />;
}
