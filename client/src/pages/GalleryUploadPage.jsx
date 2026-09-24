import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import GalleryImageForm from '../components/GalleryImageForm.jsx'
import {
  getGalleryImages,
  uploadGalleryImage,
} from '../services/gallery.js'
import { getGarden } from '../services/garden.js'
import { getNotes } from '../services/notes.js'

function GalleryUploadPage() {
  const navigate = useNavigate()

  const [notes, setNotes] =
    useState([])

  const [recentImage, setRecentImage] =
    useState(null)

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

        const [
          notesResponse,
          galleryResponse,
        ] = await Promise.all([
          getNotes(),
          getGalleryImages(),
        ])

        if (active) {
          setNotes(notesResponse.notes)
          setRecentImage(
            galleryResponse.images[0] ??
            null,
          )
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

  async function handleSubmit(values) {
    if (!values.file) {
      setError('Selecciona una imagen.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response =
        await uploadGalleryImage(values)

      navigate(
        `/gallery?selectedImage=${response.data.id}`,
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
        Preparando el archivo visual...
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
    <div className="grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
      <div>
        <Link
          to="/gallery"
          className="text-sm text-lime-400"
        >
          ← Volver a la galería
        </Link>

        <header className="mt-8">
          <p className="eyebrow">
            Archivo visual
          </p>

          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
            Guardar un recuerdo
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-stone-400">
            Añade contexto a la imagen y
            enlázala con una idea de tu
            jardín.
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

        <GalleryImageForm
          allNotes={notes}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>

      <aside className="upload-aside">
        <p className="eyebrow">
          Última pieza
        </p>

        {recentImage ? (
          <>
            <img
              src={recentImage.imageUrl}
              alt={
                recentImage.description ||
                'Última imagen guardada'
              }
            />

            <p className="mt-4 text-sm leading-6 text-stone-400">
              {recentImage.description ||
                'Sin descripción'}
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-stone-500">
            Tu archivo visual todavía está
            vacío.
          </p>
        )}
      </aside>
    </div>
  )
}

export default GalleryUploadPage
