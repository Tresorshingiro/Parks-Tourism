/**
 * Turns a portal application URL into one served through this portal's proxy.
 *
 * The dashboards cannot be framed directly: they are privately shared, so an
 * iframe pointed at gis.rdb.rw has no way to authenticate — a cross-origin
 * frame is sealed to us. Routing through /api/portal/gh makes the frame
 * same-origin, and the server attaches the signed-in user's portal token.
 */
/*
 * MUST match PORTAL_URL in .env — this is the client half of the same setting.
 * The browser bundle cannot read .env (nothing here is VITE_-prefixed, by
 * design, so no server config leaks to the page), so the origin is repeated
 * here. If one moves and the other does not, embedUrl() stops rewriting and
 * every dashboard silently loads cross-origin and is refused.
 *
 * This portal's content lives on RDB's ArcGIS Enterprise, not on GeoHub.
 */
export const PORTAL_ORIGIN = 'https://gis.rdb.rw/portal'
export const PROXY_BASE = '/api/portal/gh'

export function embedUrl(url) {
  if (typeof url !== 'string' || !url.startsWith(PORTAL_ORIGIN)) return url
  return PROXY_BASE + url.slice(PORTAL_ORIGIN.length)
}
