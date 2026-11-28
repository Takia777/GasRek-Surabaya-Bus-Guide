import { Fragment } from 'react';
import { formatKm, formatRupiah, formatTransfers, minutesBetween } from '../format.js';
import RouteMap from './RouteMap.jsx';
import '../styles/detail.css';

// Detail of one route: summary, route map and step-by-step legs.
export default function RouteDetail({ route, onBack }) {
  const firstLeg = route.legs[0];
  const lastLeg = route.legs[route.legs.length - 1];

  return (
    <section className="detail">
      <div className="detail-head">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          aria-label="Kembali ke hasil pencarian"
        >
          ←
        </button>
        <h1>Detail Perjalanan</h1>
      </div>

      <header className="detail-summary">
        <div className="detail-summary-top">
          <div>
            <span className="label-caps">Keberangkatan &amp; kedatangan</span>
            <div className="detail-times">
              {route.departure_time} → {route.arrival_time}
            </div>
          </div>
          <span className="duration-pill">
            Durasi: <strong>{route.duration_min} menit</strong>
          </span>
        </div>

        <dl className="detail-metrics">
          <div>
            <dt className="label-caps">Jarak total</dt>
            <dd>{formatKm(route.distance_km)}</dd>
          </div>
          <div>
            <dt className="label-caps">Transit</dt>
            <dd>{formatTransfers(route.transfers)}</dd>
          </div>
          <div>
            <dt className="label-caps">Total tarif</dt>
            <dd>{formatRupiah(route.fare)}</dd>
          </div>
        </dl>
      </header>

      <div className="detail-body">
        <div className="map-card detail-map">
          <div className="map-card-head">Peta jalur</div>
          <RouteMap legs={route.legs} />
        </div>

        <div className="detail-steps">
          <h2 className="steps-title">Langkah perjalanan</h2>

          <ol className="steps">
            <li className="point-card">
              <span className="point-icon point-icon-start" aria-hidden="true" />
              <div className="point-info">
                <span className="label-caps">Titik berangkat</span>
                <span className="point-name">{firstLeg.board_stop.name}</span>
              </div>
              <span className="point-time">{firstLeg.departure_time} WIB</span>
            </li>

            {route.legs.map((leg, index) => (
              <Fragment key={index}>
                {index > 0 && (
                  <li className="transit-card">
                    Pindah di <strong>{leg.board_stop.name}</strong> • Tunggu ~
                    {minutesBetween(route.legs[index - 1].arrival_time, leg.departure_time)} menit
                  </li>
                )}

                <li className="leg-card">
                  <div className="leg-head">
                    <span className="route-pill">{leg.route_id}</span>
                    <span className="leg-operator">{leg.operator}</span>
                    <span className="leg-duration">
                      {minutesBetween(leg.departure_time, leg.arrival_time)} menit
                    </span>
                  </div>

                  <p className="leg-text">
                    {index === 0 ? 'Naik' : 'Pindah ke'} <strong>{leg.route_id}</strong> dari{' '}
                    <strong>{leg.board_stop.name}</strong> ({leg.departure_time}) → turun di{' '}
                    <strong>{leg.alight_stop.name}</strong> ({leg.arrival_time})
                  </p>
                  <p className="leg-direction">{leg.direction}</p>

                  <details className="stops-toggle">
                    <summary>Halte dilewati ({leg.stops.length} halte)</summary>
                    <ul>
                      {leg.stops.map((stop) => (
                        <li key={stop.stop_id}>{stop.name}</li>
                      ))}
                    </ul>
                  </details>
                </li>
              </Fragment>
            ))}

            <li className="point-card">
              <span className="point-icon point-icon-end" aria-hidden="true" />
              <div className="point-info">
                <span className="label-caps">Tiba di tujuan</span>
                <span className="point-name">{lastLeg.alight_stop.name}</span>
              </div>
              <span className="point-time">{lastLeg.arrival_time} WIB</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
