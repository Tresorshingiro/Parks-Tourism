/**
 * Presentation config for the workspace.
 *
 * `src/data/modules.js` stays the single source of truth for content — it is
 * what `scripts/check-data.mjs` guards on every build. This file derives the
 * catalog from it and adds only what the UI needs: stable solution ids for the
 * routes, icons, and a same-origin `embedUrl`.
 */
import { modules as catalogSource } from './modules.js'
import { srcSet } from '../config/images.js'
import { embedUrl as sameOriginEmbed, formEmbedUrl } from '../lib/portal.js'

export const portal = {
  name: "Parks Operations Mapping",
  homeTitle: "Parks Operations Mapping",
  tagline: "Park operations, ranger reporting and wildlife.",
  /*
   * The ArcGIS Enterprise this portal signs into and embeds from.
   *
   * Named here rather than written into the components, because it is not the
   * same system for every portal — Parks & Tourism runs on RDB's Enterprise,
   * the rest on GeoHub. Hardcoding it meant the sign-in prompt and the privacy
   * note told the user to enter credentials for the wrong organisation.
   */
  identity: { name: 'RDB Portal', host: 'gis.rdb.rw' },

  // This portal's own module photograph, not a shared one — each split portal
  // is visually its own thing.
  hero: srcSet("parks-hero").src,
}

/**
 * Stable route ids for each application.
 *
 * Keyed by the application URL so a rename does not silently
 * repoint a link, and so a reorder cannot change a URL.
 */
const SOLUTION_IDS = {
  "https://gis.rdb.rw/portal/apps/dashboards/c33a701b3592459c9ded457313ac8a8c": "gorilla-health",
  "https://gis.rdb.rw/portal/apps/dashboards/c1f3d6464dac4fa1a5c986b558d04331": "golden-monkey",
  "https://gis.rdb.rw/portal/apps/dashboards/9db15ec819064462a1a325552daa6ac2": "chimpanzee",
  "https://gis.rdb.rw/portal/apps/dashboards/37e9e92af64a41878564d035c41bd5cf": "plant-monitoring",
  "https://gis.rdb.rw/portal/apps/dashboards/ca6e8cdbba0d409e8a249a910d0707cb": "human-wildlife-conflict",
  "https://gis.rdb.rw/portal/apps/dashboards/a2851299719e40408cc131cabcf41e5f": "illegal-activities",
  "https://gis.rdb.rw/portal/apps/dashboards/c1c9bd914a9c4cdaac8411977ae90b21": "law-enforcement",
  "https://gis.rdb.rw/portal/apps/dashboards/2c26b366cc414a61b9ca44cb7acac4f2": "ranger-monitoring",
  "https://gis.rdb.rw/portal/apps/dashboards/9e7b6650d9f44db899846a90c289735d": "gmn-park-conflict",
}

const MODULE_ICONS = {
  parks: "mountain",
}

const SOLUTION_ICONS = {
  // IconMark carries no animal glyphs, so the three species dashboards share
  // the monitoring mark and the label does the telling. Plant gets the leaf.
  "gorilla-health": "activity",
  "golden-monkey": "activity",
  "chimpanzee": "activity",
  "plant-monitoring": "leaf",
  "human-wildlife-conflict": "activity",
  "illegal-activities": "activity",
  "law-enforcement": "activity",
  "ranger-monitoring": "map",
  "gmn-park-conflict": "mountain",
}

/** A group's own mark, keyed by group name. */
const GROUP_ICONS = {
  "Parks Operations Mapping": "map",
  "Wildlife Conservation Mapping": "tree",
}

/*
 * Module accent for the light chrome.
 *
 * The catalog's `accentText` is the value drawn for this exact ground and
 * guarded at 4.5:1 on #FBFAF7 by scripts/check-data.mjs, so the sidebar uses it
 * directly. One palette, guarded in one place.
 */

/** The same accent at low alpha, for the active row's tint. */
function softAccent(hex, alpha) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * The Survey123 form feeding a dashboard, as a solution of its own.
 *
 * Its route id is derived from the dashboard's, so the pairing survives in the
 * URL and a form can never collide with an application id. Like every other
 * solution it is framed same-origin, through its own proxy base — see
 * formEmbedUrl() for why a direct frame does not work.
 *
 * The name is the form's own, so the form rows are distinguishable on their own
 * terms rather than relying on the dashboard above to tell them apart.
 */
function toForm(app, parentId) {
  return {
    id: `${parentId}-form`,
    name: app.form.name,
    icon: 'clipboard',
    isForm: true,
    embedUrl: formEmbedUrl(app.form.url),
  }
}

