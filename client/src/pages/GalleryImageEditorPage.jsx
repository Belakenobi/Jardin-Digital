import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import GalleryImageForm from '../components/GalleryImageForm.jsx'
import {
  getGalleryImages,
  updateGalleryImage,
} from '../services/gallery.js'
import { getNotes } from '../services/notes.js'

function GalleryImageEditorPage() {
  const { imageId } = useParams()
  const navigate = useNavigate()

  const [image, setImage] =
    useState(null)

  const [notes, setNotes] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    let active = true

    async function loadPage() {
      try {
        const [
          galleryResponse,
          notesResponse,
        ] = await Promise.all([
          getGalleryImages(),
          getNotes(),
        ])

        if (!active) {
          return
        }

        const selected =
          galleryResponse.images.find(
            (item) =>
              item.id === imageId,
          )

        if (!selected) {
          setError(
            'No fue posible encontrar esta imagen.',
          )
          return
        }

        setImage(selected)
        setNotes(notesResponse.notes)
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

    loadPage()

    return () => {
      active = false
    }
  }, [imageId])

  async function handleSubmit(values) {
    setError('')
    setIsSubmitting(true)

    try {
      await updateGalleryImage(
        imageId,
        {
          description:
            values.description,
          noteId:
            values.noteId || null,
        },
      )

      navigate(
        `/gallery?selectedImage=${imageId}`,
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
        Abriendo la ficha...
      </p>
    )
  }

  if (!image) {
    return (
      <section className="max-w-3xl">
        <p
          role="alert"
          className="text-red-300"
        >
          {error}
        </p>

        <Link
          to="/gallery"
          className="mt-6 inline-block text-lime-400"
        >
          ← Volver a la galería
        </Link>
      </section>
    )
  }

  return (
    <div className="grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
      <div>
        <Link
          to={`/gallery?selectedImage=${imageId}`}
          className="text-sm text-lime-400"
        >
          ← Volver a la pieza
        </Link>

        <header className="mt-8">
          <p className="eyebrow">
            Mesa de edición visual
          </p>

          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Editar recuerdo
          </h1>
        </header>

        {error && (
          <p
            role="alert"
            className="mt-6 text-red-300"
          >
            {error}
          </p>
        )}

        <GalleryImageForm
          mode="edit"
          initialImage={image}
          allNotes={notes}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>

      <aside className="upload-aside">
        <p className="eyebrow">
          Pieza seleccionada
        </p>

        <img
          src={image.imageUrl}
          alt={
            image.description ||
            'Imagen seleccionada'
          }
        />
      </aside>
    </div>
  )
}

export default GalleryImageEditorPage
