import { useState } from 'react'
import {
  Send,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Eye,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { enviarNotaPorEmail, type EmailProvider } from '../services/emailService'

interface NotaEnvio {
  id: number
  numero: string
  fornecedor: string
  cnpj: string
  valor: string
  destinatario: string
  emailDest: string
  status: 'pending' | 'sent' | 'delivered' | 'error'
  dataEmissao: string
  dataEnvio: string
  tentativas: number
}

const notasIniciais: NotaEnvio[] = [
  { id: 1, numero: 'NF-e 12345', fornecedor: 'Tech Solutions Ltda', cnpj: '12.345.678/0001-90', valor: 'R$ 12.450,00', destinatario: 'Carlos Silva', emailDest: 'carlos@techsol.com.br', status: 'delivered', dataEmissao: '05/04/2026', dataEnvio: '05/04/2026', tentativas: 1 },
  { id: 2, numero: 'NF-e 12344', fornecedor: 'Metal Parts Ind.', cnpj: '11.222.333/0001-44', valor: 'R$ 28.900,00', destinatario: 'João Mendes', emailDest: 'comercial@metalparts.com.br', status: 'sent', dataEmissao: '03/04/2026', dataEnvio: '04/04/2026', tentativas: 1 },
  { id: 3, numero: 'NF-e 12343', fornecedor: 'Distribuidora ABC', cnpj: '55.666.777/0001-88', valor: 'R$ 7.650,00', destinatario: 'Fernanda Costa', emailDest: 'pedidos@distabc.com.br', status: 'delivered', dataEmissao: '02/04/2026', dataEnvio: '02/04/2026', tentativas: 1 },
  { id: 4, numero: 'NF-e 12342', fornecedor: 'Química Brasil S.A.', cnpj: '33.444.555/0001-66', valor: 'R$ 6.300,00', destinatario: 'Ricardo Alves', emailDest: 'vendas@quimbrasil.com.br', status: 'error', dataEmissao: '01/04/2026', dataEnvio: '01/04/2026', tentativas: 3 },
  { id: 5, numero: 'NF-e 12341', fornecedor: 'Papelaria Central', cnpj: '98.765.432/0001-10', valor: 'R$ 3.280,00', destinatario: 'Ana Souza', emailDest: 'vendas@papelariacentral.com.br', status: 'pending', dataEmissao: '04/04/2026', dataEnvio: '-', tentativas: 0 },
  { id: 6, numero: 'NF-e 12340', fornecedor: 'ServEletric ME', cnpj: '44.555.666/0001-22', valor: 'R$ 15.200,00', destinatario: 'Pedro Santos', emailDest: 'contato@serveletric.com.br', status: 'pending', dataEmissao: '06/04/2026', dataEnvio: '-', tentativas: 0 },
]

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  sent: 'Enviada',
  delivered: 'Entregue',
  error: 'Erro no Envio',
}

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  sent: Send,
  delivered: CheckCircle2,
  error: AlertTriangle,
}

export default function EnvioNotas() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [notas, setNotas] = useState(notasIniciais)
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null)
  const [showEnvioModal, setShowEnvioModal] = useState<number | null>(null)
  const [emailCustom, setEmailCustom] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [provider, setProvider] = useState<EmailProvider>('gmail')
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; msg: string } | null>(null)

  function getDataHoje() {
    const hoje = new Date()
    return `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`
  }

  async function handleEnviar(id: number) {
    const nota = notas.find(n => n.id === id)
    if (!nota) return
    setEnviando(true)
    setFeedback(null)
    try {
      await enviarNotaPorEmail({
        notaNumero: nota.numero,
        fornecedor: nota.fornecedor,
        valor: nota.valor,
        destinatario: nota.destinatario,
        emailDest: emailCustom || nota.emailDest,
        mensagemAdicional: mensagem || undefined,
        provider,
      })
      setNotas(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'delivered' as const, dataEnvio: getDataHoje(), tentativas: n.tentativas + 1 } : n
      ))
      setShowEnvioModal(null)
      setFeedback({ tipo: 'success', msg: `E-mail enviado com sucesso para ${emailCustom || nota.emailDest}!` })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      setNotas(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'error' as const, tentativas: n.tentativas + 1 } : n
      ))
      setFeedback({ tipo: 'error', msg: `Falha ao enviar: ${msg}` })
    } finally {
      setEnviando(false)
      setTimeout(() => setFeedback(null), 6000)
    }
  }

  async function handleReenviar(id: number) {
    const nota = notas.find(n => n.id === id)
    if (!nota) return
    setEnviando(true)
    setFeedback(null)
    try {
      await enviarNotaPorEmail({
        notaNumero: nota.numero,
        fornecedor: nota.fornecedor,
        valor: nota.valor,
        destinatario: nota.destinatario,
        emailDest: nota.emailDest,
        provider,
      })
      setNotas(prev => prev.map(n =>
        n.id === id ? { ...n, status: 'delivered' as const, dataEnvio: getDataHoje(), tentativas: n.tentativas + 1 } : n
      ))
      setFeedback({ tipo: 'success', msg: `Nota ${nota.numero} reenviada com sucesso!` })
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      setNotas(prev => prev.map(n =>
        n.id === id ? { ...n, tentativas: n.tentativas + 1 } : n
      ))
      setFeedback({ tipo: 'error', msg: `Falha ao reenviar: ${msg}` })
    } finally {
      setEnviando(false)
      setTimeout(() => setFeedback(null), 6000)
    }
  }

  async function handleEnviarTodas() {
    const pendentes_list = notas.filter(n => n.status === 'pending')
    if (pendentes_list.length === 0) return
    setEnviando(true)
    setFeedback(null)
    let ok = 0
    let erros_count = 0
    for (const nota of pendentes_list) {
      try {
        await enviarNotaPorEmail({
          notaNumero: nota.numero,
          fornecedor: nota.fornecedor,
          valor: nota.valor,
          destinatario: nota.destinatario,
          emailDest: nota.emailDest,
          provider,
        })
        setNotas(prev => prev.map(n =>
          n.id === nota.id ? { ...n, status: 'delivered' as const, dataEnvio: getDataHoje(), tentativas: n.tentativas + 1 } : n
        ))
        ok++
      } catch {
        setNotas(prev => prev.map(n =>
          n.id === nota.id ? { ...n, status: 'error' as const, tentativas: n.tentativas + 1 } : n
        ))
        erros_count++
      }
    }
    setEnviando(false)
    if (erros_count === 0) {
      setFeedback({ tipo: 'success', msg: `${ok} nota(s) enviada(s) com sucesso!` })
    } else {
      setFeedback({ tipo: 'error', msg: `${ok} enviada(s), ${erros_count} com erro.` })
    }
    setTimeout(() => setFeedback(null), 6000)
  }

  const filteredData = notas.filter((n) => {
    const matchesFilter = filter === 'all' || n.status === filter
    const matchesSearch =
      n.numero.toLowerCase().includes(search.toLowerCase()) ||
      n.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      n.destinatario.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendentes = notas.filter(n => n.status === 'pending').length
  const enviadas = notas.filter(n => n.status === 'sent').length
  const entregues = notas.filter(n => n.status === 'delivered').length
  const erros = notas.filter(n => n.status === 'error').length

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Envio de Notas Fiscais</h2>
          <p>Gerencie o envio eletrônico de notas fiscais para fornecedores e destinatários</p>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Provedor:</label>
            <select
              className="form-select"
              style={{ width: 130, padding: '6px 10px', fontSize: 13 }}
              value={provider}
              onChange={(e) => setProvider(e.target.value as EmailProvider)}
            >
              <option value="gmail">Gmail</option>
              <option value="outlook">Outlook</option>
            </select>
          </div>
          {pendentes > 0 && (
            <button className="btn btn-primary" onClick={handleEnviarTodas} disabled={enviando}>
              {enviando ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
              {enviando ? 'Enviando...' : `Enviar Todas Pendentes (${pendentes})`}
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
          background: feedback.tipo === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${feedback.tipo === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: feedback.tipo === 'success' ? '#166534' : '#991b1b',
        }}>
          {feedback.tipo === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {feedback.msg}
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('pending')}>
          <div className="stat-card-header">
            <div className="stat-card-icon orange"><Clock size={24} /></div>
          </div>
          <div className="stat-card-value">{pendentes}</div>
          <div className="stat-card-label">Pendentes</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('sent')}>
          <div className="stat-card-header">
            <div className="stat-card-icon blue"><Send size={24} /></div>
          </div>
          <div className="stat-card-value">{enviadas}</div>
          <div className="stat-card-label">Enviadas</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('delivered')}>
          <div className="stat-card-header">
            <div className="stat-card-icon green"><CheckCircle2 size={24} /></div>
          </div>
          <div className="stat-card-value">{entregues}</div>
          <div className="stat-card-label">Entregues</div>
        </div>
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('error')}>
          <div className="stat-card-header">
            <div className="stat-card-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><AlertTriangle size={24} /></div>
          </div>
          <div className="stat-card-value">{erros}</div>
          <div className="stat-card-label">Com Erro</div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Buscar por nota, fornecedor ou destinatário..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['all', 'pending', 'sent', 'delivered', 'error'].map((f) => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todas' : statusLabels[f]}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nota</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Destinatário</th>
                <th>E-mail</th>
                <th>Data Envio</th>
                <th>Tentativas</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((n) => {
                const StatusIcon = statusIcons[n.status]
                return (
                  <tr key={n.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={16} color="#16a34a" />
                        <span style={{ fontWeight: 600 }}>{n.numero}</span>
                      </div>
                    </td>
                    <td>
                      <div>{n.fornecedor}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{n.cnpj}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{n.valor}</td>
                    <td>{n.destinatario}</td>
                    <td style={{ fontSize: 13, color: '#6b7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> {n.emailDest}
                      </div>
                    </td>
                    <td style={{ color: '#6b7280' }}>{n.dataEnvio}</td>
                    <td style={{ textAlign: 'center' }}>{n.tentativas}</td>
                    <td>
                      <span className={`status-badge ${n.status === 'delivered' ? 'completed' : n.status === 'sent' ? 'processing' : n.status === 'error' ? 'rejected' : 'pending'}`}>
                        <StatusIcon size={12} style={{ marginRight: 4 }} />
                        {statusLabels[n.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title="Detalhes" onClick={() => setShowDetailModal(n.id)}>
                          <Eye size={16} />
                        </button>
                        {n.status === 'pending' && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="Enviar" style={{ color: '#22c55e' }} onClick={() => { setEmailCustom(n.emailDest); setMensagem(''); setShowEnvioModal(n.id) }}>
                            <Send size={16} />
                          </button>
                        )}
                        {n.status === 'error' && (
                          <button className="btn btn-ghost btn-icon btn-sm" title="Reenviar" style={{ color: '#f59e0b' }} onClick={() => handleReenviar(n.id)} disabled={enviando}>
                            {enviando ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
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
          <div className="pagination-info">Mostrando {filteredData.length} de {notas.length} notas</div>
        </div>
      </div>

      {/* Modal Detalhes */}
      {showDetailModal && (() => {
        const n = notas.find(x => x.id === showDetailModal)
        if (!n) return null
        return (
          <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h3>Detalhes - {n.numero}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Fornecedor</label><span>{n.fornecedor}</span></div>
                  <div className="detail-item"><label>CNPJ</label><span>{n.cnpj}</span></div>
                  <div className="detail-item"><label>Valor</label><span style={{ color: '#16a34a', fontWeight: 600 }}>{n.valor}</span></div>
                  <div className="detail-item"><label>Destinatário</label><span>{n.destinatario}</span></div>
                  <div className="detail-item"><label>E-mail</label><span>{n.emailDest}</span></div>
                  <div className="detail-item"><label>Data Emissão</label><span>{n.dataEmissao}</span></div>
                  <div className="detail-item"><label>Data Envio</label><span>{n.dataEnvio}</span></div>
                  <div className="detail-item"><label>Tentativas</label><span>{n.tentativas}</span></div>
                  <div className="detail-item"><label>Status</label>
                    <span className={`status-badge ${n.status === 'delivered' ? 'completed' : n.status === 'sent' ? 'processing' : n.status === 'error' ? 'rejected' : 'pending'}`}>
                      {statusLabels[n.status]}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {n.status === 'pending' && (
                  <button className="btn btn-primary" onClick={() => { setShowDetailModal(null); setEmailCustom(n.emailDest); setMensagem(''); setShowEnvioModal(n.id) }}>
                    <Send size={16} /> Enviar Nota
                  </button>
                )}
                {n.status === 'error' && (
                  <button className="btn btn-primary" onClick={() => { handleReenviar(n.id); setShowDetailModal(null) }}>
                    <RefreshCw size={16} /> Reenviar
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal Envio */}
      {showEnvioModal && (() => {
        const n = notas.find(x => x.id === showEnvioModal)
        if (!n) return null
        return (
          <div className="modal-overlay" onClick={() => setShowEnvioModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 550 }}>
              <div className="modal-header">
                <h3>Enviar {n.numero}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowEnvioModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 20, fontSize: 13, color: '#166534' }}>
                  <strong>{n.fornecedor}</strong> — {n.valor}
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail do Destinatário</label>
                  <input className="form-input" type="email" value={emailCustom} onChange={(e) => setEmailCustom(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Provedor de E-mail</label>
                  <select className="form-select" value={provider} onChange={(e) => setProvider(e.target.value as EmailProvider)}>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mensagem Adicional (opcional)</label>
                  <textarea className="form-textarea" placeholder="Mensagem que acompanhará a nota fiscal..." value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEnvioModal(null)} disabled={enviando}>Cancelar</button>
                <button className="btn btn-primary" onClick={() => handleEnviar(n.id)} disabled={enviando}>
                  {enviando ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                  {enviando ? 'Enviando...' : 'Enviar Nota'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
