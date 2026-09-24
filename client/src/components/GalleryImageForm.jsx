import {
  useRef,
  useState,
} from 'react'

import ValidatedForm from './ValidatedForm.jsx'

function GalleryImageForm({
  mode = 'create',
  allNotes,
  initialImage = null,
  isSubmitting,
  onSubmit,
}) {
  const fileInput = useRef(null)

  const [file, setFile] =
    useState(null)

  const [description, setDescription] =
    useState(
      initialImage?.description ?? '',
    )

  const [noteId, setNoteId] =
    useState(
      initialImage?.noteId ?? '',
    )

  function handleSubmit(event) {
    event.preventDefault()

    onSubmit({
      file,
      description,
      noteId,
    })
  }

  return (
    <ValidatedForm
      onSubmit={handleSubmit}
      className="editor-form mt-8 space-y-6"
    >
      {mode === 'create' && (
        <div>
          <label
            htmlFor="galleryFile"
            className="mb-2 block text-sm text-stone-300"
          >
            Imagen
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                fileInput.current?.click()
              }
              disabled={isSubmitting}
              className="secondary-action"
            >
              {file
                ? 'Cambiar imagen'
                : 'Seleccionar imagen'}
            </button>

            <p className="min-w-0 break-all text-sm text-stone-400">
              {file?.name ??
                'JPG, PNG o WEBP · máximo 5 MB'}
            </p>
          </div>

          <input
            ref={fileInput}
            id="galleryFile"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) =>
              setFile(
                event.target.files?.[0] ??
                null,
              )
            }
            className="sr-only"
            required
          />
        </div>
      )}

      <div>
        <label
          htmlFor="galleryDescription"
          className="mb-2 block text-sm text-stone-300"
        >
          Descripción
        </label>

        <textarea
          id="galleryDescription"
          maxLength={1000}
          value={description}
          onChange={(event) =>
            setDescription(
              event.target.value,
            )
          }
          className="min-h-32 w-full border border-stone-700 bg-stone-950 px-4 py-3"
          placeholder="¿Qué quieres recordar de esta imagen?"
        />

        <p className="mt-2 text-xs text-stone-500">
          Máximo 1000 caracteres
        </p>
      </div>

      <div>
        <label
          htmlFor="galleryNote"
          className="mb-2 block text-sm text-stone-300"
        >
          Idea asociada
        </label>

        <select
          id="galleryNote"
          value={noteId}
          onChange={(event) =>
            setNoteId(event.target.value)
          }
          className="w-full border border-stone-700 bg-stone-950 px-4 py-3"
        >
          <option value="">
            Sin idea asociada
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
        disabled={isSubmitting}
        className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
      >
        {isSubmitting
          ? 'Guardando...'
          : mode === 'create'
            ? 'Guardar recuerdo'
            : 'Guardar cambios'}
      </button>
    </ValidatedForm>
  )
}

export default GalleryImageForm
