import ValidatedForm from '../components/ValidatedForm.jsx'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'

import {
  getGarden,
} from '../services/garden.js'

import {
  getNotes,
} from '../services/notes.js'

import {
  getGalleryImages,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
} from '../services/gallery.js'

function GalleryPage() {
  const galleryFileInput = useRef(null)

  const [hasGarden, setHasGarden] =
    useState(true)

  const [allNotes, setAllNotes] =
    useState([])

  const [
    galleryImages,
    setGalleryImages,
  ] = useState([])

  const [
    galleryFile,
    setGalleryFile,
  ] = useState(null)

  const [
    galleryDescription,
    setGalleryDescription,
  ] = useState('')

  const [
    galleryNoteId,
    setGalleryNoteId,
  ] = useState('')

  const [
    editingGalleryImageId,
    setEditingGalleryImageId,
  ] = useState(null)

  const [
    editGalleryDescription,
    setEditGalleryDescription,
  ] = useState('')

  const [
    editGalleryNoteId,
    setEditGalleryNoteId,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isLoadingGallery,
    setIsLoadingGallery,
  ] = useState(false)

  const [
    isUploadingGallery,
    setIsUploadingGallery,
  ] = useState(false)

  const [
    isUpdatingGallery,
    setIsUpdatingGallery,
  ] = useState(false)

  const [
    deletingGalleryImageId,
    setDeletingGalleryImageId,
  ] = useState(null)

  const [
    imageToDelete,
    setImageToDelete,
  ] = useState(null)

  const [error, setError] =
    useState('')

  const [
    galleryMessage,
    setGalleryMessage,
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

        const galleryResponse =
          await getGalleryImages()

        setGalleryImages(
          galleryResponse.images,
        )
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadPage()
  }, [])

  async function loadGallery() {
    setError('')
    setIsLoadingGallery(true)

    try {
      const response =
        await getGalleryImages()

      setGalleryImages(
        response.images,
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoadingGallery(false)
    }
  }

  async function handleUploadGalleryImage(
    event,
  ) {
    event.preventDefault()

    if (!galleryFile) {
      setError(
        'Selecciona una imagen.',
      )
      return
    }

    setError('')
    setGalleryMessage('')
    setIsUploadingGallery(true)

    try {
      await uploadGalleryImage({
        file: galleryFile,
        description:
          galleryDescription,
        noteId:
          galleryNoteId,
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

  function startEditingGalleryImage(
    image,
  ) {
    setError('')
    setGalleryMessage('')

    setEditingGalleryImageId(
      image.id,
    )

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
      await updateGalleryImage(
        imageId,
        {
          description:
            editGalleryDescription,
          noteId:
            editGalleryNoteId ||
            null,
        },
      )

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

  function requestDeleteGalleryImage(
    image,
  ) {
    setError('')
    setGalleryMessage('')
    setImageToDelete(image)
  }

  async function confirmDeleteGalleryImage() {
    if (!imageToDelete) {
      return
    }

    const imageId = imageToDelete.id

    setError('')
    setGalleryMessage('')

    setDeletingGalleryImageId(
      imageId,
    )

    try {
      await deleteGalleryImage(
        imageId,
      )

      if (
        editingGalleryImageId ===
        imageId
      ) {
        cancelEditingGalleryImage()
      }

      setGalleryMessage(
        'Imagen eliminada correctamente.',
      )

      setImageToDelete(null)

      await loadGallery()
    } catch (error) {
      setError(error.message)
    } finally {
      setDeletingGalleryImageId(null)
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
        Cargando galería...
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
          Galería
        </h1>

        <div className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <h2 className="text-xl font-medium">
            Primero crea tu jardín
          </h2>

          <p className="mt-3 text-stone-400">
            Necesitas un jardín antes de
            poder subir imágenes.
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
          Galería
        </h1>

        <p className="mt-3 text-stone-400">
          Guarda imágenes dentro de tu
          jardín y relaciónalas con tus notas.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="text-xl font-medium">
          Subir imagen
        </h2>

        <ValidatedForm
          onSubmit={
            handleUploadGalleryImage
          }
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="galleryFile"
              className="mb-2 block text-sm text-stone-300"
            >
              Imagen (JPG, PNG o WEBP; máximo 5 MB)
            </label>

            <div className="group">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => galleryFileInput.current?.click()}
                  disabled={isUploadingGallery}
                  aria-controls="galleryFile"
                  className="shrink-0 cursor-pointer rounded-xl border border-lime-400 bg-stone-950 px-5 py-3 font-medium text-lime-300 hover:bg-stone-800 group-focus-within:ring-2 group-focus-within:ring-lime-400 group-focus-within:ring-offset-2 group-focus-within:ring-offset-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {galleryFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </button>

                <p id="galleryFileName" role="status" className="min-w-0 break-all text-sm text-stone-300">
                  {galleryFile?.name || 'Ninguna imagen seleccionada'}
                </p>
              </div>

              <input
                ref={galleryFileInput}
                id="galleryFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-describedby="galleryFileName"
                tabIndex={-1}
                disabled={isUploadingGallery}
                onChange={(event) =>
                  setGalleryFile(
                    event.target.files?.[0] ?? null,
                  )
                }
                className="sr-only"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="galleryDescription"
              className="mb-2 block text-sm text-stone-300"
            >
              Descripción (máximo 1000 caracteres)
            </label>

            <textarea
              id="galleryDescription"
              maxLength={1000}
              value={
                galleryDescription
              }
              onChange={(event) =>
                setGalleryDescription(
                  event.target.value,
                )
              }
              className="min-h-24 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            />
          </div>

          <div>
            <label
              htmlFor="galleryNote"
              className="mb-2 block text-sm text-stone-300"
            >
              Relacionar con una nota
            </label>

            <select
              id="galleryNote"
              value={
                galleryNoteId
              }
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
            disabled={
              isUploadingGallery
            }
            className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
          >
            {isUploadingGallery
              ? 'Subiendo...'
              : 'Subir imagen'}
          </button>
        </ValidatedForm>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-medium">
              Mis imágenes
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              {galleryImages.length}{' '}
              imagen(es)
            </p>
          </div>
        </div>

        {galleryMessage && (
          <p className="mt-4 text-lime-400">
            {galleryMessage}
          </p>
        )}

        {isLoadingGallery && (
          <p className="mt-6 text-stone-400">
            Cargando galería...
          </p>
        )}

        {!isLoadingGallery &&
          galleryImages.length === 0 && (
            <p className="mt-6 text-stone-500">
              Todavía no tienes imágenes
              en tu galería.
            </p>
          )}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {galleryImages.map(
            (image) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-stone-700 bg-stone-950"
              >
                <img
                  src={
                    image.imageUrl
                  }
                  alt={
                    image.description ||
                    'Imagen de galería'
                  }
                  className="h-64 w-full object-cover"
                />

                <div className="p-5">
                  {editingGalleryImageId ===
                  image.id ? (
                    <ValidatedForm
                      onSubmit={(event) =>
                        handleUpdateGalleryImage(
                          event,
                          image.id,
                        )
                      }
                      className="space-y-4"
                    >
                      <textarea
                        aria-label="Descripción de la imagen"
                        maxLength={1000}
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
                        aria-label="Nota asociada"
                        value={
                          editGalleryNoteId
                        }
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

                        {allNotes.map(
                          (note) => (
                            <option
                              key={
                                note.id
                              }
                              value={
                                note.id
                              }
                            >
                              {
                                note.title
                              }
                            </option>
                          ),
                        )}
                      </select>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="submit"
                          disabled={
                            isUpdatingGallery
                          }
                          className="rounded-xl bg-lime-400 px-4 py-2 text-stone-950 disabled:opacity-50"
                        >
                          {isUpdatingGallery
                            ? 'Guardando...'
                            : 'Guardar'}
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
                    </ValidatedForm>
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

                      <div className="mt-4 flex flex-wrap gap-2">
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
                            requestDeleteGalleryImage(
                              image,
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
            ),
          )}
        </div>
      </section>

      <ConfirmDialog
        isOpen={Boolean(imageToDelete)}
        title="Eliminar imagen"
        message={
          imageToDelete
            ? '¿Seguro que quieres eliminar esta imagen de tu galería?'
            : ''
        }
        confirmText="Eliminar imagen"
        isLoading={
          deletingGalleryImageId ===
          imageToDelete?.id
        }
        onConfirm={
          confirmDeleteGalleryImage
        }
        onCancel={() =>
          setImageToDelete(null)
        }
      />
    </div>
  )
}

export default GalleryPage
