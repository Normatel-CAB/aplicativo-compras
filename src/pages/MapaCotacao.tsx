import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
  DollarSign,
  Clock,
  Star,
  Send,
  Ban,
  Loader2,
} from 'lucide-react'
import { add, update, subscribe, COLLECTIONS } from '../services/firestoreService'

interface ItemCotacao {
  fornecedor: string
  valor: string
  valorNum: number
  prazoEntrega: string
  formaPag: string
  observacoes: string
}

interface Cotacao {
  _id?: string
  id: number
  codigo: string
  descricao: string
  setor: string
  dataAbertura: string
  dataFechamento: string
  status: 'open' | 'analyzing' | 'completed' | 'canceled'
  itens: ItemCotacao[]
  vencedor?: string
}

const cotacoesIniciais: Cotacao[] = []

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  analyzing: 'Em Análise',
  completed: 'Concluída',
  canceled: 'Cancelada',
}

interface FormCotacao {
  descricao: string
  setor: string
  fornecedores: string
}

const initialForm: FormCotacao = {
  descricao: '',
  setor: '',
  fornecedores: '',
}

export default function MapaCotacao() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [cotacoes, setCotacoes] = useState(cotacoesIniciais)
  const [showModal, setShowModal] = useState(false)
  const [showMapaModal, setShowMapaModal] = useState<number | null>(null)
  const [form, setForm] = useState<FormCotacao>(initialForm)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe<Cotacao>(COLLECTIONS.COTACOES, (items) => {
      setCotacoes(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleCriar() {
    if (!form.descricao.trim() || !form.setor) return
    const hoje = new Date()
    const data = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
    const nextCode = cotacoes.length > 0 && cotacoes[0].codigo
      ? `COT-${String(parseInt(cotacoes[0].codigo.replace('COT-', '')) + 1).padStart(4, '0')}`
      : 'COT-0001'

    const fornecedoresList = form.fornecedores.split('\n').filter(f => f.trim())
    const itens: ItemCotacao[] = fornecedoresList.map(f => ({
      fornecedor: f.trim(), valor: 'R$ 0,00', valorNum: 0, prazoEntrega: '-', formaPag: '-', observacoes: ''
    }))

    const nova = {
      id: Date.now(), codigo: nextCode, descricao: form.descricao, setor: form.setor,
      dataAbertura: data, dataFechamento: '-', status: 'open', itens,
    }
    await add(COLLECTIONS.COTACOES, nova as unknown as Record<string, unknown>)
    setForm(initialForm)
    setShowModal(false)
  }

  async function handleSelecionarVencedor(cotacaoId: number, fornecedor: string) {
    const hoje = new Date()
    const data = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
    const c = cotacoes.find(x => x.id === cotacaoId)
    if (c?._id) await update(COLLECTIONS.COTACOES, c._id, { status: 'completed', vencedor: fornecedor, dataFechamento: data })
    setShowMapaModal(null)
  }

  async function handleCancelar(id: number) {
    const c = cotacoes.find(x => x.id === id)
    if (c?._id) await update(COLLECTIONS.COTACOES, c._id, { status: 'canceled' })
  }

  function handleExportar() {
    const header = 'Código;Descrição;Setor;Abertura;Fechamento;Status;Vencedor;Qtd Fornecedores'
    const rows = cotacoes.map(c =>
      `${c.codigo};${c.descricao};${c.setor};${c.dataAbertura};${c.dataFechamento};${statusLabels[c.status]};${c.vencedor || '-'};${c.itens.length}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mapa-cotacoes.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredData = cotacoes.filter((c) => {
    const matchesFilter = filter === 'all' || c.status === filter
    const matchesSearch =
      c.descricao.toLowerCase().includes(search.toLowerCase()) ||
      c.codigo.toLowerCase().includes(search.toLowerCase()) ||
      c.setor.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Mapa de Cotação</h2>
          <p>Compare propostas de fornecedores e selecione a melhor oferta</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setShowModal(true) }}>
            <Plus size={16} /> Nova Cotação
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Buscar por código, descrição ou setor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['all', 'open', 'analyzing', 'completed', 'canceled'].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todas' : statusLabels[f]}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={32} className="spin" color="#22c55e" />
            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Carregando cotações...</div>
          </div>
        ) : (
        <>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Setor</th>
                <th>Fornecedores</th>
                <th>Melhor Preço</th>
                <th>Abertura</th>
                <th>Fechamento</th>
                <th>Vencedor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((c) => {
                const melhorPreco = c.itens.length > 0
                  ? c.itens.reduce((min, i) => i.valorNum > 0 && i.valorNum < min.valorNum ? i : min, c.itens.find(i => i.valorNum > 0) || c.itens[0])
                  : null
                return (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: '#16a34a' }}>{c.codigo}</td>
                    <td style={{ fontWeight: 500 }}>{c.descricao}</td>
                    <td>{c.setor}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
                        {c.itens.length}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>
                      {melhorPreco && melhorPreco.valorNum > 0 ? melhorPreco.valor : '-'}
                    </td>
                    <td style={{ color: '#6b7280' }}>{c.dataAbertura}</td>
                    <td style={{ color: '#6b7280' }}>{c.dataFechamento}</td>
                    <td>
                      {c.vencedor ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Trophy size={14} color="#f59e0b" />
                          <span style={{ fontWeight: 600, fontSize: 13 }}>{c.vencedor}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge ${c.status === 'open' ? 'pending' : c.status === 'analyzing' ? 'processing' : c.status === 'completed' ? 'completed' : 'rejected'}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Ver Mapa" onClick={() => setShowMapaModal(c.id)}>
                          <Eye size={16} />
                        </button>
                        {(c.status === 'open' || c.status === 'analyzing') && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="Cancelar" style={{ color: '#ef4444' }} onClick={() => handleCancelar(c.id)}>
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <div className="pagination-info">Mostrando {filteredData.length} de {cotacoes.length} cotações</div>
        </div>
        </>
        )}
      </div>

      {/* Modal Nova Cotação */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nova Cotação</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Descrição dos Itens *</label>
                <textarea className="form-textarea" placeholder="Descreva o que será cotado..." value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Setor *</label>
                <select className="form-select" value={form.setor} onChange={(e) => setForm(p => ({ ...p, setor: e.target.value }))}>
                  <option value="">Selecione...</option>
                  <option>TI</option>
                  <option>Marketing</option>
                  <option>Produção</option>
                  <option>RH</option>
                  <option>Financeiro</option>
                  <option>Logística</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fornecedores (um por linha)</label>
                <textarea className="form-textarea" placeholder={"Fornecedor A\nFornecedor B\nFornecedor C"} style={{ minHeight: 100 }} value={form.fornecedores} onChange={(e) => setForm(p => ({ ...p, fornecedores: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCriar}>
                <Send size={16} /> Abrir Cotação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mapa Comparativo */}
      {showMapaModal && (() => {
        const c = cotacoes.find(x => x.id === showMapaModal)
        if (!c) return null
        const sorted = [...c.itens].sort((a, b) => {
          if (a.valorNum === 0) return 1
          if (b.valorNum === 0) return -1
          return a.valorNum - b.valorNum
        })
        const menorValor = sorted.find(i => i.valorNum > 0)?.valorNum || 0
        return (
          <div className="modal-overlay" onClick={() => setShowMapaModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 850 }}>
              <div className="modal-header">
                <h3>Mapa de Cotação — {c.codigo}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowMapaModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.descricao}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>Setor: {c.setor} · Abertura: {c.dataAbertura} · Status: {statusLabels[c.status]}</div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {sorted.map((item, idx) => {
                    const isMelhor = item.valorNum === menorValor && item.valorNum > 0
                    const isVencedor = c.vencedor === item.fornecedor
                    return (
                      <div key={idx} style={{
                        padding: 16, borderRadius: 10,
                        border: `2px solid ${isVencedor ? '#22c55e' : isMelhor ? '#bbf7d0' : '#e5e7eb'}`,
                        background: isVencedor ? '#f0fdf4' : 'white',
                        display: 'flex', alignItems: 'center', gap: 16,
                      }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : idx === 2 ? '#fef2f2' : '#f9fafb',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 16, color: idx === 0 ? '#d97706' : '#6b7280', flexShrink: 0,
                        }}>
                          {idx === 0 ? <Trophy size={20} color="#d97706" /> : `${idx + 1}º`}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {item.fornecedor}
                            {isVencedor && <span style={{ fontSize: 11, background: '#22c55e', color: 'white', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>VENCEDOR</span>}
                            {isMelhor && !isVencedor && <Star size={14} color="#f59e0b" fill="#f59e0b" />}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                            Prazo: {item.prazoEntrega} · Pgto: {item.formaPag}
                            {item.observacoes && ` · ${item.observacoes}`}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 18, color: isMelhor ? '#16a34a' : '#111827' }}>
                            {item.valor}
                          </div>
                          {menorValor > 0 && item.valorNum > menorValor && (
                            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
                              +{((item.valorNum - menorValor) / menorValor * 100).toFixed(1)}% mais caro
                            </div>
                          )}
                        </div>

                        {(c.status === 'open' || c.status === 'analyzing') && !c.vencedor && item.valorNum > 0 && (
                          <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => handleSelecionarVencedor(c.id, item.fornecedor)}>
                            <CheckCircle2 size={14} /> Selecionar
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {c.vencedor && (
                  <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="#16a34a" />
                    <span style={{ fontSize: 13, color: '#166534' }}>
                      Cotação concluída. Vencedor: <strong>{c.vencedor}</strong>
                    </span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowMapaModal(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
