import { useState } from 'react'
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

interface Pendencia {
  id: string
  tipo: 'Solicitação' | 'Cotação' | 'Ordem de Compra'
  descricao: string
  origem: string
  solicitante: string
  setor: string
  valor: string
  valorNum: number
  alcada: string
  aguardando: string
  prioridade: 'high' | 'medium' | 'low'
}

const pendencias: Pendencia[] = [
  { id: 'SC-0523', tipo: 'Solicitação', descricao: '10x Monitor LED 27" Full HD', origem: 'Solicitação', solicitante: 'Carlos Silva', setor: 'TI', valor: 'R$ 18.500,00', valorNum: 18500, alcada: 'Gerente de Área', aguardando: '2h', prioridade: 'high' },
  { id: 'COT-0090', tipo: 'Cotação', descricao: '10x Monitor LED 27" — vencedor definido', origem: 'Cotação', solicitante: 'Carlos Silva', setor: 'TI', valor: 'R$ 16.200,00', valorNum: 16200, alcada: 'Gerente de Área', aguardando: '5h', prioridade: 'high' },
  { id: 'SC-0522', tipo: 'Solicitação', descricao: 'Material gráfico campanha institucional', origem: 'Solicitação', solicitante: 'Ana Souza', setor: 'Marketing', valor: 'R$ 4.200,00', valorNum: 4200, alcada: 'Supervisor', aguardando: '8h', prioridade: 'medium' },
  { id: 'OC-2026-0141', tipo: 'Ordem de Compra', descricao: 'Papelaria e materiais de escritório', origem: 'Ordem de Compra', solicitante: 'Maria Lima', setor: 'RH', valor: 'R$ 3.280,00', valorNum: 3280, alcada: 'Supervisor', aguardando: '1 dia', prioridade: 'low' },
  { id: 'SC-0521', tipo: 'Solicitação', descricao: 'Peças de reposição máquina CNC', origem: 'Solicitação', solicitante: 'João Mendes', setor: 'Produção', valor: 'R$ 32.000,00', valorNum: 32000, alcada: 'Diretoria', aguardando: '3h', prioridade: 'high' },
  { id: 'OC-2026-0139', tipo: 'Ordem de Compra', descricao: 'Embalagens tipo A e B — Distribuidora ABC', origem: 'Ordem de Compra', solicitante: 'Fernanda Costa', setor: 'Logística', valor: 'R$ 7.650,00', valorNum: 7650, alcada: 'Gerente de Área', aguardando: '6h', prioridade: 'medium' },
  { id: 'COT-0089', tipo: 'Cotação', descricao: 'Material gráfico — vencedor definido', origem: 'Cotação', solicitante: 'Ana Souza', setor: 'Marketing', valor: 'R$ 3.800,00', valorNum: 3800, alcada: 'Supervisor', aguardando: '1 dia', prioridade: 'low' },
]

const tabs: { value: string; label: string }[] = [
  { value: 'Todas', label: 'Todas' },
  { value: 'Solicitação', label: 'Solicitações' },
  { value: 'Cotação', label: 'Cotações' },
  { value: 'Ordem de Compra', label: 'Ordens de Compra' },
]

export default function Aprovacoes() {
  const [tab, setTab] = useState('Todas')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [items, setItems] = useState(pendencias)

  const filtered = items.filter((p) =>
    (tab === 'Todas' || p.tipo === tab) &&
    (p.descricao.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  )

  const valorTotal = items.reduce((s, p) => s + p.valorNum, 0)
  const detail = selected ? items.find((p) => p.id === selected) : null

  function resolve(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id))
    setSelected(null)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Compras</div>
          <h1 className="page-title">Central de Aprovações</h1>
          <p className="page-desc">Fila unificada de solicitações, cotações e ordens de compra aguardando aprovação conforme as alçadas configuradas</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon amber"><Clock size={19} /></div></div>
          <div className="kpi-value">{items.length}</div>
          <div className="kpi-label">Pendentes de Aprovação</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon green"><Wallet size={19} /></div></div>
          <div className="kpi-value">R$ {(valorTotal / 1000).toFixed(1)}K</div>
          <div className="kpi-label">Valor Total em Espera</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon blue"><ShieldCheck size={19} /></div></div>
          <div className="kpi-value">23</div>
          <div className="kpi-label">Aprovadas Hoje</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon red"><AlertTriangle size={19} /></div></div>
          <div className="kpi-value">2</div>
          <div className="kpi-label">Acima do Prazo (SLA 24h)</div>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button key={t.value} className={`tab ${tab === t.value ? 'active' : ''}`} onClick={() => setTab(t.value)}>{t.label}</button>
        ))}
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 380 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar pendências..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1.4fr 1fr' : '1fr', gap: 20 }}>
        <div className="panel">
          {filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><ShieldCheck size={24} /></div>
              <h3>Fila zerada</h3>
              <p>Não há pendências de aprovação para este filtro no momento.</p>
            </div>
          ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Tipo</th><th>Código</th><th>Descrição</th><th>Setor</th><th>Valor</th><th>Alçada</th><th>Aguardando</th><th>Prioridade</th></tr></thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="clickable" onClick={() => setSelected(p.id)} style={{ background: selected === p.id ? 'var(--brand-50)' : undefined }}>
                    <td><span className="pill pill-processing">{p.tipo}</span></td>
                    <td className="cell-code">{p.id}</td>
                    <td>{p.descricao}</td>
                    <td>{p.setor}</td>
                    <td className="cell-strong">{p.valor}</td>
                    <td className="muted">{p.alcada}</td>
                    <td className="muted">{p.aguardando}</td>
                    <td><span className={`tag tag-${p.prioridade}`}>{p.prioridade === 'high' ? 'Alta' : p.prioridade === 'medium' ? 'Média' : 'Baixa'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {detail && (
          <div className="panel fade-in">
            <div className="panel-head">
              <div>
                <span className="panel-title">{detail.id}</span>
                <div className="panel-sub">{detail.tipo}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><XCircle size={18} /></button>
            </div>
            <div className="panel-body">
              <div className="detail-grid" style={{ marginBottom: 18 }}>
                <div className="detail-item"><label>Solicitante</label><span>{detail.solicitante}</span></div>
                <div className="detail-item"><label>Setor</label><span>{detail.setor}</span></div>
                <div className="detail-item"><label>Valor</label><span style={{ color: 'var(--brand-700)' }}>{detail.valor}</span></div>
                <div className="detail-item"><label>Alçada Necessária</label><span>{detail.alcada}</span></div>
                <div className="detail-item"><label>Aguardando</label><span>{detail.aguardando}</span></div>
                <div className="detail-item"><label>Prioridade</label><span className={`tag tag-${detail.prioridade}`} style={{ fontSize: 10.5 }}>{detail.prioridade === 'high' ? 'Alta' : detail.prioridade === 'medium' ? 'Média' : 'Baixa'}</span></div>
              </div>
              <hr className="divider" />
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Descrição</div>
              <p style={{ fontSize: 13.5, color: 'var(--gray-700)', marginBottom: 20 }}>{detail.descricao}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => resolve(detail.id)}><XCircle size={16} /> Rejeitar</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => resolve(detail.id)}><CheckCircle2 size={16} /> Aprovar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
