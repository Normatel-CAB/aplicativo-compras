import { useState } from 'react'
import {
  Search,
  PackageCheck,
  PackageX,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'

interface Recebimento {
  oc: string
  fornecedor: string
  itens: number
  qtdPrevista: number
  qtdRecebida: number
  status: 'pending' | 'partial' | 'received' | 'divergent'
  dataPrevista: string
  transportadora: string
  nf: string
}

const recebimentos: Recebimento[] = [
  { oc: 'OC-2026-0142', fornecedor: 'Tech Solutions Ltda', itens: 10, qtdPrevista: 10, qtdRecebida: 0, status: 'pending', dataPrevista: '08/04/2026', transportadora: 'Rápido Log', nf: '—' },
  { oc: 'OC-2026-0140', fornecedor: 'Metal Parts Ind.', itens: 25, qtdPrevista: 25, qtdRecebida: 18, status: 'partial', dataPrevista: '06/04/2026', transportadora: 'TransCarga', nf: 'NF-e 88231' },
  { oc: 'OC-2026-0139', fornecedor: 'Distribuidora ABC', itens: 500, qtdPrevista: 500, qtdRecebida: 500, status: 'received', dataPrevista: '04/04/2026', transportadora: 'Rápido Log', nf: 'NF-e 88190' },
  { oc: 'OC-2026-0135', fornecedor: 'Papelaria Central', itens: 42, qtdPrevista: 42, qtdRecebida: 39, status: 'divergent', dataPrevista: '03/04/2026', transportadora: 'Correios', nf: 'NF-e 88102' },
  { oc: 'OC-2026-0130', fornecedor: 'Serviços Elétricos ME', itens: 8, qtdPrevista: 8, qtdRecebida: 8, status: 'received', dataPrevista: '30/03/2026', transportadora: 'Frota Própria', nf: 'NF-e 87950' },
  { oc: 'OC-2026-0128', fornecedor: 'InfoShop Dist.', itens: 5, qtdPrevista: 5, qtdRecebida: 0, status: 'pending', dataPrevista: '09/04/2026', transportadora: 'TransCarga', nf: '—' },
]

const statusLabels: Record<string, string> = { pending: 'Aguardando', partial: 'Parcial', received: 'Recebido', divergent: 'Divergência' }
const statusPill: Record<string, string> = { pending: 'pending', partial: 'partial', received: 'received', divergent: 'rejected' }

export default function Recebimento() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = recebimentos.filter((r) =>
    (filter === 'all' || r.status === filter) &&
    (r.oc.toLowerCase().includes(search.toLowerCase()) || r.fornecedor.toLowerCase().includes(search.toLowerCase()))
  )
  const detail = selected ? recebimentos.find((r) => r.oc === selected) : null

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Compras</div>
          <h1 className="page-title">Recebimento de Materiais</h1>
          <p className="page-desc">Confira fisicamente os materiais entregues contra as ordens de compra e registre divergências antes do lançamento da nota fiscal</p>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon amber"><Truck size={19} /></div></div>
          <div className="kpi-value">{recebimentos.filter(r => r.status === 'pending').length}</div>
          <div className="kpi-label">Aguardando Recebimento</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon green"><PackageCheck size={19} /></div></div>
          <div className="kpi-value">{recebimentos.filter(r => r.status === 'received').length}</div>
          <div className="kpi-label">Recebidos Integralmente</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon red"><PackageX size={19} /></div></div>
          <div className="kpi-value">{recebimentos.filter(r => r.status === 'divergent').length}</div>
          <div className="kpi-label">Com Divergência</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon blue"><CheckCircle2 size={19} /></div></div>
          <div className="kpi-value">96,4%</div>
          <div className="kpi-label">Taxa OTIF (no prazo e completo)</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 380 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar por OC ou fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['all', 'pending', 'partial', 'received', 'divergent'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f === 'all' ? 'Todos' : statusLabels[f]}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1.4fr 1fr' : '1fr', gap: 20 }}>
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ordem de Compra</th><th>Fornecedor</th><th>Qtd Prevista</th><th>Qtd Recebida</th><th>Transportadora</th><th>Previsão</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.oc} className="clickable" onClick={() => setSelected(r.oc)} style={{ background: selected === r.oc ? 'var(--brand-50)' : undefined }}>
                    <td className="cell-code">{r.oc}</td>
                    <td>{r.fornecedor}</td>
                    <td>{r.qtdPrevista}</td>
                    <td className="cell-strong">{r.qtdRecebida}</td>
                    <td className="muted">{r.transportadora}</td>
                    <td className="muted">{r.dataPrevista}</td>
                    <td><span className={`pill pill-${statusPill[r.status]}`}>{statusLabels[r.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="panel fade-in">
            <div className="panel-head">
              <div><span className="panel-title">{detail.oc}</span><div className="panel-sub">{detail.fornecedor}</div></div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><XCircle size={18} /></button>
            </div>
            <div className="panel-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>Conferência de quantidade</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700 }}>{detail.qtdRecebida}/{detail.qtdPrevista}</span>
                </div>
                <div className="meter"><div className={`meter-fill ${detail.status === 'divergent' ? 'red' : detail.status === 'partial' ? 'amber' : ''}`} style={{ width: `${(detail.qtdRecebida / detail.qtdPrevista) * 100}%` }} /></div>
              </div>
              <div className="detail-grid" style={{ marginBottom: 16 }}>
                <div className="detail-item"><label>Nota Fiscal</label><span>{detail.nf}</span></div>
                <div className="detail-item"><label>Transportadora</label><span>{detail.transportadora}</span></div>
                <div className="detail-item"><label>Previsão</label><span>{detail.dataPrevista}</span></div>
                <div className="detail-item"><label>Itens</label><span>{detail.itens}</span></div>
              </div>
              {detail.status === 'divergent' && (
                <div className="callout" style={{ borderColor: 'var(--red-100)', background: 'var(--red-100)', marginBottom: 16 }}>
                  <div className="callout-icon" style={{ background: 'var(--red-600)' }}><AlertTriangle size={16} /></div>
                  <div>
                    <div className="callout-title" style={{ color: 'var(--red-600)' }}>Divergência identificada</div>
                    <div className="callout-text" style={{ color: 'var(--red-600)' }}>Recebidos {detail.qtdRecebida} de {detail.qtdPrevista} itens. Abra uma ocorrência com o fornecedor antes de liberar a nota fiscal.</div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                {detail.status !== 'received' ? (
                  <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}><PackageCheck size={16} /> Registrar Recebimento</button>
                ) : (
                  <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} disabled>Recebimento Concluído</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
