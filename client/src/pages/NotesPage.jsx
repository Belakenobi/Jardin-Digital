import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/notes.js'

import { getGarden } from '../services/garden.js'

function NotesPage() {
  const [hasGarden, setHasGarden] =
    useState(true)

  const [notes, setNotes] =
    useState([])

  const [
    maturityFilter,
    setMaturityFilter,
  ] = useState('')

  const [
    newNoteTitle,
    setNewNoteTitle,
  ] = useState('')

  const [
    newNoteContent,
    setNewNoteContent,
  ] = useState('')

  const [
    newNoteMaturity,
    setNewNoteMaturity,
  ] = useState('seed')

  const [
    editingNoteId,
    setEditingNoteId,
  ] = useState(null)

  const [
    editNoteTitle,
    setEditNoteTitle,
  ] = useState('')

  const [
    editNoteContent,
    setEditNoteContent,
  ] = useState('')

  const [
    editNoteMaturity,
    setEditNoteMaturity,
  ] = useState('seed')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isLoadingNotes,
    setIsLoadingNotes,
  ] = useState(false)

  const [
    isCreatingNote,
    setIsCreatingNote,
  ] = useState(false)

  const [
    isUpdatingNote,
    setIsUpdatingNote,
  ] = useState(false)

  const [
    deletingNoteId,
    setDeletingNoteId,
  ] = useState(null)

  const [
    noteToDelete,
    setNoteToDelete,
  ] = useState(null)

  const [error, setError] =
    useState('')

  const [
    noteMessage,
    setNoteMessage,
  ] = useState('')

  useEffect(() => {
    async function loadPage() {
      setError('')

      try {
        try {
          await getGarden()
          setHasGarden(true)
        } catch (gardenError) {
          if (gardenError.status === 404) {
            setHasGarden(false)
            return
          }

          throw gardenError
        }

        const response =
          await getNotes()

        setNotes(response.notes)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [])

  async function loadNotes(
    maturity = maturityFilter,
  ) {
    setError('')
    setIsLoadingNotes(true)

    try {
      const response =
        await getNotes(
          maturity || undefined,
        )

      setNotes(response.notes)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingNotes(false)
    }
  }

  async function handleMaturityFilterChange(
    event,
  ) {
    const value =
      event.target.value

    setMaturityFilter(value)

    await loadNotes(value)
  }

  async function handleCreateNote(
    event,
  ) {
    event.preventDefault()

    setError('')
    setNoteMessage('')
    setIsCreatingNote(true)

    try {
      await createNote({
        title: newNoteTitle,
        content: newNoteContent,
        maturity: newNoteMaturity,
      })

      setNewNoteTitle('')
      setNewNoteContent('')
      setNewNoteMaturity('seed')

      setNoteMessage(
        'Nota creada correctamente.',
      )

      await loadNotes()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreatingNote(false)
    }
  }

  function startEditingNote(note) {
    setError('')
    setNoteMessage('')

    setEditingNoteId(note.id)

    setEditNoteTitle(
      note.title,
    )

    setEditNoteContent(
      note.content ?? '',
    )

    setEditNoteMaturity(
      note.maturity,
    )
  }

  function cancelEditingNote() {
    setEditingNoteId(null)
    setEditNoteTitle('')
    setEditNoteContent('')
    setEditNoteMaturity('seed')
  }

  async function handleUpdateNote(
    event,
    noteId,
  ) {
    event.preventDefault()

    setError('')
    setNoteMessage('')
    setIsUpdatingNote(true)

    try {
      await updateNote(
        noteId,
        {
          title: editNoteTitle,
          content: editNoteContent,
          maturity: editNoteMaturity,
        },
      )

      cancelEditingNote()

      setNoteMessage(
        'Nota actualizada correctamente.',
      )

      await loadNotes()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUpdatingNote(false)
    }
  }

  function requestDeleteNote(note) {
    setError('')
    setNoteMessage('')
    setNoteToDelete(note)
  }

  async function confirmDeleteNote() {
    if (!noteToDelete) {
      return
    }

    const noteId = noteToDelete.id

    setError('')
    setNoteMessage('')
    setDeletingNoteId(noteId)

    try {
      await deleteNote(noteId)

      if (
        editingNoteId === noteId
      ) {
        cancelEditingNote()
      }

      setNoteMessage(
        'Nota eliminada correctamente.',
      )

      setNoteToDelete(null)

      await loadNotes()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingNoteId(null)
    }
  }

  function getMaturityLabel(
    maturity,
  ) {
    if (maturity === 'seed') {
      return '🌱 Semilla'
    }

    if (maturity === 'budding') {
      return '🌿 Brote'
    }

    if (maturity === 'tree') {
      return '🌳 Árbol'
    }

    return maturity
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Cargando notas...
      </p>
    )
  }

  if (!hasGarden) {
    return (
      <section className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Notas
        </h1>

        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Primero crea tu jardín
          </h2>

          <p className="mt-3 text-stone-400">
            Necesitas un jardín antes de poder
            comenzar a guardar notas.
          </p>

          <Link
            to="/profile"
            className="mt-5 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
          >
            Ir a Perfil y jardín
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-5xl">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Notas
        </h1>

        <p className="mt-3 text-stone-400">
          Planta ideas y observa cómo
          evolucionan con el tiempo.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-xl font-medium">
          Plantar una nueva idea
        </h2>

        <form
          onSubmit={
            handleCreateNote
          }
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="newNoteTitle"
              className="mb-2 block text-sm text-stone-300"
            >
              Título
            </label>

            <input
              id="newNoteTitle"
              type="text"
              value={newNoteTitle}
              onChange={(event) =>
                setNewNoteTitle(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              required
            />
          </div>

          <div>
            <label
              htmlFor="newNoteContent"
              className="mb-2 block text-sm text-stone-300"
            >
              Contenido
            </label>

            <textarea
              id="newNoteContent"
              value={newNoteContent}
              onChange={(event) =>
                setNewNoteContent(
                  event.target.value,
                )
              }
              className="min-h-40 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="newNoteMaturity"
              className="mb-2 block text-sm text-stone-300"
            >
              Madurez
            </label>

            <select
              id="newNoteMaturity"
              value={
                newNoteMaturity
              }
              onChange={(event) =>
                setNewNoteMaturity(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            >
              <option value="seed">
                🌱 Semilla
              </option>

              <option value="budding">
                🌿 Brote
              </option>

              <option value="tree">
                🌳 Árbol
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={
              isCreatingNote
            }
            className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
          >
            {isCreatingNote
              ? 'Creando...'
              : 'Crear nota'}
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium">
              Mis notas
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {notes.length} nota(s)
            </p>
          </div>

          <div>
            <label
              htmlFor="maturityFilter"
              className="mb-2 block text-sm text-stone-400"
            >
              Filtrar por madurez
            </label>

            <select
              id="maturityFilter"
              value={
                maturityFilter
              }
              onChange={
                handleMaturityFilterChange
              }
              disabled={
                isLoadingNotes
              }
              className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            >
              <option value="">
                Todas
              </option>

              <option value="seed">
                🌱 Semilla
              </option>

              <option value="budding">
                🌿 Brote
              </option>

              <option value="tree">
                🌳 Árbol
              </option>
            </select>
          </div>
        </div>

        {noteMessage && (
          <p className="mt-4 text-lime-400">
            {noteMessage}
          </p>
        )}

        {isLoadingNotes && (
          <p className="mt-6 text-stone-400">
            Cargando notas...
          </p>
        )}

        {!isLoadingNotes &&
          notes.length === 0 && (
            <p className="mt-6 text-stone-500">
              No hay notas para mostrar.
            </p>
          )}

        <div className="mt-6 space-y-4">
          {notes.map((note) => (
            <article
              key={note.id}
              className="rounded-xl border border-stone-700 bg-stone-950 p-5"
            >
              {editingNoteId ===
              note.id ? (
                <form
                  onSubmit={(event) =>
                    handleUpdateNote(
                      event,
                      note.id,
                    )
                  }
                  className="space-y-4"
                >
                  <input
                    value={
                      editNoteTitle
                    }
                    onChange={(event) =>
                      setEditNoteTitle(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                    required
                  />

                  <textarea
                    value={
                      editNoteContent
                    }
                    onChange={(event) =>
                      setEditNoteContent(
                        event.target.value,
                      )
                    }
                    className="min-h-32 w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                  />

                  <select
                    value={
                      editNoteMaturity
                    }
                    onChange={(event) =>
                      setEditNoteMaturity(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                  >
                    <option value="seed">
                      🌱 Semilla
                    </option>

                    <option value="budding">
                      🌿 Brote
                    </option>

                    <option value="tree">
                      🌳 Árbol
                    </option>
                  </select>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={
                        isUpdatingNote
                      }
                      className="rounded-xl bg-lime-400 px-5 py-3 text-stone-950 disabled:opacity-50"
                    >
                      {isUpdatingNote
                        ? 'Guardando...'
                        : 'Guardar cambios'}
                    </button>

                    <button
                      type="button"
                      onClick={
                        cancelEditingNote
                      }
                      className="rounded-xl border border-stone-700 px-5 py-3"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {note.title}
                      </h3>

                      <p className="mt-2 text-sm text-lime-400">
                        {getMaturityLabel(
                          note.maturity,
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          startEditingNote(
                            note,
                          )
                        }
                        className="rounded-lg border border-stone-700 px-4 py-2"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          requestDeleteNote(
                            note,
                          )
                        }
                        disabled={
                          deletingNoteId ===
                          note.id
                        }
                        className="rounded-lg border border-red-900 px-4 py-2 text-red-400 disabled:opacity-50"
                      >
                        {deletingNoteId ===
                        note.id
                          ? 'Eliminando...'
                          : 'Eliminar'}
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-stone-300">
                    {note.content}
                  </p>

                  <p className="mt-4 text-xs text-stone-500">
                    Plantada:{' '}
                    {new Date(
                      note.createdAt,
                    ).toLocaleString(
                      'es-MX',
                    )}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    Último riego:{' '}
                    {new Date(
                      note.updatedAt,
                    ).toLocaleString(
                      'es-MX',
                    )}
                  </p>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(noteToDelete)}
        title="Eliminar nota"
        message={
          noteToDelete
            ? `¿Seguro que quieres eliminar "${noteToDelete.title}"?`
            : ''
        }
        confirmText="Eliminar nota"
        isLoading={
          deletingNoteId ===
          noteToDelete?.id
        }
        onConfirm={confirmDeleteNote}
        onCancel={() =>
          setNoteToDelete(null)
        }
      />
    </div>
  )
}

export default NotesPage