/** Turn one catalog application into the shape the UI renders. */
function toSolution(app) {
  const id = SOLUTION_IDS[app.url]
  return {
    id,
    name: app.name,
    year: app.year,
    icon: SOLUTION_ICONS[id] || 'map',
    isForm: false,
    // Same-origin only. The Portal sends X-Frame-Options, so a frame pointed
    // straight at gis.rdb.rw is refused, and a cross-origin frame could not
    // carry the session either.
    embedUrl: id ? sameOriginEmbed(app.url) : null,
    form: id && app.form ? toForm(app, id) : null,
  }
}

/*
 * Group a module's applications for the sidebar.
 *
 * A catalog entry carrying `apps` becomes a named group; a bare application
 * becomes an unnamed one, so the sidebar has a single list to walk rather than
 * two shapes to branch on. A named group is a LABEL — no id, no route, because
 * the Experience Builder app it is named after is no longer embedded.
 */
function toGroups(mod) {
  return mod.apps.map((app) =>
    app.apps
      ? {
          name: app.name,
          icon: GROUP_ICONS[app.name] || 'layers',
          solutions: app.apps.map(toSolution),
        }
      : { name: null, icon: null, solutions: [toSolution(app)] },
  )
}

/*
 * The flat list of routable applications.
 *
 * Flattened FROM `groups` rather than built alongside it, so the router and the
 * sidebar hold the same objects and not two equal copies. Every filter below
 * therefore only has to run over the groups; the flat view follows.
 */
const flatten = (groups) =>
  groups.flatMap((g) => g.solutions.flatMap((s) => (s.form ? [s, s.form] : [s])))

const catalog = catalogSource.map((mod) => {
  const groups = toGroups(mod)
  return {
    id: mod.id,
    name: mod.name,
    description: mod.description,
    icon: MODULE_ICONS[mod.id] || 'map',
    accent: mod.accent,
    accentText: mod.accentText,
    // Named for its role in the CSS (the rail, icon and active row), which is a
    // dark accent on light chrome — the guarded, contrast-checked catalog value.
    accentDark: mod.accentText,
    accentSoft: softAccent(mod.accent, 0.12),
    image: srcSet(mod.heroSlug).src,
    // What the sidebar draws.
    groups,
    // What the router, getSolution and every total consume — none of which
    // know groups exist.
    solutions: flatten(groups),
  }
})

/*
 * Drop anything that cannot actually be framed, then drop whatever that leaves
 * empty — a group whose dashboards have all gone, then a module with nothing
 * left. Filtering the groups alone is enough: the flat view is re-flattened
 * from the result, so the two cannot disagree about what is published.
 */
function publishedModules(source) {
  const live = (app) => Boolean(app.embedUrl)
  return source
    .map((mod) => {
      const groups = mod.groups
        .map((g) => ({
          ...g,
          solutions: g.solutions
            .filter(live)
            // A dashboard whose form went missing still publishes; the form is
            // an extra way in, not a requirement.
            .map((s) => (s.form && !live(s.form) ? { ...s, form: null } : s)),
        }))
        .filter((g) => g.solutions.length > 0)
      return { ...mod, groups, solutions: flatten(groups) }
    })
    .filter((mod) => mod.solutions.length > 0)
}

export const modules = publishedModules(catalog)

export const getModule = (id) => modules.find((m) => m.id === id)
export const getSolution = (mod, solutionId) =>
  mod ? mod.solutions.find((s) => s.id === solutionId) : undefined

export const stats = {
  modules: modules.length,
  // Dashboards, matching totals.apps. A form is another way into one of these,
  // not another solution, so counting it here would overstate the portal.
  solutions: modules.reduce((n, m) => n + m.solutions.filter((s) => !s.isForm).length, 0),
  forms: modules.reduce((n, m) => n + m.solutions.filter((s) => s.isForm).length, 0),
}

export const footer = {
  agency: '',
  blurb:
    'National environmental and natural resource intelligence, built on Earth observation and national field reporting.',
  contact: { email: '', phone: '' },
  quickLinks: [
    { label: 'Home', to: '/' },
    // Dashboards only. A form is another way into one of these, not another
    // solution, so it stays out of the footer like it stays out of stats.
    ...modules.flatMap((mod) =>
      mod.solutions
        .filter((s) => !s.isForm)
        .map((s) => ({ label: s.name, to: `/module/${mod.id}/app/${s.id}` })),
    ),
  ],
}
