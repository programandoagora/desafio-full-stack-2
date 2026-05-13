import { useEffect, useRef, useState } from 'react'
import '../styles/admin.scss'

const API_URL = 'http://localhost:3001'

function AdminDashboard() {
  const loggedUser = JSON.parse(localStorage.getItem('pointflow_user'))
  const token = localStorage.getItem('pointflow_token')
  const fileInputRef = useRef(null)

  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [showAllTransactions, setShowAllTransactions] = useState(false)
  const [message, setMessage] = useState('')

  const [selectedUser, setSelectedUser] = useState(null)
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)

  const [newPassword, setNewPassword] = useState('')

  const [transactionForm, setTransactionForm] = useState({
    description: '',
    transactionDate: '',
    pointsValue: '',
    amount: '',
    status: 'pending',
  })

  const [usersPage, setUsersPage] = useState(1)
  const [transactionsPage, setTransactionsPage] = useState(1)

  const [usersPagination, setUsersPagination] = useState(null)
  const [transactionsPagination, setTransactionsPagination] = useState(null)

  const [transactionFilters, setTransactionFilters] = useState({
    cpf: '',
    product: '',
    status: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  })

  useEffect(() => {
    loadUsers(1)
  }, [])

  useEffect(() => {
    setTransactionsPage(1)
    loadTransactions(1)
  }, [showAllTransactions])

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição.')
    }

    return data
  }

  async function loadUsers(page = usersPage) {
    try {
      const data = await apiRequest(`/admin/users?page=${page}`)

      setUsers(data.users)
      setUsersPagination(data.pagination)
    } catch (error) {
      setMessage(error.message)
    }
  }

async function loadTransactions(page = transactionsPage, customFilters = transactionFilters) {
  try {
    const params = new URLSearchParams()

    params.append('page', page)
    params.append('showAll', showAllTransactions)

    if (customFilters.cpf) {
      params.append('cpf', customFilters.cpf)
    }

    if (customFilters.product) {
      params.append('product', customFilters.product)
    }

    if (customFilters.status !== 'all') {
      params.append('status', customFilters.status)
    }

    if (customFilters.startDate) {
      params.append('startDate', customFilters.startDate)
    }

    if (customFilters.endDate) {
      params.append('endDate', customFilters.endDate)
    }

    if (customFilters.minAmount) {
      params.append('minAmount', customFilters.minAmount)
    }

    if (customFilters.maxAmount) {
      params.append('maxAmount', customFilters.maxAmount)
    }

    const data = await apiRequest(`/admin/transactions?${params.toString()}`)

    setTransactions(data.transactions)
    setTransactionsPagination(data.pagination)
  } catch (error) {
    setMessage(error.message)
  }
}

function handleTransactionFilterChange(event) {
  const { name, value } = event.target

  setTransactionFilters({
    ...transactionFilters,
    [name]: value,
  })
}

function handleApplyTransactionFilters(event) {
  event.preventDefault()
  setTransactionsPage(1)
  loadTransactions(1)
}

