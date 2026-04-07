import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  FileText,
  Receipt,
  DollarSign,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
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
  { name: 'Aprovadas', value: 42, color: '#22c55e' },
  { name: 'Pendentes', value: 15, color: '#f59e0b' },
  { name: 'Rejeitadas', value: 5, color: '#ef4444' },
  { name: 'Em Análise', value: 8, color: '#3b82f6' },
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

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon green">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-card-change up">
              <TrendingUp size={14} /> +12%
            </div>
          </div>
          <div className="stat-card-value">R$ 82.4K</div>
          <div className="stat-card-label">Total em Compras (Mês)</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon blue">
              <FileText size={24} />
            </div>
            <div className="stat-card-change up">
              <TrendingUp size={14} /> +8%
            </div>
          </div>
          <div className="stat-card-value">142</div>
          <div className="stat-card-label">Ordens de Compra</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon orange">
              <Receipt size={24} />
            </div>
            <div className="stat-card-change down">
              <TrendingDown size={14} /> -3%
            </div>
          </div>
          <div className="stat-card-value">58</div>
          <div className="stat-card-label">Notas Importadas</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-icon purple">
              <DollarSign size={24} />
            </div>
            <div className="stat-card-change up">
              <TrendingUp size={14} /> +5%
            </div>
          </div>
          <div className="stat-card-value">R$ 15.2K</div>
          <div className="stat-card-label">Economia em Cotações</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Compras vs Orçamento</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/solicitacoes')}>
              Ver Detalhes <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCompras" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Area type="monotone" dataKey="orcamento" stroke="#d1d5db" strokeWidth={2} fill="none" strokeDasharray="5 5" name="Orçamento" />
                <Area type="monotone" dataKey="compras" stroke="#22c55e" strokeWidth={2} fill="url(#colorCompras)" name="Compras" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Compras por Setor</span>
          </div>
          <div className="card-body" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <Tooltip
                  formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="valor" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Status das Solicitações</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1 }}>
              {statusData.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: '#374151' }}>{item.name}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Aprovações Pendentes</span>
            <span className="status-badge pending">
              {pendingApprovals.length} pendentes
            </span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Setor</th>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Prioridade</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.id}</td>
                    <td>{item.setor}</td>
                    <td>{item.descricao}</td>
                    <td style={{ fontWeight: 600 }}>{item.valor}</td>
                    <td>
                      <span className={`priority-badge ${item.prioridade}`}>
                        {priorityLabels[item.prioridade]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">Últimas Ordens de Compra</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/ordens')}>
            Ver Todas <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>{order.id}</td>
                  <td>{order.fornecedor}</td>
                  <td style={{ fontWeight: 600 }}>{order.valor}</td>
                  <td>
                    <span className={`status-badge ${order.status}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{order.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
