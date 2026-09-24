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
import {
  deleteGalleryImage,
  getGalleryImages,
} from '../services/gallery.js'
import { getGarden } from '../services/garden.js'
import { getNotes } from '../services/notes.js'

function GalleryPage() {
  const [searchParams] =
    useSearchParams()

  const selectedImageId =
    searchParams.get('selectedImage')

  const [images, setImages] =
    useState([])

  const [notes, setNotes] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [hasGarden, setHasGarden] =
    useState(true)

  const [imageToDelete, setImageToDelete] =
    useState(null)

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null)

  const [error, setError] =
    useState('')

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

        const [
          galleryResponse,
          notesResponse,
        ] = await Promise.all([
          getGalleryImages(),
          getNotes(),
        ])

        if (active) {
          setImages(
            galleryResponse.images,
          )
          setNotes(notesResponse.notes)
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
    if (!selectedImageId || isLoading) {
      return
    }

    requestAnimationFrame(() => {
      document
        .getElementById(
          `gallery-image-${selectedImageId}`,
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
    })
  }, [
    selectedImageId,
    images,
    isLoading,
  ])

  async function handleDelete() {
    if (!imageToDelete) {
      return
    }

    setDeletingImageId(
      imageToDelete.id,
    )
    setError('')

    try {
      await deleteGalleryImage(
        imageToDelete.id,
      )

      setImages((current) =>
        current.filter(
          (image) =>
            image.id !==
            imageToDelete.id,
        ),
      )

      setImageToDelete(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setDeletingImageId(null)
    }
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Abriendo la sala...
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
            Archivo fotográfico
          </p>

          <h1 className="mt-3 text-5xl font-semibold leading-none sm:text-6xl">
            Recorrer galería
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-400">
            Recuerdos, referencias y fragmentos
            visuales que también forman parte
            del jardín.
          </p>
        </div>

        <Link
          to="/gallery/new"
          className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
        >
          + Guardar recuerdo
        </Link>
      </header>

      <div className="archive-toolbar">
        <p className="utility-meta">
          {images.length}{' '}
          {images.length === 1
            ? 'pieza'
            : 'piezas'}
        </p>

        <p className="text-sm text-stone-500">
          Colección personal
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-6 border-l-4 border-red-900 bg-red-950/40 p-4 text-red-300"
        >
          {error}
        </p>
      )}

      {images.length === 0 ? (
        <div className="mt-10 border-t border-stone-700 py-12">
          <p className="text-xl text-stone-400">
            La sala todavía está vacía.
          </p>

          <Link
            to="/gallery/new"
            className="mt-4 inline-block text-lime-400"
          >
            Guardar el primer recuerdo →
          </Link>
        </div>
      ) : (
        <div className="visual-archive">
          {images.map((image, index) => {
            const relatedNote =
              notesById.get(image.noteId)

            return (
              <article
                id={`gallery-image-${image.id}`}
                key={image.id}
                data-selected={
                  selectedImageId ===
                  image.id
                }
                className="gallery-piece visual-archive__piece"
                style={{
                  '--piece-index': index,
                }}
              >
                <div className="gallery-frame">
                  <img
                    src={image.imageUrl}
                    alt={
                      image.description ||
                      'Recuerdo visual del jardín'
                    }
                    loading={
                      selectedImageId ===
                      image.id
                        ? 'eager'
                        : 'lazy'
                    }
                    onLoad={() => {
                      if (
                        selectedImageId ===
                        image.id
                      ) {
                        document
                          .getElementById(
                            `gallery-image-${image.id}`,
                          )
                          ?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          })
                      }
                    }}
                    className="gallery-artwork"
                  />
                </div>

                <div className="gallery-caption">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 max-w-3xl">
                      <p className="eyebrow">
                        Pieza{' '}
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </p>

                      <p className="mt-3 text-lg leading-7 text-stone-300">
                        {image.description ||
                          'Sin descripción'}
                      </p>
                    </div>

                    <div className="entry-actions">
                      <Link
                        to={`/gallery/${image.id}/edit`}
                        className="secondary-action"
                      >
                        ✎ Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setImageToDelete(
                            image,
                          )
                        }
                        className="secondary-action danger-action"
                      >
                        × Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-t border-stone-700 pt-4 text-xs text-stone-500">
                    <p>
                      <span className="mr-2 uppercase tracking-[0.12em]">
                        Idea
                      </span>

                      {relatedNote ? (
                        <Link
                          to={`/notes/${relatedNote.id}`}
                          className="text-lime-400"
                        >
                          {relatedNote.title}
                        </Link>
                      ) : (
                        'Sin asociación'
                      )}
                    </p>

                    <p>
                      <span className="mr-2 uppercase tracking-[0.12em]">
                        Ingreso
                      </span>

                      {new Date(
                        image.createdAt,
                      ).toLocaleString(
                        'es-MX',
                      )}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(imageToDelete)}
        title="Eliminar imagen"
        message="¿Seguro que quieres retirar esta pieza de tu galería?"
        confirmText="Eliminar imagen"
        isLoading={
          deletingImageId ===
          imageToDelete?.id
        }
        onConfirm={handleDelete}
        onCancel={() =>
          setImageToDelete(null)
        }
      />
    </div>
  )
}

export default GalleryPage
