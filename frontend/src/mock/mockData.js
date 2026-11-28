// MOCK DATA (data tiruan), shaped like docs/api-contract.md.
// Stop names follow the contract examples; coordinates are approximate and for testing only.

export const MOCK_STOPS = [
  { stop_id: 'STP0001', name: 'Halte ITS', group_id: 'GRP0001', operators: ['Suroboyo Bus', 'Wira Wiri'], lat: -7.28, lon: 112.79 },
  { stop_id: 'STP0050', name: 'Terminal Bratang', group_id: 'GRP0050', operators: ['Wira Wiri', 'Suroboyo Bus'], lat: -7.2999, lon: 112.764 },
  { stop_id: 'STP0200', name: 'Tunjungan', group_id: 'GRP0200', operators: ['Suroboyo Bus'], lat: -7.2625, lon: 112.738 },
  { stop_id: 'STP0300', name: 'Halte Tunjungan 2', group_id: 'GRP0200', operators: ['Suroboyo Bus'], lat: -7.2641, lon: 112.7391 },
  { stop_id: 'STP0999', name: 'Halte Terpencil (tiruan)', group_id: 'GRP0999', operators: ['Wira Wiri'], lat: -7.4, lon: 112.9 },
];

const stop = (id) => {
  const s = MOCK_STOPS.find((x) => x.stop_id === id);
  return { stop_id: s.stop_id, name: s.name, lat: s.lat, lon: s.lon };
};

// Fare per passenger type (from data/raw/fares.md); the mock does not model the 2-hour rule.
export const FARE_BY_TYPE = {
  general: 5000,
  student: 2500,
  elderly: 0,
  child: 0,
  disabled: 0,
  veteran: 0,
};

// Route with one transfer (same as the contract example, plus a second leg).
export const MOCK_ROUTE_TRANSFER = {
  departure_time: '15:06',
  arrival_time: '16:02',
  duration_min: 56,
  transfers: 1,
  fare: 2500,
  distance_km: 14.2,
  legs: [
    {
      route_id: 'FD11',
      operator: 'Wira Wiri',
      direction: 'Shelter Bulak → Terminal Bratang',
      board_stop: { stop_id: 'STP0001', name: 'Halte ITS' },
      alight_stop: { stop_id: 'STP0050', name: 'Terminal Bratang' },
      departure_time: '15:06',
      arrival_time: '15:31',
      stops: [stop('STP0001'), stop('STP0050')],
      distance_km: 7.1,
    },
    {
      route_id: 'R1',
      operator: 'Suroboyo Bus',
      direction: 'Terminal Purabaya → Rajawali',
      board_stop: { stop_id: 'STP0050', name: 'Terminal Bratang' },
      alight_stop: { stop_id: 'STP0200', name: 'Tunjungan' },
      departure_time: '15:40',
      arrival_time: '16:02',
      stops: [stop('STP0050'), stop('STP0200')],
      distance_km: 7.1,
    },
  ],
};

// Direct route, no transfer.
export const MOCK_ROUTE_DIRECT = {
  departure_time: '15:20',
  arrival_time: '16:25',
  duration_min: 65,
  transfers: 0,
  fare: 2500,
  distance_km: 13.0,
  legs: [
    {
      route_id: 'R4',
      operator: 'Suroboyo Bus',
      direction: 'Terminal Benowo → Tunjungan',
      board_stop: { stop_id: 'STP0001', name: 'Halte ITS' },
      alight_stop: { stop_id: 'STP0200', name: 'Tunjungan' },
      departure_time: '15:20',
      arrival_time: '16:25',
      stops: [stop('STP0001'), stop('STP0200')],
      distance_km: 13.0,
    },
  ],
};

export const MOCK_ALTERNATIVE_STOP = stop('STP0300');