function handleClearTransactionFilters() {
  const clearedFilters = {
    cpf: '',
    product: '',
    status: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  }

  setTransactionFilters(clearedFilters)
  setTransactionsPage(1)
  loadTransactions(1, clearedFilters)
}

  async function handleImportExcel(event) {
    const file = event.target.files[0]

    if (!file) {
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/admin/transactions/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Erro ao importar Excel.')
        return
      }

      setMessage(
        `Importação concluída. Linhas importadas: ${data.importedRows}. Falhas: ${data.failedRows}.`,
      )

      await loadTransactions()
    } catch (error) {
      setMessage('Erro ao importar Excel.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleToggleRole(user) {
    const newRole = user.role === 'admin' ? 'user' : 'admin'

    try {
      await apiRequest(`/admin/users/${user.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      })

      await loadUsers()

      if (loggedUser.id === user.id) {
        localStorage.setItem(
          'pointflow_user',
          JSON.stringify({
            ...loggedUser,
            role: newRole,
          }),
        )
      }

      setMessage('Permissão atualizada com sucesso.')
    } catch (error) {
      setMessage(error.message)
      setIsAlertModalOpen(true)
    }
  }

  function openTransactionModal(user) {
    setSelectedUser(user)
    setMessage('')
    setTransactionForm({
      description: '',
      transactionDate: '',
      pointsValue: '',
      amount: '',
      status: 'pending',
    })
    setIsTransactionModalOpen(true)
  }

  function formatCurrencyBR(value) {
    const numberValue = Number(value || 0)

    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
  }

  function openPasswordModal(user) {
    setSelectedUser(user)
    setNewPassword('')
    setMessage('')
    setIsPasswordModalOpen(true)
  }

  function handleTransactionChange(event) {
    const { name, value } = event.target

    setTransactionForm({
      ...transactionForm,
      [name]: value,
    })
  }

  async function handleCreateTransaction(event) {
    event.preventDefault()

    try {
      await apiRequest(`/admin/users/${selectedUser.id}/transactions`, {
        method: 'POST',
        body: JSON.stringify(transactionForm),
      })

      setIsTransactionModalOpen(false)
      setSelectedUser(null)
      setMessage('Transação cadastrada com sucesso.')

      await loadTransactions()
      setActiveTab('transactions')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function handleUsersPageChange(page) {
    setUsersPage(page)
    loadUsers(page)
  }

  function handleTransactionsPageChange(page) {
    setTransactionsPage(page)
    loadTransactions(page)
  }

  async function handleUpdatePassword(event) {
    event.preventDefault()

    try {
      await apiRequest(`/admin/users/${selectedUser.id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({
          password: newPassword,
        }),
      })

      setIsPasswordModalOpen(false)
      setSelectedUser(null)
      setNewPassword('')
      setMessage('Senha alterada com sucesso.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  function handleLogout() {
    localStorage.removeItem('pointflow_token')
    localStorage.removeItem('pointflow_user')
    window.location.href = '/'
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <span className="brand-icon">PF</span>
          <strong>PointFlow Admin</strong>
        </div>

        <button type="button" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <section className="admin-content">
        <div className="admin-title">
          <div>
            <span className="tag">Área administrativa</span>
            <h1>Bem-vindo, {loggedUser?.name}</h1>
            <p>
              Gerencie usuários, permissões e transações cadastradas no sistema.
            </p>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Usuários cadastrados
          </button>

          <button
            type="button"
            className={activeTab === 'transactions' ? 'active' : ''}
            onClick={() => setActiveTab('transactions')}
          >
            Transações
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {activeTab === 'users' && (
          <div className="admin-card">
            <div className="table-header">
              <h2>Usuários cadastrados</h2>
              <span>{users.length} usuários</span>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF</th>
                    <th>E-mail</th>
                    <th>Tipo</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.cpf}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === 'admin' ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <div className="actions compact">
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => handleToggleRole(user)}
                          >
                            {user.role === 'admin' ? 'User' : 'Admin'}
                          </button>

                          <button
                            type="button"
                            className="table-action primary"
                            onClick={() => openTransactionModal(user)}
                          >
                            Transação
                          </button>

                          <button
                            type="button"
                            className="table-action"
                            onClick={() => openPasswordModal(user)}
                          >
                            Senha
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5">Nenhum usuário cadastrado.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {usersPagination && usersPagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={usersPagination.page === 1}
                  onClick={() => handleUsersPageChange(usersPagination.page - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página {usersPagination.page} de {usersPagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={usersPagination.page === usersPagination.totalPages}
                  onClick={() => handleUsersPageChange(usersPagination.page + 1)}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="admin-card">
            <div className="table-header">
              <div>
                <h2>Transações</h2>
                {transactionsPagination?.total || 0} transações
              </div>              

              <div className="transaction-tools">
                <label className="check-option">
                  <input
                    type="checkbox"
                    checked={showAllTransactions}
                    onChange={(event) => {
                      setTransactionsPage(1)
                      setShowAllTransactions(event.target.checked)
                    }}
                  />
                  Ver todas as transações
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  hidden
                />

                <button
                  type="button"
                  className="import-button"
                  onClick={() => fileInputRef.current.click()}
                >
                  Importar Excel
                </button>
              </div>
            </div>

                        <form className="admin-filters" onSubmit={handleApplyTransactionFilters}>
              <label>
                CPF
                <input
                  name="cpf"
                  type="text"
                  placeholder="Buscar CPF"
                  value={transactionFilters.cpf}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <label>
                Produto
                <input
                  name="product"
                  type="text"
                  placeholder="Produto X, Y, Z..."
                  value={transactionFilters.product}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={transactionFilters.status}
                  onChange={handleTransactionFilterChange}
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
                  value={transactionFilters.startDate}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <label>
                Data final
                <input
                  name="endDate"
                  type="date"
                  value={transactionFilters.endDate}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <label>
                Valor mínimo
                <input
                  name="minAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={transactionFilters.minAmount}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <label>
                Valor máximo
                <input
                  name="maxAmount"
                  type="number"
                  step="0.01"
                  placeholder="10000.00"
                  value={transactionFilters.maxAmount}
                  onChange={handleTransactionFilterChange}
                />
              </label>

              <button type="submit" className="filter-primary">
                Filtrar
              </button>

              <button type="button" onClick={handleClearTransactionFilters}>
                Limpar
              </button>
            </form>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>CPF</th>
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
                      <td>{transaction.user?.name || 'Não cadastrado'}</td>
                      <td>{transaction.cpf}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.transactionDate}</td>
                      <td>{transaction.pointsValue}</td>
                      <td>{formatCurrencyBR(transaction.amount)}</td>
                      <td>
                        <span className={`status-badge ${transaction.status}`}>
                          {transaction.status === 'approved'
                            ? 'Aprovado'
                            : transaction.status === 'rejected'
                              ? 'Reprovado'
                              : 'Em avaliação'}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="7">Nenhuma transação cadastrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {transactionsPagination && transactionsPagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={transactionsPagination.page === 1}
                  onClick={() =>
                    handleTransactionsPageChange(transactionsPagination.page - 1)
                  }
                >
                  Anterior
                </button>

                <span>
                  Página {transactionsPagination.page} de{' '}
                  {transactionsPagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    transactionsPagination.page === transactionsPagination.totalPages
                  }
                  onClick={() =>
                    handleTransactionsPageChange(transactionsPagination.page + 1)
                  }
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {isTransactionModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal">
            <h2>Cadastrar transação</h2>
            <p>
              Usuário: <strong>{selectedUser?.name}</strong>
            </p>

            <form onSubmit={handleCreateTransaction}>
              <label>
                Descrição da transação
                <input
                  name="description"
                  value={transactionForm.description}
                  onChange={handleTransactionChange}
                  placeholder="Venda do produto X"
                />
              </label>

              <label>
                Data da transação
                <input
                  name="transactionDate"
                  type="date"
                  value={transactionForm.transactionDate}
                  onChange={handleTransactionChange}
                />
              </label>

              <label>
                Valor em pontos
                <input
                  name="pointsValue"
                  type="number"
                  step="0.01"
                  value={transactionForm.pointsValue}
                  onChange={handleTransactionChange}
                  placeholder="10000"
                />
              </label>

              <label>
                Valor
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  value={transactionForm.amount}
                  onChange={handleTransactionChange}
                  placeholder="10000.00"
                />
              </label>

              <label>
                Status
                <select
                  name="status"
                  value={transactionForm.status}
                  onChange={handleTransactionChange}
                >
                  <option value="pending">Em avaliação</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Reprovado</option>
                </select>
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary">
                  Salvar transação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal small">
            <h2>Alterar senha</h2>

            <p>
              Usuário: <strong>{selectedUser?.name}</strong>
            </p>

            <form onSubmit={handleUpdatePassword}>
              <label>
                Nova senha
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="Digite a nova senha"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancelar
                </button>

                <button type="submit" className="primary">
                  Salvar senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAlertModalOpen && (
        <div className="modal-overlay">
          <div className="admin-modal small">
            <h2>Ação não permitida</h2>
            <p>{message}</p>

            <div className="modal-actions">
              <button
                type="button"
                className="primary"
                onClick={() => setIsAlertModalOpen(false)}
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminDashboard