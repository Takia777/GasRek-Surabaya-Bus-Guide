import { formatKm, formatRupiah, formatTransfers } from '../format.js';
import '../styles/results.css';

// Number of different stops the trip passes.
const countStops = (route) =>
  new Set(route.legs.flatMap((leg) => leg.stops.map((stop) => stop.stop_id))).size;

// List of route cards (routes[] of POST /routes/search). onSelect(route) opens the detail.
export default function RouteList({ routes, onSelect }) {
  return (
    <section className="results">
      <div className="results-head">
        <h2>Pilihan rute</h2>
        <p className="results-count">{routes.length} rute tersedia</p>
      </div>

      <ul className="route-list">
        {routes.map((route, index) => (
          <li key={index} className="route-card">
            <div className="route-card-top">
              <div>
                <div className="route-card-times">
                  {route.departure_time} → {route.arrival_time}
                  <span className="route-card-duration">{route.duration_min} menit</span>
                </div>
                <ul className="chips">
                  <li>{formatTransfers(route.transfers)}</li>
                  <li>{countStops(route)} halte dilewati</li>
                  <li>{formatKm(route.distance_km)}</li>
                </ul>
              </div>

              <div className="route-card-fare">
                <span className="label-caps">Total tarif</span>
                <strong>{formatRupiah(route.fare)}</strong>
              </div>
            </div>

            <div className="route-card-actions">
              <button
                type="button"
                className="primary-button route-card-button"
                onClick={() => onSelect(route)}
              >
                Detail
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
