import React from 'react';

const SuggestionPopup = ({ issue, position, onAccept, onIgnore }) => {
  if (!issue || !position) {
    return null;
  }

  // Styles are now applied via CSS classes defined in styles/globals.css
  const popupStyle = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    // Other styles like border, background, padding, zIndex, etc., are in CSS.
  };

  let title = 'Suggestion';
  if (issue.type === 'spelling') title = 'Spelling Mistake';
  else if (issue.type === 'grammar') title = 'Grammar Issue';
  else if (issue.type === 'style') title = 'Style Suggestion';
  else if (issue.type === 'phrasing') title = 'Phrasing Suggestion';

  return (
    <div style={popupStyle} className="suggestion-popup">
      <p className="suggestion-popup-title">
        <strong>{title}:</strong> {issue.message}
      </p>
      {issue.suggestions && issue.suggestions.length > 0 ? (
        <ul className="suggestion-popup-list">
          {issue.suggestions.map((suggestion, index) => (
            <li key={index} className="suggestion-popup-item">
              <button onClick={() => onAccept(issue, suggestion)}>
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="suggestion-popup-no-suggestions">No suggestions available.</p>
      )}
      <div className="suggestion-popup-actions">
        <button
          onClick={() => onIgnore(issue)}
          className="suggestion-popup-button" /* Add 'ignore' class if specific styling is needed */
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default SuggestionPopup;
