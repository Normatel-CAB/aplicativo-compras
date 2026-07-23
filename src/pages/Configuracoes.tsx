import { useState, useEffect } from 'react'
import {
  Save,
  Shield,
  DollarSign,
  Building2,
  Plus,
  Edit3,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { add, update, subscribe, getAll, COLLECTIONS } from '../services/firestoreService'

interface Setor {
  _id?: string
  id: number
  setor: string
  limiteCompra: string
  limiteAprovacao: string
  responsavel: string
  status: string
}

interface Alcada {
  _id?: string
  id: number
  nivel: string
  faixaMin: string
  faixaMax: string
  aprovador: string
  tempoSLA: string
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('limites')
  const [setores, setSetores] = useState<Setor[]>([])
  const [alcadas, setAlcadas] = useState<Alcada[]>([])
  const [showSetorModal, setShowSetorModal] = useState(false)
  const [editSetor, setEditSetor] = useState<number | null>(null)
  const [setorForm, setSetorForm] = useState({ setor: '', limiteCompra: '', limiteAprovacao: '', responsavel: '' })
  const [showAlcadaModal, setShowAlcadaModal] = useState(false)
  const [editAlcada, setEditAlcada] = useState<number | null>(null)
  const [alcadaForm, setAlcadaForm] = useState({ nivel: '', faixaMin: '', faixaMax: '', aprovador: '', tempoSLA: '' })
  const [configSaved, setConfigSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const [configGeral, setConfigGeral] = useState({
    nomeEmpresa: 'Empresa Modelo S.A.',
    cnpj: '00.000.000/0001-00',
    inscricaoEstadual: '123.456.789.000',
    emailCotacoes: 'compras@empresa.com.br',
    prazoCotacoes: '5',
    moeda: 'BRL',
  })
  const [configDocId, setConfigDocId] = useState<string | null>(null)

  useEffect(() => {
    const unsub1 = subscribe<Setor>(COLLECTIONS.CONFIG_SETORES, (items) => {
      setSetores(items)
      setLoading(false)
    })
    const unsub2 = subscribe<Alcada>(COLLECTIONS.CONFIG_ALCADAS, (items) => {
      setAlcadas(items)
    })
    // Load general config
    getAll<{ _id?: string; nomeEmpresa: string; cnpj: string; inscricaoEstadual: string; emailCotacoes: string; prazoCotacoes: string; moeda: string }>(COLLECTIONS.CONFIG).then(items => {
      if (items.length > 0) {
        const c = items[0]
        setConfigGeral({ nomeEmpresa: c.nomeEmpresa, cnpj: c.cnpj, inscricaoEstadual: c.inscricaoEstadual, emailCotacoes: c.emailCotacoes, prazoCotacoes: c.prazoCotacoes, moeda: c.moeda })
        setConfigDocId(c._id || null)
      }
    })
    return () => { unsub1(); unsub2() }
  }, [])

  function handleOpenSetorModal(id?: number) {
    if (id) {
      const s = setores.find(x => x.id === id)
      if (s) {
        setSetorForm({ setor: s.setor, limiteCompra: s.limiteCompra, limiteAprovacao: s.limiteAprovacao, responsavel: s.responsavel })
        setEditSetor(id)
      }
    } else {
      setSetorForm({ setor: '', limiteCompra: '', limiteAprovacao: '', responsavel: '' })
      setEditSetor(null)
    }
    setShowSetorModal(true)
  }

  async function handleSalvarSetor() {
    if (!setorForm.setor.trim()) return
    if (editSetor) {
      const s = setores.find(x => x.id === editSetor)
      if (s?._id) await update(COLLECTIONS.CONFIG_SETORES, s._id, setorForm)
    } else {
      await add(COLLECTIONS.CONFIG_SETORES, { id: Date.now(), ...setorForm, status: 'active' })
    }
    setShowSetorModal(false)
  }

  function handleOpenAlcadaModal(id?: number) {
    if (id) {
      const a = alcadas.find(x => x.id === id)
      if (a) {
        setAlcadaForm({ nivel: a.nivel, faixaMin: a.faixaMin, faixaMax: a.faixaMax, aprovador: a.aprovador, tempoSLA: a.tempoSLA })
        setEditAlcada(id)
      }
    } else {
      setAlcadaForm({ nivel: '', faixaMin: '', faixaMax: '', aprovador: '', tempoSLA: '' })
      setEditAlcada(null)
    }
    setShowAlcadaModal(true)
  }

  async function handleSalvarAlcada() {
    if (!alcadaForm.nivel.trim()) return
    if (editAlcada) {
      const a = alcadas.find(x => x.id === editAlcada)
      if (a?._id) await update(COLLECTIONS.CONFIG_ALCADAS, a._id, alcadaForm)
    } else {
      await add(COLLECTIONS.CONFIG_ALCADAS, { id: Date.now(), ...alcadaForm })
    }
    setShowAlcadaModal(false)
  }

  async function handleSalvarConfig() {
    if (configDocId) {
      await update(COLLECTIONS.CONFIG, configDocId, configGeral)
    } else {
      const id = await add(COLLECTIONS.CONFIG, configGeral as unknown as Record<string, unknown>)
      setConfigDocId(id)
    }
    setConfigSaved(true)
    setTimeout(() => setConfigSaved(false), 3000)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Sistema</div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-desc">Definição de limites de compra por setor e alçadas de aprovação</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'limites' ? 'active' : ''}`} onClick={() => setActiveTab('limites')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={16} /> Limites por Setor
          </span>
        </button>
        <button className={`tab ${activeTab === 'alcadas' ? 'active' : ''}`} onClick={() => setActiveTab('alcadas')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Shield size={16} /> Alçadas de Aprovação
          </span>
        </button>
        <button className={`tab ${activeTab === 'geral' ? 'active' : ''}`} onClick={() => setActiveTab('geral')}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={16} /> Geral
          </span>
        </button>
      </div>

      {activeTab === 'limites' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Limites de Compra por Setor</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                Defina o valor máximo de compra que cada setor pode solicitar por mês
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenSetorModal()}>
              <Plus size={14} /> Novo Setor
            </button>
          </div>

          <div className="panel">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Setor</th>
                    <th>Limite Mensal de Compra</th>
                    <th>Limite Aprovação Direta</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {setores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Building2 size={16} color="#16a34a" /> {s.setor}
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: '#16a34a' }}>{s.limiteCompra}</td>
                      <td style={{ fontWeight: 600 }}>{s.limiteAprovacao}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #86efac, #22c55e)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: 11, fontWeight: 700,
                          }}>
                            {s.responsavel.split(' ').map(n => n[0]).join('')}
                          </div>
                          {s.responsavel}
                        </div>
                      </td>
                      <td><span className="pill pill-active">Ativo</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleOpenSetorModal(s.id)}><Edit3 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alcadas' && (
        <div className="fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Alçadas de Aprovação</h3>
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                Configure os níveis hierárquicos de aprovação baseados no valor da compra
              </p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => handleOpenAlcadaModal()}>
              <Plus size={14} /> Nova Alçada
            </button>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {alcadas.map((a) => (
              <div key={a.id} className="panel">
                <div className="panel-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 12,
                    background: `linear-gradient(135deg, ${a.id === 1 ? '#dcfce7' : a.id === 2 ? '#dbeafe' : a.id === 3 ? '#fef3c7' : '#fee2e2'}, ${a.id === 1 ? '#bbf7d0' : a.id === 2 ? '#bfdbfe' : a.id === 3 ? '#fde68a' : '#fecaca'})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Shield size={24} color={a.id === 1 ? '#16a34a' : a.id === 2 ? '#2563eb' : a.id === 3 ? '#d97706' : '#dc2626'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{a.nivel}</div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>
                      Faixa: <strong>{a.faixaMin}</strong> até <strong>{a.faixaMax}</strong>
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 24px' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Aprovador</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{a.aprovador}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '0 24px', borderLeft: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>SLA</div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: '#16a34a' }}>{a.tempoSLA}</div>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleOpenAlcadaModal(a.id)}><Edit3 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'geral' && (
        <div className="fade-in">
          <div className="panel">
            <div className="panel-head">
              <span className="panel-title">Configurações Gerais</span>
            </div>
            <div className="panel-body">
              <div className="field">
                <label className="field-label">Nome da Empresa</label>
                <input className="input" type="text" value={configGeral.nomeEmpresa} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, nomeEmpresa: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">CNPJ</label>
                  <input className="input" type="text" value={configGeral.cnpj} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, cnpj: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Inscrição Estadual</label>
                  <input className="input" type="text" value={configGeral.inscricaoEstadual} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, inscricaoEstadual: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">E-mail para Cotações</label>
                <input className="input" type="email" value={configGeral.emailCotacoes} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, emailCotacoes: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Prazo Padrão para Cotações (dias)</label>
                  <input className="input" type="number" value={configGeral.prazoCotacoes} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, prazoCotacoes: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Moeda Padrão</label>
                  <select className="input" value={configGeral.moeda} onChange={(e) => setConfigGeral((p: typeof configGeral) => ({ ...p, moeda: e.target.value }))}>
                    <option value="BRL">BRL - Real Brasileiro</option>
                    <option value="USD">USD - Dólar Americano</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: '#166534' }}>
                  <strong>Integração Fast Supply ativa.</strong> As cotações serão enviadas automaticamente
                  para fornecedores cadastrados nas categorias dos produtos solicitados.
                </div>
              </div>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12 }}>
                {configSaved && (
                  <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> Salvo com sucesso!
                  </span>
                )}
                <button className="btn btn-primary" onClick={handleSalvarConfig}>
                  <Save size={16} /> Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Setor */}
      {showSetorModal && (
        <div className="overlay" onClick={() => setShowSetorModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <h3>{editSetor ? 'Editar Setor' : 'Novo Setor'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowSetorModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Setor *</label>
                <input className="input" type="text" placeholder="Nome do setor" value={setorForm.setor} onChange={(e) => setSetorForm(p => ({ ...p, setor: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Limite Mensal</label>
                  <input className="input" type="text" placeholder="R$ 0,00" value={setorForm.limiteCompra} onChange={(e) => setSetorForm(p => ({ ...p, limiteCompra: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Limite Aprovação</label>
                  <input className="input" type="text" placeholder="R$ 0,00" value={setorForm.limiteAprovacao} onChange={(e) => setSetorForm(p => ({ ...p, limiteAprovacao: e.target.value }))} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Responsável</label>
                <input className="input" type="text" placeholder="Nome do responsável" value={setorForm.responsavel} onChange={(e) => setSetorForm(p => ({ ...p, responsavel: e.target.value }))} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowSetorModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvarSetor}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alçada */}
      {showAlcadaModal && (
        <div className="overlay" onClick={() => setShowAlcadaModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-head">
              <h3>{editAlcada ? 'Editar Alçada' : 'Nova Alçada'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowAlcadaModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label className="field-label">Nível *</label>
                <input className="input" type="text" placeholder="Ex: Nível 5" value={alcadaForm.nivel} onChange={(e) => setAlcadaForm(p => ({ ...p, nivel: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Faixa Mínima</label>
                  <input className="input" type="text" placeholder="R$ 0" value={alcadaForm.faixaMin} onChange={(e) => setAlcadaForm(p => ({ ...p, faixaMin: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">Faixa Máxima</label>
                  <input className="input" type="text" placeholder="R$ 0" value={alcadaForm.faixaMax} onChange={(e) => setAlcadaForm(p => ({ ...p, faixaMax: e.target.value }))} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Aprovador</label>
                  <input className="input" type="text" placeholder="Cargo/Nome" value={alcadaForm.aprovador} onChange={(e) => setAlcadaForm(p => ({ ...p, aprovador: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="field-label">SLA</label>
                  <input className="input" type="text" placeholder="Ex: 24h" value={alcadaForm.tempoSLA} onChange={(e) => setAlcadaForm(p => ({ ...p, tempoSLA: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowAlcadaModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSalvarAlcada}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
