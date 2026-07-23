import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Receipt,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  ClipboardCheck,
  PackageCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const monthlyData = [
  { name: 'Jan', compras: 45000, orcamento: 60000 },
  { name: 'Fev', compras: 52000, orcamento: 60000 },
  { name: 'Mar', compras: 49000, orcamento: 60000 },
  { name: 'Abr', compras: 63000, orcamento: 65000 },
  { name: 'Mai', compras: 58000, orcamento: 65000 },
  { name: 'Jun', compras: 71000, orcamento: 70000 },
  { name: 'Jul', compras: 55000, orcamento: 70000 },
  { name: 'Ago', compras: 48000, orcamento: 70000 },
  { name: 'Set', compras: 62000, orcamento: 75000 },
  { name: 'Out', compras: 67000, orcamento: 75000 },
  { name: 'Nov', compras: 73000, orcamento: 80000 },
  { name: 'Dez', compras: 82000, orcamento: 80000 },
]

const sectorData = [
  { name: 'TI', valor: 35000 },
  { name: 'Marketing', valor: 22000 },
  { name: 'Produção', valor: 48000 },
  { name: 'RH', valor: 12000 },
  { name: 'Financeiro', valor: 8000 },
  { name: 'Logística', valor: 28000 },
]

const statusData = [
  { name: 'Aprovadas', value: 42, color: '#4f9f44' },
  { name: 'Pendentes', value: 15, color: '#dd9a2b' },
  { name: 'Rejeitadas', value: 5, color: '#d94842' },
  { name: 'Em Análise', value: 8, color: '#3f7fc4' },
]

const recentOrders = [
  { id: 'OC-2026-0142', fornecedor: 'Tech Solutions Ltda', valor: 'R$ 12.450,00', status: 'approved', data: '05/04/2026' },
  { id: 'OC-2026-0141', fornecedor: 'Papelaria Central', valor: 'R$ 3.280,00', status: 'pending', data: '04/04/2026' },
  { id: 'OC-2026-0140', fornecedor: 'Metal Parts Ind.', valor: 'R$ 28.900,00', status: 'processing', data: '03/04/2026' },
  { id: 'OC-2026-0139', fornecedor: 'Distribuidora ABC', valor: 'R$ 7.650,00', status: 'approved', data: '03/04/2026' },
  { id: 'OC-2026-0138', fornecedor: 'Serviços Elétricos ME', valor: 'R$ 15.200,00', status: 'rejected', data: '02/04/2026' },
]

const pendingApprovals = [
  { id: 'SC-0523', setor: 'TI', solicitante: 'Carlos Silva', descricao: '10x Monitor LED 27"', valor: 'R$ 18.500,00', prioridade: 'high' },
  { id: 'SC-0522', setor: 'Marketing', solicitante: 'Ana Souza', descricao: 'Material gráfico campanha', valor: 'R$ 4.200,00', prioridade: 'medium' },
  { id: 'SC-0521', setor: 'Produção', solicitante: 'João Mendes', descricao: 'Peças de reposição', valor: 'R$ 32.000,00', prioridade: 'high' },
  { id: 'SC-0520', setor: 'RH', solicitante: 'Maria Lima', descricao: 'Materiais de escritório', valor: 'R$ 1.850,00', prioridade: 'low' },
]

const statusLabels: Record<string, string> = {
  approved: 'Aprovada',
  pending: 'Pendente',
  processing: 'Em Processamento',
  rejected: 'Rejeitada',
}

