// Fake backend. Same inputs and outputs as docs/api-contract.md, no network needed.
import {
  MOCK_STOPS,
  FARE_BY_TYPE,
  MOCK_ROUTE_TRANSFER,
  MOCK_ROUTE_DIRECT,
  MOCK_ALTERNATIVE_STOP,
} from './mockData.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// GET /stops?q=&limit=
export async function mockSearchStops(q, limit = 10) {
  await delay(150);
  const query = (q || '').trim().toLowerCase();
  return MOCK_STOPS.filter((s) => s.name.toLowerCase().includes(query)).slice(0, limit);
}

// POST /routes/search
// Mock scenarios:
//   destination STP0999        -> status "no_route"
//   departure_time >= "21:00"  -> status "ended_today"
//   anything else              -> status "ok"
export async function mockSearchRoutes(req) {
  await delay(300);

  if (req.destination_stop_id === 'STP0999') {
    return {
      status: 'no_route',
      message: 'Tidak ada rute untuk tujuan tersebut',
      routes: [],
      alternative_stop: null,
    };
  }

  if (req.departure_time >= '21:00') {
    return {
      status: 'ended_today',
      message: 'Sisa rute hari ini sudah habis, tunggu besok',
      routes: [],
      alternative_stop: MOCK_ALTERNATIVE_STOP,
    };
  }

  const fare = FARE_BY_TYPE[req.passenger_type] ?? FARE_BY_TYPE.general;
  let routes = [MOCK_ROUTE_TRANSFER, MOCK_ROUTE_DIRECT].map((r) => ({ ...r, fare }));

  // fastest or cheapest: exactly one route (the mock picks the first one)
  if (req.filter === 'fastest' || req.filter === 'cheapest') {
    routes = [routes[0]];
  }

  return { status: 'ok', message: null, routes, alternative_stop: null };
}

// POST /chat
// Mock behaviour:
//   message is exactly "Tunjungan" or "Halte Tunjungan 2" -> answer with routes
//   message mentions "tunjungan" otherwise                 -> ask which stop is meant
//   anything else                                          -> "not understood" reply
export async function mockChat(req) {
  await delay(400);
  const text = req.message.trim().toLowerCase();

  if (text === 'tunjungan' || text === 'halte tunjungan 2') {
    const routes = [MOCK_ROUTE_TRANSFER, MOCK_ROUTE_DIRECT];
    return {
      reply:
        'Ada 2 rute yang masih tersedia. Yang tercepat: naik FD11 dari Halte ITS pukul 15.06, ' +
        'pindah di Terminal Bratang ke R1, tiba di Tunjungan pukul 16.02. Tarif Rp 2.500.',
      search: {
        origin_stop_id: 'STP0001',
        destination_stop_id: 'STP0200',
        departure_time: '15:00',
        passenger_type: 'student',
        filter: 'all',
      },
      result: { status: 'ok', routes, alternative_stop: null },
      needs_clarification: false,
      options: [],
    };
  }

  if (text.includes('tunjungan')) {
    return {
      reply: 'Halte Tunjungan yang mana maksudmu?',
      search: null,
      result: null,
      needs_clarification: true,
      options: MOCK_STOPS.filter((s) => s.name.toLowerCase().includes('tunjungan')).map((s) => ({
        stop_id: s.stop_id,
        name: s.name,
      })),
    };
  }

  return {
    reply: 'Maaf, aku belum paham. Coba tulis halte asal, tujuan, dan jam berangkat.',
    search: null,
    result: null,
    needs_clarification: false,
    options: [],
  };
}
