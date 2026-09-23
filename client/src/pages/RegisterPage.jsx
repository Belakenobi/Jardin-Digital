import ValidatedForm from '../components/ValidatedForm.jsx'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../services/auth.js'
import { saveSession } from '../services/session.js'

function RegisterPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setHasError(false)
    setIsLoading(true)

    try {
      const response = await registerUser({
        displayName,
        email,
        password,
      })

      if (response.data.session) {
        saveSession(response.data.session)
        navigate('/dashboard')
        return
      }

      if (response.data.requiresEmailConfirmation) {
        setMessage(
          'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
        )
      }
    } catch (error) {
      setHasError(true)
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-6">
      <section className="w-full max-w-md">
        <p className="text-sm uppercase tracking-[0.3em] text-lime-400">
          Digital Garden
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Crear cuenta
        </h1>

        <ValidatedForm onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="displayName"
              className="block mb-2 text-sm text-stone-300"
            >
              Nombre (máximo 80 caracteres)
            </label>

            <input
              id="displayName"
              maxLength={80}
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 outline-none focus:border-lime-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm text-stone-300"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 outline-none focus:border-lime-400"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm text-stone-300"
            >
              Contraseña (mínimo 8 caracteres)
            </label>

            <input
              id="password"
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 outline-none focus:border-lime-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-lime-400 px-5 py-3 font-medium text-stone-950 hover:bg-lime-300 disabled:opacity-50"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </ValidatedForm>

        {message && (
          <p
            role={hasError ? 'alert' : 'status'}
            className={`mt-4 rounded-xl border p-4 text-sm ${hasError ? 'border-red-900 bg-red-950/40 text-red-300' : 'border-lime-900 bg-lime-950/40 text-lime-300'}`}
          >
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-stone-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-lime-400 hover:text-lime-300"
          >
            Iniciar sesión
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
