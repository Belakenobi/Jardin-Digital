import {
  useEffect,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  getProfile,
} from '../services/profile.js'

import {
  getGarden,
} from '../services/garden.js'

import {
  getNotes,
} from '../services/notes.js'

import {
  getGalleryImages,
} from '../services/gallery.js'

function DashboardPage() {
  const [profile, setProfile] =
    useState(null)

  const [garden, setGarden] =
    useState(null)

  const [notes, setNotes] =
    useState([])

  const [
    galleryImages,
    setGalleryImages,
  ] = useState([])

  const [hasGarden, setHasGarden] =
    useState(true)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  useEffect(() => {
    async function loadDashboard() {
      setError('')

      try {
        const profileResponse =
          await getProfile()

        setProfile(
          profileResponse.profile,
        )

        try {
          const gardenResponse =
            await getGarden()

          setGarden(
            gardenResponse.garden,
          )

          setHasGarden(true)
        } catch (gardenError) {
          if (
            gardenError.status === 404
          ) {
            setHasGarden(false)
            return
          }

          throw gardenError
        }

        const [
          notesResponse,
          galleryResponse,
        ] = await Promise.all([
          getNotes(),
          getGalleryImages(),
        ])

        setNotes(
          notesResponse.notes,
        )

        setGalleryImages(
          galleryResponse.images,
        )
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const seedCount =
    notes.filter(
      (note) =>
        note.maturity === 'seed',
    ).length

  const buddingCount =
    notes.filter(
      (note) =>
        note.maturity === 'budding',
    ).length

  const treeCount =
    notes.filter(
      (note) =>
        note.maturity === 'tree',
    ).length

  const recentNotes =
    notes.slice(0, 3)

  if (isLoading) {
    return (
      <p className="text-stone-400">
        Cargando tu jardín...
      </p>
    )
  }

  if (!hasGarden) {
    return (
      <section className="max-w-4xl">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Hola
          {profile?.displayName
            ? `, ${profile.displayName}`
            : ''}
        </h1>

        <div className="mt-8 rounded-2xl border border-lime-900 bg-stone-900 p-8">
          <p className="text-4xl">
            🌱
          </p>

          <h2 className="mt-4 text-2xl font-semibold">
            Tu jardín está listo para comenzar
          </h2>

          <p className="mt-3 max-w-2xl text-stone-400">
            Crea tu jardín personal antes
            de comenzar a plantar notas,
            relacionar ideas y guardar
            imágenes.
          </p>

          <Link
            to="/profile"
            className="mt-6 inline-block rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950"
          >
            Crear mi jardín
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="max-w-6xl">
      <header>
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Hola
          {profile?.displayName
            ? `, ${profile.displayName}`
            : ''}
        </h1>

        <p className="mt-3 text-stone-400">
          Este es el estado actual de{' '}
          <span className="text-stone-200">
            {garden?.name}
          </span>
          .
        </p>
      </header>

      {error && (
        <p className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </p>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <p className="text-sm text-stone-400">
            Notas
          </p>

          <p className="mt-2 text-4xl font-semibold">
            {notes.length}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            ideas plantadas
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <p className="text-sm text-stone-400">
            🌱 Semillas
          </p>

          <p className="mt-2 text-4xl font-semibold">
            {seedCount}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            ideas comenzando
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <p className="text-sm text-stone-400">
            🌿 Brotes / 🌳 Árboles
          </p>

          <p className="mt-2 text-4xl font-semibold">
            {buddingCount +
              treeCount}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            ideas desarrolladas
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <p className="text-sm text-stone-400">
            Imágenes
          </p>

          <p className="mt-2 text-4xl font-semibold">
            {galleryImages.length}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            recuerdos guardados
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-medium">
          Accesos rápidos
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/notes"
            className="group rounded-2xl border border-stone-800 bg-stone-900 p-6 transition hover:border-lime-500"
          >
            <p className="text-3xl">
              🌱
            </p>

            <h3 className="mt-4 font-medium">
              Plantar una idea
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Crear, editar y desarrollar
              tus notas.
            </p>

            <p className="mt-4 text-sm text-lime-400">
              Ir a notas →
            </p>
          </Link>

          <Link
            to="/relations"
            className="group rounded-2xl border border-stone-800 bg-stone-900 p-6 transition hover:border-lime-500"
          >
            <p className="text-3xl">
              🔗
            </p>

            <h3 className="mt-4 font-medium">
              Conectar ideas
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Crea relaciones y descubre
              backlinks.
            </p>

            <p className="mt-4 text-sm text-lime-400">
              Ir a relaciones →
            </p>
          </Link>

          <Link
            to="/gallery"
            className="group rounded-2xl border border-stone-800 bg-stone-900 p-6 transition hover:border-lime-500"
          >
            <p className="text-3xl">
              🖼️
            </p>

            <h3 className="mt-4 font-medium">
              Añadir imagen
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Guarda imágenes y relaciónalas
              con tus ideas.
            </p>

            <p className="mt-4 text-sm text-lime-400">
              Ir a galería →
            </p>
          </Link>

          <Link
            to="/profile"
            className="group rounded-2xl border border-stone-800 bg-stone-900 p-6 transition hover:border-lime-500"
          >
            <p className="text-3xl">
              ⚙️
            </p>

            <h3 className="mt-4 font-medium">
              Mi jardín
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Edita tu perfil y configuración
              del jardín.
            </p>

            <p className="mt-4 text-sm text-lime-400">
              Configurar →
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-medium">
              Estado de tus ideas
            </h2>

            <Link
              to="/notes"
              className="text-sm text-lime-400"
            >
              Ver todas
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="flex justify-between text-sm">
                <span>
                  🌱 Semillas
                </span>

                <span className="text-stone-400">
                  {seedCount}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>
                  🌿 Brotes
                </span>

                <span className="text-stone-400">
                  {buddingCount}
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <span>
                  🌳 Árboles
                </span>

                <span className="text-stone-400">
                  {treeCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-medium">
              Notas recientes
            </h2>

            <Link
              to="/notes"
              className="text-sm text-lime-400"
            >
              Ver notas
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <div className="mt-6">
              <p className="text-stone-500">
                Todavía no has plantado
                ninguna idea.
              </p>

              <Link
                to="/notes"
                className="mt-4 inline-block text-sm text-lime-400"
              >
                Crear primera nota →
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {recentNotes.map(
                (note) => (
                  <div
                    key={note.id}
                    className="rounded-xl border border-stone-800 bg-stone-950 p-4"
                  >
                    <p className="font-medium">
                      {note.title}
                    </p>

                    <p className="mt-1 text-xs text-stone-500">
                      Actualizada{' '}
                      {new Date(
                        note.updatedAt,
                      ).toLocaleString(
                        'es-MX',
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-stone-500">
              Jardín actual
            </p>

            <h2 className="mt-1 text-xl font-medium">
              {garden?.name}
            </h2>

            {garden?.description && (
              <p className="mt-2 max-w-2xl text-stone-400">
                {garden.description}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-stone-700 px-4 py-2 text-sm">
            {garden?.isPublic
              ? '🌎 Público'
              : '🔒 Privado'}
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
