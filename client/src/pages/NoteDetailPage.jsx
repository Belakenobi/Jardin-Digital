import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'
import MaturityBadge from '../components/MaturityBadge.jsx'
import { getGalleryImages } from '../services/gallery.js'
import {
  deleteNote,
  getNoteById,
  getNotes,
} from '../services/notes.js'
import { getRelationsForNote } from '../services/relations.js'
import { formatNoteTimestamp } from '../utils/formatNoteTimestamp.js'

function NoteDetailPage() {
  const { noteId } = useParams()
  const navigate = useNavigate()

  const [note, setNote] =
    useState(null)

  const [allNotes, setAllNotes] =
    useState([])

  const [relations, setRelations] =
    useState({
      outgoing: [],
      incoming: [],
    })

  const [images, setImages] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isDeleting, setIsDeleting] =
    useState(false)

  const [showDelete, setShowDelete] =
    useState(false)

  const [error, setError] =
    useState('')

  const [actionError, setActionError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadEntry() {
      try {
        const [
          noteResponse,
          notesResponse,
          relationsResponse,
          galleryResponse,
        ] = await Promise.all([
          getNoteById(noteId),
          getNotes(),
          getRelationsForNote(noteId),
          getGalleryImages(),
        ])

        if (!active) {
          return
        }

        setNote(noteResponse.note)
        setAllNotes(notesResponse.notes)
        setRelations(
          relationsResponse.relations,
        )
        setImages(
          galleryResponse.images.filter(
            (image) =>
              image.noteId === noteId,
          ),
        )
      } catch (requestError) {
        if (active) {
          setError(requestError.message)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadEntry()

    return () => {
      active = false
    }
  }, [noteId])

  const notesById = useMemo(
    () =>
      new Map(
        allNotes.map((item) => [
          item.id,
          item,
        ]),
      ),
    [allNotes],
  )

  async function handleDelete() {
    setIsDeleting(true)
    setActionError('')

    try {
      await deleteNote(noteId)
      navigate('/notes')
    } catch (requestError) {
      setActionError(
        requestError.message,
      )
      setShowDelete(false)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Abriendo la entrada...
      </p>
    )
  }

  if (error || !note) {
    return (
      <section className="max-w-3xl">
        <p
          role="alert"
          className="border-l-4 border-red-900 bg-red-950/40 p-5 text-red-300"
        >
          {error ||
            'No fue posible encontrar esta idea.'}
        </p>

        <Link
          to="/notes"
          className="mt-6 inline-block text-lime-400"
        >
          ← Volver al archivo
        </Link>
      </section>
    )
  }

  return (
    <article className="journal-entry">
      <header className="journal-entry__header">
        <Link
          to="/notes"
          className="text-sm text-lime-400"
        >
          ← Archivo de ideas
        </Link>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <MaturityBadge
            maturity={note.maturity}
          />

          <span className="utility-meta">
            Plantada{' '}
            {formatNoteTimestamp(
              note.createdAt,
            )}
          </span>
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.96] sm:text-6xl">
          {note.title}
        </h1>

        <div className="mt-8 flex flex-wrap gap-3 border-t border-stone-700 pt-5">
          <Link
            to={`/notes/${note.id}/edit`}
            className="secondary-action"
          >
            ✎ Editar
          </Link>

          <Link
            to={`/relations/new?source=${encodeURIComponent(
              note.id,
            )}`}
            className="secondary-action"
          >
            ↗ Conectar
          </Link>

          <button
            type="button"
            onClick={() =>
              setShowDelete(true)
            }
            className="secondary-action danger-action"
          >
            × Eliminar
          </button>
        </div>
      </header>

      {actionError && (
        <p
          role="alert"
          className="mb-6 border-l-4 border-red-900 bg-red-950/40 p-4 text-red-300"
        >
          {actionError}
        </p>
      )}

      <div className="journal-entry__body">
        <p className="whitespace-pre-wrap">
          {note.content ||
            'Esta idea todavía no tiene contenido.'}
        </p>
      </div>

      {images.length > 0 && (
        <section className="journal-resources">
          <p className="eyebrow">
            Archivo visual
          </p>

          <div className="mt-5 grid max-w-4xl gap-7">
            {images.map((image) => (
              <Link
                key={image.id}
                to={`/gallery?selectedImage=${image.id}`}
                className="journal-image"
              >
                <img
                  src={image.imageUrl}
                  alt={
                    image.description ||
                    'Imagen asociada'
                  }
                  loading="lazy"
                />

                <span>
                  {image.description ||
                    'Ver recuerdo asociado'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="root-system">
        <div className="root-system__heading">
          <p className="eyebrow">
            Sistema de raíces
          </p>

          <h2 className="mt-2 text-3xl font-semibold">
            Relaciones y backlinks
          </h2>

          <p className="mt-3 max-w-xl text-stone-400">
            Las ideas que alimentan esta
            entrada y las ramas que nacen de
            ella.
          </p>
        </div>

        <div className="root-system__grid">
          <div>
            <h3 className="text-xl font-medium">
              ← Raíces
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Ideas que apuntan hacia esta.
            </p>

            <div className="mt-5 space-y-3">
              {relations.incoming.length ===
              0 ? (
                <p className="text-sm text-stone-500">
                  Todavía no hay backlinks.
                </p>
              ) : (
                relations.incoming.map(
                  (relation) => {
                    const related =
                      notesById.get(
                        relation.sourceNoteId,
                      )

                    return (
                      <Link
                        key={relation.id}
                        to={`/notes/${relation.sourceNoteId}`}
                        className="root-link"
                      >
                        <span aria-hidden="true">
                          🌱
                        </span>

                        {related?.title ??
                          'Idea no disponible'}
                      </Link>
                    )
                  },
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-medium">
              Ramas →
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              Ideas hacia las que continúa.
            </p>

            <div className="mt-5 space-y-3">
              {relations.outgoing.length ===
              0 ? (
                <p className="text-sm text-stone-500">
                  Todavía no hay ramas.
                </p>
              ) : (
                relations.outgoing.map(
                  (relation) => {
                    const related =
                      notesById.get(
                        relation.targetNoteId,
                      )

                    return (
                      <Link
                        key={relation.id}
                        to={`/notes/${relation.targetNoteId}`}
                        className="root-link"
                      >
                        <span aria-hidden="true">
                          🌿
                        </span>

                        {related?.title ??
                          'Idea no disponible'}
                      </Link>
                    )
                  },
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        isOpen={showDelete}
        title="Eliminar idea"
        message={`¿Seguro que quieres eliminar “${note.title}”?`}
        confirmText="Eliminar idea"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() =>
          setShowDelete(false)
        }
      />
    </article>
  )
}

export default NoteDetailPage
