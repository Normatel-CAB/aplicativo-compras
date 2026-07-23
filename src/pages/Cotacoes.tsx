import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
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
  solicitacao?: string
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
  solicitacao: string
  fornecedores: string
}

const initialForm: FormCotacao = { descricao: '', setor: '', solicitacao: '', fornecedores: '' }

export default function Cotacoes() {
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
      solicitacao: form.solicitacao, dataAbertura: data, dataFechamento: '-', status: 'open', itens,
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
    a.download = 'cotacoes.csv'
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
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Compras</div>
          <h1 className="page-title">Cotações</h1>
          <p className="page-desc">Envie RFQs a fornecedores, compare propostas e selecione a melhor oferta para gerar a ordem de compra</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}><Download size={16} /> Exportar</button>
          <button className="btn btn-primary" onClick={() => { setForm(initialForm); setShowModal(true) }}><Plus size={16} /> Nova Cotação</button>
        </div>
      </div>

      <div className="callout">
        <div className="callout-icon"><Send size={18} /></div>
        <div>
          <div className="callout-title">Envio automático de RFQ</div>
          <div className="callout-text">As cotações são enviadas automaticamente por e-mail aos fornecedores cadastrados na categoria do item. O sistema classifica as propostas por preço, prazo e condição de pagamento.</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 420 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar por código, descrição ou setor..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['all', 'open', 'analyzing', 'completed', 'canceled'].map((f) => (
          <button key={f} className={`chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todas' : statusLabels[f]}
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={30} className="spin" color="var(--brand-500)" />
            <div style={{ marginTop: 12, color: 'var(--gray-500)', fontSize: 13.5 }}>Carregando cotações...</div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Send size={24} /></div>
            <h3>Nenhuma cotação em aberto</h3>
            <p>Crie uma cotação a partir de uma solicitação aprovada para começar a comparar propostas de fornecedores.</p>
            <button className="btn btn-primary" onClick={() => { setForm(initialForm); setShowModal(true) }}><Plus size={16} /> Nova Cotação</button>
          </div>
        ) : (
        <>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Código</th><th>Descrição</th><th>Setor</th><th>Fornecedores</th><th>Melhor Preço</th>
                <th>Abertura</th><th>Fechamento</th><th>Vencedor</th><th>Status</th><th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((c) => {
                const melhorPreco = c.itens.length > 0
                  ? c.itens.reduce((min, i) => i.valorNum > 0 && i.valorNum < min.valorNum ? i : min, c.itens.find(i => i.valorNum > 0) || c.itens[0])
                  : null
                return (
                  <tr key={c.id} className="clickable" onClick={() => setShowMapaModal(c.id)}>
                    <td className="cell-code">{c.codigo}</td>
                    <td style={{ fontWeight: 500 }}>{c.descricao}</td>
                    <td>{c.setor}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: 'var(--brand-100)', color: 'var(--brand-800)', padding: '2px 10px', borderRadius: 12, fontWeight: 700, fontSize: 12.5 }}>{c.itens.length}</span>
                    </td>
                    <td className="cell-code">{melhorPreco && melhorPreco.valorNum > 0 ? melhorPreco.valor : '-'}</td>
                    <td className="muted">{c.dataAbertura}</td>
                    <td className="muted">{c.dataFechamento}</td>
                    <td>
                      {c.vencedor ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Trophy size={13} color="var(--amber-dot)" />
                          <span style={{ fontWeight: 600, fontSize: 12.5 }}>{c.vencedor}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`pill pill-${c.status === 'open' ? 'pending' : c.status === 'analyzing' ? 'processing' : c.status === 'completed' ? 'completed' : 'rejected'}`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Ver Mapa" onClick={() => setShowMapaModal(c.id)}><Eye size={16} /></button>
                        {(c.status === 'open' || c.status === 'analyzing') && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="Cancelar" style={{ color: 'var(--red-600)' }} onClick={() => handleCancelar(c.id)}><Ban size={16} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="pager"><div className="pager-info">Mostrando {filteredData.length} de {cotacoes.length} cotações</div></div>
        </>
        )}
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Nova Cotação</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Descrição dos Itens *</label>
                <textarea className="input" placeholder="Descreva o que será cotado..." value={form.descricao} onChange={(e) => setForm(p => ({ ...p, descricao: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Setor *</label>
                  <select className="input" value={form.setor} onChange={(e) => setForm(p => ({ ...p, setor: e.target.value }))}>
                    <option value="">Selecione...</option>
                    <option>TI</option><option>Marketing</option><option>Produção</option><option>RH</option><option>Financeiro</option><option>Logística</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Solicitação de Origem</label>
                  <input className="input" type="text" placeholder="Ex: SC-0523" value={form.solicitacao} onChange={(e) => setForm(p => ({ ...p, solicitacao: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Fornecedores (um por linha)</label>
                <textarea className="input" placeholder={"Fornecedor A\nFornecedor B\nFornecedor C"} style={{ minHeight: 100 }} value={form.fornecedores} onChange={(e) => setForm(p => ({ ...p, fornecedores: e.target.value }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleCriar}><Send size={16} /> Abrir Cotação</button>
            </div>
          </div>
        </div>
      )}

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
          <div className="overlay" onClick={() => setShowMapaModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 850 }}>
              <div className="modal-head">
                <h3>Mapa de Cotação — {c.codigo}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowMapaModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{c.descricao}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--gray-500)' }}>Setor: {c.setor} · Abertura: {c.dataAbertura} · Status: {statusLabels[c.status]}</div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {sorted.map((item, idx) => {
                    const isMelhor = item.valorNum === menorValor && item.valorNum > 0
                    const isVencedor = c.vencedor === item.fornecedor
                    return (
                      <div key={idx} style={{
                        padding: 16, borderRadius: 10,
                        border: `2px solid ${isVencedor ? 'var(--brand-500)' : isMelhor ? 'var(--brand-200)' : 'var(--gray-200)'}`,
                        background: isVencedor ? 'var(--brand-50)' : 'white',
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 10,
                          background: idx === 0 ? 'var(--amber-100)' : 'var(--gray-100)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: 15, color: idx === 0 ? 'var(--amber-600)' : 'var(--gray-500)', flexShrink: 0,
                        }}>
                          {idx === 0 ? <Trophy size={19} color="var(--amber-600)" /> : `${idx + 1}º`}
                        </div>

                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {item.fornecedor}
                            {isVencedor && <span className="pill pill-approved">Vencedor</span>}
                            {isMelhor && !isVencedor && <Star size={13} color="var(--amber-dot)" fill="var(--amber-dot)" />}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
                            Prazo: {item.prazoEntrega} · Pgto: {item.formaPag}{item.observacoes && ` · ${item.observacoes}`}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 17, color: isMelhor ? 'var(--brand-700)' : 'var(--gray-900)' }}>{item.valor}</div>
                          {menorValor > 0 && item.valorNum > menorValor && (
                            <div style={{ fontSize: 11, color: 'var(--red-600)', fontWeight: 600 }}>+{((item.valorNum - menorValor) / menorValor * 100).toFixed(1)}% mais caro</div>
                          )}
                        </div>

                        {(c.status === 'open' || c.status === 'analyzing') && !c.vencedor && item.valorNum > 0 && (
                          <button className="btn btn-primary btn-sm" onClick={() => handleSelecionarVencedor(c.id, item.fornecedor)}><CheckCircle2 size={14} /> Selecionar</button>
                        )}
                      </div>
                    )
                  })}
                </div>

                {c.vencedor && (
                  <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--brand-50)', borderRadius: 8, border: '1px solid var(--brand-200)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={18} color="var(--brand-600)" />
                    <span style={{ fontSize: 13, color: 'var(--brand-800)' }}>Cotação concluída. Vencedor: <strong>{c.vencedor}</strong> — pronto para gerar Ordem de Compra.</span>
                  </div>
                )}
              </div>
              <div className="modal-foot">
                <button className="btn btn-secondary" onClick={() => setShowMapaModal(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
