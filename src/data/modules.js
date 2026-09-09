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
    /*
     * Applications, and the groups they hang under.
     *
     * An entry with `apps` instead of `url` is a GROUP: a label carrying
     * dashboards, not something that opens. The Experience Builder app
     * "Park Operation Monitoring" (13f0692d…) is exactly that — it was one
     * embed whose own top nav led to four dashboards, so the frame showed a
     * landing page the user then had to navigate a second time. The four are
     * listed here instead and open directly; the app's name survives as the
     * group's.
     *
     * The order is the app's own nav order, so anyone who knows the app finds
     * the same sequence here. Leaves keep the exact shape they always had —
     * name, url, year — so a portal that groups nothing is unaffected, and an
     * application can still be moved between portals untouched.
     */
    apps: [
      {
        name: "Parks Operations Mapping and Monitoring",
        apps: [
          {
            name: "Gorilla Health Check Monitoring",
            url: "https://gis.rdb.rw/portal/apps/dashboards/c33a701b3592459c9ded457313ac8a8c",
            year: "Year 2",
          },
          {
            name: "Golden Monkey Monitoring",
            url: "https://gis.rdb.rw/portal/apps/dashboards/c1f3d6464dac4fa1a5c986b558d04331",
            year: "Year 2",
          },
          {
            name: "Chimpanzee Monitoring",
            url: "https://gis.rdb.rw/portal/apps/dashboards/9db15ec819064462a1a325552daa6ac2",
            year: "Year 2",
          },
          {
            name: "Plant Monitoring",
            url: "https://gis.rdb.rw/portal/apps/dashboards/37e9e92af64a41878564d035c41bd5cf",
            year: "Year 2",
          },
        ],
      },
      /*
       * Wildlife Conservation Mapping.
       *
       * The entry that arrived from the Conservation portal carried a single
       * URL, and it turned out to be the Gorilla Health Check dashboard now
       * listed above — so this is the real set, five RDB dashboards named by
       * the portal itself. They are `access: "org"` rather than public, so they
       * only resolve for a signed-in user; the proxy attaches the same RDB
       * token as everything else here, so nothing about the plumbing changes.
       */
      {
        name: "Wildlife Conservation Mapping",
        apps: [
          {
            name: "Sustainable Human-Wildlife Conflicts Management",
            url: "https://gis.rdb.rw/portal/apps/dashboards/ca6e8cdbba0d409e8a249a910d0707cb",
            year: "Year 1",
          },
          {
            // Portal title: "Illegal activities dashboard".
            name: "Illegal Activities",
            url: "https://gis.rdb.rw/portal/apps/dashboards/a2851299719e40408cc131cabcf41e5f",
            year: "Year 1",
          },
          {
            // Portal title: "Law__Enforcement" — the double underscore is a
            // typo in the item, not a name to reproduce in the sidebar.
            name: "Law Enforcement",
            url: "https://gis.rdb.rw/portal/apps/dashboards/c1c9bd914a9c4cdaac8411977ae90b21",
            year: "Year 1",
          },
          {
            name: "Ranger Based Monitoring",
            url: "https://gis.rdb.rw/portal/apps/dashboards/2c26b366cc414a61b9ca44cb7acac4f2",
            year: "Year 1",
          },
          {
            name: "Human and Wildlife Conflict Around GMN Park",
            url: "https://gis.rdb.rw/portal/apps/dashboards/9e7b6650d9f44db899846a90c289735d",
            year: "Year 1",
          },
        ],
      },
    ],
    features: features.parks,
  },
]

/** Every application in a module, with groups flattened away. */
export const leafApps = (mod) => mod.apps.flatMap((app) => app.apps || [app])

// Derived, never typed.
export const totals = {
  modules: modules.length,
  // Leaves only. A group is a label, and counting it would overstate the
  // portal by one wherever a total is shown.
  apps: modules.reduce((n, m) => n + leafApps(m).length, 0),
  features: modules.reduce((n, m) => n + m.features.length, 0),
}

export const getModule = (id) => modules.find((m) => m.id === id)
