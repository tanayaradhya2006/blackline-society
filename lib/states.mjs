// South India states the site covers, and how to work out a rider's state from GPS.
// This file is used on both the server and in the browser.

export const STATE_COOKIE = "bls_state";

export const STATES = [
  { slug: "karnataka", name: "Karnataka", city: "Bengaluru", center: [14.6, 76.2], zoom: 6.5 },
  { slug: "kerala", name: "Kerala", city: "Kochi", center: [10.4, 76.4], zoom: 7 },
  { slug: "tamil-nadu", name: "Tamil Nadu", city: "Chennai", center: [11.0, 78.4], zoom: 6.6 },
  { slug: "andhra-pradesh", name: "Andhra Pradesh", city: "Vijayawada", center: [15.9, 80.0], zoom: 6.4 },
  { slug: "telangana", name: "Telangana", city: "Hyderabad", center: [17.9, 79.0], zoom: 7 },
  { slug: "puducherry", name: "Puducherry", city: "Puducherry", center: [11.94, 79.81], zoom: 10 }
];

export const DEFAULT_STATE = STATES[0];

export function findState(slug) {
  return STATES.find((s) => s.slug === slug) ?? null;
}

// Reference towns: [latitude, longitude, state slug]. A rider is placed in the state of the
// nearest town. Towns marked null are just outside South India (Goa, Maharashtra,
// Chhattisgarh, Odisha) so that riders near a border are not put in the wrong state.
const TOWNS = [
  // Karnataka
  [12.97, 77.59, "karnataka"], [12.3, 76.64, "karnataka"], [12.91, 74.86, "karnataka"], [15.36, 75.12, "karnataka"],
  [15.85, 74.5, "karnataka"], [17.33, 76.83, "karnataka"], [15.14, 76.92, "karnataka"], [16.83, 75.71, "karnataka"],
  [13.93, 75.57, "karnataka"], [13.34, 77.1, "karnataka"], [14.46, 75.92, "karnataka"], [16.21, 77.36, "karnataka"],
  [17.91, 77.52, "karnataka"], [13.0, 76.1, "karnataka"], [13.34, 74.75, "karnataka"], [14.81, 74.13, "karnataka"],
  [13.32, 75.77, "karnataka"], [12.42, 75.74, "karnataka"], [14.23, 76.4, "karnataka"], [13.14, 78.13, "karnataka"],
  [12.52, 76.9, "karnataka"], [16.18, 75.7, "karnataka"], [15.43, 75.63, "karnataka"], [14.79, 75.4, "karnataka"],
  [15.35, 76.15, "karnataka"], [11.92, 76.94, "karnataka"], [16.77, 77.14, "karnataka"], [13.43, 77.73, "karnataka"],
  [12.72, 77.28, "karnataka"], [14.62, 74.84, "karnataka"], [15.6, 74.9, "karnataka"], [14.0, 74.55, "karnataka"],
  // Kerala
  [8.52, 76.94, "kerala"], [8.89, 76.61, "kerala"], [9.26, 76.79, "kerala"], [9.5, 76.34, "kerala"],
  [9.59, 76.52, "kerala"], [9.85, 76.97, "kerala"], [10.09, 77.06, "kerala"], [9.93, 76.27, "kerala"],
  [10.53, 76.21, "kerala"], [10.78, 76.65, "kerala"], [11.07, 76.07, "kerala"], [11.26, 75.78, "kerala"],
  [11.61, 76.08, "kerala"], [11.87, 75.37, "kerala"], [12.5, 74.99, "kerala"], [11.75, 75.49, "kerala"],
  // Tamil Nadu
  [13.08, 80.27, "tamil-nadu"], [11.02, 76.96, "tamil-nadu"], [9.93, 78.12, "tamil-nadu"], [10.8, 78.69, "tamil-nadu"],
  [11.66, 78.15, "tamil-nadu"], [8.71, 77.76, "tamil-nadu"], [11.11, 77.34, "tamil-nadu"], [11.34, 77.72, "tamil-nadu"],
  [12.92, 79.13, "tamil-nadu"], [8.76, 78.13, "tamil-nadu"], [10.79, 79.14, "tamil-nadu"], [10.36, 77.98, "tamil-nadu"],
  [12.83, 79.7, "tamil-nadu"], [8.18, 77.41, "tamil-nadu"], [12.74, 77.83, "tamil-nadu"], [12.52, 78.21, "tamil-nadu"],
  [12.13, 78.16, "tamil-nadu"], [11.41, 76.7, "tamil-nadu"], [11.75, 79.75, "tamil-nadu"], [11.94, 79.49, "tamil-nadu"],
  [10.96, 78.08, "tamil-nadu"], [11.22, 78.17, "tamil-nadu"], [10.38, 78.82, "tamil-nadu"], [9.37, 78.83, "tamil-nadu"],
  [9.85, 78.48, "tamil-nadu"], [9.58, 77.96, "tamil-nadu"], [10.77, 79.84, "tamil-nadu"], [12.23, 79.07, "tamil-nadu"],
  [10.01, 77.48, "tamil-nadu"], [10.96, 79.39, "tamil-nadu"], [13.14, 79.91, "tamil-nadu"], [11.48, 79.6, "tamil-nadu"],
  // Andhra Pradesh
  [17.69, 83.22, "andhra-pradesh"], [16.51, 80.65, "andhra-pradesh"], [16.51, 80.52, "andhra-pradesh"], [16.31, 80.44, "andhra-pradesh"],
  [14.44, 79.99, "andhra-pradesh"], [13.63, 79.42, "andhra-pradesh"], [15.83, 78.04, "andhra-pradesh"], [14.68, 77.6, "andhra-pradesh"],
  [14.47, 78.82, "andhra-pradesh"], [17.0, 81.8, "andhra-pradesh"], [16.99, 82.25, "andhra-pradesh"], [16.71, 81.1, "andhra-pradesh"],
  [15.5, 80.05, "andhra-pradesh"], [18.3, 83.9, "andhra-pradesh"], [18.11, 83.4, "andhra-pradesh"], [13.22, 79.1, "andhra-pradesh"],
  [16.19, 81.14, "andhra-pradesh"], [15.48, 78.48, "andhra-pradesh"], [13.83, 77.49, "andhra-pradesh"], [16.54, 81.52, "andhra-pradesh"],
  [18.08, 82.67, "andhra-pradesh"], [15.74, 79.27, "andhra-pradesh"], [18.75, 84.1, "andhra-pradesh"], [17.33, 82.0, "andhra-pradesh"],
  // Telangana
  [17.39, 78.49, "telangana"], [17.97, 79.59, "telangana"], [18.44, 79.13, "telangana"], [18.67, 78.09, "telangana"],
  [17.25, 80.15, "telangana"], [16.74, 78.0, "telangana"], [17.05, 79.27, "telangana"], [19.66, 78.53, "telangana"],
  [18.1, 78.85, "telangana"], [17.14, 79.62, "telangana"], [18.87, 79.44, "telangana"], [17.62, 78.09, "telangana"],
  [17.55, 80.62, "telangana"], [16.36, 78.06, "telangana"], [17.34, 77.9, "telangana"], [19.1, 78.34, "telangana"],
  [18.79, 78.91, "telangana"], [18.03, 78.26, "telangana"], [17.67, 80.89, "telangana"], [16.23, 77.8, "telangana"],
  // Puducherry (four separate pieces)
  [11.94, 79.83, "puducherry"], [10.93, 79.84, "puducherry"], [11.7, 75.53, "puducherry"], [16.73, 82.21, "puducherry"],
  // Just outside South India
  [15.49, 73.83, null], [15.28, 73.96, null], [15.9, 73.82, null], [16.99, 73.3, null], [16.7, 74.24, null],
  [16.22, 74.35, null], [16.85, 74.58, null], [17.05, 75.22, null], [17.66, 75.91, null], [17.52, 76.2, null],
  [18.18, 76.04, null], [18.4, 76.56, null], [19.15, 77.31, null], [20.39, 78.12, null], [19.96, 79.3, null],
  [20.18, 79.99, null], [18.85, 79.96, null], [18.8, 80.82, null], [18.39, 81.66, null], [19.08, 82.02, null],
  [18.35, 81.89, null], [18.81, 82.71, null], [19.17, 83.42, null], [19.31, 84.79, null]
];

const MAX_KM = 100;

function distanceKm(lat1, lng1, lat2, lng2) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

// Returns the state object for a GPS position, or null if it is outside South India.
export function stateFromCoords(lat, lng) {
  let best = null;
  let bestKm = Infinity;
  for (const [tLat, tLng, slug] of TOWNS) {
    const km = distanceKm(lat, lng, tLat, tLng);
    if (km < bestKm) {
      bestKm = km;
      best = slug;
    }
  }
  if (!best || bestKm > MAX_KM) return null;
  return findState(best);
}
