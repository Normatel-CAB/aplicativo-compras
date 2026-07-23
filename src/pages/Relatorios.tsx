import { Download, Clock, TrendingUp, Timer, Target } from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const spendByCategory = [
  { name: 'Produção', valor: 312000 },
  { name: 'TI', valor: 214000 },
  { name: 'Logística', valor: 168000 },
  { name: 'Marketing', valor: 96000 },
  { name: 'RH', valor: 54000 },
  { name: 'Financeiro', valor: 38000 },
]

const cycleTrend = [
  { name: 'Jan', solicitacao: 1.8, aprovacao: 1.2, cotacao: 3.4 },
  { name: 'Fev', solicitacao: 1.6, aprovacao: 1.1, cotacao: 3.1 },
  { name: 'Mar', solicitacao: 1.9, aprovacao: 1.4, cotacao: 3.6 },
  { name: 'Abr', solicitacao: 1.5, aprovacao: 0.9, cotacao: 2.8 },
  { name: 'Mai', solicitacao: 1.4, aprovacao: 1.0, cotacao: 2.9 },
  { name: 'Jun', solicitacao: 1.3, aprovacao: 0.8, cotacao: 2.5 },
]

const topFornecedores = [
  { nome: 'Tech Solutions Ltda', categoria: 'TI', volume: 'R$ 186.400,00', pedidos: 24, otif: '98%', economia: 'R$ 8.200,00' },
  { nome: 'Metal Parts Ind.', categoria: 'Produção', volume: 'R$ 154.900,00', pedidos: 31, otif: '92%', economia: 'R$ 5.100,00' },
  { nome: 'Distribuidora ABC', categoria: 'Logística', volume: 'R$ 98.300,00', pedidos: 19, otif: '96%', economia: 'R$ 3.400,00' },
  { nome: 'Papelaria Central', categoria: 'Escritório', volume: 'R$ 41.200,00', pedidos: 42, otif: '89%', economia: 'R$ 1.150,00' },
  { nome: 'Gráfica Express', categoria: 'Marketing', volume: 'R$ 28.900,00', pedidos: 12, otif: '100%', economia: 'R$ 980,00' },
]

export default function Relatorios() {
  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Análise</div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-desc">Indicadores de desempenho do processo de compras: gasto por categoria, ciclo de aprovação, economia e performance de fornecedores</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary"><Download size={16} /> Exportar Relatório</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon green"><TrendingUp size={19} /></div></div>
          <div className="kpi-value">R$ 186K</div>
          <div className="kpi-label">Economia Acumulada (Ano)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon blue"><Clock size={19} /></div></div>
          <div className="kpi-value">2,3 dias</div>
          <div className="kpi-label">Ciclo Médio de Aprovação</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon amber"><Timer size={19} /></div></div>
          <div className="kpi-value">6,1 dias</div>
          <div className="kpi-label">Lead Time Médio (RFQ → Recebimento)</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon purple"><Target size={19} /></div></div>
          <div className="kpi-value">94,8%</div>
          <div className="kpi-label">Taxa OTIF Consolidada</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Gasto por Categoria (Ano)</span></div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}K`} />
                <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip formatter={(v) => [`R$ ${Number(v).toLocaleString('pt-BR')}`, 'Gasto']} contentStyle={{ borderRadius: 8, border: '1px solid #e4e7ea' }} />
                <Bar dataKey="valor" fill="#4f9f44" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head"><span className="panel-title">Ciclo do Processo (dias)</span></div>
          <div className="panel-body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycleTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f4" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e7ea' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="solicitacao" name="Solicitação" stroke="#3f7fc4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="aprovacao" name="Aprovação" stroke="#dd9a2b" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="cotacao" name="Cotação" stroke="#4f9f44" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Desempenho de Fornecedores</span>
          <span className="panel-sub">Ranking por volume de compra no período</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Fornecedor</th><th>Categoria</th><th>Volume</th><th>Pedidos</th><th>OTIF</th><th>Economia Gerada</th></tr></thead>
            <tbody>
              {topFornecedores.map((f, i) => (
                <tr key={f.nome}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="avatar-sm">{i + 1}</span>
                    <span style={{ fontWeight: 600 }}>{f.nome}</span>
                  </td>
                  <td className="muted">{f.categoria}</td>
                  <td className="cell-strong">{f.volume}</td>
                  <td>{f.pedidos}</td>
                  <td><span className="pill pill-approved">{f.otif}</span></td>
                  <td className="cell-code">{f.economia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
