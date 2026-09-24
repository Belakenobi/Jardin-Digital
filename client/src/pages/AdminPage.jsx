import { useEffect, useState } from 'react'

import {
  getAdminSummary,
  getAdminUsers,
} from '../services/admin.js'

const statisticCards = [
  ['userCount', 'Usuarios'],
  ['gardenCount', 'Jardines'],
  ['publicGardenCount', 'Jardines públicos'],
  ['privateGardenCount', 'Jardines privados'],
  ['noteCount', 'Ideas'],
  ['relationCount', 'Relaciones'],
  ['galleryImageCount', 'Imágenes'],
]

function AdminPage() {
  const [summary, setSummary] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAdminData() {
      try {
        setError('')

        const [summaryResponse, usersResponse] =
          await Promise.all([
            getAdminSummary(),
            getAdminUsers(),
          ])

        setSummary(summaryResponse.data.summary)
        setUsers(usersResponse.data.users)
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [])

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Cargando panel administrativo...
      </p>
    )
  }

  return (
    <div className="max-w-7xl">
      <header>
        <p className="eyebrow">
          Administración
        </p>

        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Panel administrativo
        </h1>

        <p className="mt-3 text-stone-400">
          Vista general del sistema
        </p>
      </header>

      {error && (
        <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      {summary && (
        <section
          aria-label="Estadísticas generales"
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {statisticCards.map(([key, label]) => (
            <article
              key={key}
              className="border-t border-stone-700 py-5"
            >
              <p className="text-sm text-stone-400">
                {label}
              </p>

              <p className="mt-2 text-4xl font-semibold text-stone-100">
                {summary[key]}
              </p>
            </article>
          ))}
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-2xl font-semibold">
          Usuarios registrados
        </h2>

        {users.length === 0 && !error ? (
          <p className="mt-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 text-stone-400">
            No hay usuarios registrados.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-stone-800 bg-stone-900 text-stone-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">Usuario</th>
                    <th className="px-5 py-4 font-medium">Rol</th>
                    <th className="px-5 py-4 font-medium">Jardín asociado</th>
                    <th className="px-5 py-4 font-medium">Visibilidad</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-800">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4 font-medium text-stone-100">
                        {user.displayName}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-stone-800 px-3 py-1 text-xs uppercase text-lime-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-300">
                        {user.garden?.name ?? 'Sin jardín'}
                      </td>
                      <td className="px-5 py-4 text-stone-400">
                        {user.garden
                          ? user.garden.isPublic
                            ? 'Público'
                            : 'Privado'
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminPage
