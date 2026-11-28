import { useEffect, useState } from 'react';
import StopInput from './StopInput.jsx';
import '../styles/search-form.css';

const PASSENGER_TYPES = [
  { value: 'general', label: 'Umum' },
  { value: 'student', label: 'Pelajar' },
  { value: 'elderly', label: 'Lansia' },
  { value: 'child', label: 'Anak (di bawah 5 tahun)' },
  { value: 'disabled', label: 'Disabilitas' },
  { value: 'veteran', label: 'Veteran' },
];

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'fastest', label: 'Tercepat' },
  { value: 'cheapest', label: 'Termurah' },
];

const currentTime = () => {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

// "Sekarang", "+15 m", "+30 m": clock time now plus some minutes (wraps after midnight).
const timeFromNow = (plusMin) => {
  const d = new Date(Date.now() + plusMin * 60000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

// Calls onSearch(request) with the body of POST /routes/search.
// originOverride = { stop, nonce }: when the nonce changes, the origin is replaced by that stop.
export default function SearchForm({ onSearch, loading, originOverride }) {
  const [origin, setOrigin] = useState(null);
  const [originText, setOriginText] = useState('');
  const [destination, setDestination] = useState(null);
  const [destinationText, setDestinationText] = useState('');
  const [time, setTime] = useState(currentTime);
  const [passengerType, setPassengerType] = useState('general');
  const [filter, setFilter] = useState('all');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!originOverride) return;
    setOrigin(originOverride.stop);
    setOriginText(originOverride.stop.name);
    setFormError('');
  }, [originOverride]);

  const handleSwap = () => {
    setOrigin(destination);
    setOriginText(destinationText);
    setDestination(origin);
    setDestinationText(originText);
  };

  const handleReset = () => {
    setOrigin(null);
    setOriginText('');
    setDestination(null);
    setDestinationText('');
    setTime(currentTime());
    setPassengerType('general');
    setFilter('all');
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!origin) return setFormError('Pilih halte asal dari daftar saran.');
    if (!destination) return setFormError('Pilih halte tujuan dari daftar saran.');
    if (origin.stop_id === destination.stop_id) {
      return setFormError('Halte asal dan tujuan tidak boleh sama.');
    }
    if (!time) return setFormError('Isi jam berangkat.');

    setFormError('');
    return onSearch({
      origin_stop_id: origin.stop_id,
      destination_stop_id: destination.stop_id,
      departure_time: time,
      passenger_type: passengerType,
      filter,
    });
  };

  return (
    <form className="search-card" onSubmit={handleSubmit} noValidate>
      <div className="search-head">
        <h2 className="search-title">Formulir Rute</h2>
        <button type="button" className="text-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      <StopInput
        id="origin"
        label="Dari (Halte Keberangkatan)"
        text={originText}
        onTextChange={setOriginText}
        onSelect={setOrigin}
      />

      <button
        type="button"
        className="swap-button"
        aria-label="Tukar halte asal dan tujuan"
        onClick={handleSwap}
      >
        ⇅
      </button>

      <StopInput
        id="destination"
        label="Ke (Halte Tujuan)"
        text={destinationText}
        onTextChange={setDestinationText}
        onSelect={setDestination}
      />

      <div className="field">
        <label htmlFor="time">Waktu keberangkatan</label>
        <div className="time-row">
          <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          {[
            ['Sekarang', 0],
            ['+15 m', 15],
            ['+30 m', 30],
          ].map(([text, plus]) => (
            <button
              key={text}
              type="button"
              className="chip-button"
              onClick={() => setTime(timeFromNow(plus))}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="passenger">Kategori penumpang</label>
        <select
          id="passenger"
          value={passengerType}
          onChange={(e) => setPassengerType(e.target.value)}
        >
          {PASSENGER_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="field filter-group">
        <legend>Tampilkan rute</legend>
        <div className="segmented">
          {FILTERS.map((f) => (
            <label key={f.value} className="segment">
              <input
                type="radio"
                name="filter"
                value={f.value}
                checked={filter === f.value}
                onChange={() => setFilter(f.value)}
              />
              <span>{f.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className="primary-button submit-button" disabled={loading}>
        {loading ? 'Mencari...' : 'Cari rute'}
      </button>
    </form>
  );
}
