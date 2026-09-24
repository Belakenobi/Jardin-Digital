import { useState } from 'react'

import ValidatedForm from './ValidatedForm.jsx'

function NoteForm({
  initialNote = null,
  isSubmitting,
  submitLabel,
  onSubmit,
}) {
  const [title, setTitle] =
    useState(initialNote?.title ?? '')

  const [content, setContent] =
    useState(initialNote?.content ?? '')

  const [maturity, setMaturity] =
    useState(
      initialNote?.maturity ?? 'seed',
    )

  function handleSubmit(event) {
    event.preventDefault()

    onSubmit({
      title,
      content,
      maturity,
    })
  }

  return (
    <ValidatedForm
      onSubmit={handleSubmit}
      className="editor-form mt-8 space-y-6"
    >
      <div>
        <label
          htmlFor="noteTitle"
          className="mb-2 block text-sm text-stone-300"
        >
          Título
        </label>

        <input
          id="noteTitle"
          maxLength={200}
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          className="w-full border border-stone-700 bg-stone-950 px-4 py-3 text-lg"
          required
          autoFocus
        />

        <p className="mt-2 text-xs text-stone-500">
          Máximo 200 caracteres
        </p>
      </div>

      <div>
        <label
          htmlFor="noteContent"
          className="mb-2 block text-sm text-stone-300"
        >
          Contenido
        </label>

        <textarea
          id="noteContent"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          className="min-h-80 w-full border border-stone-700 bg-stone-950 px-4 py-4 leading-7"
          placeholder="Escribe sin prisa. Esta idea puede seguir creciendo después."
        />
      </div>

      <div>
        <label
          htmlFor="noteMaturity"
          className="mb-2 block text-sm text-stone-300"
        >
          Estado de crecimiento
        </label>

        <select
          id="noteMaturity"
          value={maturity}
          onChange={(event) =>
            setMaturity(event.target.value)
          }
          className="w-full border border-stone-700 bg-stone-950 px-4 py-3 sm:max-w-xs"
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
        disabled={isSubmitting}
        className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
      >
        {isSubmitting
          ? 'Guardando...'
          : submitLabel}
      </button>
    </ValidatedForm>
  )
}

export default NoteForm
