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
  LogOut,
  Send,
  ClipboardCheck,
  PackageCheck,
  BookOpen,
  FileSignature,
  FolderKanban,
  Truck,
  Mail,
  BarChart3,
} from 'lucide-react'
import brandMark from '../assets/normatel-mark.png'

const navItems = [
  {
    section: 'Principal',
    items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }],
  },
  {
    section: 'Compras',
    items: [
      { to: '/solicitacoes', icon: ShoppingCart, label: 'Solicitações', badge: 5 },
      { to: '/cotacoes', icon: ClipboardCheck, label: 'Cotações' },
      { to: '/ordens', icon: FileText, label: 'Ordens de Compra', badge: 3 },
      { to: '/recebimento', icon: PackageCheck, label: 'Recebimento' },
      { to: '/aprovacoes', icon: ClipboardCheck, label: 'Aprovações', badge: 7 },
    ],
  },
  {
    section: 'Cadastros',
    items: [
      { to: '/fornecedores', icon: Users, label: 'Fornecedores' },
      { to: '/catalogo', icon: BookOpen, label: 'Catálogo de Materiais' },
      { to: '/contratos', icon: FileSignature, label: 'Contratos' },
      { to: '/projetos', icon: FolderKanban, label: 'Projetos / C. Custo' },
      { to: '/transportadores', icon: Truck, label: 'Transportadores' },
    ],
  },
  {
    section: 'Operações',
    items: [
      { to: '/notas', icon: Receipt, label: 'Notas Fiscais' },
      { to: '/envio-notas', icon: Send, label: 'Envio de Notas' },
      { to: '/emails-automaticos', icon: Mail, label: 'E-mails Automáticos' },
    ],
  },
  {
    section: 'Análise',
    items: [{ to: '/relatorios', icon: BarChart3, label: 'Relatórios' }],
  },
  {
    section: 'Sistema',
    items: [{ to: '/configuracoes', icon: Settings, label: 'Configurações' }],
  },
]

const pageMeta: Record<string, { title: string; crumb: string }> = {
  '/': { title: 'Dashboard', crumb: 'Visão Geral' },
  '/solicitacoes': { title: 'Solicitações de Compra', crumb: 'Compras' },
  '/cotacoes': { title: 'Cotações', crumb: 'Compras' },
  '/ordens': { title: 'Ordens de Compra', crumb: 'Compras' },
  '/recebimento': { title: 'Recebimento de Materiais', crumb: 'Compras' },
  '/aprovacoes': { title: 'Central de Aprovações', crumb: 'Compras' },
  '/fornecedores': { title: 'Fornecedores', crumb: 'Cadastros' },
  '/catalogo': { title: 'Catálogo de Materiais', crumb: 'Cadastros' },
  '/contratos': { title: 'Contratos', crumb: 'Cadastros' },
  '/projetos': { title: 'Projetos / Centros de Custo', crumb: 'Cadastros' },
  '/transportadores': { title: 'Transportadores', crumb: 'Cadastros' },
  '/notas': { title: 'Notas Fiscais', crumb: 'Operações' },
  '/envio-notas': { title: 'Envio de Notas', crumb: 'Operações' },
  '/emails-automaticos': { title: 'E-mails Automáticos', crumb: 'Operações' },
  '/relatorios': { title: 'Relatórios', crumb: 'Análise' },
  '/configuracoes': { title: 'Configurações', crumb: 'Sistema' },
}

const notifications = [
  { id: 1, msg: 'Solicitação SC-0523 aguardando aprovação', time: 'Há 10 min', link: '/aprovacoes' },
  { id: 2, msg: 'Nota fiscal NF-e 12345 importada', time: 'Há 30 min', link: '/notas' },
  { id: 3, msg: 'Cotação COT-0090 recebeu 3 propostas', time: 'Há 1h', link: '/cotacoes' },
  { id: 4, msg: 'Ordem OC-2026-0142 aprovada', time: 'Há 2h', link: '/ordens' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const meta = pageMeta[location.pathname] || { title: 'Página', crumb: '' }

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !search.trim()) return
    const term = search.toLowerCase()
    if (term.includes('solicit') || term.includes('sc-')) navigate('/solicitacoes')
    else if (term.includes('cotaç') || term.includes('cot-')) navigate('/cotacoes')
    else if (term.includes('ordem') || term.includes('oc-')) navigate('/ordens')
    else if (term.includes('receb')) navigate('/recebimento')
    else if (term.includes('aprova')) navigate('/aprovacoes')
    else if (term.includes('fornec') || term.includes('cnpj')) navigate('/fornecedores')
    else if (term.includes('material') || term.includes('item')) navigate('/catalogo')
    else if (term.includes('contrat')) navigate('/contratos')
    else if (term.includes('projeto')) navigate('/projetos')
    else if (term.includes('transport')) navigate('/transportadores')
    else if (term.includes('nota') || term.includes('nf')) navigate('/notas')
    else if (term.includes('email') || term.includes('template')) navigate('/emails-automaticos')
    else if (term.includes('relat')) navigate('/relatorios')
    else if (term.includes('config')) navigate('/configuracoes')
    else navigate('/solicitacoes')
    setSearch('')
  }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={brandMark} alt="Normatel" className="brand-mark" />
          <div>
            <div className="brand-title">ERP Normatel</div>
            <div className="brand-subtitle">Módulo de Compras</div>
          </div>
        </div>

        <nav className="sidebar-scroll">
          {navItems.map((group) => (
            <div key={group.section} className="nav-group">
              <div className="nav-group-title">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="nav-icon" size={17} />
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip" onClick={() => setShowUser(!showUser)} style={{ position: 'relative' }}>
            <div className="user-avatar">AD</div>
            <div className="user-meta">
              <div className="user-name">Administrador</div>
              <div className="user-role">Gerente de Compras</div>
            </div>
            <LogOut size={15} style={{ color: '#7c8a86' }} />
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <div className="crumb">{meta.crumb}</div>
              <div className="crumb-current">{meta.title}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="search" style={{ maxWidth: 240 }}>
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Buscar em todo o sistema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button className="icon-btn" onClick={() => setShowNotif(!showNotif)}>
                <Bell size={17} />
                <span className="dot" />
              </button>
              {showNotif && (
                <div className="popover slide-in">
                  <div className="popover-head">
                    Notificações
                    <span className="pill pill-pending">{notifications.length} novas</span>
                  </div>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="popover-item"
                      onClick={() => { navigate(n.link); setShowNotif(false) }}
                    >
                      <div style={{ color: 'var(--gray-900)', marginBottom: 3 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={() => setShowUser(!showUser)}>AD</div>
              {showUser && (
                <div className="popover slide-in" style={{ width: 200 }}>
                  <div className="popover-item" onClick={() => { navigate('/configuracoes'); setShowUser(false) }}>Meu Perfil</div>
                  <div className="popover-item" onClick={() => { navigate('/configuracoes'); setShowUser(false) }}>Configurações</div>
                  <div className="popover-item" style={{ color: 'var(--red-600)' }}>Sair</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
