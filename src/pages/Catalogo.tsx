import { useState } from 'react'
import { Plus, Search, BookOpen, AlertTriangle, Layers, Wallet } from 'lucide-react'

interface Material {
  codigo: string
  descricao: string
  categoria: string
  unidade: string
  estoqueAtual: number
  estoqueMin: number
  precoMedio: string
  fornecedor: string
  curva: 'A' | 'B' | 'C'
}

const materiais: Material[] = [
  { codigo: 'MAT-1001', descricao: 'Monitor LED 27" Full HD', categoria: 'TI', unidade: 'UN', estoqueAtual: 4, estoqueMin: 6, precoMedio: 'R$ 1.620,00', fornecedor: 'Tech Solutions Ltda', curva: 'A' },
  { codigo: 'MAT-1002', descricao: 'Notebook Dell Latitude i7', categoria: 'TI', unidade: 'UN', estoqueAtual: 2, estoqueMin: 3, precoMedio: 'R$ 8.500,00', fornecedor: 'InfoShop Dist.', curva: 'A' },
  { codigo: 'MAT-2010', descricao: 'Papel Sulfite A4 75g (resma)', categoria: 'Escritório', unidade: 'CX', estoqueAtual: 120, estoqueMin: 50, precoMedio: 'R$ 24,90', fornecedor: 'Papelaria Central', curva: 'C' },
  { codigo: 'MAT-3005', descricao: 'Óleo Lubrificante Industrial 20L', categoria: 'Produção', unidade: 'GL', estoqueAtual: 8, estoqueMin: 15, precoMedio: 'R$ 126,00', fornecedor: 'Metal Parts Ind.', curva: 'B' },
  { codigo: 'MAT-3012', descricao: 'Rolamento Industrial 6205', categoria: 'Produção', unidade: 'UN', estoqueAtual: 45, estoqueMin: 20, precoMedio: 'R$ 38,50', fornecedor: 'Metal Parts Ind.', curva: 'B' },
  { codigo: 'MAT-4020', descricao: 'Embalagem Papelão Tipo A', categoria: 'Logística', unidade: 'UN', estoqueAtual: 890, estoqueMin: 300, precoMedio: 'R$ 3,20', fornecedor: 'Distribuidora ABC', curva: 'C' },
  { codigo: 'MAT-1050', descricao: 'Toner HP LaserJet 85A', categoria: 'Escritório', unidade: 'UN', estoqueAtual: 3, estoqueMin: 8, precoMedio: 'R$ 310,00', fornecedor: 'Papelaria Central', curva: 'B' },
  { codigo: 'MAT-5001', descricao: 'Material Gráfico Institucional', categoria: 'Marketing', unidade: 'KIT', estoqueAtual: 0, estoqueMin: 5, precoMedio: 'R$ 760,00', fornecedor: 'Gráfica Express', curva: 'C' },
]

const categorias = ['Todas', 'TI', 'Escritório', 'Produção', 'Logística', 'Marketing']

export default function Catalogo() {
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Todas')

  const filtered = materiais.filter((m) =>
    (cat === 'Todas' || m.categoria === cat) &&
    (m.descricao.toLowerCase().includes(search.toLowerCase()) || m.codigo.toLowerCase().includes(search.toLowerCase()))
  )
  const abaixoMin = materiais.filter((m) => m.estoqueAtual < m.estoqueMin).length

  return (
    <>
      <div className="page-head">
        <div>
          <div className="page-eyebrow">Cadastros</div>
          <h1 className="page-title">Catálogo de Materiais</h1>
          <p className="page-desc">Base única de itens utilizada em solicitações, cotações e ordens de compra, com classificação ABC e estoque mínimo</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary"><Plus size={16} /> Novo Material</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon green"><BookOpen size={19} /></div></div>
          <div className="kpi-value">{materiais.length}</div>
          <div className="kpi-label">Itens Ativos no Catálogo</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon blue"><Layers size={19} /></div></div>
          <div className="kpi-value">{categorias.length - 1}</div>
          <div className="kpi-label">Categorias</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon red"><AlertTriangle size={19} /></div></div>
          <div className="kpi-value">{abaixoMin}</div>
          <div className="kpi-label">Itens Abaixo do Mínimo</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top"><div className="kpi-icon amber"><Wallet size={19} /></div></div>
          <div className="kpi-value">R$ 412K</div>
          <div className="kpi-label">Valor Total em Estoque</div>
        </div>
      </div>

      <div className="filter-row">
        <div className="search" style={{ maxWidth: 380 }}>
          <Search className="search-icon" size={16} />
          <input type="text" placeholder="Buscar por código ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {categorias.map((c) => (
          <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Código</th><th>Descrição</th><th>Categoria</th><th>Un.</th><th>Estoque</th><th>Mínimo</th><th>Preço Médio</th><th>Últ. Fornecedor</th><th>Curva</th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.codigo}>
                  <td className="cell-code">{m.codigo}</td>
                  <td style={{ fontWeight: 500 }}>{m.descricao}</td>
                  <td className="muted">{m.categoria}</td>
                  <td className="muted">{m.unidade}</td>
                  <td className={m.estoqueAtual < m.estoqueMin ? 'cell-strong' : ''} style={m.estoqueAtual < m.estoqueMin ? { color: 'var(--red-600)' } : undefined}>{m.estoqueAtual}</td>
                  <td className="muted">{m.estoqueMin}</td>
                  <td className="cell-strong">{m.precoMedio}</td>
                  <td className="muted">{m.fornecedor}</td>
                  <td>
                    <span className="pill" style={{
                      background: m.curva === 'A' ? 'var(--red-100)' : m.curva === 'B' ? 'var(--amber-100)' : 'var(--gray-100)',
                      color: m.curva === 'A' ? 'var(--red-600)' : m.curva === 'B' ? 'var(--amber-600)' : 'var(--gray-500)',
                    }}>
                      Curva {m.curva}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
