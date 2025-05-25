import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

const HighlightExtension = Extension.create({
  name: 'highlightExtension',

  addOptions() {
    return {
      issues: [], // Expected to be an array of { startIndex, endIndex, type, message, suggestions }
      onHighlightClick: ({ event, issue }) => {}, // Callback for when a highlight is clicked
    };
  },

  addProseMirrorPlugins() {
    const self = this; // Access the extension instance

    // Safeguard: Ensure self and self.options are available, providing defaults if not.
    const getOptions = () => {
      if (!self || !self.options) {
        // This case should ideally not happen if TipTap's lifecycle is correct.
        // Providing super-defensive defaults.
        return {
          issues: [],
          onHighlightClick: () => {},
        };
      }
      return {
        issues: self.options.issues || [],
        onHighlightClick: self.options.onHighlightClick || (() => {}),
      };
    };

    return [
      new Plugin({
        key: new PluginKey('highlight'),
        state: {
          init: (_, { doc }) => {
            const currentOptions = getOptions();
            const decorations = currentOptions.issues.map((issue, index) => {
              let className = 'highlight-default';
              if (issue.type === 'spelling' || issue.type === 'grammar') {
                className = 'highlight-red';
              } else if (issue.type === 'style') {
                className = 'highlight-yellow';
              } else if (issue.type === 'phrasing') {
                className = 'highlight-blue';
              }
              // Prosemirror positions are 1-based and different from character indices.
              // This is a simplified mapping. For complex documents, a more robust mapping is needed.
              const from = Math.min(Math.max(1, issue.startIndex + 1), doc.content.size -1);
              const to = Math.min(Math.max(from, issue.endIndex + 1), doc.content.size -1);

              if (from >= to) return null;

              return Decoration.inline(from, to, {
                class: className,
                'data-issue-index': index.toString(), // Add index to identify the issue
                // Store other data directly if small, or rely on index to fetch from issues array
                'data-issue-message': issue.message,
                'data-issue-suggestions': issue.suggestions.join('|||'), // Use a unique separator
                'data-issue-type': issue.type,
              });
            }).filter(Boolean);
            return DecorationSet.create(doc, decorations);
          },
          apply: (tr, oldSet, oldState, newState) => {
            const currentOptions = getOptions();
            const previousIssues = oldSet.spec && oldSet.spec.options ? oldSet.spec.options.issues || [] : [];

            if (tr.docChanged || oldState.doc.content.size !== newState.doc.content.size || currentOptions.issues !== previousIssues) {
              const { doc } = newState;
              const decorations = currentOptions.issues.map((issue, index) => {
                let className = 'highlight-default';
                if (issue.type === 'spelling' || issue.type === 'grammar') {
                  className = 'highlight-red';
                } else if (issue.type === 'style') {
                  className = 'highlight-yellow';
                } else if (issue.type === 'phrasing') {
                  className = 'highlight-blue';
                }
                const from = Math.min(Math.max(1, issue.startIndex + 1), doc.content.size -1);
                const to = Math.min(Math.max(from, issue.endIndex + 1), doc.content.size -1);

                if (from >= to) return null;

                return Decoration.inline(from, to, {
                  class: className,
                  'data-issue-index': index.toString(),
                  'data-issue-message': issue.message,
                  'data-issue-suggestions': issue.suggestions.join('|||'),
                  'data-issue-type': issue.type,
                });
              }).filter(Boolean);
              return DecorationSet.create(doc, decorations);
            }
            return oldSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
          handleDOMEvents: {
            click: (view, event) => {
              const target = event.target;
              if (target && target.hasAttribute('data-issue-index')) {
                const currentOptionsOnClick = getOptions(); // Get potentially updated options
                const issueIndex = parseInt(target.getAttribute('data-issue-index'), 10);
                const issue = currentOptionsOnClick.issues[issueIndex];

                if (issue && typeof currentOptionsOnClick.onHighlightClick === 'function') {
                  currentOptionsOnClick.onHighlightClick({ event, issue });
                  return true; // Indicate that the event was handled
                }
              }
              return false;
            },
          },
        },
        // The spec should reflect the structure expected by getOptions,
        // or simply pass self.options and let getOptions handle it.
        // For robustness, ensure spec.options exists for comparison in apply.
        spec: {
          options: self.options || { issues: [], onHighlightClick: () => {} },
        }
      }),
    ];
  },
});

export default HighlightExtension;
