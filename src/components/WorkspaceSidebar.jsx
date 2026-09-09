import { NavLink, useLocation } from 'react-router-dom'
import IconMark from './IconMark'
import SidebarAccount from './SidebarAccount'
import { useWorkspaceNav } from './workspace-nav'
import { modules, portal } from '../data/config'

export default function WorkspaceSidebar() {
  const { pathname } = useLocation()
  const { toggle } = useWorkspaceNav()

  // Every category is always open. The whole catalog is ten items, so nothing
  // is gained by hiding it behind a disclosure the user has to work through —
  // the sidebar is the map of the portal and it shows all of it at once.
  const activeModuleId = pathname.match(/^\/module\/([^/]+)/)?.[1]
  const activeSolutionId = pathname.match(/^\/module\/[^/]+\/app\/([^/]+)/)?.[1]

  /*
   * A portal that IS its module does not get a module header.
   *
   * Each split portal carries one module and takes its name from it. With the
   * full catalog names restored that put the same words in the brand and in the
   * group title — and in Water Resources, whose first application is also
   * "Water Resources Mapping", the same string appeared three times inside
   * 100px. The brand already names the module, so the group keeps its accent
   * rail and drops the title and the count. A multi-module catalog is
   * unaffected: there the title is the only thing telling the groups apart.
   */
  const soleModule = modules.length === 1 && modules[0].name === portal.name

  return (
    <nav className="workspace-sidebar" aria-label="Modules">
      {/* The portal's name lives here now that there is no header bar. */}
      <div className="sidebar__top">
        <NavLink to="/" className="sidebar__brand">
          {portal.name}
        </NavLink>
        <button
          type="button"
          className="sidebar__collapse"
          onClick={toggle}
          aria-label="Collapse modules menu"
        >
          <IconMark name="panelLeftClose" size={18} />
        </button>
      </div>

      <div className="sidebar__scroll">
        <h2 className="sidebar__heading">{soleModule ? 'Solutions' : 'Modules'}</h2>

        {modules.map((mod) => {
          const isActive = activeModuleId === mod.id
          const count = mod.solutions.length

          return (
            <section
              key={mod.id}
              className={`modgroup ${isActive ? 'is-active' : ''} ${
                soleModule ? 'is-sole' : ''
              }`}
              // The module's own colour, carried down to the rail, the icon and
              // the active row. Set here rather than in CSS so the stylesheet
              // needs no per-module rules.
              style={{
                '--accent': mod.accent,
                '--accent-text': mod.accentText,
                '--accent-dark': mod.accentDark,
                '--accent-soft': mod.accentSoft,
              }}
              aria-label={mod.name}
            >
              {!soleModule && (
                <div className="modgroup__head">
                  <IconMark name={mod.icon} size={16} className="modgroup__icon" />
                  <span className="modgroup__title">{mod.name}</span>
                  <span className="modgroup__count">
                    {count} {count === 1 ? 'solution' : 'solutions'}
                  </span>
                </div>
              )}

              {mod.groups.map((group, i) => {
                /*
                 * A named group is a heading with its dashboards under it; an
                 * unnamed one is a bare row, exactly as before grouping
                 * existed. The head is plain text — not a link, because the
                 * app it is named after is no longer embedded, and not a
                 * disclosure, because this sidebar has never hidden anything
                 * behind one. Every dashboard is on screen at all times.
                 */
                const heading = group.name ? `${mod.id}-group-${i}` : undefined

                return (
                  <div key={group.name || `solo-${i}`} className="solgroup">
                    {group.name && (
                      <div className="solgroup__head" id={heading}>
                        <IconMark name={group.icon} size={16} className="solgroup__icon" />
                        <span className="solgroup__title">{group.name}</span>
                      </div>
                    )}

                    <ul
                      className={`modlist ${group.name ? 'modlist--nested' : ''}`}
                      aria-labelledby={heading}
                    >
                      {group.solutions.map((solution) => (
                        <li key={solution.id}>
                          <NavLink
                            to={`/module/${mod.id}/app/${solution.id}`}
                            className={`modlist__item ${
                              activeSolutionId === solution.id ? 'is-active' : ''
                            }`}
                          >
                            <IconMark name={solution.icon} size={16} />
                            <span>{solution.name}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}

            </section>
          )
        })}
      </div>

      <SidebarAccount />
    </nav>
  )
}
