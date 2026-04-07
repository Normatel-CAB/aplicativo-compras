import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  Users,
  Receipt,
  Settings,
  Bell,
  Search,
  Menu,
  Package,
  LogOut,
  Send,
  Map,
  Mail,
} from 'lucide-react'

const navItems = [
  {
    section: 'Principal',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/solicitacoes', icon: ShoppingCart, label: 'Solicitações', badge: 5 },
      { to: '/ordens', icon: FileText, label: 'Ordens de Compra', badge: 3 },
    ],
  },
  {
    section: 'Cadastros',
    items: [
      { to: '/fornecedores', icon: Users, label: 'Fornecedores' },
    ],
  },
  {
    section: 'Operações',
    items: [
      { to: '/notas', icon: Receipt, label: 'Notas Fiscais' },
      { to: '/envio-notas', icon: Send, label: 'Envio de Notas' },
      { to: '/mapa-cotacao', icon: Map, label: 'Mapa de Cotação' },
      { to: '/emails-automaticos', icon: Mail, label: 'E-mails Automáticos' },
    ],
  },
  {
    section: 'Sistema',
    items: [
      { to: '/configuracoes', icon: Settings, label: 'Configurações' },
    ],
  },
]

const pageTitles: Record<string, { title: string; breadcrumb: string }> = {
  '/': { title: 'Dashboard', breadcrumb: 'Visão Geral' },
  '/solicitacoes': { title: 'Solicitações de Compra', breadcrumb: 'Compras > Solicitações' },
  '/ordens': { title: 'Ordens de Compra', breadcrumb: 'Compras > Ordens' },
  '/fornecedores': { title: 'Fornecedores', breadcrumb: 'Cadastros > Fornecedores' },
  '/notas': { title: 'Notas Fiscais', breadcrumb: 'Operações > Notas Fiscais' },
  '/envio-notas': { title: 'Envio de Notas', breadcrumb: 'Operações > Envio de Notas' },
  '/mapa-cotacao': { title: 'Mapa de Cotação', breadcrumb: 'Operações > Mapa de Cotação' },
  '/emails-automaticos': { title: 'E-mails Automáticos', breadcrumb: 'Operações > E-mails Automáticos' },
  '/configuracoes': { title: 'Configurações', breadcrumb: 'Sistema > Configurações' },
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = pageTitles[location.pathname] || { title: 'Página', breadcrumb: '' }

  const notifications = [
    { id: 1, msg: 'Solicitação SC-0523 aguardando aprovação', time: 'Há 10 min', link: '/solicitacoes' },
    { id: 2, msg: 'Nota fiscal NF-e 12345 importada', time: 'Há 30 min', link: '/notas' },
    { id: 3, msg: 'Cotação COT-0090 precisa de análise', time: 'Há 1h', link: '/mapa-cotacao' },
    { id: 4, msg: 'Ordem OC-2026-0142 aprovada', time: 'Há 2h', link: '/ordens' },
  ]

  function handleGlobalSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && globalSearch.trim()) {
      const term = globalSearch.toLowerCase()
      if (term.includes('solicit') || term.includes('sc-')) navigate('/solicitacoes')
      else if (term.includes('ordem') || term.includes('oc-')) navigate('/ordens')
      else if (term.includes('fornec') || term.includes('cnpj')) navigate('/fornecedores')
      else if (term.includes('nota') || term.includes('nf')) navigate('/notas')
      else if (term.includes('cotaç') || term.includes('cot-')) navigate('/mapa-cotacao')
      else if (term.includes('email') || term.includes('template')) navigate('/emails-automaticos')
      else if (term.includes('envio')) navigate('/envio-notas')
      else if (term.includes('config')) navigate('/configuracoes')
      else navigate('/solicitacoes')
      setGlobalSearch('')
    }
  }

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
            display: 'block',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <Package size={22} />
            </div>
            <div>
              <h1>CompraFácil</h1>
              <span>Módulo de Compras</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.section} className="sidebar-section">
              <div className="sidebar-section-title">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="icon" size={20} />
                  {item.label}
                  {item.badge && <span className="badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">AD</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Admin</div>
              <div className="sidebar-user-role">Gerente de Compras</div>
            </div>
            <LogOut size={16} style={{ color: 'var(--gray-500)', cursor: 'pointer' }} />
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="main-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <div className="header-title">{currentPage.title}</div>
              <div className="header-breadcrumb">{currentPage.breadcrumb}</div>
            </div>
          </div>
          <div className="header-right">
            <div className="search-bar" style={{ maxWidth: 260 }}>
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button className="header-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={18} />
                <span className="notification-dot" />
              </button>
              {showNotifications && (
                <div style={{
                  position: 'absolute', right: 0, top: '100%', marginTop: 8,
                  width: 340, background: 'white', borderRadius: 12,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
                  zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 700, fontSize: 14 }}>
                    Notificações
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} style={{
                      padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer', fontSize: 13, transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
                    onClick={() => { navigate(n.link); setShowNotifications(false) }}
                    >
                      <div style={{ color: '#111827', marginBottom: 2 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{n.time}</div>
                    </div>
                  ))}
                  <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12, color: '#16a34a' }}
                      onClick={() => setShowNotifications(false)}
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
