import { useEffect, useRef, useState } from 'react';
import { searchStops } from '../api.js';

// Text input with stop-name suggestions (GET /stops?q=).
// onSelect(stop) is called with the chosen stop, or null when the user edits the text again.
export default function StopInput({ id, label, onSelect }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const requestId = useRef(0); // ignore answers that arrive late

  useEffect(() => {
    const q = text.trim();
    if (!open || q === '') {
      setSuggestions([]);
      setSearching(false);
      return undefined;
    }

    const current = ++requestId.current;
    setSearching(true);
    const timer = setTimeout(() => {
      searchStops(q, 8)
        .then((stops) => {
          if (current !== requestId.current) return;
          setSuggestions(stops);
          setFailed(false);
        })
        .catch(() => {
          if (current !== requestId.current) return;
          setSuggestions([]);
          setFailed(true);
        })
        .finally(() => {
          if (current === requestId.current) setSearching(false);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [text, open]);

  const handleChange = (e) => {
    setText(e.target.value);
    setOpen(true);
    onSelect(null); // the text changed, so the earlier choice no longer applies
  };

  const handleSelect = (stop) => {
    setText(stop.name);
    setOpen(false);
    onSelect(stop);
  };

  const showList = open && text.trim() !== '';

  return (
    <div className="field stop-input">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={`${id}-list`}
        placeholder="Ketik nama halte"
        value={text}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {showList && (
        <ul id={`${id}-list`} role="listbox" className="suggestions">
          {searching && <li className="suggestion-note">Mencari...</li>}
          {!searching && failed && (
            <li className="suggestion-note">Saran halte tidak bisa dimuat</li>
          )}
          {!searching && !failed && suggestions.length === 0 && (
            <li className="suggestion-note">Halte tidak ditemukan</li>
          )}
          {!searching &&
            suggestions.map((stop) => (
              <li
                key={stop.stop_id}
                role="option"
                aria-selected="false"
                onMouseDown={(e) => {
                  e.preventDefault(); // keep focus so the list does not close before the click
                  handleSelect(stop);
                }}
              >
                {stop.name}
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
