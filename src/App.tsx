
import { useEffect, useState } from "react";
import { Check, X, ChevronDown, ChevronRight } from "lucide-react";
import {
  STATUSES,
  DEFAULT_DATA,
  type AppData,
  type Hero,
  type StatusId,
} from "./types";
import { loadData, saveData } from "./storage";

export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [loaded, setLoaded] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [rolesExpanded, setRolesExpanded] = useState(false);

  const [statusLabels, setStatusLabels] = useState<Record<string, string>>(
    () => {
      const defaults = Object.fromEntries(
        STATUSES.map((status) => [status.id, status.label])
      );

      try {
        const saved = localStorage.getItem("deadlock-status-labels");
        return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
      } catch {
        return defaults;
      }
    }
  );

  useEffect(() => {
    loadData()
      .then((saved) => {
        if (!saved) return;

        const existingIds = new Set(saved.heroes.map((hero) => hero.id));
        const missingHeroes = DEFAULT_DATA.heroes
          .filter((hero) => !existingIds.has(hero.id))
          .map((hero, index) => ({
            ...hero,
            order: saved.heroes.length + index,
          }));

        const savedRoles = (saved.roles ?? []).map((role) => ({
          ...role,
          description: role.description ?? "",
        }));

        const missingRoles = DEFAULT_DATA.roles.filter(
          (defaultRole) =>
            !savedRoles.some((role) => role.id === defaultRole.id)
        );

        setData({
          ...saved,
          heroes: [...saved.heroes, ...missingHeroes],
          roles: [...savedRoles, ...missingRoles],
        });
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveData(data).catch(console.error);
  }, [data, loaded]);

  useEffect(() => {
    localStorage.setItem(
      "deadlock-status-labels",
      JSON.stringify(statusLabels)
    );
  }, [statusLabels]);

  const updateHero = (id: string, changes: Partial<Hero>) => {
    setData((old) => ({
      ...old,
      heroes: old.heroes.map((hero) =>
        hero.id === id ? { ...hero, ...changes } : hero
      ),
    }));
  };

  const updateRole = (
    roleId: string,
    changes: Partial<AppData["roles"][number]>
  ) => {
    setData((old) => ({
      ...old,
      roles: old.roles.map((role) =>
        role.id === roleId ? { ...role, ...changes } : role
      ),
    }));
  };

  const moveHero = (
    heroId: string,
    status: StatusId,
    targetIndex?: number
  ) => {
    setData((old) => {
      const draggedHero = old.heroes.find((hero) => hero.id === heroId);
      if (!draggedHero) return old;

      const remaining = old.heroes.filter((hero) => hero.id !== heroId);

      const targetHeroes = remaining
        .filter((hero) => hero.status === status)
        .sort((a, b) => a.order - b.order);

      const insertAt = Math.max(
        0,
        Math.min(targetIndex ?? targetHeroes.length, targetHeroes.length)
      );

      const oldIndex = old.heroes
        .filter((hero) => hero.status === status)
        .sort((a, b) => a.order - b.order)
        .findIndex((hero) => hero.id === heroId);

      const adjustedIndex =
        draggedHero.status === status && oldIndex < insertAt
          ? insertAt - 1
          : insertAt;

      targetHeroes.splice(adjustedIndex, 0, {
        ...draggedHero,
        status,
      });

      const otherHeroes = remaining.filter(
        (hero) => hero.status !== status
      );

      return {
        ...old,
        heroes: [
          ...otherHeroes,
          ...targetHeroes.map((hero, index) => ({
            ...hero,
            order: index,
          })),
        ],
      };
    });

    setDraggedId(null);
  };

  return (
    <main className="app">
      <section className="roles-collapsible">
        <button
          className="roles-toggle"
          onClick={() => setRolesExpanded((expanded) => !expanded)}
        >
          {rolesExpanded ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronRight size={15} />
          )}
          Roles
        </button>

        {rolesExpanded && (
          <div className="role-list">
            {data.roles.map((role) => (
              <div className="role-item" key={role.id}>
                <div className="role-item-heading">
                  <input
                    className="role-name"
                    value={role.name}
                    onChange={(event) =>
                      updateRole(role.id, { name: event.target.value })
                    }
                    aria-label="Role name"
                  />

                  <input
                    className="color-input"
                    type="color"
                    value={role.color}
                    onChange={(event) =>
                      updateRole(role.id, { color: event.target.value })
                    }
                    title="Change role color"
                  />
                </div>

                <textarea
                  className="role-description"
                  value={role.description}
                  onChange={(event) =>
                    updateRole(role.id, {
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe this role..."
                  rows={3}
                  aria-label={`${role.name} description`}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="board">
        {STATUSES.map((status) => {
          const heroes = data.heroes
            .filter((hero) => hero.status === status.id)
            .sort((a, b) => a.order - b.order);

          return (
            <div
              className="status-column"
              key={status.id}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (draggedId) moveHero(draggedId, status.id);
              }}
            >
              <div className="column-heading">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <input
                    value={statusLabels[status.id] ?? status.label}
                    onChange={(event) =>
                      setStatusLabels((old) => ({
                        ...old,
                        [status.id]: event.target.value,
                      }))
                    }
                    aria-label="Spaltenname bearbeiten"
                    style={{
                      font: "inherit",
                      color: "inherit",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      minWidth: 0,
                      width: "auto",
                    }}
                  />
                  <span>{heroes.length}</span>
                </div>
              </div>

              <div className="hero-list">
                {heroes.map((hero) => {
                  const selectedRoles = data.roles.filter((role) =>
                    hero.roles.includes(role.id)
                  );

                  const availableRoles = data.roles.filter(
                    (role) => !hero.roles.includes(role.id)
                  );

                  return (
                    <article
                      key={hero.id}
                      draggable
                      onDragStart={() => setDraggedId(hero.id)}
                      onDragEnd={() => setDraggedId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();

                        if (draggedId) {
                          moveHero(
                            draggedId,
                            status.id,
                            heroes.findIndex((h) => h.id === hero.id)
                          );
                        }
                      }}
                    >
                      <div className="compact-card">
                        <div className="hero-image">
                          {hero.image && (
                            <img src={hero.image} alt={hero.name} />
                          )}
                        </div>

                        <div className="compact-content">
                          <div className="card-roles">
                            {selectedRoles.map((role) => (
                              <button
                                key={role.id}
                                className="role-chip active"
                                style={{
                                  borderColor: role.color,
                                  background: `${role.color}22`,
                                }}
                                onClick={() =>
                                  updateHero(hero.id, {
                                    roles: hero.roles.filter(
                                      (id) => id !== role.id
                                    ),
                                  })
                                }
                                title={`${role.name} entfernen`}
                              >
                                {role.name}
                              </button>
                            ))}

                            {selectedRoles.length < 3 &&
                              availableRoles.length > 0 && (
                                <select
                                  className="role-select"
                                  value=""
                                  aria-label="Rolle hinzufügen"
                                  onChange={(event) => {
                                    const roleId = event.target.value;
                                    if (!roleId) return;

                                    updateHero(hero.id, {
                                      roles: [...hero.roles, roleId],
                                    });
                                  }}
                                >
                                  <option value="">+</option>
                                  {availableRoles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                      {role.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                          </div>

                          <button
                            className={`build-toggle ${
                              hero.hasBuild ? "has-build" : "no-build"
                            }`}
                            onClick={() =>
                              updateHero(hero.id, {
                                hasBuild: !hero.hasBuild,
                              })
                            }
                            title={
                              hero.hasBuild
                                ? "Build vorhanden"
                                : "Kein Build vorhanden"
                            }
                          >
                            Build
                            {hero.hasBuild ? (
                              <Check size={14} />
                            ) : (
                              <X size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}

                {heroes.length === 0 && (
                  <div className="empty-column">Drop heroes here</div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}
