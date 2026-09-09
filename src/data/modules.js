import { features } from './features.generated.js'

/**
 * This portal carries ONE module. It was split out of the combined
 * Environmental and Natural Resource portal so each module ships, deploys and
 * is access-controlled on its own.
 *
 * The shape is unchanged from the parent — same fields, same guard — so a
 * module can be moved back or across without touching any component.
 */
export const modules = [
  {
    id: "parks",
    index: '01',
    name: "Parks and Tourism Management",
    accent: "#C98A21",
    accentText: "#9B6A19",
    description: "Park operations, ranger reporting, wildlife incidents and visitor analytics.",
    cardSlug: "parks-card",
    heroSlug: "parks-hero",
    cardAlt: "Zebra on open savannah in Akagera National Park",
    apps: [
      {
        name: "Parks Operations Mapping and Monitoring",
        url: "https://gis.rdb.rw/portal/apps/experiencebuilder/experience/?id=13f0692d8992482fa9d516609f0bf4b3",
        year: "Year 2",
      },
      /*
       * Moved here from the Conservation portal.
       *
       * It is an RDB item, and Conservation signs into GeoHub — so over there it
       * was the one application that could not be proxied, and was framed
       * cross-origin carrying no session. This portal already runs on RDB's
       * Enterprise, so here embedUrl() rewrites it like any other and the frame
       * gets the signed-in user's token.
       */
      {
        name: "Wildlife Conservation Mapping",
        url: "https://gis.rdb.rw/portal/apps/dashboards/c33a701b3592459c9ded457313ac8a8c",
        year: "Year 1",
      },
    ],
    features: features.parks,
  },
]

// Derived, never typed.
export const totals = {
  modules: modules.length,
  apps: modules.reduce((n, m) => n + m.apps.length, 0),
  features: modules.reduce((n, m) => n + m.features.length, 0),
}

export const getModule = (id) => modules.find((m) => m.id === id)
