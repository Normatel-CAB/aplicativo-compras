import { useState } from 'react'
import { Plus, Search, FileSignature, AlertTriangle, Wallet, RefreshCw, XCircle } from 'lucide-react'

interface Contrato {
  numero: string
  fornecedor: string
  objeto: string
  inicio: string
  fim: string
  valorTotal: string
  valorTotalNum: number
  consumido: number
  status: 'active' | 'expiring' | 'expired'
  renovacao: boolean
}

const contratos: Contrato[] = [
  { numero: 'CT-2025-018', fornecedor: 'Tech Solutions Ltda', objeto: 'Fornecimento de equipamentos de TI', inicio: '01/06/2025', fim: '31/05/2026', valorTotal: 'R$ 320.000,00', valorTotalNum: 320000, consumido: 58, status: 'active', renovacao: true },
  { numero: 'CT-2025-022', fornecedor: 'Metal Parts Ind.', objeto: 'Manutenção e peças CNC', inicio: '01/08/2025', fim: '30/04/2026', valorTotal: 'R$ 180.000,00', valorTotalNum: 180000, consumido: 81, status: 'expiring', renovacao: true },
  { numero: 'CT-2024-095', fornecedor: 'Distribuidora ABC', objeto: 'Embalagens e insumos logísticos', inicio: '01/01/2025', fim: '15/04/2026', valorTotal: 'R$ 95.000,00', valorTotalNum: 95000, consumido: 92, status: 'expiring', renovacao: false },
  { numero: 'CT-2024-071', fornecedor: 'Serviços Elétricos ME', objeto: 'Manutenção elétrica predial', inicio: '01/03/2024', fim: '28/02/2026', valorTotal: 'R$ 60.000,00', valorTotalNum: 60000, consumido: 100, status: 'expired', renovacao: false },
  { numero: 'CT-2025-030', fornecedor: 'Papelaria Central', objeto: 'Materiais de escritório recorrentes', inicio: '01/09/2025', fim: '31/08/2026', valorTotal: 'R$ 42.000,00', valorTotalNum: 42000, consumido: 34, status: 'active', renovacao: true },
]

const statusLabels: Record<string, string> = { active: 'Vigente', expiring: 'Vencendo', expired: 'Vencido' }
const statusPill: Record<string, string> = { active: 'active', expiring: 'pending', expired: 'rejected' }

export default function Contratos() {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = contratos.filter((c) =>
    c.fornecedor.toLowerCase().includes(search.toLowerCase()) || c.numero.toLowerCase().includes(search.toLowerCase())
  )
  const detail = selected ? contratos.find((c) => c.numero === selected) : null
  const valorVigente = contratos.filter(c => c.status !== 'expired').reduce((s, c) => s + c.valorTotalNum, 0)
  const vencendo = contratos.filter(c => c.status === 'expiring').length

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Cadastros</div>
          <h1 className="page-title">Contratos</h1>
          <p className="page-desc">Acompanhe vigência, consumo e renovação dos contratos firmados com fornecedores</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Plus size={16} /> Novo Contrato</button>
        </div>
      </div>

      {vencendo > 0 && (
        <div className="callout" style={{ borderColor: 'var(--amber-100)', background: 'var(--amber-100)' }}>
          <div className="callout-icon" style={{ background: 'var(--amber-600)' }}><AlertTriangle size={18} /></div>
          <div>
            <div className="callout-title" style={{ color: 'var(--amber-600)' }}>{vencendo} contrato(s) vencendo nos próximos 30 dias</div>
            <div className="callout-text" style={{ color: 'var(--amber-600)' }}>Revise as condições comerciais e inicie o processo de renovação ou nova cotação com antecedência.</div>
          </div>
        </div>
      )}

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon green"><FileSignature size={19} /></div></div>
          <div className="kpi-value">{contratos.filter(c => c.status !== 'expired').length}</div>
          <div className="kpi-label">Contratos Vigentes</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon amber"><RefreshCw size={19} /></div></div>
          <div className="kpi-value">{vencendo}</div>
          <div className="kpi-label">Vencendo em 30 Dias</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon blue"><Wallet size={19} /></div></div>
          <div className="kpi-value">R$ {(valorVigente / 1000).toFixed(0)}K</div>
          <div className="kpi-label">Valor Total Vigente</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 380 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar por número ou fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1.4fr 1fr' : '1fr', gap: 20 }}>
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Número</th><th>Fornecedor</th><th>Objeto</th><th>Vigência</th><th>Valor Total</th><th>Consumo</th><th>Status</th></tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.numero} className="clickable" onClick={() => setSelected(c.numero)} style={{ background: selected === c.numero ? 'var(--brand-50)' : undefined }}>
                    <td className="cell-code">{c.numero}</td>
                    <td>{c.fornecedor}</td>
                    <td className="muted">{c.objeto}</td>
                    <td className="muted">{c.inicio} — {c.fim}</td>
                    <td className="cell-strong">{c.valorTotal}</td>
                    <td style={{ minWidth: 90 }}>
                      <div className="meter"><div className={`meter-fill ${c.consumido > 90 ? 'red' : c.consumido > 70 ? 'amber' : ''}`} style={{ width: `${c.consumido}%` }} /></div>
                    </td>
                    <td><span className={`pill pill-${statusPill[c.status]}`}>{statusLabels[c.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="panel fade-in">
            <div className="panel-head">
              <div><span className="panel-title">{detail.numero}</span><div className="panel-sub">{detail.fornecedor}</div></div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelected(null)}><XCircle size={18} /></button>
            </div>
            <div className="panel-body">
              <p style={{ fontSize: 13.5, color: 'var(--gray-700)', marginBottom: 18 }}>{detail.objeto}</p>
              <div className="detail-grid" style={{ marginBottom: 18 }}>
                <div className="detail-item"><label>Início</label><span>{detail.inicio}</span></div>
                <div className="detail-item"><label>Término</label><span>{detail.fim}</span></div>
                <div className="detail-item"><label>Valor Total</label><span style={{ color: 'var(--brand-700)' }}>{detail.valorTotal}</span></div>
                <div className="detail-item"><label>Renovação Automática</label><span>{detail.renovacao ? 'Sim' : 'Não'}</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>Consumo do contrato</span>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{detail.consumido}%</span>
              </div>
              <div className="meter" style={{ marginBottom: 20 }}><div className={`meter-fill ${detail.consumido > 90 ? 'red' : detail.consumido > 70 ? 'amber' : ''}`} style={{ width: `${detail.consumido}%` }} /></div>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}><RefreshCw size={16} /> Iniciar Renovação</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
