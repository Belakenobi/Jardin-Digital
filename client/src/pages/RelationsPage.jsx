import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'

import {
  getNotes,
} from '../services/notes.js'

import {
  getRelationsForNote,
  createRelation,
  deleteRelation,
} from '../services/relations.js'

import {
  getGarden,
} from '../services/garden.js'

function RelationsPage() {
  const [hasGarden, setHasGarden] =
    useState(true)

  const [allNotes, setAllNotes] =
    useState([])

  const [
    selectedRelationNoteId,
    setSelectedRelationNoteId,
  ] = useState('')

  const [
    targetRelationNoteId,
    setTargetRelationNoteId,
  ] = useState('')

  const [
    relations,
    setRelations,
  ] = useState({
    outgoing: [],
    incoming: [],
  })

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isLoadingRelations,
    setIsLoadingRelations,
  ] = useState(false)

  const [
    isCreatingRelation,
    setIsCreatingRelation,
  ] = useState(false)

  const [
    deletingRelationId,
    setDeletingRelationId,
  ] = useState(null)

  const [
    relationToDelete,
    setRelationToDelete,
  ] = useState(null)

  const [error, setError] =
    useState('')

  const [
    relationMessage,
    setRelationMessage,
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

        const notesResponse =
          await getNotes()

        setAllNotes(
          notesResponse.notes,
        )
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [])

  async function loadRelations(
    noteId,
  ) {
    if (!noteId) {
      setRelations({
        outgoing: [],
        incoming: [],
      })

      return
    }

    setError('')
    setRelationMessage('')
    setIsLoadingRelations(true)

    try {
      const response =
        await getRelationsForNote(
          noteId,
        )

      setRelations(
        response.relations,
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingRelations(false)
    }
  }

  async function handleRelationNoteChange(
    event,
  ) {
    const noteId =
      event.target.value

    setSelectedRelationNoteId(
      noteId,
    )

    setTargetRelationNoteId('')

    await loadRelations(noteId)
  }

  async function handleCreateRelation(
    event,
  ) {
    event.preventDefault()

    if (
      !selectedRelationNoteId ||
      !targetRelationNoteId
    ) {
      return
    }

    setError('')
    setRelationMessage('')
    setIsCreatingRelation(true)

    try {
      await createRelation({
        sourceNoteId:
          selectedRelationNoteId,
        targetNoteId:
          targetRelationNoteId,
      })

      setTargetRelationNoteId('')

      setRelationMessage(
        'Relación creada correctamente.',
      )

      await loadRelations(
        selectedRelationNoteId,
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreatingRelation(false)
    }
  }

  function requestDeleteRelation(
    relation,
  ) {
    setError('')
    setRelationMessage('')
    setRelationToDelete(relation)
  }

  async function confirmDeleteRelation() {
    if (!relationToDelete) {
      return
    }

    const relationId =
      relationToDelete.id

    setError('')
    setRelationMessage('')
    setDeletingRelationId(
      relationId,
    )

    try {
      await deleteRelation(
        relationId,
      )

      setRelationMessage(
        'Relación eliminada correctamente.',
      )

      setRelationToDelete(null)

      await loadRelations(
        selectedRelationNoteId,
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingRelationId(null)
    }
  }

  function getNoteTitle(
    noteId,
  ) {
    const note =
      allNotes.find(
        (currentNote) =>
          currentNote.id === noteId,
      )

    return (
      note?.title ??
      'Nota no disponible'
    )
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Cargando relaciones...
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
          Relaciones
        </h1>

        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Primero crea tu jardín
          </h2>

          <p className="mt-3 text-stone-400">
            Necesitas un jardín antes de
            poder relacionar notas.
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
          Relaciones y backlinks
        </h1>

        <p className="mt-3 text-stone-400">
          Conecta tus notas y observa
          cuáles apuntan hacia otras ideas.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-xl font-medium">
          Seleccionar nota
        </h2>

        {allNotes.length === 0 ? (
          <div className="mt-5">
            <p className="text-stone-400">
              Todavía no tienes notas para
              relacionar.
            </p>

            <Link
              to="/notes"
              className="mt-4 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
            >
              Crear notas
            </Link>
          </div>
        ) : (
          <select
            value={
              selectedRelationNoteId
            }
            onChange={
              handleRelationNoteChange
            }
            className="mt-6 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
          >
            <option value="">
              Selecciona una nota
            </option>

            {allNotes.map((note) => (
              <option
                key={note.id}
                value={note.id}
              >
                {note.title}
              </option>
            ))}
          </select>
        )}
      </section>

      {selectedRelationNoteId && (
        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Crear relación
          </h2>

          <p className="mt-2 text-sm text-stone-400">
            Nota origen:{' '}
            <span className="text-stone-200">
              {getNoteTitle(
                selectedRelationNoteId,
              )}
            </span>
          </p>

          <form
            onSubmit={
              handleCreateRelation
            }
            className="mt-6"
          >
            <label
              htmlFor="targetRelation"
              className="mb-2 block text-sm text-stone-300"
            >
              Relacionar con
            </label>

            <select
              id="targetRelation"
              value={
                targetRelationNoteId
              }
              onChange={(event) =>
                setTargetRelationNoteId(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            >
              <option value="">
                Selecciona una nota
              </option>

              {allNotes
                .filter(
                  (note) =>
                    note.id !==
                    selectedRelationNoteId,
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

            <button
              type="submit"
              disabled={
                isCreatingRelation ||
                !targetRelationNoteId
              }
              className="mt-4 rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
            >
              {isCreatingRelation
                ? 'Creando...'
                : 'Crear relación'}
            </button>
          </form>

          {relationMessage && (
            <p className="mt-4 text-lime-400">
              {relationMessage}
            </p>
          )}
        </section>
      )}

      {selectedRelationNoteId && (
        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Relaciones de la nota
          </h2>

          {isLoadingRelations ? (
            <p className="mt-6 text-stone-400">
              Cargando relaciones...
            </p>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="font-medium text-stone-200">
                  Enlaces salientes
                </h3>

                {relations.outgoing.length ===
                0 ? (
                  <p className="mt-3 text-sm text-stone-500">
                    No hay enlaces salientes.
                  </p>
                ) : (
                  relations.outgoing.map(
                    (relation) => (
                      <div
                        key={
                          relation.id
                        }
                        className="mt-3 rounded-xl border border-stone-700 bg-stone-950 p-4"
                      >
                        <p>
                          →{' '}
                          {getNoteTitle(
                            relation.targetNoteId,
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            requestDeleteRelation(
                              relation,
                            )
                          }
                          disabled={
                            deletingRelationId ===
                            relation.id
                          }
                          className="mt-3 text-sm text-red-400 disabled:opacity-50"
                        >
                          {deletingRelationId ===
                          relation.id
                            ? 'Eliminando...'
                            : 'Eliminar relación'}
                        </button>
                      </div>
                    ),
                  )
                )}
              </div>

              <div>
                <h3 className="font-medium text-stone-200">
                  Backlinks
                </h3>

                {relations.incoming.length ===
                0 ? (
                  <p className="mt-3 text-sm text-stone-500">
                    No hay backlinks.
                  </p>
                ) : (
                  relations.incoming.map(
                    (relation) => (
                      <div
                        key={
                          relation.id
                        }
                        className="mt-3 rounded-xl border border-stone-700 bg-stone-950 p-4"
                      >
                        <p>
                          ←{' '}
                          {getNoteTitle(
                            relation.sourceNoteId,
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            requestDeleteRelation(
                              relation,
                            )
                          }
                          disabled={
                            deletingRelationId ===
                            relation.id
                          }
                          className="mt-3 text-sm text-red-400 disabled:opacity-50"
                        >
                          {deletingRelationId ===
                          relation.id
                            ? 'Eliminando...'
                            : 'Eliminar relación'}
                        </button>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          )}
        </section>
      )}

      <ConfirmDialog
        isOpen={Boolean(relationToDelete)}
        title="Eliminar relación"
        message={
          relationToDelete
            ? '¿Seguro que quieres eliminar esta relación entre notas?'
            : ''
        }
        confirmText="Eliminar relación"
        isLoading={
          deletingRelationId ===
          relationToDelete?.id
        }
        onConfirm={
          confirmDeleteRelation
        }
        onCancel={() =>
          setRelationToDelete(null)
        }
      />
    </div>
  )
}

export default RelationsPage

