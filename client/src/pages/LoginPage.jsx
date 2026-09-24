import ValidatedForm from '../components/ValidatedForm.jsx'
import { useState } from 'react'
import { loginUser } from '../services/auth.js'
import { saveSession } from '../services/session.js'
import { Link, useNavigate } from 'react-router-dom'


function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setIsLoading(true)

    try {
      const response = await loginUser({
        email,
        password,
      })

      saveSession(response.data.session)
      navigate('/dashboard')

    } catch (error) {
      setMessage(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-shell flex min-h-screen items-center justify-center bg-stone-950 px-6 py-12 text-stone-100">
      <section className="paper-panel w-full max-w-md p-6 sm:p-8">
        <p className="eyebrow">
          Digital Garden
        </p>

        <h1 className="mt-3 text-4xl font-semibold">
          Iniciar sesión
        </h1>

        <ValidatedForm onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              Contraseña
            </label>

            <input
              id="password"
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
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </ValidatedForm>

        {message && (
          <p role="alert" className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
            {message}
          </p>
        )}

        <p className="mt-6 text-sm text-stone-400">
          ¿No tienes cuenta?{' '}
          <Link
            to="/register"
            className="text-lime-400 hover:text-lime-300"
          >
            Crear cuenta
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
