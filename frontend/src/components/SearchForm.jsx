import { useState } from 'react';
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

// Calls onSearch(request) with the body of POST /routes/search.
export default function SearchForm({ onSearch, loading }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [time, setTime] = useState(currentTime);
  const [passengerType, setPassengerType] = useState('general');
  const [filter, setFilter] = useState('all');
  const [formError, setFormError] = useState('');

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
      <h2 className="search-title">Formulir Rute</h2>

      <StopInput id="origin" label="Dari (Halte Keberangkatan)" onSelect={setOrigin} />
      <StopInput id="destination" label="Ke (Halte Tujuan)" onSelect={setDestination} />

      <div className="field">
        <label htmlFor="time">Waktu keberangkatan</label>
        <input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
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
