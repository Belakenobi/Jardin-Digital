import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getPublicGardens } from '../services/public.js'

function HomePage() {
  const [gardens, setGardens] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadGardens() {
      try {
        const response = await getPublicGardens()

        if (active) {
          setGardens(response.data.gardens)
        }
      } catch {
        if (active) {
          setError('No fue posible cargar los jardines públicos. Intenta de nuevo más tarde.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadGardens()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <Link
            to="/"
            className="text-lg font-semibold text-lime-400"
          >
            Digital Garden
          </Link>

          <nav aria-label="Acceso" className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              to="/login"
              className="text-stone-300 hover:text-lime-300"
            >
              Iniciar sesión
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-lime-400 px-4 py-2 font-medium text-stone-950 hover:bg-lime-300"
            >
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12 sm:py-16">
        <section aria-labelledby="intro-title" className="max-w-3xl">
          <p className="eyebrow">
            Ideas en crecimiento
          </p>

          <h1 id="intro-title" className="mt-5 text-5xl font-semibold leading-[0.95] sm:text-7xl">
            Cultiva ideas. Conecta pensamientos.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-300">
            Un espacio para cultivar ideas, conectarlas y dejarlas evolucionar.
            Cada idea puede crecer de Semilla a Brote y convertirse en Árbol,
            a tu propio ritmo.
          </p>

          <p className="mt-4 text-sm text-stone-400">
            Explora lo que otras personas comparten, sin necesidad de iniciar sesión.
          </p>
        </section>

        <section aria-labelledby="gardens-title" className="mt-14">
          <h2 id="gardens-title" className="text-2xl font-semibold">
            Explora jardines públicos
          </h2>

          <div className="mt-6" aria-live="polite" aria-busy={loading}>
            {loading ? (
              <p role="status" className="rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-400">
                Cargando jardines públicos...
              </p>
            ) : error ? (
              <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
                {error}
              </p>
            ) : gardens.length === 0 ? (
              <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
                <p className="text-lg font-medium">
                  Todavía no hay jardines públicos para explorar.
                </p>

                <p className="mt-3 max-w-2xl text-stone-400">
                  Digital Garden te permite guardar ideas, conectar pensamientos
                  y ver cómo crecen tus ideas. Puedes crear tu propio jardín
                  y decidir si quieres compartirlo.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {gardens.slice(0, 6).map((garden) => (
                  <article
                    key={garden.id}
                    className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-b from-stone-900 to-stone-900/80 p-6 shadow-md transition duration-300 ease-out hover:-translate-y-1.5 hover:border-lime-600 hover:shadow-2xl hover:shadow-black/30"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-lime-400 transition-transform duration-300 group-hover:scale-x-100" />

                    <h3 className="wrap-anywhere text-xl font-semibold transition-colors duration-300 group-hover:text-lime-300">
                      {garden.name}
                    </h3>

                    <p className="mt-2 wrap-anywhere text-sm text-stone-400">
                      Jardín de {garden.owner?.displayName || 'Autoría no disponible'}
                    </p>

                    <p className="mt-4 line-clamp-3 wrap-anywhere text-stone-300">
                      {garden.description || 'Un jardín de ideas en crecimiento.'}
                    </p>

                    <div className="mt-auto pt-6">
                      <p className="text-sm text-stone-400">
                        {garden.noteCount} {garden.noteCount === 1 ? 'idea' : 'ideas'}
                      </p>

                      {garden.maturityCounts && (
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-lime-300">
                          <span className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1">
                            🌱 Semillas: {garden.maturityCounts.seed}
                          </span>
                          <span className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1">
                            🌿 Brotes: {garden.maturityCounts.budding}
                          </span>
                          <span className="rounded-full border border-stone-700 bg-stone-800 px-3 py-1">
                            🌳 Árboles: {garden.maturityCounts.tree}
                          </span>
                        </div>
                      )}

                      <Link
                        to={`/garden/${garden.id}`}
                        aria-label={`Ver jardín: ${garden.name}`}
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-stone-950 transition duration-200 hover:bg-lime-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
                      >
                        Ver jardín
                        <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-800 px-6 py-6 text-center text-sm text-stone-500">
        Digital Garden — cultiva ideas en lugar de archivarlas.
      </footer>
    </div>
  )
}

export default HomePage
