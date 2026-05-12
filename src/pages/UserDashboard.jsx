import { useEffect, useState } from 'react'
import '../styles/user.scss'

const API_URL = 'http://localhost:3001'

function UserDashboard() {
  const user = JSON.parse(localStorage.getItem('pointflow_user'))
  const token = localStorage.getItem('pointflow_token')

  const [wallet, setWallet] = useState({
    totalPoints: 0,
  })

  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState(null)
  const [message, setMessage] = useState('')

  const [filters, setFilters] = useState({
    status: 'all',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    loadWallet()
    loadStatement(1)
  }, [])

  async function apiRequest(url) {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição.')
    }

    return data
  }

  async function loadWallet() {
    try {
      const data = await apiRequest('/user/wallet')
      setWallet(data)
    } catch (error) {
      setMessage(error.message)
    }
  }

  async function loadStatement(page = 1) {
    try {
      const params = new URLSearchParams()

      params.append('page', page)
      params.append('status', filters.status)

      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }

      const data = await apiRequest(`/user/statement?${params.toString()}`)

      setTransactions(data.transactions)
      setPagination(data.pagination)
    } catch (error) {
      setMessage(error.message)
    }
  }

  function handleFilterChange(event) {
    const { name, value } = event.target

    setFilters({
      ...filters,
      [name]: value,
    })
  }

  function handleApplyFilters(event) {
    event.preventDefault()
    loadStatement(1)
  }

  function handleClearFilters() {
    setFilters({
      status: 'all',
      startDate: '',
      endDate: '',
    })

    setTimeout(() => {
      loadStatement(1)
    }, 0)
  }

  function handlePageChange(page) {
    loadStatement(page)
  }

  function handleLogout() {
    localStorage.removeItem('pointflow_token')
    localStorage.removeItem('pointflow_user')
    window.location.href = '/'
  }

  function formatCurrencyBR(value) {
    const numberValue = Number(value || 0)

    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function formatPoints(value) {
    const numberValue = Number(value || 0)

    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  function formatDateBR(value) {
    if (!value) return '-'

    const [year, month, day] = value.split('-')

    return `${day}/${month}/${year}`
  }

  function renderStatus(status) {
    if (status === 'approved') return 'Aprovado'
    if (status === 'rejected') return 'Reprovado'
    return 'Em avaliação'
  }

  return (
    <main className="user-page">
      <header className="user-header">
        <div>
          <span className="brand-icon">PF</span>
          <strong>PointFlow</strong>
        </div>

        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <section className="user-content">
        <div className="user-title">
          <span className="tag">Minha carteira</span>

          <h1>Olá, {user?.name}</h1>

          <p>
            Acompanhe seu saldo de pontos aprovados e consulte seu extrato de
            transações.
          </p>
        </div>

        {message && <p className="user-message">{message}</p>}

        <section className="wallet-card">
          <span>Saldo disponível em pontos</span>
          <strong>{formatPoints(wallet.totalPoints)} pts</strong>
          <p>
            O saldo considera somente transações com status aprovado
          </p>
        </section>

        <section className="statement-card">
          <div className="statement-header">
            <div>
              <h2>Extrato de transações</h2>
              <span>{pagination?.total || 0} transações encontradas</span>
            </div>

            <form className="filters" onSubmit={handleApplyFilters}>
              <label>
                Status
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="all">Todos</option>
                  <option value="approved">Aprovado</option>
                  <option value="pending">Em avaliação</option>
                  <option value="rejected">Reprovado</option>
                </select>
              </label>

              <label>
                Data inicial
                <input
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                />
              </label>

              <label>
                Data final
                <input
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                />
              </label>

              <button type="submit">
                Filtrar
              </button>

              <button type="button" onClick={handleClearFilters}>
                Limpar
              </button>
            </form>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Data</th>
                  <th>Pontos</th>
                  <th>Valor</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.description}</td>
                    <td>{formatDateBR(transaction.transactionDate)}</td>
                    <td>{formatPoints(transaction.pointsValue)}</td>
                    <td>{formatCurrencyBR(transaction.amount)}</td>
                    <td>
                      <span className={`status-badge ${transaction.status}`}>
                        {renderStatus(transaction.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan="5">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                Anterior
              </button>

              <span>
                Página {pagination.page} de {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page === pagination.totalPages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default UserDashboard