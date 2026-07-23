import { useState, useEffect } from 'react'
import {
  Mail,
  Plus,
  Search,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Eye,
  XCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Loader2,
} from 'lucide-react'
import { db } from '../firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore'

interface TemplateEmail {
  id: string
  nome: string
  assunto: string
  corpo: string
  gatilho: string
  ativo: boolean
  destinatarios: string
  ultimoEnvio: string
  totalEnvios: number
}

interface LogEmail {
  id: string
  template: string
  destinatario: string
  assunto: string
  data: string
  hora: string
  status: 'sent' | 'delivered' | 'error'
}

const templatesIniciais: TemplateEmail[] = [
  { id: '1', nome: 'Nova Solicitação de Compra', assunto: 'Nova solicitação #{codigo} - Aguardando aprovação', corpo: 'Prezado(a) {comprador},\n\nUma nova solicitação de compra #{codigo} foi criada pelo setor {setor} e requer sua análise.\n\nDescrição: {descricao}\nValor estimado: {valor}\n\nAcesse o sistema para revisar e aprovar.', gatilho: 'Nova solicitação criada', ativo: true, destinatarios: 'Comprador responsável', ultimoEnvio: '06/04/2026 14:32', totalEnvios: 147 },
  { id: '2', nome: 'Ordem de Compra Aprovada', assunto: 'Ordem #{codigo} aprovada - Providenciar envio', corpo: 'Prezado(a) {comprador},\n\nA ordem de compra #{codigo} para o fornecedor {fornecedor} foi aprovada com sucesso.\n\nValor total: {valor}\nPrazo de entrega: {prazo}\n\nPor favor, acompanhe o processo de entrega.', gatilho: 'Ordem aprovada', ativo: true, destinatarios: 'Comprador + Gestor', ultimoEnvio: '05/04/2026 09:15', totalEnvios: 89 },
  { id: '3', nome: 'Nota Fiscal Recebida', assunto: 'NF-e #{numero} recebida - {fornecedor}', corpo: 'Prezado(a) {comprador},\n\nA nota fiscal #{numero} do fornecedor {fornecedor} foi registrada no sistema.\n\nValor: {valor}\nData emissão: {dataEmissao}\n\nVerifique os itens e confirme o recebimento.', gatilho: 'Nota fiscal importada', ativo: true, destinatarios: 'Comprador responsável', ultimoEnvio: '04/04/2026 11:20', totalEnvios: 203 },
  { id: '4', nome: 'Cotação Finalizada', assunto: 'Cotação #{codigo} concluída - Vencedor: {vencedor}', corpo: 'Prezado(a) {comprador},\n\nA cotação #{codigo} foi finalizada.\n\nVencedor: {vencedor}\nValor: {valor}\n\nUma ordem de compra será gerada automaticamente.', gatilho: 'Cotação concluída', ativo: false, destinatarios: 'Comprador + Financeiro', ultimoEnvio: '28/03/2026 16:45', totalEnvios: 34 },
  { id: '5', nome: 'Lembrete de Aprovação Pendente', assunto: 'Lembrete: {qtd} solicitações pendentes de aprovação', corpo: 'Prezado(a) {comprador},\n\nVocê possui {qtd} solicitação(ões) de compra pendente(s) de aprovação.\n\nSolicitações mais antigas:\n{lista}\n\nAcesse o sistema para revisar.', gatilho: 'Diário (8h) se houver pendências', ativo: true, destinatarios: 'Aprovadores com pendências', ultimoEnvio: '06/04/2026 08:00', totalEnvios: 412 },
]

const logsIniciais: LogEmail[] = [
  { id: '1', template: 'Nova Solicitação de Compra', destinatario: 'carlos.silva@empresa.com', assunto: 'Nova solicitação #SOL-0249 - Aguardando aprovação', data: '06/04/2026', hora: '14:32', status: 'delivered' },
  { id: '2', template: 'Lembrete de Aprovação Pendente', destinatario: 'maria.santos@empresa.com', assunto: 'Lembrete: 3 solicitações pendentes de aprovação', data: '06/04/2026', hora: '08:00', status: 'delivered' },
  { id: '3', template: 'Ordem de Compra Aprovada', destinatario: 'joao.mendes@empresa.com', assunto: 'Ordem #OC-0178 aprovada - Providenciar envio', data: '05/04/2026', hora: '09:15', status: 'delivered' },
  { id: '4', template: 'Nota Fiscal Recebida', destinatario: 'ana.costa@empresa.com', assunto: 'NF-e #12345 recebida - Tech Solutions Ltda', data: '04/04/2026', hora: '11:20', status: 'sent' },
  { id: '5', template: 'Nova Solicitação de Compra', destinatario: 'pedro.oliveira@empresa.com', assunto: 'Nova solicitação #SOL-0248 - Aguardando aprovação', data: '04/04/2026', hora: '15:10', status: 'error' },
  { id: '6', template: 'Lembrete de Aprovação Pendente', destinatario: 'carlos.silva@empresa.com', assunto: 'Lembrete: 1 solicitação pendente de aprovação', data: '05/04/2026', hora: '08:00', status: 'delivered' },
]

