import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useSearchParams,
} from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'
import MaturityBadge from '../components/MaturityBadge.jsx'
import { getGarden } from '../services/garden.js'
import { getNotes } from '../services/notes.js'
import {
  deleteRelation,
  getRelationsForNote,
} from '../services/relations.js'

function RelationsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const [notes, setNotes] =
    useState([])

  const [relations, setRelations] =
    useState({
      outgoing: [],
      incoming: [],
    })

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    isLoadingRelations,
    setIsLoadingRelations,
  ] = useState(false)

  const [hasGarden, setHasGarden] =
    useState(true)

  const [relationToDelete, setRelationToDelete] =
    useState(null)

  const [
    deletingRelationId,
    setDeletingRelationId,
  ] = useState(null)

  const [error, setError] =
    useState('')

  const requestedNoteId =
    searchParams.get('idea')

  const selectedNote =
    notes.find(
      (note) =>
        note.id === requestedNoteId,
    ) ?? notes[0] ?? null

  const selectedNoteId =
    selectedNote?.id ?? ''

  const notesById = useMemo(
    () =>
      new Map(
        notes.map((note) => [
          note.id,
          note,
        ]),
      ),
    [notes],
  )

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

  useEffect(() => {
    let active = true

    async function loadRelations() {
      if (!selectedNoteId) {
        setRelations({
          outgoing: [],
          incoming: [],
        })
        return
      }

      setIsLoadingRelations(true)
      setError('')

      try {
        const response =
          await getRelationsForNote(
            selectedNoteId,
          )

        if (active) {
          setRelations(
            response.relations,
          )
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message)
        }
      } finally {
        if (active) {
          setIsLoadingRelations(false)
        }
      }
    }

    loadRelations()

    return () => {
      active = false
    }
  }, [selectedNoteId])

  function selectNote(noteId) {
    setSearchParams({
      idea: noteId,
    })
  }

  async function handleDelete() {
    if (!relationToDelete) {
      return
    }

    setDeletingRelationId(
      relationToDelete.id,
    )
    setError('')

    try {
      await deleteRelation(
        relationToDelete.id,
      )

      setRelations((current) => ({
        outgoing:
          current.outgoing.filter(
            (relation) =>
              relation.id !==
              relationToDelete.id,
          ),
        incoming:
          current.incoming.filter(
            (relation) =>
              relation.id !==
              relationToDelete.id,
          ),
      }))

      setRelationToDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingRelationId(null)
    }
  }

  function renderRelation(
    relation,
    direction,
  ) {
    const relatedId =
      direction === 'incoming'
        ? relation.sourceNoteId
        : relation.targetNoteId

    const related =
      notesById.get(relatedId)

    return (
      <article
        key={relation.id}
        className="connection-branch"
      >
        <Link
          to={`/notes/${relatedId}`}
          className="connection-branch__title"
        >
          {related?.title ??
            'Idea no disponible'}
        </Link>

        {related && (
          <MaturityBadge
            maturity={related.maturity}
          />
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              selectNote(relatedId)
            }
            className="secondary-action"
          >
            Seguir esta idea
          </button>

          <button
            type="button"
            onClick={() =>
              setRelationToDelete(
                relation,
              )
            }
            className="secondary-action danger-action"
          >
            Eliminar vínculo
          </button>
        </div>
      </article>
    )
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Trazando conexiones...
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
    <div className="max-w-7xl">
      <header className="archive-heading">
        <div>
          <p className="eyebrow">
            Cartografía cercana
          </p>

          <h1 className="mt-3 text-5xl font-semibold leading-none sm:text-6xl">
            Explorar conexiones
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
            Sigue las raíces y ramas de una
            idea sin perderte en la red
            completa.
          </p>
        </div>

        <Link
          to={
            selectedNoteId
              ? `/relations/new?source=${encodeURIComponent(
                  selectedNoteId,
                )}`
              : '/relations/new'
          }
          className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
        >
          + Conectar ideas
        </Link>
      </header>

      {error && (
        <p
          role="alert"
          className="mt-6 border-l-4 border-red-900 bg-red-950/40 p-4 text-red-300"
        >
          {error}
        </p>
      )}

      {notes.length === 0 ? (
        <div className="mt-10 border-t border-stone-700 py-12">
          <p className="text-xl text-stone-400">
            Todavía no hay ideas que conectar.
          </p>

          <Link
            to="/notes/new"
            className="mt-4 inline-block text-lime-400"
          >
            Plantar una idea →
          </Link>
        </div>
      ) : (
        <>
          <div className="connection-selector">
            <label htmlFor="connection-note" className="connection-selector__label">
              <span className="utility-meta">Idea principal</span>
              <select
                id="connection-note"
                value={selectedNoteId}
                onChange={(event) => selectNote(event.target.value)}
                className="connection-selector__select"
              >
                {notes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isLoadingRelations ? (
            <p
              role="status"
              className="mt-10 text-stone-500"
            >
              Siguiendo raíces y ramas...
            </p>
          ) : (
            <section className="connection-map">
              <div className="connection-column connection-column--incoming">
                <p className="eyebrow">
                  Backlinks · Raíces
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Llegan hasta aquí
                </h2>

                <div className="mt-7 space-y-6">
                  {relations.incoming.length ===
                  0 ? (
                    <p className="text-sm leading-6 text-stone-500">
                      Ninguna idea alimenta esta
                      raíz todavía.
                    </p>
                  ) : (
                    relations.incoming.map(
                      (relation) =>
                        renderRelation(
                          relation,
                          'incoming',
                        ),
                    )
                  )}
                </div>
              </div>

              <div className="connection-core">
                <span
                  aria-hidden="true"
                  className="connection-core__mark"
                >
                  ✦
                </span>

                <MaturityBadge
                  maturity={
                    selectedNote.maturity
                  }
                />

                <h2 className="mt-5 text-3xl font-semibold leading-tight">
                  {selectedNote.title}
                </h2>

                <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-6 text-stone-400">
                  {selectedNote.content ||
                    'Esta idea todavía no tiene contenido.'}
                </p>

                <Link
                  to={`/notes/${selectedNote.id}`}
                  className="mt-6 inline-block text-sm text-lime-400"
                >
                  Leer la entrada →
                </Link>
              </div>

              <div className="connection-column connection-column--outgoing">
                <p className="eyebrow">
                  Enlaces · Ramas
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  Crecen desde aquí
                </h2>

                <div className="mt-7 space-y-6">
                  {relations.outgoing.length ===
                  0 ? (
                    <p className="text-sm leading-6 text-stone-500">
                      De esta idea todavía no
                      nacen otras ramas.
                    </p>
                  ) : (
                    relations.outgoing.map(
                      (relation) =>
                        renderRelation(
                          relation,
                          'outgoing',
                        ),
                    )
                  )}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(relationToDelete)}
        title="Eliminar conexión"
        message="¿Seguro que quieres cortar este vínculo entre ideas?"
        confirmText="Eliminar conexión"
        isLoading={
          deletingRelationId ===
          relationToDelete?.id
        }
        onConfirm={handleDelete}
        onCancel={() =>
          setRelationToDelete(null)
        }
      />
    </div>
  )
}

export default RelationsPage
