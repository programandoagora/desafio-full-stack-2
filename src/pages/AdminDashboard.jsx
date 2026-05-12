import '../styles/admin.scss'

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem('pointflow_user'))

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
        <span className="tag">Área administrativa</span>

        <h1>Bem-vindo, {user?.name}</h1>

        <p>
          Aqui você poderá importar planilhas, visualizar relatórios e acompanhar
          todas as transações cadastradas no sistema.
        </p>

        <div className="hero-cards">
          <div>
            <strong>Upload</strong>
            <span>Importar planilha de transações</span>
          </div>

          <div>
            <strong>Reports</strong>
            <span>Relatórios gerais com filtros</span>
          </div>

          <div>
            <strong>Users</strong>
            <span>Transações vinculadas aos usuários</span>
          </div>
        </div>
      </section>
    </main>
  )
}

export default AdminDashboard