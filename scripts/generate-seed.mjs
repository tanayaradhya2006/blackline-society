import { writeFileSync } from "node:fs";
import { brands, bikes, issues, modParts, mechanics, stateTopBikes } from "../data/seed-data.mjs";
import { STATES } from "../lib/states.mjs";

const q = (v) => {
  if (v === null || v === undefined || v === "") return "null";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `array[${v.map(q).join(",")}]::text[]`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const lines = ["begin;", "delete from public.issues where created_by is null;", "delete from public.mechanics where is_demo = true;"];

for (const s of STATES) {
  lines.push(`insert into public.states (slug,name) values (${q(s.slug)},${q(s.name)}) on conflict (slug) do update set name=excluded.name;`);
}

for (const b of brands) {
  lines.push(`insert into public.brands (slug,name,color,rsa_phone,rsa_hours,rsa_notes,customer_care,source_url) values (${[b.slug, b.name, b.color, b.rsa_phone, b.rsa_hours, b.rsa_notes, b.customer_care, b.source_url].map(q).join(",")}) on conflict (slug) do update set name=excluded.name, color=excluded.color, rsa_phone=excluded.rsa_phone, rsa_hours=excluded.rsa_hours, rsa_notes=excluded.rsa_notes, customer_care=excluded.customer_care, source_url=excluded.source_url;`);
}

for (const b of bikes) {
  lines.push(`insert into public.bikes (slug,brand_id,name,category,engine_cc,power_hp,torque_nm,mileage_kmpl,weight_kg,stock_noise_db,price_range,tagline) select ${q(b.slug)}, id, ${[b.name, b.category, b.engine_cc, b.power_hp, b.torque_nm, b.mileage_kmpl, b.weight_kg, b.stock_noise_db, b.price_range, b.tagline].map(q).join(",")} from public.brands where slug = ${q(b.brand)} on conflict (slug) do update set brand_id=excluded.brand_id, name=excluded.name, category=excluded.category, engine_cc=excluded.engine_cc, power_hp=excluded.power_hp, torque_nm=excluded.torque_nm, mileage_kmpl=excluded.mileage_kmpl, weight_kg=excluded.weight_kg, stock_noise_db=excluded.stock_noise_db, price_range=excluded.price_range, tagline=excluded.tagline;`);
}

lines.push("delete from public.state_bikes;");
for (const [state, slugs] of Object.entries(stateTopBikes)) {
  slugs.forEach((slug, i) => {
    lines.push(`insert into public.state_bikes (state_slug,bike_id,rank) select ${q(state)}, id, ${i + 1} from public.bikes where slug = ${q(slug)};`);
  });
}

for (const i of issues) {
  lines.push(`insert into public.issues (bike_id,title,description,severity,fix_tip) select id, ${[i.title, i.description, i.severity, i.fix_tip].map(q).join(",")} from public.bikes where slug = ${q(i.bike)};`);
}

for (const p of modParts) {
  lines.push(`insert into public.mod_parts (slug,name,icon,description,power_pct_min,power_pct_max,mileage_pct_min,mileage_pct_max,noise_db_min,noise_db_max,other_effects,legal_status,legal_summary,law_refs,source_url) values (${[p.slug, p.name, p.icon, p.description, p.power_pct_min, p.power_pct_max, p.mileage_pct_min, p.mileage_pct_max, p.noise_db_min, p.noise_db_max, p.other_effects, p.legal_status, p.legal_summary, p.law_refs, p.source_url].map(q).join(",")}) on conflict (slug) do update set name=excluded.name, icon=excluded.icon, description=excluded.description, power_pct_min=excluded.power_pct_min, power_pct_max=excluded.power_pct_max, mileage_pct_min=excluded.mileage_pct_min, mileage_pct_max=excluded.mileage_pct_max, noise_db_min=excluded.noise_db_min, noise_db_max=excluded.noise_db_max, other_effects=excluded.other_effects, legal_status=excluded.legal_status, legal_summary=excluded.legal_summary, law_refs=excluded.law_refs, source_url=excluded.source_url, last_checked=current_date;`);
}

lines.push("delete from public.mod_state_notes;");
for (const p of modParts) {
  for (const [state, n] of Object.entries(p.state_notes ?? {})) {
    lines.push(`insert into public.mod_state_notes (part_id,state_slug,note,source_url) select id, ${q(state)}, ${q(n.note)}, ${q(n.source_url)} from public.mod_parts where slug = ${q(p.slug)};`);
  }
}

for (const m of mechanics) {
  lines.push(`insert into public.mechanics (shop_name,state,city,address,phone,specialties,lat,lng,status,google_rating,google_found,is_demo) values (${[m.shop_name, m.state, m.city, m.address, m.phone, m.specialties, m.lat, m.lng, m.status, m.google_rating, true, true].map(q).join(",")});`);
}

lines.push("commit;");
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), lines.join("\n") + "\n");
console.log(`seed.sql written with ${lines.length - 3} statements`);
