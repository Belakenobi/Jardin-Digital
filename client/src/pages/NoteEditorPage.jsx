import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import NoteForm from '../components/NoteForm.jsx'
import { getGarden } from '../services/garden.js'
import {
  createNote,
  getNoteById,
  updateNote,
} from '../services/notes.js'

function NoteEditorPage() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(noteId)

  const [note, setNote] =
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

        if (isEditing) {
          const response =
            await getNoteById(noteId)

          if (active) {
            setNote(response.note)
          }
        }
      } catch (requestError) {
        if (!active) {
          return
        }

        if (
          !isEditing &&
          requestError.status === 404
        ) {
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
  }, [isEditing, noteId])

  async function handleSubmit(values) {
    setError('')
    setIsSubmitting(true)

    try {
      const response = isEditing
        ? await updateNote(
            noteId,
            values,
          )
        : await createNote(values)

      navigate(
        `/notes/${response.note.id}`,
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
        Preparando el cuaderno...
      </p>
    )
  }

  if (
    isEditing &&
    (error || !note)
  ) {
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

  if (!hasGarden) {
    return (
      <section className="max-w-3xl">
        <p className="eyebrow">
          Antes de plantar
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Crea tu jardín
        </h1>

        <p className="mt-4 text-stone-400">
          Necesitas un jardín antes de
          comenzar a guardar ideas.
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
    <div className="max-w-4xl">
      <Link
        to={
          isEditing
            ? `/notes/${noteId}`
            : '/notes'
        }
        className="text-sm text-lime-400"
      >
        ← Volver al archivo
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="eyebrow">
          {isEditing
            ? 'Mesa de edición'
            : 'Nueva entrada'}
        </p>

        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          {isEditing
            ? 'Editar idea'
            : 'Plantar una idea'}
        </h1>

        <p className="mt-4 max-w-2xl leading-7 text-stone-400">
          {isEditing
            ? 'Revisa el texto, cambia su estado de crecimiento y conserva su historia.'
            : 'Un espacio en blanco para registrar algo que apenas comienza a crecer.'}
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

      <NoteForm
        initialNote={note}
        isSubmitting={isSubmitting}
        submitLabel={
          isEditing
            ? 'Guardar cambios'
            : 'Plantar idea'
        }
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default NoteEditorPage
