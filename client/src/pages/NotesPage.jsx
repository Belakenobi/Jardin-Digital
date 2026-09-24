import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'
import MaturityBadge from '../components/MaturityBadge.jsx'
import { getGarden } from '../services/garden.js'
import {
  deleteNote,
  getNotes,
} from '../services/notes.js'

function createExcerpt(content) {
  const text = content?.trim() ?? ''

  if (!text) {
    return 'Esta idea todavía espera sus primeras palabras.'
  }

  return text.length > 260
    ? `${text.slice(0, 260).trimEnd()}…`
    : text
}

function NotesPage() {
  const navigate = useNavigate()
  const [searchParams] =
    useSearchParams()

  const [notes, setNotes] =
    useState([])

  const [maturityFilter, setMaturityFilter] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isFiltering, setIsFiltering] =
    useState(false)

  const [hasGarden, setHasGarden] =
    useState(true)

  const [noteToDelete, setNoteToDelete] =
    useState(null)

  const [deletingNoteId, setDeletingNoteId] =
    useState(null)

  const [error, setError] =
    useState('')

  const editorialNumbers = useMemo(
    () =>
      new Map(
        [...notes]
          .sort((first, second) => {
            const dateDifference =
              new Date(first.createdAt).getTime() -
              new Date(second.createdAt).getTime()

            return dateDifference ||
              first.id.localeCompare(second.id)
          })
          .map((note, index) => [
            note.id,
            index + 1,
          ]),
      ),
    [notes],
  )

  useEffect(() => {
    const legacySelection =
      searchParams.get('selected')

    if (legacySelection) {
      navigate(
        `/notes/${legacySelection}`,
        { replace: true },
      )
    }
  }, [navigate, searchParams])

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

  async function handleFilter(event) {
    const maturity = event.target.value
    setMaturityFilter(maturity)
    setIsFiltering(true)
    setError('')

    try {
      const response = await getNotes(
        maturity || undefined,
      )

      setNotes(response.notes)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsFiltering(false)
    }
  }

  async function handleDelete() {
    if (!noteToDelete) {
      return
    }

    setDeletingNoteId(noteToDelete.id)
    setError('')

    try {
      await deleteNote(noteToDelete.id)
      setNotes((current) =>
        current.filter(
          (note) =>
            note.id !== noteToDelete.id,
        ),
      )
      setNoteToDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingNoteId(null)
    }
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Abriendo el archivo...
      </p>
    )
  }

  if (!hasGarden) {
    return (
      <section className="max-w-3xl">
        <p className="eyebrow">
          Archivo de ideas
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Crea tu jardín primero
        </h1>

        <p className="mt-4 text-stone-400">
          Tu archivo comenzará cuando exista
          un jardín donde plantar ideas.
        </p>

        <Link
          to="/profile"
          className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
        >
          Ir a Perfil y jardín
        </Link>
      </section>
    )
  }

  return (
    <div className="max-w-6xl">
      <header className="archive-heading">
        <div>
          <p className="eyebrow">
            Herbario de pensamientos
          </p>

          <h1 className="mt-3 text-5xl font-semibold leading-none sm:text-6xl">
            Explorar ideas
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
            Un archivo personal de intuiciones,
            preguntas y textos que siguen
            cambiando con el tiempo.
          </p>
        </div>

        <Link
          to="/notes/new"
          className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
        >
          + Plantar una idea
        </Link>
      </header>

      <div className="archive-toolbar">
        <p className="utility-meta">
          {notes.length}{' '}
          {notes.length === 1
            ? 'entrada'
            : 'entradas'}
        </p>

        <label className="flex items-center gap-3 text-sm text-stone-400">
          <span>Estado</span>

          <select
            value={maturityFilter}
            onChange={handleFilter}
            disabled={isFiltering}
            className="border border-stone-700 bg-stone-950 px-4 py-2"
          >
            <option value="">
              Todo el jardín
            </option>
            <option value="seed">
              🌱 Semillas
            </option>
            <option value="budding">
              🌿 Brotes
            </option>
            <option value="tree">
              🌳 Árboles
            </option>
          </select>
        </label>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 border-l-4 border-red-900 bg-red-950/40 p-4 text-red-300"
        >
          {error}
        </p>
      )}

      {isFiltering && (
        <p
          role="status"
          className="mt-8 text-sm text-stone-500"
        >
          Reordenando el archivo...
        </p>
      )}

      {!isFiltering &&
        notes.length === 0 && (
          <div className="mt-10 border-t border-stone-700 py-12">
            <p className="text-xl text-stone-400">
              No hay ideas en esta parte del jardín.
            </p>

            <Link
              to="/notes/new"
              className="mt-4 inline-block text-lime-400"
            >
              Plantar la primera →
            </Link>
          </div>
        )}

      <div className="editorial-index">
        {notes.map((note, index) => (
          <article
            key={note.id}
            className="editorial-entry"
            style={{
              '--entry-index': index,
            }}
          >
            <div className="editorial-entry__number">
              {String(
                editorialNumbers.get(note.id),
              ).padStart(2, '0')}
            </div>

            <div className="editorial-entry__content">
              <div className="flex flex-wrap items-center gap-3">
                <MaturityBadge
                  maturity={note.maturity}
                />

                <span className="utility-meta">
                  Plantada ·{' '}
                  {new Date(
                    note.createdAt,
                  ).toLocaleDateString(
                    'es-MX',
                  )}
                </span>

                <span
                  aria-hidden="true"
                  className="text-stone-500"
                >
                  /
                </span>

                <span className="utility-meta">
                  Último riego ·{' '}
                  {new Date(
                    note.updatedAt,
                  ).toLocaleDateString(
                    'es-MX',
                  )}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-semibold leading-tight sm:text-4xl">
                <Link
                  to={`/notes/${note.id}`}
                  className="editorial-title-link"
                >
                  {note.title}
                </Link>
              </h2>

              <p className="mt-5 max-w-3xl whitespace-pre-line text-base leading-7 text-stone-400">
                {createExcerpt(note.content)}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  to={`/notes/${note.id}`}
                  className="read-more-link"
                >
                  Continuar leyendo →
                </Link>

                <div className="entry-actions">
                  <Link
                    to={`/notes/${note.id}/edit`}
                    className="secondary-action"
                  >
                    Editar
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      setNoteToDelete(note)
                    }
                    className="secondary-action danger-action"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title="Eliminar idea"
        message={
          noteToDelete
            ? `¿Seguro que quieres eliminar “${noteToDelete.title}”?`
            : ''
        }
        confirmText="Eliminar idea"
        isLoading={
          deletingNoteId ===
          noteToDelete?.id
        }
        onConfirm={handleDelete}
        onCancel={() =>
          setNoteToDelete(null)
        }
      />
    </div>
  )
}

export default NotesPage
