import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Download,
  Eye,
  Send,
  Printer,
  FileText,
  XCircle,
  CheckCircle2,
  Truck,
  Loader2,
} from 'lucide-react'
import { add, update, subscribe, COLLECTIONS } from '../services/firestoreService'

const ordensIniciais: { _id?: string; id: string; fornecedor: string; cnpj: string; itens: number; valor: string; formaPag: string; prazoEntrega: string; status: string; cotacao: string; data: string }[] = []

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  processing: 'Enviada',
  completed: 'Recebida',
}

interface FormOrdem {
  cotacao: string
  fornecedor: string
  formaPag: string
  prazoEntrega: string
  transportadora: string
  observacoes: string
}

const initialFormOrdem: FormOrdem = {
  cotacao: '',
  fornecedor: '',
  formaPag: 'À vista',
  prazoEntrega: '',
  transportadora: 'A definir pelo fornecedor',
  observacoes: '',
}

export default function OrdensCompra() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null)
  const [ordens, setOrdens] = useState(ordensIniciais)
  const [form, setForm] = useState<FormOrdem>(initialFormOrdem)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = subscribe<typeof ordensIniciais[0]>(COLLECTIONS.ORDENS, (items) => {
      setOrdens(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function updateForm(field: keyof FormOrdem, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleCriar() {
    if (!form.fornecedor.trim()) return
    const hoje = new Date()
    const data = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
    const nextNum = ordens.length > 0 && ordens[0].id
      ? String(parseInt(ordens[0].id.replace('OC-2026-', '')) + 1).padStart(4, '0')
      : '0001'
    const nova = {
      id: `OC-2026-${nextNum}`,
      fornecedor: form.fornecedor,
      cnpj: '',
      itens: 0,
      valor: 'R$ 0,00',
      formaPag: form.formaPag,
      prazoEntrega: form.prazoEntrega || data,
      status: 'pending',
      cotacao: form.cotacao || '-',
      data,
    }
    await add(COLLECTIONS.ORDENS, nova as unknown as Record<string, unknown>)
    setForm(initialFormOrdem)
    setShowModal(false)
  }

  async function handleEnviar(id: string) {
    const o = ordens.find(x => x.id === id)
    if (o?._id && o.status === 'pending') await update(COLLECTIONS.ORDENS, o._id, { status: 'processing' })
  }

  function handleExportar() {
    const header = 'Código;Fornecedor;CNPJ;Itens;Valor;Forma Pgto;Prazo;Status;Data'
    const rows = ordens.map(o =>
      `${o.id};${o.fornecedor};${o.cnpj};${o.itens};${o.valor};${o.formaPag};${o.prazoEntrega};${statusLabels[o.status]};${o.data}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ordens-compra.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredData = ordens.filter((o) => {
    const matchesFilter = filter === 'all' || o.status === filter
    const matchesSearch =
      o.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Compras</div>
          <h1 className="page-title">Ordens de Compra</h1>
          <p className="page-desc">Gerencie ordens de compra geradas a partir de cotações aprovadas</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary" onClick={() => { setForm(initialFormOrdem); setShowModal(true) }}>
            <Plus size={16} /> Nova Ordem
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar ordens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {['all', 'pending', 'approved', 'processing', 'completed', 'rejected'].map((f) => (
          <button
            key={f}
            className={`chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Todas' : statusLabels[f]}
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={32} className="spin" color="#22c55e" />
            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Carregando ordens...</div>
          </div>
        ) : (
        <>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Fornecedor</th>
                <th>CNPJ</th>
                <th>Itens</th>
                <th>Valor Total</th>
                <th>Forma Pgto</th>
                <th>Prazo Entrega</th>
                <th>Cotação</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>{o.id}</td>
                  <td style={{ fontWeight: 500 }}>{o.fornecedor}</td>
                  <td style={{ fontSize: 13, color: '#6b7280' }}>{o.cnpj}</td>
                  <td>{o.itens}</td>
                  <td style={{ fontWeight: 600 }}>{o.valor}</td>
                  <td>{o.formaPag}</td>
                  <td>{o.prazoEntrega}</td>
                  <td>
                    <span style={{ color: '#2563eb', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate('/mapa-cotacao')}>{o.cotacao}</span>
                  </td>
                  <td><span className={`pill pill-${o.status}`}>{statusLabels[o.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Visualizar" onClick={() => setShowDetailModal(o.id)}><Eye size={16} /></button>
                      {(o.status === 'pending' || o.status === 'approved') && (
                        <button className="btn btn-ghost btn-icon btn-sm" title="Enviar ao Fornecedor" onClick={() => handleEnviar(o.id)}><Send size={16} /></button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" title="Imprimir" onClick={() => window.print()}><Printer size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <div className="pager-info">Mostrando {paginatedData.length} de {filteredData.length} ordens</div>
          <div className="pager-btns">
            <button className="pager-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`pager-btn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className="pager-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Próxima</button>
          </div>
        </div>
        </>
        )}
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Nova Ordem de Compra</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Cotação de Referência</label>
                <input className="input" type="text" placeholder="Ex: COT-0090" value={form.cotacao} onChange={(e) => updateForm('cotacao', e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Fornecedor *</label>
                  <input className="input" type="text" placeholder="Nome do fornecedor" value={form.fornecedor} onChange={(e) => updateForm('fornecedor', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Forma de Pagamento</label>
                  <select className="input" value={form.formaPag} onChange={(e) => updateForm('formaPag', e.target.value)}>
                    <option>À vista</option>
                    <option>30 dias</option>
                    <option>30/60 dias</option>
                    <option>30/60/90 dias</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Prazo de Entrega</label>
                  <input className="input" type="date" value={form.prazoEntrega} onChange={(e) => updateForm('prazoEntrega', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Transportadora</label>
                  <select className="input" value={form.transportadora} onChange={(e) => updateForm('transportadora', e.target.value)}>
                    <option>A definir pelo fornecedor</option>
                    <option>TransLog Express</option>
                    <option>Rápido Transportes</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Observações</label>
                <textarea className="input" placeholder="Instruções especiais para o fornecedor..." value={form.observacoes} onChange={(e) => updateForm('observacoes', e.target.value)} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCriar}>
                <Send size={16} /> Gerar Ordem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && (() => {
        const sel = ordens.find(o => o.id === showDetailModal)
        if (!sel) return null
        return (
          <div className="overlay" onClick={() => setShowDetailModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-head">
                <h3>Ordem {sel.id}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Fornecedor</label><span>{sel.fornecedor}</span></div>
                  <div className="detail-item"><label>CNPJ</label><span>{sel.cnpj || '-'}</span></div>
                  <div className="detail-item"><label>Valor Total</label><span style={{ color: '#16a34a', fontWeight: 600 }}>{sel.valor}</span></div>
                  <div className="detail-item"><label>Forma de Pagamento</label><span>{sel.formaPag}</span></div>
                  <div className="detail-item"><label>Prazo de Entrega</label><span>{sel.prazoEntrega}</span></div>
                  <div className="detail-item"><label>Cotação</label><span>{sel.cotacao}</span></div>
                  <div className="detail-item"><label>Itens</label><span>{sel.itens}</span></div>
                  <div className="detail-item"><label>Status</label><span className={`pill pill-${sel.status}`}>{statusLabels[sel.status]}</span></div>
                </div>
              </div>
              <div className="modal-foot">
                {(sel.status === 'pending' || sel.status === 'approved') && (
                  <button className="btn btn-primary" onClick={() => { handleEnviar(sel.id); setShowDetailModal(null) }}>
                    <Send size={16} /> Enviar ao Fornecedor
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
