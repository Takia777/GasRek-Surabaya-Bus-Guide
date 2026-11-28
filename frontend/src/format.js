// Display helpers (Indonesian formats).

export const formatRupiah = (amount) => `Rp ${amount.toLocaleString('id-ID')}`;

export const formatKm = (km) =>
  `${km.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

export const formatTransfers = (n) => (n === 0 ? 'Tanpa pindah' : `${n}x pindah`);

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

// Minutes from one "HH:MM" to another (wraps over midnight).
export const minutesBetween = (from, to) => (((toMinutes(to) - toMinutes(from)) % 1440) + 1440) % 1440;
