// ── Тээврийн аргуудын өгөгдөл ─────────────────
export const METHODS = [
  {
    name:  "Air Express",
    time:  "3–5 Business Days",
    price: 12.50,
  },
  {
    name:  "Standard Cargo",
    time:  "7–10 Business Days",
    price: 8.00,
  },
];

// ── Хориотой барааны жагсаалт ─────────────────
export const PROHIBITED = [
  { label: "Explosives & Flammables",  sub: "Fireworks, fuel, lighter fluid, matches." },
  { label: "Dangerous Chemicals",       sub: "Corrosives, poisons, radioactive material." },
  { label: "Live Animals & Plants",     sub: "Pets, livestock, restricted seeds, soil." },
  { label: "Illegal Substances",        sub: "Narcotics, counterfeit goods, weapons." },
  { label: "Valuable Assets",           sub: "Cash, bullion, precious stones, bonds." },
  { label: "Lithium Batteries",         sub: "Certain standalone power banks and cells." },
];

// ── Тооцооллын тогтмол ────────────────────────
export const VOLUMETRIC_DIVISOR = 5000;
export const DEFAULT_RATE_PER_KG = 8.00;
