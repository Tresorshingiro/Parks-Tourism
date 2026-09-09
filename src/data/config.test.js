import { describe, expect, it } from 'vitest'
import { modules, stats, getSolution } from './config.js'
import { modules as catalog, totals } from './modules.js'

/*
 * The catalog gained a level: an entry under a module's `apps` may now carry
 * its own `apps` instead of a `url`, which makes it a GROUP — a label with
 * dashboards under it, not something you can open.
 *
 * Two views are derived from that one source and they must not drift:
 *   `mod.groups`    - what the sidebar draws, the tree.
 *   `mod.solutions` - what the router resolves, the flat leaves.
 * Everything downstream of `solutions` (AppViewer, getSolution, stats, the
 * footer links) predates groups and is untouched, so the flattening is the
 * thing holding the change together.
 */

const groupLeaves = (mod) => mod.groups.flatMap((g) => g.solutions)

describe('catalog groups', () => {
  it('flattens every group back to exactly the routable solutions, in order', () => {
    for (const mod of modules) {
      expect(groupLeaves(mod).map((s) => s.id)).toEqual(mod.solutions.map((s) => s.id))
    }
  })

  it('counts leaves, never group labels', () => {
    // A group is a label. Counting it as an application would overstate the
    // portal by one on every screen that shows a total.
    const leaves = modules.reduce((n, m) => n + m.solutions.length, 0)
    expect(stats.solutions).toBe(leaves)
    expect(totals.apps).toBe(leaves)
    expect(totals.apps).toBe(9)
  })

  it('gives a group a name and no url of its own', () => {
    for (const mod of catalog) {
      for (const app of mod.apps) {
        if (!app.apps) continue
        expect(app.name).toBeTruthy()
        expect(app.url).toBeUndefined()
        expect(app.apps.length).toBeGreaterThan(0)
      }
    }
  })

  const parksGroup = (name) =>
    modules.find((m) => m.id === 'parks').groups.find((g) => g.name === name)

  it('puts the four park dashboards under one group, in the order the app navigates them', () => {
    const group = parksGroup('Parks Operations Mapping and Monitoring')
    expect(group).toBeDefined()
    expect(group.solutions.map((s) => s.name)).toEqual([
      'Gorilla Health Check Monitoring',
      'Golden Monkey Monitoring',
      'Chimpanzee Monitoring',
      'Plant Monitoring',
    ])
  })

  it('puts the five conservation dashboards under their own group', () => {
    const group = parksGroup('Wildlife Conservation Mapping')
    expect(group).toBeDefined()
    expect(group.solutions.map((s) => s.name)).toEqual([
      'Sustainable Human-Wildlife Conflicts Management',
      'Illegal Activities',
      'Law Enforcement',
      'Ranger Based Monitoring',
      'Human and Wildlife Conflict Around GMN Park',
    ])
  })

  it('keeps the two groups apart and in catalog order', () => {
    const parks = modules.find((m) => m.id === 'parks')
    expect(parks.groups.map((g) => g.name)).toEqual([
      'Parks Operations Mapping and Monitoring',
      'Wildlife Conservation Mapping',
    ])
    // Every route id is unique across groups, or one dashboard would shadow
    // another on the same URL.
    const ids = parks.solutions.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps every leaf resolvable by the route it is linked as', () => {
    for (const mod of modules) {
      for (const solution of groupLeaves(mod)) {
        expect(getSolution(mod, solution.id)).toBe(solution)
        expect(solution.embedUrl.startsWith('/api/portal/gh/')).toBe(true)
      }
    }
  })

  it('no longer embeds the Experience Builder app the group was named after', () => {
    // It became the group's label. Leaving its URL in the catalog would put a
    // fifth row back in the sidebar carrying the page the split was undoing.
    const urls = catalog.flatMap((m) => m.apps.flatMap((a) => a.apps || [a])).map((a) => a.url)
    expect(urls.some((u) => u?.includes('13f0692d8992482fa9d516609f0bf4b3'))).toBe(false)
  })
})
