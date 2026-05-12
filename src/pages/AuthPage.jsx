import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.scss'



function AuthPage() {
  const [mode, setMode] = useState('login')

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    password: '',
  })

  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')

    const endpoint =
      mode === 'register'
        ? 'http://localhost:3001/auth/register'
        : 'http://localhost:3001/auth/login'

    const payload =
      mode === 'register'
        ? formData
        : {
            email: formData.email,
            password: formData.password,
          }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
            setMessage('Login realizado com sucesso.')

            if (data.user.role === 'admin') {
                navigate('/admin')
                return
            }

            navigate('/dashboard')
            return
      }

        if (mode === 'login') {
            localStorage.setItem('pointflow_token', data.token)
            localStorage.setItem('pointflow_user', JSON.stringify(data.user))

            setMessage('Login realizado com sucesso.')

            if (data.user.role === 'admin') {
                navigate('/admin')
                return
            }

            navigate('/dashboard')
            return
        }

      setMessage('Usuário cadastrado com sucesso.')

      setFormData({
        name: '',
        cpf: '',
        email: '',
        password: '',
      })

      setMode('login')
    } catch (error) {
      setMessage('Erro ao conectar com a API.')
    }
  }

  function handleModeChange(selectedMode) {
    setMode(selectedMode)
    setMessage('')

    setFormData({
      name: '',
      cpf: '',
      email: '',
      password: '',
    })
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="brand">
          <span className="brand-icon">PF</span>
          <strong>PointFlow</strong>
        </div>

        <div className="hero-content">
          <span className="tag">Gestão inteligente de pontos</span>

          <h1>
            Controle de transações, pontos e saldos em uma única plataforma.
          </h1>

          <p>
            O PointFlow é um fluxo simples, seguro e eficiente para acompanhar
            transações, extratos e carteiras.
          </p>

          <div className="hero-cards">
            <div>
              <strong>Transactions</strong>
              <span>Acompanhamento de transações</span>
            </div>

            <div>
              <strong>Wallet</strong>
              <span>Saldo de pontos aprovados</span>
            </div>

            <div>
              <strong>Reports</strong>
              <span>Relatórios com filtros</span>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-box">
        <div className="auth-card">
          <div className="tabs">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => handleModeChange('login')}
              type="button"
            >
              Login
            </button>

            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => handleModeChange('register')}
              type="button"
            >
              Cadastro
            </button>
          </div>

          <div className="form-header">
            <h2>{mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}</h2>
            <p>
              {mode === 'login'
                ? 'Entre para visualizar seu extrato e sua carteira.'
                : 'Cadastre-se para começar a acompanhar suas transações.'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
            <>
            <label>
              Nome
              <input
                name="name"
                type="text"
                placeholder="Digite seu nome"
                value={formData.name}
                onChange={handleChange}
              />
            </label>

            <label>
              CPF
              <input
                name="cpf"
                type="text"
                placeholder="Digite seu CPF"
                value={formData.cpf}
                onChange={handleChange}
              />
            </label>
          </>
            )}

            <label>
              E-mail
              <input
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={formData.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Senha
              <input
                name="password"
                type="password"
                placeholder="Digite sua senha"
                value={formData.password}
                onChange={handleChange}
              />
            </label>

            <button className="submit" type="submit">
              {mode === 'login' ? 'Entrar no PointFlow' : 'Criar conta'}
            </button>

            {message && (
              <p className="form-message">
                {message}
              </p>
            )}
          </form>

          <p className="switch-text">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui conta?'}{' '}
            <button
              type="button"
              onClick={() =>
                handleModeChange(mode === 'login' ? 'register' : 'login')
              }
            >
              {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default AuthPage