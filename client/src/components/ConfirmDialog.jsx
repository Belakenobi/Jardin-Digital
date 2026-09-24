function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isLoading
        ) {
          onCancel()
        }
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="paper-panel w-full max-w-md p-6 sm:p-7"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-900 bg-red-950/40 text-lg font-semibold text-red-400">
          !
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-5 text-xl font-semibold text-stone-100"
        >
          {title}
        </h2>

        <p
          id="confirm-dialog-message"
          className="mt-3 text-sm leading-6 text-stone-400"
        >
          {message}
        </p>

        <p className="mt-2 text-xs text-stone-500">
          Esta acción no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-stone-700 px-4 py-2.5 text-sm text-stone-300 transition hover:bg-stone-800 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? 'Eliminando...'
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

