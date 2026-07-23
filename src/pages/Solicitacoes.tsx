import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { add, update, subscribe, COLLECTIONS } from '../services/firestoreService'

interface Solicitacao {
  _id?: string
  id: string
  setor: string
  solicitante: string
  tipo: string
  descricao: string
  itens: number
  valor: string
  status: string
  prioridade: string
  data: string
}

const solicitacoesIniciais: Solicitacao[] = [
  { id: 'SC-0523', setor: 'TI', solicitante: 'Carlos Silva', tipo: 'Estoque', descricao: '10x Monitor LED 27"', itens: 10, valor: 'R$ 18.500,00', status: 'pending', prioridade: 'high', data: '05/04/2026' },
  { id: 'SC-0522', setor: 'Marketing', solicitante: 'Ana Souza', tipo: 'Uso Direto', descricao: 'Material gráfico campanha', itens: 5, valor: 'R$ 4.200,00', status: 'pending', prioridade: 'medium', data: '04/04/2026' },
  { id: 'SC-0521', setor: 'Produção', solicitante: 'João Mendes', tipo: 'Estoque', descricao: 'Peças de reposição máquina CNC', itens: 25, valor: 'R$ 32.000,00', status: 'approved', prioridade: 'high', data: '03/04/2026' },
  { id: 'SC-0520', setor: 'RH', solicitante: 'Maria Lima', tipo: 'Uso Direto', descricao: 'Materiais de escritório variados', itens: 42, valor: 'R$ 1.850,00', status: 'approved', prioridade: 'low', data: '03/04/2026' },
  { id: 'SC-0519', setor: 'TI', solicitante: 'Pedro Santos', tipo: 'Estoque', descricao: '5x Notebook Dell Latitude', itens: 5, valor: 'R$ 42.500,00', status: 'rejected', prioridade: 'high', data: '02/04/2026' },
  { id: 'SC-0518', setor: 'Logística', solicitante: 'Fernanda Costa', tipo: 'Estoque', descricao: 'Embalagens tipo A e B', itens: 500, valor: 'R$ 8.900,00', status: 'approved', prioridade: 'medium', data: '01/04/2026' },
  { id: 'SC-0517', setor: 'Produção', solicitante: 'Ricardo Alves', tipo: 'Uso Direto', descricao: 'Óleo lubrificante industrial', itens: 50, valor: 'R$ 6.300,00', status: 'processing', prioridade: 'medium', data: '31/03/2026' },
  { id: 'SC-0516', setor: 'Financeiro', solicitante: 'Lúcia Ferreira', tipo: 'Uso Direto', descricao: 'Toner impressora laser', itens: 8, valor: 'R$ 2.400,00', status: 'completed', prioridade: 'low', data: '30/03/2026' },
]

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  processing: 'Em Cotação',
  completed: 'Concluída',
}

const priorityLabels: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

interface FormSolicitacao {
  setor: string
  solicitante: string
  tipo: string
  prioridade: string
  descricao: string
  itens: string
  valor: string
  observacoes: string
}

const initialForm: FormSolicitacao = {
  setor: '',
  solicitante: '',
  tipo: 'Uso Direto',
  prioridade: 'medium',
  descricao: '',
  itens: '',
  valor: '',
  observacoes: '',
}

export default function Solicitacoes() {
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([])
  const [form, setForm] = useState<FormSolicitacao>(initialForm)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10

  useEffect(() => {
    const unsub = subscribe<Solicitacao>(COLLECTIONS.SOLICITACOES, (items) => {
      setSolicitacoes(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function updateForm(field: keyof FormSolicitacao, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleCriar() {
    if (!form.descricao.trim() || !form.setor) return
    const nextId = solicitacoes.length > 0
      ? `SC-${String(parseInt(solicitacoes[0].id.replace('SC-', '')) + 1).padStart(4, '0')}`
      : 'SC-0001'
    const hoje = new Date()
    const data = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
    const nova: Omit<Solicitacao, '_id'> = {
      id: nextId, setor: form.setor, solicitante: form.solicitante || 'Usuário', tipo: form.tipo,
      descricao: form.descricao, itens: parseInt(form.itens) || 1, valor: form.valor ? `R$ ${form.valor}` : 'R$ 0,00',
      status: 'pending', prioridade: form.prioridade, data,
    }
    await add(COLLECTIONS.SOLICITACOES, nova as Record<string, unknown>)
    setForm(initialForm)
    setShowModal(false)
  }

  async function handleAprovar(id: string) {
    const s = solicitacoes.find(x => x.id === id)
    if (s?._id) await update(COLLECTIONS.SOLICITACOES, s._id, { status: 'approved' })
  }

  async function handleRejeitar(id: string) {
    const s = solicitacoes.find(x => x.id === id)
    if (s?._id) await update(COLLECTIONS.SOLICITACOES, s._id, { status: 'rejected' })
  }

  function handleExportar() {
    const header = 'Código;Setor;Solicitante;Tipo;Descrição;Qtd;Valor;Status;Prioridade;Data'
    const rows = solicitacoes.map(s =>
      `${s.id};${s.setor};${s.solicitante};${s.tipo};${s.descricao};${s.itens};${s.valor};${statusLabels[s.status]};${priorityLabels[s.prioridade]};${s.data}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solicitacoes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredData = solicitacoes.filter((s) => {
    const matchesFilter = filter === 'all' || s.status === filter
    const matchesSearch =
      s.descricao.toLowerCase().includes(search.toLowerCase()) ||
      s.solicitante.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Compras</div>
          <h1 className="page-title">Solicitações de Compra</h1>
          <p className="page-desc">Gerencie as solicitações de compra por setor e acompanhe aprovações</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setShowModal(true) }}>
            <Plus size={16} /> Nova Solicitação
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar solicitações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {['all', 'pending', 'approved', 'processing', 'rejected', 'completed'].map((f) => (
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
            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Carregando solicitações...</div>
          </div>
        ) : (
        <>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Setor</th>
                <th>Solicitante</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Est.</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: '#16a34a' }}>{s.id}</td>
                  <td>{s.setor}</td>
                  <td>{s.solicitante}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 600,
                      background: s.tipo === 'Estoque' ? '#dbeafe' : '#f3e8ff',
                      color: s.tipo === 'Estoque' ? '#1e40af' : '#7c3aed',
                    }}>
                      {s.tipo}
                    </span>
                  </td>
                  <td>{s.descricao}</td>
                  <td>{s.itens}</td>
                  <td style={{ fontWeight: 600 }}>{s.valor}</td>
                  <td><span className={`pill pill-${s.status}`}>{statusLabels[s.status]}</span></td>
                  <td><span className={`tag tag-${s.prioridade}`}>{priorityLabels[s.prioridade]}</span></td>
                  <td style={{ color: '#6b7280' }}>{s.data}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Visualizar" onClick={() => setShowDetailModal(s.id)}>
                        <Eye size={16} />
                      </button>
                      {s.status === 'pending' && (
                        <>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Aprovar" style={{ color: '#22c55e' }} onClick={() => handleAprovar(s.id)}>
                            <CheckCircle2 size={16} />
                          </button>
                          <button className="btn btn-ghost btn-icon btn-sm" title="Rejeitar" style={{ color: '#ef4444' }} onClick={() => handleRejeitar(s.id)}>
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pager">
          <div className="pager-info">Mostrando {paginatedData.length} de {filteredData.length} solicitações</div>
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
              <h3>Nova Solicitação de Compra</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Setor *</label>
                  <select className="input" value={form.setor} onChange={(e) => updateForm('setor', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option>TI</option>
                    <option>Marketing</option>
                    <option>Produção</option>
                    <option>RH</option>
                    <option>Financeiro</option>
                    <option>Logística</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Tipo de Uso</label>
                  <select className="input" value={form.tipo} onChange={(e) => updateForm('tipo', e.target.value)}>
                    <option>Uso Direto</option>
                    <option>Estoque</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Prioridade</label>
                  <select className="input" value={form.prioridade} onChange={(e) => updateForm('prioridade', e.target.value)}>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Solicitante</label>
                  <input className="input" type="text" placeholder="Nome do solicitante" value={form.solicitante} onChange={(e) => updateForm('solicitante', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Descrição dos Itens *</label>
                <textarea className="input" placeholder="Descreva os itens que deseja solicitar..." value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Quantidade</label>
                  <input className="input" type="number" placeholder="0" value={form.itens} onChange={(e) => updateForm('itens', e.target.value)} />
                </div>
                <div className="field">
                  <label className="field-label">Valor Estimado (R$)</label>
                  <input className="input" type="text" placeholder="0,00" value={form.valor} onChange={(e) => updateForm('valor', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Observações</label>
                <textarea className="input" placeholder="Observações adicionais..." style={{ minHeight: 60 }} value={form.observacoes} onChange={(e) => updateForm('observacoes', e.target.value)} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCriar}>Enviar Solicitação</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && (() => {
        const sel = solicitacoes.find(s => s.id === showDetailModal)
        if (!sel) return null
        return (
          <div className="overlay" onClick={() => setShowDetailModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-head">
                <h3>Solicitação {sel.id}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Setor</label><span>{sel.setor}</span></div>
                  <div className="detail-item"><label>Solicitante</label><span>{sel.solicitante}</span></div>
                  <div className="detail-item"><label>Tipo</label><span>{sel.tipo}</span></div>
                  <div className="detail-item"><label>Prioridade</label><span className={`tag tag-${sel.prioridade}`}>{priorityLabels[sel.prioridade]}</span></div>
                  <div className="detail-item"><label>Quantidade</label><span>{sel.itens} itens</span></div>
                  <div className="detail-item"><label>Valor Estimado</label><span style={{ color: '#16a34a', fontWeight: 600 }}>{sel.valor}</span></div>
                  <div className="detail-item"><label>Data</label><span>{sel.data}</span></div>
                  <div className="detail-item"><label>Status</label><span className={`pill pill-${sel.status}`}>{statusLabels[sel.status]}</span></div>
                </div>
                <div style={{ marginTop: 16, padding: 12, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>DESCRIÇÃO</div>
                  <div style={{ fontSize: 14 }}>{sel.descricao}</div>
                </div>
              </div>
              <div className="modal-foot">
                {sel.status === 'pending' ? (
                  <>
                    <button className="btn btn-secondary" style={{ color: '#ef4444' }} onClick={() => { handleRejeitar(sel.id); setShowDetailModal(null) }}>Rejeitar</button>
                    <button className="btn btn-primary" onClick={() => { handleAprovar(sel.id); setShowDetailModal(null) }}>Aprovar</button>
                  </>
                ) : (
                  <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
                )}
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