const flowStages = [
  { label: 'Solicitações', value: 68, icon: ShoppingCart, to: '/solicitacoes' },
  { label: 'Cotações', value: 24, icon: ClipboardCheck, to: '/cotacoes' },
  { label: 'Ordens de Compra', value: 142, icon: FileText, to: '/ordens' },
  { label: 'Recebimento', value: 31, icon: PackageCheck, to: '/recebimento' },
  { label: 'Notas Fiscais', value: 58, icon: Receipt, to: '/notas' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon green"><ShoppingCart size={19} /></div>
            <div className="kpi-trend up"><TrendingUp size={13} /> +12%</div>
          </div>
          <div className="kpi-value">R$ 82,4K</div>
          <div className="kpi-label">Total em Compras (Mês)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon blue"><FileText size={19} /></div>
            <div className="kpi-trend up"><TrendingUp size={13} /> +8%</div>
          </div>
          <div className="kpi-value">142</div>
          <div className="kpi-label">Ordens de Compra Abertas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon amber"><Receipt size={19} /></div>
            <div className="kpi-trend down"><TrendingDown size={13} /> -3%</div>
          </div>
          <div className="kpi-value">58</div>
          <div className="kpi-label">Notas Importadas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-icon green"><DollarSign size={19} /></div>
            <div className="kpi-trend up"><TrendingUp size={13} /> +5%</div>
          </div>
          <div className="kpi-value">R$ 15,2K</div>
          <div className="kpi-label">Economia em Cotações</div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Fluxo de Compras (Procure-to-Pay)</div>
            <div className="panel-sub">Volume ativo em cada etapa do processo</div>
          </div>
        </div>
        <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {flowStages.map((stage, i) => (
            <div key={stage.label} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 140 }}>
              <div
                onClick={() => navigate(stage.to)}
                style={{ flex: 1, cursor: 'pointer', textAlign: 'center', padding: '14px 8px', borderRadius: 10, border: '1px solid var(--gray-200)', transition: 'var(--ease)' }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--brand-300)')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--gray-200)')}
              >
                <stage.icon size={18} style={{ color: 'var(--brand-600)', marginBottom: 8 }} />
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', fontFamily: 'Manrope, sans-serif' }}>{stage.value}</div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-500)', fontWeight: 600, marginTop: 2 }}>{stage.label}</div>
              </div>
              {i < flowStages.length - 1 && <ArrowRight size={16} style={{ color: 'var(--gray-300)', flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Compras vs Orçamento</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/relatorios')}>
              Ver Detalhes <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f9f44" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4f9f44" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} contentStyle={{ borderRadius: 8, border: '1px solid #e4e7ea' }} />
                <Area type="monotone" dataKey="orcamento" stroke="#d1d6db" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Orçamento" />
                <Area type="monotone" dataKey="compras" stroke="#4f9f44" strokeWidth={2} fill="url(#colorCompras)" name="Compras" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">Compras por Setor</span></div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']} contentStyle={{ borderRadius: 8, border: '1px solid #e4e7ea' }} />
                <Bar dataKey="valor" fill="#4f9f44" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Status das Solicitações</span></div>
          <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <div style={{ width: 160, height: 160, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={46} outerRadius={72} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {statusData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--gray-700)' }}>{item.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 15 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Aprovações Pendentes</span>
            <span className="pill pill-pending">{pendingApprovals.length} pendentes</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Setor</th><th>Descrição</th><th>Valor</th><th>Prioridade</th></tr></thead>
              <tbody>
                {pendingApprovals.map((item) => (
                  <tr key={item.id} className="clickable" onClick={() => navigate('/aprovacoes')}>
                    <td className="cell-strong">{item.id}</td>
                    <td>{item.setor}</td>
                    <td>{item.descricao}</td>
                    <td className="cell-strong">{item.valor}</td>
                    <td><span className={`tag tag-${item.prioridade}`}>{item.prioridade === 'high' ? 'Alta' : item.prioridade === 'medium' ? 'Média' : 'Baixa'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Últimas Ordens de Compra</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ordens')}>Ver Todas <ArrowUpRight size={14} /></button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Código</th><th>Fornecedor</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="clickable" onClick={() => navigate('/ordens')}>
                  <td className="cell-code">{order.id}</td>
                  <td>{order.fornecedor}</td>
                  <td className="cell-strong">{order.valor}</td>
                  <td><span className={`pill pill-${order.status}`}>{statusLabels[order.status]}</span></td>
                  <td className="muted">{order.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
