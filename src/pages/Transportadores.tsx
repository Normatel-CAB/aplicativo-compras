import { useState } from 'react'
import {
  Plus,
  Search,
  Eye,
  Edit3,
  Truck,
  Phone,
  Mail,
  MapPin,
  XCircle,
} from 'lucide-react'

const transportadoresData = [
  { id: 1, razaoSocial: 'TransLog Express Ltda', nomeFantasia: 'TransLog', cnpj: '12.333.444/0001-55', telefone: '(11) 4444-5555', email: 'operacao@translog.com.br', cidade: 'São Paulo - SP', tipoFrete: 'CIF/FOB', status: 'active', entregas: 89 },
  { id: 2, razaoSocial: 'Rápido Transportes S.A.', nomeFantasia: 'Rápido Trans', cnpj: '22.444.555/0001-77', telefone: '(11) 5555-6666', email: 'logistica@rapidotrans.com.br', cidade: 'Osasco - SP', tipoFrete: 'CIF', status: 'active', entregas: 124 },
  { id: 3, razaoSocial: 'Veloz Cargas ME', nomeFantasia: 'Veloz Cargas', cnpj: '33.555.666/0001-99', telefone: '(19) 6666-7777', email: 'contato@velozcargas.com.br', cidade: 'Campinas - SP', tipoFrete: 'FOB', status: 'active', entregas: 45 },
  { id: 4, razaoSocial: 'Nacional Logística Ltda', nomeFantasia: 'Nacional Log', cnpj: '44.666.777/0001-11', telefone: '(21) 7777-8888', email: 'operacoes@nacionallog.com.br', cidade: 'Rio de Janeiro - RJ', tipoFrete: 'CIF/FOB', status: 'inactive', entregas: 32 },
  { id: 5, razaoSocial: 'Sul Express Transportadora', nomeFantasia: 'Sul Express', cnpj: '55.777.888/0001-33', telefone: '(41) 8888-9999', email: 'frete@sulexpress.com.br', cidade: 'Curitiba - PR', tipoFrete: 'CIF', status: 'active', entregas: 67 },
]

export default function Transportadores() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filteredData = transportadoresData.filter((t) =>
    t.razaoSocial.toLowerCase().includes(search.toLowerCase()) ||
    t.nomeFantasia.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Cadastros</div>
          <h1 className="page-title">Transportadores</h1>
          <p className="page-desc">Cadastro e controle de transportadoras vinculadas às compras</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Novo Transportador
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar transportadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filteredData.map((t) => (
          <div key={t.id} className="panel" style={{ transition: 'all 0.2s ease' }}>
            <div className="panel-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: t.status === 'active' ? '#f0fdf4' : '#f3f4f6',
                    color: t.status === 'active' ? '#16a34a' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Truck size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{t.nomeFantasia}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{t.razaoSocial}</div>
                  </div>
                </div>
                <span className={`pill pill-${t.status}`}>{t.status === 'active' ? 'Ativo' : 'Inativo'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
                  <Phone size={14} color="#9ca3af" /> {t.telefone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
                  <Mail size={14} color="#9ca3af" /> {t.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4b5563' }}>
                  <MapPin size={14} color="#9ca3af" /> {t.cidade}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Frete</div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{t.tipoFrete}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Entregas</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{t.entregas}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-ghost btn-icon btn-sm"><Eye size={16} /></button>
                  <button className="btn btn-ghost btn-icon btn-sm"><Edit3 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Novo Transportador</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Razão Social</label>
                  <input className="input" type="text" placeholder="Razão social" />
                </div>
                <div className="field">
                  <label className="field-label">Nome Fantasia</label>
                  <input className="input" type="text" placeholder="Nome fantasia" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">CNPJ</label>
                  <input className="input" type="text" placeholder="00.000.000/0000-00" />
                </div>
                <div className="field">
                  <label className="field-label">Tipo de Frete</label>
                  <select className="input">
                    <option>CIF</option>
                    <option>FOB</option>
                    <option>CIF/FOB</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Telefone</label>
                  <input className="input" type="text" placeholder="(00) 0000-0000" />
                </div>
                <div className="field">
                  <label className="field-label">E-mail</label>
                  <input className="input" type="email" placeholder="email@transportador.com" />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field-label">Cidade</label>
                  <input className="input" type="text" placeholder="Cidade" />
                </div>
                <div className="field">
                  <label className="field-label">Estado</label>
                  <select className="input">
                    <option>Selecione...</option>
                    <option>SP</option><option>RJ</option><option>MG</option><option>PR</option><option>SC</option><option>RS</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setShowModal(false)}>Cadastrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
