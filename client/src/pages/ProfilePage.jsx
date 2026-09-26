import ValidatedForm from '../components/ValidatedForm.jsx'
import {
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import ConfirmDialog from '../components/ConfirmDialog.jsx'

import {
  getProfile,
  updateProfile,
} from '../services/profile.js'

import {
  createGarden,
  deleteGarden,
  getGarden,
  updateGarden,
} from '../services/garden.js'

function ProfilePage() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)

  const [displayName, setDisplayName] =
    useState('')

  const [garden, setGarden] = useState(null)

  const [gardenName, setGardenName] =
    useState('')

  const [
    gardenDescription,
    setGardenDescription,
  ] = useState('')

  const [
    gardenIsPublic,
    setGardenIsPublic,
  ] = useState(false)

  const [isLoading, setIsLoading] =
    useState(true)

  const [
    isSavingProfile,
    setIsSavingProfile,
  ] = useState(false)

  const [
    isSavingGarden,
    setIsSavingGarden,
  ] = useState(false)

  const [
    showDeleteGarden,
    setShowDeleteGarden,
  ] = useState(false)

  const [
    isDeletingGarden,
    setIsDeletingGarden,
  ] = useState(false)

  const [error, setError] =
    useState('')

  const [
    profileMessage,
    setProfileMessage,
  ] = useState('')

  const [
    gardenMessage,
    setGardenMessage,
  ] = useState('')

  useEffect(() => {
    async function loadData() {
      setError('')

      try {
        const profileResponse =
          await getProfile()

        setProfile(
          profileResponse.profile,
        )

        setDisplayName(
          profileResponse.profile.displayName,
        )

        try {
          const gardenResponse =
            await getGarden()

          const loadedGarden =
            gardenResponse.garden

          setGarden(loadedGarden)

          setGardenName(
            loadedGarden.name,
          )

          setGardenDescription(
            loadedGarden.description ?? '',
          )

          setGardenIsPublic(
            loadedGarden.isPublic,
          )
        } catch (error) {
          if (error.status === 404) {
            setGarden(null)
          } else {
            throw error
          }
        }
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  async function handleProfileSubmit(
    event,
  ) {
    event.preventDefault()

    setError('')
    setProfileMessage('')
    setIsSavingProfile(true)

    try {
      const response =
        await updateProfile(
          displayName,
        )

      setProfile(response.profile)

      setDisplayName(
        response.profile.displayName,
      )

      setProfileMessage(
        'Perfil actualizado correctamente.',
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleGardenSubmit(
    event,
  ) {
    event.preventDefault()

    setError('')
    setGardenMessage('')
    setIsSavingGarden(true)

    try {
      let response

      if (garden) {
        response =
          await updateGarden({
            name: gardenName,
            description:
              gardenDescription || null,
            isPublic:
              gardenIsPublic,
          })
      } else {
        response =
          await createGarden({
            name: gardenName,
            description:
              gardenDescription || null,
            isPublic:
              gardenIsPublic,
          })
      }

      setGarden(response.garden)

      setGardenName(
        response.garden.name,
      )

      setGardenDescription(
        response.garden.description ?? '',
      )

      setGardenIsPublic(
        response.garden.isPublic,
      )

      setGardenMessage(
        garden
          ? 'Jardín actualizado correctamente.'
          : 'Jardín creado correctamente.',
      )
    } catch (error) {
      setError(error.message)
    } finally {
      setIsSavingGarden(false)
    }
  }

  async function handleGardenDelete() {
    setError('')
    setGardenMessage('')
    setIsDeletingGarden(true)

    try {
      await deleteGarden()

      setGarden(null)
      setGardenName('')
      setGardenDescription('')
      setGardenIsPublic(false)
      setShowDeleteGarden(false)

      navigate('/dashboard', {
        replace: true,
        state: {
          gardenDeleted: true,
        },
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsDeletingGarden(false)
    }
  }

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Cargando perfil...
      </p>
    )
  }

  return (
    <div className="max-w-4xl">
      <div>
        <p className="eyebrow">
          Configuración
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Perfil y jardín
        </h1>

        <p className="mt-3 text-stone-400">
          Administra tu identidad y la
          información principal de tu jardín.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      {profile && (
        <section className="paper-panel mt-8 p-6 sm:p-7">
          <h2 className="text-xl font-medium">
            Perfil
          </h2>

          <p className="mt-3 text-sm text-stone-400">
            Rol: {profile.role}
          </p>

          <ValidatedForm
            onSubmit={
              handleProfileSubmit
            }
            className="mt-6 max-w-md"
          >
            <label
              htmlFor="displayName"
              className="mb-2 block text-sm text-stone-300"
            >
              Nombre visible (máximo 80 caracteres)
            </label>

            <input
              id="displayName"
              maxLength={80}
              type="text"
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              required
            />

            <button
              type="submit"
              disabled={
                isSavingProfile
              }
              className="mt-4 rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
            >
              {isSavingProfile
                ? 'Guardando...'
                : 'Guardar perfil'}
            </button>
          </ValidatedForm>

          {profileMessage && (
            <p className="mt-4 text-sm text-lime-400">
              {profileMessage}
            </p>
          )}
        </section>
      )}

      <section className="paper-panel mt-8 p-6 sm:p-7">
        <h2 className="text-xl font-medium">
          {garden
            ? 'Jardín'
            : 'Crear jardín'}
        </h2>

        {!garden && (
          <p className="mt-3 text-stone-400">
            Tu cuenta todavía no tiene un
            jardín. Crea uno para poder usar
            ideas, relaciones y galería.
          </p>
        )}

        <ValidatedForm
          onSubmit={
            handleGardenSubmit
          }
          className="mt-6 max-w-xl space-y-5"
        >
          <div>
            <label
              htmlFor="gardenName"
              className="mb-2 block text-sm text-stone-300"
            >
              Nombre del jardín (máximo 100 caracteres)
            </label>

            <input
              id="gardenName"
              maxLength={100}
              type="text"
              value={gardenName}
              onChange={(event) =>
                setGardenName(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
              required
            />
          </div>

          <div>
            <label
              htmlFor="gardenDescription"
              className="mb-2 block text-sm text-stone-300"
            >
              Descripción (máximo 500 caracteres)
            </label>

            <textarea
              id="gardenDescription"
              maxLength={500}
              value={
                gardenDescription
              }
              onChange={(event) =>
                setGardenDescription(
                  event.target.value,
                )
              }
              rows="4"
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3"
            />
          </div>

          <label className="flex items-center gap-3 text-stone-300">
            <input
              type="checkbox"
              checked={
                gardenIsPublic
              }
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
            disabled={
              isSavingGarden
            }
            className="rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 disabled:opacity-50"
          >
            {isSavingGarden
              ? 'Guardando...'
              : garden
                ? 'Guardar jardín'
                : 'Crear jardín'}
          </button>
        </ValidatedForm>

        {gardenMessage && (
          <p className="mt-4 text-sm text-lime-400">
            {gardenMessage}
          </p>
        )}
      </section>

      {garden && (
        <section className="mt-8 rounded-2xl border border-red-900 bg-red-950/20 p-6 sm:p-7">
          <h2 className="text-xl font-medium text-red-300">
            Zona de peligro
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">
            Elimina permanentemente tu jardín y todo su contenido. Tu perfil y tu cuenta permanecerán activos.
          </p>

          <button
            type="button"
            onClick={() =>
              setShowDeleteGarden(true)
            }
            className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-500"
          >
            Eliminar jardín
          </button>
        </section>
      )}

      <ConfirmDialog
        isOpen={showDeleteGarden}
        title="Eliminar jardín"
        message="Se eliminarán permanentemente el jardín, todas sus notas, relaciones e imágenes. Tu perfil y tu cuenta no se eliminarán."
        confirmText="Eliminar jardín"
        isLoading={isDeletingGarden}
        onConfirm={handleGardenDelete}
        onCancel={() =>
          setShowDeleteGarden(false)
        }
      />
    </div>
  )
}

export default ProfilePage
