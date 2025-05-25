import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState, useCallback, useRef } from 'react';
import _debounce from 'lodash/debounce';
import HighlightExtension from '@/extensions/HighlightExtension';
import SuggestionPopup from './SuggestionPopup';

const Editor = () => {
  const [issues, setIssues] = useState([]);
  const [activeIssue, setActiveIssue] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef(null);

  // Memoize handleHighlightClick as it's a dependency for useEditor
  const handleHighlightClick = useCallback(({ event, issue }) => {
    setActiveIssue(issue);
    const editorRect = editorRef.current ? editorRef.current.getBoundingClientRect() : { top: 0, left: 0 };
    setPopupPosition({
      top: event.clientY - editorRect.top + window.scrollY + 10,
      left: event.clientX - editorRect.left + window.scrollX,
    });
  }, []); // No dependencies, this function is stable

  const editor = useEditor({
    extensions: [
      StarterKit,
      HighlightExtension.configure({ // Initial options
        issues,
        onHighlightClick: handleHighlightClick,
      }),
    ],
    content: '<p>This is a testt with some mistaks. Styel can be improved too.</p>',
    onUpdate: ({ editor }) => {
      debouncedCheckText(editor.getText());
      setActiveIssue(null);
    },
  }, []); // Initialize once; options updated via useEffect

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

      const contentType = response.headers.get('content-type') || '';
      let responseData;
      if (contentType.includes('application/json')) {
        // Safely parse JSON only if the response is JSON
        responseData = await response.json();
      } else {
        // Fallback to text to avoid JSON parsing errors like
        // "SyntaxError: Unexpected token '<'"
        const textData = await response.text();
        responseData = { error: textData };
      }

      if (!response.ok) {
        console.error('API Error:', responseData.error || response.statusText);
        setIssues([]);
        return;
      }

      console.log('API Response:', responseData);
      setIssues(responseData.issues || []);
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setIssues([]);
    }
  };

  const debouncedCheckText = useCallback(_debounce(checkTextWithAPI, 1000), []);

  // Update HighlightExtension options when issues change without re-initializing the editor
  useEffect(() => {
    if (editor && editor.extensionManager.extensions.find(ext => ext.name === 'highlightExtension')) {
      editor.chain().focus().updateExtensionOptions('highlightExtension', { issues, onHighlightClick: handleHighlightClick }).run();
    }
  }, [issues, editor, handleHighlightClick]);

  useEffect(() => {
    if (editor) {
      const timer = setTimeout(() => {
        debouncedCheckText(editor.getText());
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [editor, debouncedCheckText]); // debouncedCheckText is stable

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
      {/* dir="auto" allows automatic right-to-left support when typing Arabic */}
      <EditorContent editor={editor} dir="auto" />
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
