import { useState } from 'react'
import './App.scss'

function App() {
  const [mode, setMode] = useState('login')

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
            O PointFlow é um fluxo simples, seguro e eficiente para acompanhar transações, extratos e carteiras.
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
              onClick={() => setMode('login')}
              type="button"
            >
              Login
            </button>

            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
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

          <form>
            {mode === 'register' && (
              <label>
                Nome
                <input type="text" placeholder="Digite seu nome" />
              </label>
            )}

            <label>
              E-mail
              <input type="email" placeholder="Digite seu e-mail" />
            </label>

            <label>
              Senha
              <input type="password" placeholder="Digite sua senha" />
            </label>

            <button className="submit" type="submit">
              {mode === 'login' ? 'Entrar no PointFlow' : 'Criar conta'}
            </button>
          </form>

          <p className="switch-text">
            {mode === 'login' ? 'Ainda não tem conta?' : 'Já possui conta?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

export default App