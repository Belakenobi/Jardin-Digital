import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { clearSession } from '../services/session.js'

import {
  getProfile,
  updateProfile,
} from '../services/profile.js'

import {
  getGarden,
  createGarden,
  updateGarden,
} from '../services/garden.js'

import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../services/notes.js'

import {
  getRelationsForNote,
  createRelation,
  deleteRelation,
} from '../services/relations.js'

import {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '../services/gallery.js'

function DashboardPage() {
  const navigate = useNavigate()

  // PERFIL
  const [profile, setProfile] = useState(null)
  const [displayName, setDisplayName] = useState('')

  // JARDÍN
  const [garden, setGarden] = useState(null)
  const [gardenName, setGardenName] = useState('')
  const [gardenDescription, setGardenDescription] = useState('')
  const [gardenIsPublic, setGardenIsPublic] = useState(false)

  // NOTAS
  const [notes, setNotes] = useState([])
  const [allNotes, setAllNotes] = useState([])
  const [maturityFilter, setMaturityFilter] = useState('')

  const [newNoteTitle, setNewNoteTitle] = useState('')
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteMaturity, setNewNoteMaturity] = useState('seed')

  const [editingNoteId, setEditingNoteId] = useState(null)
  const [editNoteTitle, setEditNoteTitle] = useState('')
  const [editNoteContent, setEditNoteContent] = useState('')
  const [editNoteMaturity, setEditNoteMaturity] = useState('seed')

  // RELACIONES
  const [selectedRelationNoteId, setSelectedRelationNoteId] =
    useState('')
  const [targetRelationNoteId, setTargetRelationNoteId] =
    useState('')

  const [relations, setRelations] = useState({
    outgoing: [],
    incoming: [],
  })

  // GALERÍA
  const [galleryImages, setGalleryImages] = useState([])

  const [galleryFile, setGalleryFile] = useState(null)
  const [galleryDescription, setGalleryDescription] = useState('')
  const [galleryNoteId, setGalleryNoteId] = useState('')

  const [editingGalleryImageId, setEditingGalleryImageId] =
    useState(null)
  const [editGalleryDescription, setEditGalleryDescription] =
    useState('')
  const [editGalleryNoteId, setEditGalleryNoteId] = useState('')

  // LOADING
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingNotes, setIsLoadingNotes] = useState(false)
  const [isLoadingRelations, setIsLoadingRelations] =
    useState(false)
  const [isLoadingGallery, setIsLoadingGallery] = useState(false)

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isCreatingGarden, setIsCreatingGarden] = useState(false)
  const [isSavingGarden, setIsSavingGarden] = useState(false)

  const [isCreatingNote, setIsCreatingNote] = useState(false)
  const [isUpdatingNote, setIsUpdatingNote] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState(null)

  const [isCreatingRelation, setIsCreatingRelation] =
    useState(false)
  const [deletingRelationId, setDeletingRelationId] =
    useState(null)

  const [isUploadingGallery, setIsUploadingGallery] =
    useState(false)
  const [isUpdatingGallery, setIsUpdatingGallery] =
    useState(false)
  const [deletingGalleryImageId, setDeletingGalleryImageId] =
    useState(null)

  // MENSAJES
  const [error, setError] = useState('')
  const [profileMessage, setProfileMessage] = useState('')
  const [gardenMessage, setGardenMessage] = useState('')
  const [noteMessage, setNoteMessage] = useState('')
  const [relationMessage, setRelationMessage] = useState('')
  const [galleryMessage, setGalleryMessage] = useState('')

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const profileResponse = await getProfile()

        setProfile(profileResponse.profile)
        setDisplayName(profileResponse.profile.displayName)

        try {
          const gardenResponse = await getGarden()

          setGarden(gardenResponse.garden)
          setGardenName(gardenResponse.garden.name)
          setGardenDescription(
            gardenResponse.garden.description ?? '',
          )
          setGardenIsPublic(
            gardenResponse.garden.isPublic,
          )
        } catch (gardenError) {
          if (gardenError.status === 404) {
            setGarden(null)
            return
          }

          throw gardenError
        }

        const notesResponse = await getNotes()

        setNotes(notesResponse.notes)
        setAllNotes(notesResponse.notes)

        const galleryResponse = await getGalleryImages()

        setGalleryImages(galleryResponse.images)
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  async function loadAllNotes() {
    const response = await getNotes()

    setAllNotes(response.notes)

    return response.notes
  }

  async function loadNotes(maturity = '') {
    setError('')
    setIsLoadingNotes(true)

    try {
      const response = await getNotes(
        maturity || undefined,
      )

      setNotes(response.notes)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingNotes(false)
    }
  }

  async function refreshNotes() {
    const completeNotes = await loadAllNotes()

    if (maturityFilter) {
      await loadNotes(maturityFilter)
    } else {
      setNotes(completeNotes)
    }
  }

  async function loadGallery() {
    setError('')
    setIsLoadingGallery(true)

    try {
      const response = await getGalleryImages()
      setGalleryImages(response.images)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingGallery(false)
    }
  }

  async function loadRelations(noteId) {
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
      const response = await getRelationsForNote(noteId)
      setRelations(response.relations)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingRelations(false)
    }
  }

  async function handleProfileSubmit(event) {
    event.preventDefault()

    setError('')
    setProfileMessage('')
    setIsSavingProfile(true)

    try {
      const response = await updateProfile(displayName)

      setProfile(response.profile)
      setDisplayName(response.profile.displayName)

      setProfileMessage(
        'Perfil actualizado correctamente.',
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleCreateGarden(event) {
    event.preventDefault()

    setError('')
    setGardenMessage('')
    setIsCreatingGarden(true)

    try {
      const response = await createGarden({
        name: gardenName,
        description: gardenDescription || null,
        isPublic: gardenIsPublic,
      })

      setGarden(response.garden)
      setGardenName(response.garden.name)
      setGardenDescription(
        response.garden.description ?? '',
      )
      setGardenIsPublic(
        response.garden.isPublic,
      )

      setGardenMessage(
        'Jardín creado correctamente.',
      )

      const notesResponse = await getNotes()

      setNotes(notesResponse.notes)
      setAllNotes(notesResponse.notes)

      const galleryResponse = await getGalleryImages()

      setGalleryImages(galleryResponse.images)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreatingGarden(false)
    }
  }

  async function handleGardenSubmit(event) {
    event.preventDefault()

    setError('')
    setGardenMessage('')
    setIsSavingGarden(true)

    try {
      const response = await updateGarden({
        name: gardenName,
        description: gardenDescription || null,
        isPublic: gardenIsPublic,
      })

      setGarden(response.garden)
      setGardenName(response.garden.name)
      setGardenDescription(
        response.garden.description ?? '',
      )
      setGardenIsPublic(
        response.garden.isPublic,
      )

      setGardenMessage(
        'Jardín actualizado correctamente.',
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSavingGarden(false)
    }
  }

  async function handleMaturityFilterChange(event) {
    const value = event.target.value

    setMaturityFilter(value)

    await loadNotes(value)
  }

  async function handleCreateNote(event) {
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

      await refreshNotes()
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
    setEditNoteTitle(note.title)
    setEditNoteContent(note.content ?? '')
    setEditNoteMaturity(note.maturity)
  }

  function cancelEditingNote() {
    setEditingNoteId(null)
    setEditNoteTitle('')
    setEditNoteContent('')
    setEditNoteMaturity('seed')
  }

  async function handleUpdateNote(event, noteId) {
    event.preventDefault()

    setError('')
    setNoteMessage('')
    setIsUpdatingNote(true)

    try {
      await updateNote(noteId, {
        title: editNoteTitle,
        content: editNoteContent,
        maturity: editNoteMaturity,
      })

      cancelEditingNote()

      setNoteMessage(
        'Nota actualizada correctamente.',
      )

      await refreshNotes()

      if (selectedRelationNoteId === noteId) {
        await loadRelations(noteId)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUpdatingNote(false)
    }
  }

  async function handleDeleteNote(noteId) {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar esta nota?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setNoteMessage('')
    setDeletingNoteId(noteId)

    try {
      await deleteNote(noteId)

      if (editingNoteId === noteId) {
        cancelEditingNote()
      }

      if (selectedRelationNoteId === noteId) {
        setSelectedRelationNoteId('')
        setTargetRelationNoteId('')

        setRelations({
          outgoing: [],
          incoming: [],
        })
      }

      setNoteMessage(
        'Nota eliminada correctamente.',
      )

      await refreshNotes()
      await loadGallery()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingNoteId(null)
    }
  }

  async function handleRelationNoteChange(event) {
    const noteId = event.target.value

    setSelectedRelationNoteId(noteId)
    setTargetRelationNoteId('')

    await loadRelations(noteId)
  }

  async function handleCreateRelation(event) {
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
        sourceNoteId: selectedRelationNoteId,
        targetNoteId: targetRelationNoteId,
      })

      setTargetRelationNoteId('')

      setRelationMessage(
        'Relación creada correctamente.',
      )

      await loadRelations(selectedRelationNoteId)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreatingRelation(false)
    }
  }

  async function handleDeleteRelation(relationId) {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar esta relación?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setRelationMessage('')
    setDeletingRelationId(relationId)

    try {
      await deleteRelation(relationId)

      setRelationMessage(
        'Relación eliminada correctamente.',
      )

      await loadRelations(selectedRelationNoteId)
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingRelationId(null)
    }
  }

  async function handleUploadGalleryImage(event) {
    event.preventDefault()

    if (!galleryFile) {
      setError('Selecciona una imagen.')
      return
    }

    setError('')
    setGalleryMessage('')
    setIsUploadingGallery(true)

    try {
      await uploadGalleryImage({
        file: galleryFile,
        description: galleryDescription,
        noteId: galleryNoteId,
      })

      setGalleryFile(null)
      setGalleryDescription('')
      setGalleryNoteId('')

      setGalleryMessage(
        'Imagen subida correctamente.',
      )

      event.target.reset()

      await loadGallery()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUploadingGallery(false)
    }
  }

  function startEditingGalleryImage(image) {
    setError('')
    setGalleryMessage('')

    setEditingGalleryImageId(image.id)
    setEditGalleryDescription(
      image.description ?? '',
    )
    setEditGalleryNoteId(
      image.noteId ?? '',
    )
  }

  function cancelEditingGalleryImage() {
    setEditingGalleryImageId(null)
    setEditGalleryDescription('')
    setEditGalleryNoteId('')
  }

  async function handleUpdateGalleryImage(
    event,
    imageId,
  ) {
    event.preventDefault()

    setError('')
    setGalleryMessage('')
    setIsUpdatingGallery(true)

    try {
      await updateGalleryImage(imageId, {
        description: editGalleryDescription,
        noteId: editGalleryNoteId || null,
      })

      cancelEditingGalleryImage()

      setGalleryMessage(
        'Imagen actualizada correctamente.',
      )

      await loadGallery()
    } catch (error) {
      setError(error.message)
    } finally {
      setIsUpdatingGallery(false)
    }
  }

  async function handleDeleteGalleryImage(imageId) {
    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar esta imagen?',
    )

    if (!confirmed) {
      return
    }

    setError('')
    setGalleryMessage('')
    setDeletingGalleryImageId(imageId)

    try {
      await deleteGalleryImage(imageId)

      if (editingGalleryImageId === imageId) {
        cancelEditingGalleryImage()
      }

      setGalleryMessage(
        'Imagen eliminada correctamente.',
      )

      await loadGallery()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingGalleryImageId(null)
    }
  }

  function handleLogout() {
    clearSession()
    navigate('/login')
  }

  function getMaturityLabel(maturity) {
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

  function getNoteTitle(noteId) {
    const note = allNotes.find(
      (currentNote) =>
        currentNote.id === noteId,
    )

    return note?.title ?? 'Nota no disponible'
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 p-8">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Mi jardín
        </h1>

        {isLoading && (
          <p className="mt-6 text-stone-400">
            Cargando datos...
          </p>
        )}

        {error && (
          <p className="mt-6 text-red-400">
            {error}
          </p>
        )}

        {profile && (
          <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-xl font-medium">
              Perfil
            </h2>

            <p className="mt-4 text-stone-400">
              Rol: {profile.role}
            </p>

            <form
              onSubmit={handleProfileSubmit}
              className="mt-6 max-w-md"
            >
              <label
                htmlFor="displayName"
                className="block mb-2 text-sm text-stone-300"
              >
                Nombre visible
              </label>

              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
                required
              />

              <button
                type="submit"
                disabled={isSavingProfile}
                className="mt-4 rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
              >
                {isSavingProfile
                  ? 'Guardando...'
                  : 'Guardar nombre'}
              </button>
            </form>

            {profileMessage && (
              <p className="mt-4 text-sm text-lime-400">
                {profileMessage}
              </p>
            )}
          </section>
        )}

        {!isLoading && profile && !garden && (
          <section className="mt-8 rounded-2xl border border-lime-900 bg-stone-900 p-6">
            <h2 className="text-xl font-medium">
              Crea tu jardín
            </h2>

            <p className="mt-3 text-stone-400">
              Tu cuenta ya está lista. Ahora crea tu jardín para
              empezar a guardar notas, relaciones e imágenes.
            </p>

            <form
              onSubmit={handleCreateGarden}
              className="mt-6 max-w-xl space-y-5"
            >
              <div>
                <label
                  htmlFor="newGardenName"
                  className="mb-2 block text-sm text-stone-300"
                >
                  Nombre del jardín
                </label>

                <input
                  id="newGardenName"
                  type="text"
                  value={gardenName}
                  onChange={(event) =>
                    setGardenName(event.target.value)
                  }
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="newGardenDescription"
                  className="mb-2 block text-sm text-stone-300"
                >
                  Descripción
                </label>

                <textarea
                  id="newGardenDescription"
                  value={gardenDescription}
                  onChange={(event) =>
                    setGardenDescription(
                      event.target.value,
                    )
                  }
                  className="min-h-32 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
                />
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={gardenIsPublic}
                  onChange={(event) =>
                    setGardenIsPublic(
                      event.target.checked,
                    )
                  }
                />

                Jardín público
              </label>

              <button
                type="submit"
                disabled={isCreatingGarden}
                className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
              >
                {isCreatingGarden
                  ? 'Creando jardín...'
                  : 'Crear mi jardín'}
              </button>
            </form>
          </section>
        )}

        {garden && (
          <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
            <h2 className="text-xl font-medium">
              Jardín
            </h2>

            <form
              onSubmit={handleGardenSubmit}
              className="mt-6 max-w-xl space-y-5"
            >
              <input
                type="text"
                value={gardenName}
                onChange={(event) =>
                  setGardenName(event.target.value)
                }
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
                required
              />

              <textarea
                value={gardenDescription}
                onChange={(event) =>
                  setGardenDescription(
                    event.target.value,
                  )
                }
                className="min-h-32 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              />

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={gardenIsPublic}
                  onChange={(event) =>
                    setGardenIsPublic(
                      event.target.checked,
                    )
                  }
                />

                Jardín público
              </label>

              <button
                type="submit"
                disabled={isSavingGarden}
                className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
              >
                Guardar jardín
              </button>
            </form>

            {gardenMessage && (
              <p className="mt-4 text-sm text-lime-400">
                {gardenMessage}
              </p>
            )}
          </section>
        )}

        {garden && (
          <>
        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Plantar una nueva idea
          </h2>

          <form
            onSubmit={handleCreateNote}
            className="mt-6 space-y-5"
          >
            <input
              type="text"
              placeholder="Título"
              value={newNoteTitle}
              onChange={(event) =>
                setNewNoteTitle(event.target.value)
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              required
            />

            <textarea
              placeholder="Contenido"
              value={newNoteContent}
              onChange={(event) =>
                setNewNoteContent(
                  event.target.value,
                )
              }
              className="min-h-40 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            />

            <select
              value={newNoteMaturity}
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

            <button
              type="submit"
              disabled={isCreatingNote}
              className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
            >
              Crear nota
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

            <select
              value={maturityFilter}
              onChange={handleMaturityFilterChange}
              disabled={isLoadingNotes}
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

          {noteMessage && (
            <p className="mt-4 text-lime-400">
              {noteMessage}
            </p>
          )}

          <div className="mt-6 space-y-4">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-stone-700 bg-stone-950 p-5"
              >
                {editingNoteId === note.id ? (
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
                      value={editNoteTitle}
                      onChange={(event) =>
                        setEditNoteTitle(
                          event.target.value,
                        )
                      }
                      className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                    />

                    <textarea
                      value={editNoteContent}
                      onChange={(event) =>
                        setEditNoteContent(
                          event.target.value,
                        )
                      }
                      className="min-h-32 w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                    />

                    <select
                      value={editNoteMaturity}
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

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={isUpdatingNote}
                        className="rounded-xl bg-lime-400 px-5 py-3 text-stone-950"
                      >
                        Guardar cambios
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditingNote}
                        className="rounded-xl border border-stone-700 px-5 py-3"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-between gap-4">
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
                            startEditingNote(note)
                          }
                          className="rounded-lg border border-stone-700 px-4 py-2"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNote(
                              note.id,
                            )
                          }
                          disabled={
                            deletingNoteId ===
                            note.id
                          }
                          className="rounded-lg border border-red-900 px-4 py-2 text-red-400"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-stone-300">
                      {note.content}
                    </p>

                    <p className="mt-4 text-xs text-stone-500">
                      Plantada:{' '}
                      {new Date(
                        note.createdAt,
                      ).toLocaleString('es-MX')}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Último riego:{' '}
                      {new Date(
                        note.updatedAt,
                      ).toLocaleString('es-MX')}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Relaciones y backlinks
          </h2>

          <select
            value={selectedRelationNoteId}
            onChange={handleRelationNoteChange}
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

          {selectedRelationNoteId && (
            <>
              <form
                onSubmit={handleCreateRelation}
                className="mt-6"
              >
                <select
                  value={targetRelationNoteId}
                  onChange={(event) =>
                    setTargetRelationNoteId(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
                >
                  <option value="">
                    Relacionar con...
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
                  className="mt-4 rounded-xl bg-lime-400 px-5 py-3 text-stone-950"
                >
                  Crear relación
                </button>
              </form>

              {relationMessage && (
                <p className="mt-4 text-lime-400">
                  {relationMessage}
                </p>
              )}

              {!isLoadingRelations && (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  <div>
                    <h3>Enlaces salientes</h3>

                    {relations.outgoing.map(
                      (relation) => (
                        <div
                          key={relation.id}
                          className="mt-3 rounded-xl border border-stone-700 p-4"
                        >
                          →{' '}
                          {getNoteTitle(
                            relation.targetNoteId,
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRelation(
                                relation.id,
                              )
                            }
                            disabled={
                              deletingRelationId ===
                              relation.id
                            }
                            className="mt-3 block text-sm text-red-400"
                          >
                            Eliminar relación
                          </button>
                        </div>
                      ),
                    )}
                  </div>

                  <div>
                    <h3>Backlinks</h3>

                    {relations.incoming.map(
                      (relation) => (
                        <div
                          key={relation.id}
                          className="mt-3 rounded-xl border border-stone-700 p-4"
                        >
                          ←{' '}
                          {getNoteTitle(
                            relation.sourceNoteId,
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRelation(
                                relation.id,
                              )
                            }
                            className="mt-3 block text-sm text-red-400"
                          >
                            Eliminar relación
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* GALERÍA */}
        <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Galería
          </h2>

          <form
            onSubmit={handleUploadGalleryImage}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="block mb-2 text-sm text-stone-300">
                Imagen
              </label>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setGalleryFile(
                    event.target.files?.[0] ?? null,
                  )
                }
                className="block w-full text-sm text-stone-300"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-stone-300">
                Descripción
              </label>

              <textarea
                value={galleryDescription}
                onChange={(event) =>
                  setGalleryDescription(
                    event.target.value,
                  )
                }
                className="min-h-24 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-stone-300">
                Relacionar con una nota
              </label>

              <select
                value={galleryNoteId}
                onChange={(event) =>
                  setGalleryNoteId(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              >
                <option value="">
                  Sin nota asociada
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
            </div>

            <button
              type="submit"
              disabled={isUploadingGallery}
              className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
            >
              {isUploadingGallery
                ? 'Subiendo...'
                : 'Subir imagen'}
            </button>
          </form>

          {galleryMessage && (
            <p className="mt-4 text-sm text-lime-400">
              {galleryMessage}
            </p>
          )}

          {isLoadingGallery && (
            <p className="mt-6 text-stone-400">
              Cargando galería...
            </p>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {galleryImages.map((image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950"
              >
                <img
                  src={image.imageUrl}
                  alt={
                    image.description ||
                    'Imagen de galería'
                  }
                  className="h-64 w-full object-cover"
                />

                <div className="p-5">
                  {editingGalleryImageId ===
                  image.id ? (
                    <form
                      onSubmit={(event) =>
                        handleUpdateGalleryImage(
                          event,
                          image.id,
                        )
                      }
                      className="space-y-4"
                    >
                      <textarea
                        value={
                          editGalleryDescription
                        }
                        onChange={(event) =>
                          setEditGalleryDescription(
                            event.target.value,
                          )
                        }
                        placeholder="Descripción"
                        className="min-h-24 w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                      />

                      <select
                        value={editGalleryNoteId}
                        onChange={(event) =>
                          setEditGalleryNoteId(
                            event.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3"
                      >
                        <option value="">
                          Sin nota asociada
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

                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={isUpdatingGallery}
                          className="rounded-xl bg-lime-400 px-4 py-2 text-stone-950"
                        >
                          Guardar
                        </button>

                        <button
                          type="button"
                          onClick={
                            cancelEditingGalleryImage
                          }
                          className="rounded-xl border border-stone-700 px-4 py-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <p className="text-stone-300">
                        {image.description ||
                          'Sin descripción'}
                      </p>

                      <p className="mt-3 text-sm text-stone-500">
                        Nota:{' '}
                        {image.noteId
                          ? getNoteTitle(
                              image.noteId,
                            )
                          : 'Sin asociación'}
                      </p>

                      <p className="mt-2 text-xs text-stone-600">
                        Subida:{' '}
                        {new Date(
                          image.createdAt,
                        ).toLocaleString(
                          'es-MX',
                        )}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            startEditingGalleryImage(
                              image,
                            )
                          }
                          className="rounded-lg border border-stone-700 px-4 py-2 text-sm"
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteGalleryImage(
                              image.id,
                            )
                          }
                          disabled={
                            deletingGalleryImageId ===
                            image.id
                          }
                          className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 disabled:opacity-50"
                        >
                          {deletingGalleryImageId ===
                          image.id
                            ? 'Eliminando...'
                            : 'Eliminar'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>

          {!isLoadingGallery &&
            galleryImages.length === 0 && (
              <p className="mt-6 text-stone-500">
                Todavía no tienes imágenes en tu galería.
              </p>
            )}
        </section>
          </>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-xl border border-stone-700 px-5 py-3"
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  )
}

export default DashboardPage

