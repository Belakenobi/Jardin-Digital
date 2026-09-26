import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getPublicGarden } from '../services/public.js'
import { formatNoteTimestamp } from '../utils/formatNoteTimestamp.js'

const maturityLabels = {
  seed: 'Semilla 🌱',
  budding: 'Brote 🌿',
  tree: 'Árbol 🌳',
}

function PublicGardenPage() {
  const { gardenId, noteId } = useParams()

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

  const selectedNote = noteId
    ? notes.find((note) => note.id === noteId)
    : null

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

        {noteId && !selectedNote ? (
          <div className="rounded-2xl border border-stone-800 bg-stone-900 p-8">
            <p className="text-stone-300">
              Esta nota no está disponible en este jardín.
            </p>

            <Link
              to={'/garden/' + gardenId}
              className="mt-5 inline-flex text-sm font-medium text-lime-400 hover:text-lime-300"
            >
              ← Volver a las notas
            </Link>
          </div>
        ) : selectedNote ? (
          <article className="mx-auto max-w-3xl">
            <Link
              to={'/garden/' + gardenId}
              className="inline-flex text-sm font-medium text-lime-400 hover:text-lime-300"
            >
              ← Todas las notas del jardín
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="whitespace-nowrap rounded-full border border-stone-700 bg-stone-900 px-2.5 py-1 text-xs font-semibold text-lime-300">
                {maturityLabels[selectedNote.maturity]}
              </span>

              <span className="text-xs text-stone-500">
                Plantada:{' '}
                {formatNoteTimestamp(
                  selectedNote.createdAt,
                )}
              </span>

              <span className="text-xs text-stone-500">
                Último riego:{' '}
                {formatNoteTimestamp(
                  selectedNote.updatedAt,
                )}
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
              {selectedNote.title}
            </h2>

            <div className="mt-8 border-t border-stone-800 pt-8 text-lg leading-8 text-stone-300">
              <p className="whitespace-pre-wrap">
                {selectedNote.content ||
                  'Esta idea todavía no tiene contenido.'}
              </p>
            </div>
          </article>
        ) : notes.length === 0 ? (
          <p className="text-stone-400">
            Este jardín todavía no tiene ideas.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                to={
                  '/garden/' +
                  gardenId +
                  '/notes/' +
                  note.id
                }
                className="group flex min-h-56 flex-col rounded-2xl border border-stone-800 bg-stone-900 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-lime-500 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-400"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 text-lg font-semibold leading-snug text-stone-100 group-hover:text-lime-300">
                    {note.title}
                  </h2>

                  <span className="whitespace-nowrap rounded-full border border-stone-700 bg-stone-800 px-2 py-0.5 text-[0.65rem] font-semibold text-lime-300">
                    {maturityLabels[note.maturity]}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-stone-400">
                  {note.content ||
                    'Esta idea todavía no tiene contenido.'}
                </p>

                <div className="mt-auto space-y-1 pt-5 text-[0.7rem] leading-5 text-stone-500">
                  <p>
                    Plantada:{' '}
                    {formatNoteTimestamp(
                      note.createdAt,
                    )}
                  </p>

                  <p>
                    Último riego:{' '}
                    {formatNoteTimestamp(
                      note.updatedAt,
                    )}
                  </p>
                </div>
              </Link>
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
