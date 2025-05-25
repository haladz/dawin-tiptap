import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useCallback, useRef } from 'react';
import _debounce from 'lodash/debounce';
import HighlightExtension from '@/extensions/HighlightExtension';
import SuggestionPopup from './SuggestionPopup'; // Import the popup component

const Editor = () => {
  const [issues, setIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef(null); // To get editor container position

  const handleHighlightClick = ({ event, issue }) => {
    setActiveIssue(issue);
    // Position popup relative to the editor container to handle scrolling
    const editorRect = editorRef.current ? editorRef.current.getBoundingClientRect() : { top: 0, left: 0 };
    setPopupPosition({
      top: event.clientY - editorRect.top + window.scrollY + 10, // Add scrollY for absolute positioning
      left: event.clientX - editorRect.left + window.scrollX,      // Add scrollX
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      HighlightExtension.configure({
        issues,
        onHighlightClick: handleHighlightClick,
      }),
    ],
    content: '<p>This is a testt with some mistaks. Styel can be improved too.</p>',
    onUpdate: ({ editor }) => {
      debouncedCheckText(editor.getText());
      setActiveIssue(null); // Hide popup on text change
    },
  });

  const checkTextWithAPI = async (text) => {
    if (!text.trim()) {
      setIssues([]);
      return;
    }
    try {
      const response = await fetch('/api/checkText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData.error);
        setIssues([]);
        return;
      }
      const data = await response.json();
      console.log('API Response:', data);
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setIssues([]);
    }
  };

  const debouncedCheckText = useCallback(_debounce(checkTextWithAPI, 1000), []);

  useEffect(() => {
    if (editor && editor.extensionManager.extensions.find(ext => ext.name === 'highlightExtension')) {
      editor.chain().focus().updateExtensionOptions('highlightExtension', { issues, onHighlightClick: handleHighlightClick }).run();
    }
  }, [issues, editor]); // handleHighlightClick can be added if it changes, but it's stable if defined outside useEffect

  useEffect(() => {
    if (editor) {
      const timer = setTimeout(() => {
        debouncedCheckText(editor.getText());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editor, debouncedCheckText]);

  const handleAcceptSuggestion = (issueToCorrect, suggestion) => {
    if (!editor) return;
    const { startIndex, endIndex } = issueToCorrect;
    // Important: TipTap's `insertContentAt` uses Prosemirror positions.
    // We need to map character indices to Prosemirror positions.
    // This is a simplified approach. For complex content, a robust mapping from text offset to Prosemirror pos is needed.
    // The +1 is because Prosemirror positions are typically 1-based for user content.
    const from = startIndex + 1;
    const to = endIndex + 1;

    editor.chain().focus()
      .insertContentAt({ from, to }, suggestion)
      .run();

    // Remove the corrected issue from the list and update highlights
    const updatedIssues = issues.filter(i => i !== issueToCorrect);
    setIssues(updatedIssues);
    setActiveIssue(null); // Hide popup
    // Optionally, re-check text after correction
    // debouncedCheckText(editor.getText());
  };

  const handleIgnoreSuggestion = (issueToIgnore) => {
    // Remove the ignored issue from the list and update highlights
    const updatedIssues = issues.filter(i => i !== issueToIgnore);
    setIssues(updatedIssues);
    setActiveIssue(null); // Hide popup
  };


  return (
    <div ref={editorRef} style={{ position: 'relative' }}> {/* Wrapper for positioning context */}
      <EditorContent editor={editor} />
      {activeIssue && (
        <SuggestionPopup
          issue={activeIssue}
          position={popupPosition}
          onAccept={handleAcceptSuggestion}
          onIgnore={handleIgnoreSuggestion}
        />
      )}
    </div>
  );
};

export default Editor;