const statusLabels: Record<string, string> = {
  sent: 'Enviado',
  delivered: 'Entregue',
  error: 'Erro',
}

interface FormTemplate {
  nome: string
  assunto: string
  corpo: string
  gatilho: string
  destinatarios: string
}

const initialForm: FormTemplate = {
  nome: '',
  assunto: '',
  corpo: '',
  gatilho: '',
  destinatarios: '',
}

export default function EmailsAutomaticos() {
  const [tab, setTab] = useState<'templates' | 'logs'>('templates')
  const [search, setSearch] = useState('')
  const [templates, setTemplates] = useState(templatesIniciais)
  const [logs, setLogs] = useState(logsIniciais)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null)
  const [form, setForm] = useState<FormTemplate>(initialForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(true)

  // Carregar templates e logs do Firestore
  useEffect(() => {
    async function loadData() {
      try {
        // Templates
        const tSnap = await getDocs(collection(db, 'email_templates'))
        if (!tSnap.empty) {
          const firestoreTemplates = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as TemplateEmail))
          setTemplates(firestoreTemplates)
        }

        // Logs de emails enviados
        const lQuery = query(collection(db, 'emails_enviados'), orderBy('enviadoEm', 'desc'), limit(50))
        const lSnap = await getDocs(lQuery)
        if (!lSnap.empty) {
          const firestoreLogs: LogEmail[] = lSnap.docs.map(d => {
            const data = d.data()
            const ts = data.enviadoEm?.toDate?.()
            return {
              id: d.id,
              template: data.templateNome || 'Envio Manual',
              destinatario: data.destinatario || '',
              assunto: data.assunto || '',
              data: ts ? `${String(ts.getDate()).padStart(2, '0')}/${String(ts.getMonth() + 1).padStart(2, '0')}/${ts.getFullYear()}` : '-',
              hora: ts ? `${String(ts.getHours()).padStart(2, '0')}:${String(ts.getMinutes()).padStart(2, '0')}` : '-',
              status: data.status || 'sent',
            }
          })
          setLogs(firestoreLogs)
        }
      } catch {
        // Firestore não configurado — usa dados locais
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  async function handleSalvar() {
    if (!form.nome.trim() || !form.assunto.trim() || !form.corpo.trim()) return
    try {
      if (editId) {
        // Atualizar no Firestore
        try {
          await updateDoc(doc(db, 'email_templates', editId), { ...form })
        } catch { /* fallback local */ }
        setTemplates(prev => prev.map(t =>
          t.id === editId ? { ...t, ...form } : t
        ))
        setFeedback('Template atualizado com sucesso!')
      } else {
        // Criar no Firestore
        const novoLocal: TemplateEmail = {
          id: String(Date.now()), ...form, ativo: true, ultimoEnvio: '-', totalEnvios: 0,
        }
        try {
          const docRef = await addDoc(collection(db, 'email_templates'), {
            ...form, ativo: true, ultimoEnvio: '-', totalEnvios: 0,
          })
          novoLocal.id = docRef.id
        } catch { /* fallback local */ }
        setTemplates(prev => [novoLocal, ...prev])
        setFeedback('Template criado com sucesso!')
      }
    } catch {
      setFeedback('Erro ao salvar template')
    }
    setForm(initialForm)
    setEditId(null)
    setShowModal(false)
    setTimeout(() => setFeedback(''), 3000)
  }

  function handleEditar(t: TemplateEmail) {
    setEditId(t.id)
    setForm({
      nome: t.nome, assunto: t.assunto, corpo: t.corpo, gatilho: t.gatilho, destinatarios: t.destinatarios,
    })
    setShowModal(true)
  }

  async function handleExcluir(id: string) {
    try { await deleteDoc(doc(db, 'email_templates', id)) } catch { /* fallback */ }
    setTemplates(prev => prev.filter(t => t.id !== id))
  }

  async function handleToggle(id: string) {
    const t = templates.find(x => x.id === id)
    if (!t) return
    try { await updateDoc(doc(db, 'email_templates', id), { ativo: !t.ativo }) } catch { /* fallback */ }
    setTemplates(prev => prev.map(x =>
      x.id === id ? { ...x, ativo: !x.ativo } : x
    ))
  }

  const filteredTemplates = templates.filter(t =>
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.gatilho.toLowerCase().includes(search.toLowerCase())
  )

  const filteredLogs = logs.filter(l =>
    l.template.toLowerCase().includes(search.toLowerCase()) ||
    l.destinatario.toLowerCase().includes(search.toLowerCase()) ||
    l.assunto.toLowerCase().includes(search.toLowerCase())
  )

  const ativos = templates.filter(t => t.ativo).length
  const totalEnvios = templates.reduce((acc, t) => acc + t.totalEnvios, 0)

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Operações</div>
          <h1 className="page-title">E-mails Automáticos</h1>
          <p className="page-desc">Configure templates e gatilhos para envio automático de e-mails aos compradores</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(initialForm); setShowModal(true) }}>
            <Plus size={16} /> Novo Template
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#166534' }}>
          <CheckCircle2 size={16} /> {feedback}
        </div>
      )}

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 40, color: '#6b7280' }}>
          <Loader2 size={20} className="spin" /> Carregando dados do Firebase...
        </div>
      )}

      {/* Stats */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-panel">
          <div className="stat-panel-head"><div className="stat-panel-icon blue"><Mail size={24} /></div></div>
          <div className="stat-panel-value">{templates.length}</div>
          <div className="stat-panel-label">Templates</div>
        </div>
        <div className="stat-panel">
          <div className="stat-panel-head"><div className="stat-panel-icon green"><CheckCircle2 size={24} /></div></div>
          <div className="stat-panel-value">{ativos}</div>
          <div className="stat-panel-label">Ativos</div>
        </div>
        <div className="stat-panel">
          <div className="stat-panel-head"><div className="stat-panel-icon orange"><Send size={24} /></div></div>
          <div className="stat-panel-value">{totalEnvios.toLocaleString('pt-BR')}</div>
          <div className="stat-panel-label">E-mails Enviados</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e5e7eb' }}>
        <button onClick={() => setTab('templates')} style={{
          padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
          fontWeight: 600, fontSize: 14, color: tab === 'templates' ? '#16a34a' : '#6b7280',
          borderBottom: tab === 'templates' ? '2px solid #16a34a' : '2px solid transparent', marginBottom: -2,
        }}>
          <Mail size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Templates ({templates.length})
        </button>
        <button onClick={() => setTab('logs')} style={{
          padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
          fontWeight: 600, fontSize: 14, color: tab === 'logs' ? '#16a34a' : '#6b7280',
          borderBottom: tab === 'logs' ? '2px solid #16a34a' : '2px solid transparent', marginBottom: -2,
        }}>
          <Clock size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          Histórico de Envios ({logs.length})
        </button>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input type="text" placeholder={tab === 'templates' ? "Buscar template..." : "Buscar no histórico..."} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Templates */}
      {tab === 'templates' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {filteredTemplates.map((t) => (
            <div key={t.id} className="panel" style={{ padding: 20, opacity: t.ativo ? 1 : 0.6, transition: 'opacity 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Mail size={18} color={t.ativo ? '#16a34a' : '#9ca3af'} />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{t.nome}</span>
                    {!t.ativo && <span style={{ fontSize: 11, background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>INATIVO</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    <strong>Assunto:</strong> {t.assunto}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <span>Gatilho: <strong style={{ color: '#6b7280' }}>{t.gatilho}</strong></span>
                    <span>Para: <strong style={{ color: '#6b7280' }}>{t.destinatarios}</strong></span>
                    <span>Último envio: {t.ultimoEnvio}</span>
                    <span>Total: <strong style={{ color: '#6b7280' }}>{t.totalEnvios}</strong> envios</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Visualizar" onClick={() => setShowDetailModal(t.id)}>
                    <Eye size={16} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => handleEditar(t)}>
                    <Edit3 size={16} />
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title={t.ativo ? 'Desativar' : 'Ativar'} style={{ color: t.ativo ? '#22c55e' : '#9ca3af' }} onClick={() => handleToggle(t.id)}>
                    {t.ativo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: '#ef4444' }} onClick={() => handleExcluir(t.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logs */}
      {tab === 'logs' && (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Template</th>
                  <th>Destinatário</th>
                  <th>Assunto</th>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{l.template}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Mail size={13} color="#6b7280" /> {l.destinatario}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.assunto}</td>
                    <td style={{ color: '#6b7280' }}>{l.data}</td>
                    <td style={{ color: '#6b7280' }}>{l.hora}</td>
                    <td>
                      <span className={`pill pill-${l.status === 'delivered' ? 'completed' : l.status === 'sent' ? 'processing' : 'rejected'}`}>
                        {l.status === 'error' && <AlertTriangle size={12} style={{ marginRight: 4 }} />}
                        {statusLabels[l.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal criar/editar template */}
      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
            <div className="modal-head">
              <h3>{editId ? 'Editar Template' : 'Novo Template'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Nome do Template *</label>
                <input className="input" placeholder="Ex: Aviso de nova cotação" value={form.nome} onChange={(e) => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="field-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Gatilho *</label>
                  <select className="input" value={form.gatilho} onChange={(e) => setForm(p => ({ ...p, gatilho: e.target.value }))}>
                    <option value="">Selecione...</option>
                    <option>Nova solicitação criada</option>
                    <option>Solicitação aprovada</option>
                    <option>Solicitação rejeitada</option>
                    <option>Ordem aprovada</option>
                    <option>Nota fiscal importada</option>
                    <option>Cotação concluída</option>
                    <option>Diário (8h) se houver pendências</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Destinatários *</label>
                  <select className="input" value={form.destinatarios} onChange={(e) => setForm(p => ({ ...p, destinatarios: e.target.value }))}>
                    <option value="">Selecione...</option>
                    <option>Comprador responsável</option>
                    <option>Comprador + Gestor</option>
                    <option>Comprador + Financeiro</option>
                    <option>Aprovadores com pendências</option>
                    <option>Todos os compradores</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Assunto do E-mail *</label>
                <input className="input" placeholder="Use {codigo}, {fornecedor}, {valor} como variáveis" value={form.assunto} onChange={(e) => setForm(p => ({ ...p, assunto: e.target.value }))} />
              </div>
              <div className="field">
                <label className="field-label">Corpo do E-mail *</label>
                <textarea className="input" style={{ minHeight: 160, fontFamily: 'monospace', fontSize: 13 }} placeholder="Use variáveis como {comprador}, {codigo}, {setor}, {valor}, {fornecedor}..." value={form.corpo} onChange={(e) => setForm(p => ({ ...p, corpo: e.target.value }))} />
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                  Variáveis disponíveis: {'{comprador}'}, {'{codigo}'}, {'{setor}'}, {'{valor}'}, {'{fornecedor}'}, {'{descricao}'}, {'{prazo}'}, {'{numero}'}, {'{dataEmissao}'}, {'{vencedor}'}, {'{qtd}'}, {'{lista}'}
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvar}>
                <Save size={16} /> {editId ? 'Salvar Alterações' : 'Criar Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe Template */}
      {showDetailModal && (() => {
        const t = templates.find(x => x.id === showDetailModal)
        if (!t) return null
        return (
          <div className="overlay" onClick={() => setShowDetailModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-head">
                <h3>{t.nome}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Gatilho</label><span>{t.gatilho}</span></div>
                  <div className="detail-item"><label>Destinatários</label><span>{t.destinatarios}</span></div>
                  <div className="detail-item"><label>Status</label><span className={`pill pill-${t.ativo ? 'completed' : 'rejected'}`}>{t.ativo ? 'Ativo' : 'Inativo'}</span></div>
                  <div className="detail-item"><label>Total de Envios</label><span>{t.totalEnvios}</span></div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Assunto</label>
                  <div style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}>{t.assunto}</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Corpo do E-mail</label>
                  <pre style={{ padding: '12px 14px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.5, margin: 0 }}>{t.corpo}</pre>
                </div>
              </div>
              <div className="modal-foot">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
                <button className="btn btn-primary" onClick={() => { setShowDetailModal(null); handleEditar(t) }}>
                  <Edit3 size={16} /> Editar
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
