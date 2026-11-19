import { cookies } from "next/headers";
import { DEFAULT_STATE, STATE_COOKIE, findState } from "./states.mjs";

// Reads the rider's chosen state from their browser cookie.
// `chosen` is false the first time someone visits, so the "Find your state" screen opens.
export async function getCurrentState() {
  const store = await cookies();
  const picked = findState(store.get(STATE_COOKIE)?.value);
  return { state: picked ?? DEFAULT_STATE, chosen: Boolean(picked) };
}
