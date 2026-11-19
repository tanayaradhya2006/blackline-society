const rank = { legal: 0, conditional: 1, illegal: 2 };

export function buildStats(bike, parts) {
  const sum = (key) => parts.reduce((t, p) => t + Number(p[key] || 0), 0);
  const pMin = sum("power_pct_min");
  const pMax = sum("power_pct_max");
  const mMin = sum("mileage_pct_min");
  const mMax = sum("mileage_pct_max");
  const nMin = sum("noise_db_min");
  const nMax = sum("noise_db_max");
  const r = (v, d = 1) => Math.round(v * 10 ** d) / 10 ** d;
  const status = parts.reduce((worst, p) => (rank[p.legal_status] > rank[worst] ? p.legal_status : worst), "legal");
  return {
    power: { stock: bike.power_hp, min: r(bike.power_hp * (1 + pMin / 100)), max: r(bike.power_hp * (1 + pMax / 100)), pctMin: pMin, pctMax: pMax },
    mileage: { stock: bike.mileage_kmpl, min: r(bike.mileage_kmpl * (1 + mMin / 100)), max: r(bike.mileage_kmpl * (1 + mMax / 100)), pctMin: mMin, pctMax: mMax },
    noise: { stock: bike.stock_noise_db, min: bike.stock_noise_db + nMin, max: bike.stock_noise_db + nMax },
    status: parts.length ? status : "legal"
  };
}

export const legalStyle = {
  legal: { label: "Road legal", cls: "bg-transparent text-steel ring-steel/60" },
  conditional: { label: "Legal with conditions", cls: "bg-graphite-600 text-steel ring-gunmetal/70" },
  illegal: { label: "Not road legal", cls: "bg-burgundy text-bone ring-burgundy" }
};
