import { useState } from 'react'
import {
  Plus,
  Search,
  FolderKanban,
  Eye,
  MoreHorizontal,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const projetosData = [
  {
    id: 'PRJ-001',
    nome: 'Expansão Fábrica',
    responsavel: 'Roberto Gomes',
    orcamento: 'R$ 500.000,00',
    gasto: 'R$ 312.000,00',
    percentual: 62,
    status: 'active',
    ordens: 28,
    inicio: '01/01/2026',
    previsao: '30/06/2026',
  },
  {
    id: 'PRJ-002',
    nome: 'Reforma Escritório',
    responsavel: 'Carla Dias',
    orcamento: 'R$ 150.000,00',
    gasto: 'R$ 98.500,00',
    percentual: 66,
    status: 'active',
    ordens: 15,
    inicio: '15/02/2026',
    previsao: '30/04/2026',
  },
  {
    id: 'PRJ-003',
    nome: 'Novo Produto X',
    responsavel: 'Marcos Oliveira',
    orcamento: 'R$ 250.000,00',
    gasto: 'R$ 45.000,00',
    percentual: 18,
    status: 'active',
    ordens: 8,
    inicio: '01/03/2026',
    previsao: '31/12/2026',
  },
  {
    id: 'PRJ-004',
    nome: 'Atualização TI',
    responsavel: 'Carlos Silva',
    orcamento: 'R$ 80.000,00',
    gasto: 'R$ 78.000,00',
    percentual: 98,
    status: 'completed',
    ordens: 12,
    inicio: '01/10/2025',
    previsao: '31/03/2026',
  },
]

const allocationData = [
  { projeto: 'Exp. Fábrica', valor: 312000 },
  { projeto: 'Ref. Escritório', valor: 98500 },
  { projeto: 'Novo Prod. X', valor: 45000 },
  { projeto: 'Atualiz. TI', valor: 78000 },
]

export default function Projetos() {
  const [search, setSearch] = useState('')

  const filteredData = projetosData.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Alocação por Projetos</h2>
          <p>Controle de compras alocadas por projeto com acompanhamento de orçamento</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={16} /> Novo Projeto
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Gastos por Projeto</span>
        </div>
        <div className="card-body" style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={allocationData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `R$ ${v / 1000}K`} />
              <YAxis type="category" dataKey="projeto" fontSize={12} tickLine={false} axisLine={false} width={100} />
              <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Valor Gasto']} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="valor" fill="#22c55e" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 400 }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 20 }}>
        {filteredData.map((p) => (
          <div key={p.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: p.status === 'active' ? '#f0fdf4' : '#f3f4f6',
                    color: p.status === 'active' ? '#16a34a' : '#6b7280',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FolderKanban size={22} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.nome}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{p.id} • {p.responsavel}</div>
                  </div>
                </div>
                <span className={`status-badge ${p.status === 'active' ? 'active' : 'completed'}`}>
                  {p.status === 'active' ? 'Em Andamento' : 'Concluído'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Orçamento utilizado</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.percentual > 90 ? '#dc2626' : '#16a34a' }}>
                  {p.percentual}%
                </span>
              </div>
              <div className="progress-bar" style={{ marginBottom: 16 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${p.percentual}%`,
                    background: p.percentual > 90
                      ? 'linear-gradient(90deg, #f87171, #ef4444)'
                      : p.percentual > 70
                        ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                        : undefined,
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Orçamento</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.orcamento}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Gasto</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>{p.gasto}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', fontWeight: 600 }}>Ordens</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.ordens}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #e5e7eb', fontSize: 12, color: '#6b7280' }}>
                <span>Início: {p.inicio}</span>
                <span>Previsão: {p.previsao}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
