import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getPublicGarden } from '../services/public.js'

const maturityLabels = {
  seed: 'Semilla 🌱',
  budding: 'Brote 🌿',
  tree: 'Árbol 🌳',
}

function PublicGardenPage() {
  const { gardenId } = useParams()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadGarden() {
      try {
        setLoading(true)
        setError('')

        const response =
          await getPublicGarden(gardenId)

        setData(response.data)
      } catch (requestError) {
        setError(
          requestError.status === 404
            ? 'Este jardín no existe o es privado.'
            : 'No fue posible cargar el jardín.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadGarden()
  }, [gardenId])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 p-8 text-stone-100">
        <p>Cargando jardín...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-950 p-8 text-stone-100">
        <div className="mx-auto max-w-3xl">
          <p className="text-red-300">
            {error}
          </p>

          <Link
            to="/login"
            className="mt-6 inline-block text-lime-400 hover:underline"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  const {
    garden,
    owner,
    notes,
    relations,
  } = data

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <header className="border-b border-stone-800 bg-stone-900">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <p className="eyebrow">
            Digital Garden
          </p>

          <h1 className="mt-3 text-4xl font-semibold">
            {garden.name}
          </h1>

          {garden.description && (
            <p className="mt-4 max-w-2xl text-stone-300">
              {garden.description}
            </p>
          )}

          {owner && (
            <p className="mt-4 text-sm text-stone-400">
              Jardín de {owner.displayName}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-900 px-4 py-2.5 text-sm font-medium text-stone-100 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-lime-500 hover:bg-stone-800 hover:text-lime-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
        >
          <span aria-hidden="true">←</span>
          Volver a explorar jardines
        </Link>

        <div className="mb-8 flex flex-wrap gap-4 text-sm text-stone-400">
          <span>
            {notes.length} {notes.length === 1 ? 'idea' : 'ideas'}
          </span>

          <span>
            {relations.length} relaciones
          </span>
        </div>

        {notes.length === 0 ? (
          <p className="text-stone-400">
            Este jardín todavía no tiene ideas.
          </p>
        ) : (
          <div className="archive-list">
            {notes.map((note) => (
              <article
                key={note.id}
                className="archive-item px-2 py-7 sm:px-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold">
                    {note.title}
                  </h2>

                  <span className="whitespace-nowrap rounded-full bg-stone-800 px-3 py-1 text-xs text-lime-300">
                    {maturityLabels[note.maturity]}
                  </span>
                </div>

                <p className="mt-4 whitespace-pre-wrap text-stone-300">
                  {note.content}
                </p>

                <div className="mt-6 text-xs text-stone-500">
                  <p>
                    Plantada:{' '}
                    {new Date(
                      note.createdAt,
                    ).toLocaleDateString()}
                  </p>

                  <p>
                    Último riego:{' '}
                    {new Date(
                      note.updatedAt,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-12 border-t border-stone-800 pt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold text-stone-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-lg hover:shadow-lime-950/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
          >
            Crear o administrar mi jardín
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default PublicGardenPage
