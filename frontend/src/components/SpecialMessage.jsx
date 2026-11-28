import '../styles/notice.css';

const LABELS = {
  ended_today: 'Operasional berakhir',
  no_route: 'Rute tidak ditemukan',
  error: 'Terjadi kesalahan',
};

// Shown when POST /routes/search does not return routes:
//   ended_today -> all buses for today have left
//   no_route    -> no path between the two stops
//   error       -> the backend reports an error
// The message text comes from the API; the alternative stop comes with ended_today and no_route.
export default function SpecialMessage({ result }) {
  const { status, message, alternative_stop: alternativeStop } = result;
  const showAlternative = status === 'ended_today' || status === 'no_route';

  return (
    <>
      <section
        className={`notice notice-${status}`}
        role={status === 'error' ? 'alert' : 'status'}
      >
        <span className="notice-icon" aria-hidden="true">
          {status === 'ended_today' ? '☾' : '!'}
        </span>
        <div>
          {LABELS[status] && <span className="notice-chip">{LABELS[status]}</span>}
          <p className="notice-message">{message}</p>
        </div>
      </section>

      {showAlternative && (
        <section className="alt-card">
          <h3>Halte alternatif terdekat:</h3>
          <p className="alt-stop">{alternativeStop ? alternativeStop.name : 'tidak ada'}</p>
        </section>
      )}
    </>
  );
}
