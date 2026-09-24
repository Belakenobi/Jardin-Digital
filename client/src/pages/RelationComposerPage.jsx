import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import ValidatedForm from '../components/ValidatedForm.jsx'
import { getGarden } from '../services/garden.js'
import { getNotes } from '../services/notes.js'
import { createRelation } from '../services/relations.js'

function RelationComposerPage() {
  const navigate = useNavigate()
  const [searchParams] =
    useSearchParams()

  const [notes, setNotes] =
    useState([])

  const [sourceNoteId, setSourceNoteId] =
    useState(
      searchParams.get('source') ?? '',
    )

  const [targetNoteId, setTargetNoteId] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [hasGarden, setHasGarden] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadPage() {
      try {
        await getGarden()
        const response = await getNotes()

        if (active) {
          setNotes(response.notes)
        }
      } catch (requestError) {
        if (!active) {
          return
        }

        if (requestError.status === 404) {
          setHasGarden(false)
        } else {
          setError(requestError.message)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadPage()

    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await createRelation({
        sourceNoteId,
        targetNoteId,
      })

      navigate(
        `/relations?idea=${encodeURIComponent(
          sourceNoteId,
        )}`,
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Preparando las conexiones...
      </p>
    )
  }

  if (!hasGarden) {
    return (
      <section className="max-w-3xl">
        <h1 className="text-4xl font-semibold">
          Crea tu jardín primero
        </h1>

        <Link
          to="/profile"
          className="mt-6 inline-block text-lime-400"
        >
          Ir a Perfil y jardín →
        </Link>
      </section>
    )
  }

  return (
    <div className="max-w-4xl">
      <Link
        to="/relations"
        className="text-sm text-lime-400"
      >
        ← Volver a conexiones
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="eyebrow">
          Injerto editorial
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Conectar ideas
        </h1>

        <p className="mt-4 leading-7 text-stone-400">
          Elige una idea de origen y otra
          hacia la que continuará creciendo.
        </p>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300"
        >
          {error}
        </p>
      )}

      {notes.length < 2 ? (
        <div className="mt-8 border-t border-stone-700 py-8">
          <p className="text-stone-400">
            Necesitas al menos dos ideas para
            crear una conexión.
          </p>

          <Link
            to="/notes/new"
            className="mt-4 inline-block text-lime-400"
          >
            Plantar otra idea →
          </Link>
        </div>
      ) : (
        <ValidatedForm
          onSubmit={handleSubmit}
          className="connection-form mt-9"
        >
          <div>
            <label
              htmlFor="sourceNote"
              className="mb-2 block text-sm text-stone-300"
            >
              Idea de origen
            </label>

            <select
              id="sourceNote"
              value={sourceNoteId}
              onChange={(event) => {
                setSourceNoteId(
                  event.target.value,
                )
                setTargetNoteId('')
              }}
              className="w-full border border-stone-700 bg-stone-950 px-4 py-3"
              required
            >
              <option value="">
                Selecciona una idea
              </option>

              {notes.map((note) => (
                <option
                  key={note.id}
                  value={note.id}
                >
                  {note.title}
                </option>
              ))}
            </select>
          </div>

          <div
            aria-hidden="true"
            className="connection-form__arrow"
          >
            ↓
          </div>

          <div>
            <label
              htmlFor="targetNote"
              className="mb-2 block text-sm text-stone-300"
            >
              Idea de destino
            </label>

            <select
              id="targetNote"
              value={targetNoteId}
              onChange={(event) =>
                setTargetNoteId(
                  event.target.value,
                )
              }
              className="w-full border border-stone-700 bg-stone-950 px-4 py-3"
              required
            >
              <option value="">
                Selecciona una idea
              </option>

              {notes
                .filter(
                  (note) =>
                    note.id !==
                    sourceNoteId,
                )
                .map((note) => (
                  <option
                    key={note.id}
                    value={note.id}
                  >
                    {note.title}
                  </option>
                ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Conectando...'
              : 'Crear conexión'}
          </button>
        </ValidatedForm>
      )}
    </div>
  )
}

export default RelationComposerPage
