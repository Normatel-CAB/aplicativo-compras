import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit3,
  Trash2,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Building2,
  Star,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { add, update, remove, subscribe, COLLECTIONS } from '../services/firestoreService'

interface Fornecedor {
  _id?: string
  id: number
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  telefone: string
  email: string
  cidade: string
  categoria: string
  status: string
  rating: number
  pedidos: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= Math.floor(rating) ? '#f59e0b' : 'none'}
          stroke={star <= Math.floor(rating) ? '#f59e0b' : '#d1d5db'}
        />
      ))}
      <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </div>
  )
}

interface FormData {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  inscricaoEstadual: string
  telefone: string
  email: string
  cidade: string
  estado: string
  endereco: string
  categoria: string
  observacoes: string
}

const initialForm: FormData = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  inscricaoEstadual: '',
  telefone: '',
  email: '',
  cidade: '',
  estado: '',
  endereco: '',
  categoria: '',
  observacoes: '',
}

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2')
  }
  return digits.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
}

export default function Fornecedores() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [form, setForm] = useState<FormData>(initialForm)
  const [cnpjStatus, setCnpjStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [cnpjMessage, setCnpjMessage] = useState('')
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe<Fornecedor>(COLLECTIONS.FORNECEDORES, (items) => {
      setFornecedores(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  async function handleCadastrar() {
    if (!form.razaoSocial.trim() && !form.cnpj.trim()) return

    const novo = {
      id: Date.now(),
      razaoSocial: form.razaoSocial || 'Sem razão social',
      nomeFantasia: form.nomeFantasia || form.razaoSocial || 'Sem nome',
      cnpj: form.cnpj,
      telefone: form.telefone,
      email: form.email,
      cidade: form.cidade && form.estado ? `${form.cidade} - ${form.estado}` : form.cidade || '',
      categoria: form.categoria || 'Outros',
      status: 'active',
      rating: 0,
      pedidos: 0,
    }

    await add(COLLECTIONS.FORNECEDORES, novo as unknown as Record<string, unknown>)
    setForm(initialForm)
    setCnpjStatus('idle')
    setCnpjMessage('')
    setShowModal(false)
  }

  function handleEditar(id: number) {
    const f = fornecedores.find(x => x.id === id)
    if (!f) return
    const cidadeParts = f.cidade.split(' - ')
    setForm({
      cnpj: f.cnpj,
      razaoSocial: f.razaoSocial,
      nomeFantasia: f.nomeFantasia,
      inscricaoEstadual: '',
      telefone: f.telefone,
      email: f.email,
      cidade: cidadeParts[0] || '',
      estado: cidadeParts[1] || '',
      endereco: '',
      categoria: f.categoria,
      observacoes: '',
    })
    setEditId(id)
    setCnpjStatus('idle')
    setCnpjMessage('')
    setShowModal(true)
  }

  async function handleSalvarEdicao() {
    if (!editId) return
    const f = fornecedores.find(x => x.id === editId)
    if (!f?._id) return
    await update(COLLECTIONS.FORNECEDORES, f._id, {
      razaoSocial: form.razaoSocial || f.razaoSocial,
      nomeFantasia: form.nomeFantasia || f.nomeFantasia,
      cnpj: form.cnpj || f.cnpj,
      telefone: form.telefone,
      email: form.email,
      cidade: form.cidade && form.estado ? `${form.cidade} - ${form.estado}` : form.cidade || f.cidade,
      categoria: form.categoria || f.categoria,
    })
    setForm(initialForm)
    setCnpjStatus('idle')
    setCnpjMessage('')
    setShowModal(false)
    setEditId(null)
  }

  async function handleExcluir(id: number) {
    const f = fornecedores.find(x => x.id === id)
    if (f?._id) await remove(COLLECTIONS.FORNECEDORES, f._id)
  }

  function handleExportar() {
    const header = 'Razão Social;Nome Fantasia;CNPJ;Telefone;Email;Cidade;Categoria;Status'
    const rows = fornecedores.map(f =>
      `${f.razaoSocial};${f.nomeFantasia};${f.cnpj};${f.telefone};${f.email};${f.cidade};${f.categoria};${f.status === 'active' ? 'Ativo' : 'Inativo'}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fornecedores.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleOpenModal() {
    setForm(initialForm)
    setCnpjStatus('idle')
    setCnpjMessage('')
    setEditId(null)
    setShowModal(true)
  }

  function updateForm(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function buscarCNPJ(cnpjRaw: string) {
    const digits = cnpjRaw.replace(/\D/g, '')
    if (digits.length !== 14) return

    setCnpjStatus('loading')
    setCnpjMessage('Consultando CNPJ...')

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${digits}`)
      if (!res.ok) throw new Error('CNPJ não encontrado')
      const data = await res.json()

      const ddd = data.ddd_telefone_1 ? data.ddd_telefone_1.replace(/\D/g, '') : ''

      setForm(prev => ({
        ...prev,
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        telefone: ddd ? formatPhone(ddd) : '',
        email: data.email || '',
        cidade: data.municipio || '',
        estado: data.uf || '',
        endereco: [
          data.descricao_tipo_de_logradouro,
          data.logradouro,
          data.numero,
          data.complemento,
          data.bairro,
        ].filter(Boolean).join(', '),
      }))

      setCnpjStatus('success')
      setCnpjMessage('Dados carregados com sucesso!')
    } catch {
      setCnpjStatus('error')
      setCnpjMessage('CNPJ não encontrado ou serviço indisponível.')
    }
  }

  function handleCnpjChange(value: string) {
    const formatted = formatCNPJ(value)
    updateForm('cnpj', formatted)
    setCnpjStatus('idle')
    setCnpjMessage('')

    const digits = formatted.replace(/\D/g, '')
    if (digits.length === 14) {
      buscarCNPJ(formatted)
    }
  }

  const filteredData = fornecedores.filter((f) =>
    f.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    f.nomeFantasia.toLowerCase().includes(search.toLowerCase()) ||
    f.cnpj.includes(search)
  )

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Fornecedores</h2>
          <p>Cadastro e gerenciamento de fornecedores para cotações e compras</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={16} /> Novo Fornecedor
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por razão social, nome fantasia ou CNPJ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={32} className="spin" color="#22c55e" />
            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Carregando fornecedores...</div>
          </div>
        ) : (
        <>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>CNPJ</th>
                <th>Contato</th>
                <th>Cidade</th>
                <th>Categoria</th>
                <th>Avaliação</th>
                <th>Pedidos</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{f.nomeFantasia}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{f.razaoSocial}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{f.cnpj}</td>
                  <td>
                    <div style={{ fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                        <Phone size={12} color="#6b7280" /> {f.telefone}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#6b7280' }}>
                        <Mail size={12} /> {f.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={14} color="#6b7280" /> {f.cidade}
                    </div>
                  </td>
                  <td>{f.categoria}</td>
                  <td><StarRating rating={f.rating} /></td>
                  <td style={{ fontWeight: 600 }}>{f.pedidos}</td>
                  <td><span className={`status-badge ${f.status}`}>{f.status === 'active' ? 'Ativo' : 'Inativo'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Visualizar" onClick={() => setShowDetailModal(f.id)}><Eye size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => handleEditar(f.id)}><Edit3 size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Excluir" style={{ color: '#ef4444' }} onClick={() => handleExcluir(f.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <div className="pagination-info">Mostrando {filteredData.length} de {fornecedores.length} fornecedores</div>
          <div className="pagination-buttons">
            <button className="pagination-btn active">1</button>
          </div>
        </div>
        </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>{editId ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* CNPJ - campo principal com busca automática */}
              <div className="form-group">
                <label className="form-label">CNPJ</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={(e) => handleCnpjChange(e.target.value)}
                    style={{
                      paddingRight: 44,
                      borderColor: cnpjStatus === 'success' ? '#22c55e' : cnpjStatus === 'error' ? '#ef4444' : undefined,
                    }}
                  />
                  <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                    {cnpjStatus === 'loading' && <Loader2 size={18} color="#22c55e" style={{ animation: 'spin 1s linear infinite' }} />}
                    {cnpjStatus === 'success' && <CheckCircle2 size={18} color="#22c55e" />}
                    {cnpjStatus === 'error' && <AlertCircle size={18} color="#ef4444" />}
                  </div>
                </div>
                {cnpjMessage && (
                  <div style={{
                    marginTop: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: cnpjStatus === 'success' ? '#16a34a' : cnpjStatus === 'error' ? '#dc2626' : '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    {cnpjStatus === 'loading' && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
                    {cnpjMessage}
                  </div>
                )}
              </div>

              {cnpjStatus === 'success' && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '10px 14px',
                  marginBottom: 16,
                  fontSize: 13,
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <CheckCircle2 size={16} />
                  Campos preenchidos automaticamente via CNPJ. Confira e ajuste se necessário.
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Razão Social</label>
                  <input className="form-input" type="text" placeholder="Razão social completa" value={form.razaoSocial} onChange={(e) => updateForm('razaoSocial', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Nome Fantasia</label>
                  <input className="form-input" type="text" placeholder="Nome fantasia" value={form.nomeFantasia} onChange={(e) => updateForm('nomeFantasia', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Inscrição Estadual</label>
                <input className="form-input" type="text" placeholder="Inscrição estadual" value={form.inscricaoEstadual} onChange={(e) => updateForm('inscricaoEstadual', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input className="form-input" type="text" placeholder="(00) 0000-0000" value={form.telefone} onChange={(e) => updateForm('telefone', formatPhone(e.target.value))} />
                </div>
                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input className="form-input" type="email" placeholder="email@fornecedor.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                </div>
              </div>
              {form.endereco && (
                <div className="form-group">
                  <label className="form-label">Endereço</label>
                  <input className="form-input" type="text" value={form.endereco} onChange={(e) => updateForm('endereco', e.target.value)} />
                </div>
              )}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" type="text" placeholder="Cidade" value={form.cidade} onChange={(e) => updateForm('cidade', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" value={form.estado} onChange={(e) => updateForm('estado', e.target.value)}>
                    <option value="">Selecione...</option>
                    <option>AC</option><option>AL</option><option>AP</option><option>AM</option>
                    <option>BA</option><option>CE</option><option>DF</option><option>ES</option>
                    <option>GO</option><option>MA</option><option>MT</option><option>MS</option>
                    <option>MG</option><option>PA</option><option>PB</option><option>PR</option>
                    <option>PE</option><option>PI</option><option>RJ</option><option>RN</option>
                    <option>RS</option><option>RO</option><option>RR</option><option>SC</option>
                    <option>SP</option><option>SE</option><option>TO</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-select" value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)}>
                  <option value="">Selecione...</option>
                  <option>Tecnologia</option>
                  <option>Material Escritório</option>
                  <option>Indústria</option>
                  <option>Distribuição</option>
                  <option>Elétrica</option>
                  <option>Química</option>
                  <option>Serviços</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea className="form-textarea" placeholder="Dados adicionais sobre o fornecedor..." value={form.observacoes} onChange={(e) => updateForm('observacoes', e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={editId ? handleSalvarEdicao : handleCadastrar}>{editId ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {showDetailModal && (() => {
        const f = fornecedores.find(x => x.id === showDetailModal)
        if (!f) return null
        return (
          <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
            <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
              <div className="modal-header">
                <h3>{f.nomeFantasia}</h3>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}><XCircle size={20} /></button>
              </div>
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item"><label>Razão Social</label><span>{f.razaoSocial}</span></div>
                  <div className="detail-item"><label>Nome Fantasia</label><span>{f.nomeFantasia}</span></div>
                  <div className="detail-item"><label>CNPJ</label><span>{f.cnpj}</span></div>
                  <div className="detail-item"><label>Telefone</label><span>{f.telefone || '-'}</span></div>
                  <div className="detail-item"><label>E-mail</label><span>{f.email || '-'}</span></div>
                  <div className="detail-item"><label>Cidade</label><span>{f.cidade || '-'}</span></div>
                  <div className="detail-item"><label>Categoria</label><span>{f.categoria}</span></div>
                  <div className="detail-item"><label>Status</label><span className={`status-badge ${f.status}`}>{f.status === 'active' ? 'Ativo' : 'Inativo'}</span></div>
                  <div className="detail-item"><label>Avaliação</label><span>{f.rating.toFixed(1)}</span></div>
                  <div className="detail-item"><label>Pedidos</label><span>{f.pedidos}</span></div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
                <button className="btn btn-primary" onClick={() => { setShowDetailModal(null); handleEditar(f.id) }}>Editar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
