import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// One color per leg, so a transfer is visible on the map.
const LEG_COLORS = ['#1c1b1b', '#ba1a1a', '#1a5fba'];
const SURABAYA_CENTER = [-7.2575, 112.7521];

// Draws the route on OpenStreetMap: a line through the stops of each leg.
// Stops where the passenger boards or alights are drawn larger, with a white fill.
export default function RouteMap({ legs }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const map = L.map(containerRef.current);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const allPoints = [];

    legs.forEach((leg, legIndex) => {
      const color = LEG_COLORS[legIndex % LEG_COLORS.length];
      const points = leg.stops.map((stop) => [stop.lat, stop.lon]);
      allPoints.push(...points);

      L.polyline(points, { color, weight: 5 }).addTo(map);

      leg.stops.forEach((stop, stopIndex) => {
        const isEnd = stopIndex === 0 || stopIndex === leg.stops.length - 1;
        L.circleMarker([stop.lat, stop.lon], {
          radius: isEnd ? 7 : 4,
          color,
          weight: 3,
          fillColor: isEnd ? '#ffffff' : color,
          fillOpacity: 1,
        })
          .bindTooltip(stop.name)
          .addTo(map);
      });
    });

    if (allPoints.length > 0) {
      map.fitBounds(allPoints, { padding: [24, 24] });
    } else {
      map.setView(SURABAYA_CENTER, 12);
    }

    return () => map.remove();
  }, [legs]);

  return <div ref={containerRef} className="route-map" role="img" aria-label="Peta jalur rute" />;
}
