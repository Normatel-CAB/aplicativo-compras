import { useState } from 'react'
import {
  Plus,
  Search,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
  Clock,
  Mail,
  Star,
} from 'lucide-react'

const cotacoesData = [
  {
    id: 'COT-0090',
    descricao: '10x Monitor LED 27" Full HD',
    solicitacao: 'SC-0523',
    status: 'open',
    dataAbertura: '05/04/2026',
    dataEncerramento: '10/04/2026',
    respostas: 3,
    melhorPreco: 'R$ 16.200,00',
    fornecedores: [
      { nome: 'Tech Solutions Ltda', valor: 'R$ 16.200,00', prazo: '10 dias', pagamento: '30/60 dias', melhor: true },
      { nome: 'InfoShop Dist.', valor: 'R$ 17.500,00', prazo: '7 dias', pagamento: '30 dias', melhor: false },
      { nome: 'NovaTech', valor: 'R$ 18.100,00', prazo: '15 dias', pagamento: 'À vista', melhor: false },
    ],
  },
  {
    id: 'COT-0089',
    descricao: 'Material gráfico campanha institucional',
    solicitacao: 'SC-0522',
    status: 'open',
    dataAbertura: '04/04/2026',
    dataEncerramento: '09/04/2026',
    respostas: 2,
    melhorPreco: 'R$ 3.800,00',
    fornecedores: [
      { nome: 'Gráfica Express', valor: 'R$ 3.800,00', prazo: '5 dias', pagamento: '30 dias', melhor: true },
      { nome: 'PrintMaster', valor: 'R$ 4.200,00', prazo: '3 dias', pagamento: 'À vista', melhor: false },
    ],
  },
  {
    id: 'COT-0088',
    descricao: 'Peças de reposição máquina CNC',
    solicitacao: 'SC-0521',
    status: 'completed',
    dataAbertura: '01/04/2026',
    dataEncerramento: '05/04/2026',
    respostas: 4,
    melhorPreco: 'R$ 28.900,00',
    fornecedores: [
      { nome: 'Metal Parts Ind.', valor: 'R$ 28.900,00', prazo: '12 dias', pagamento: '30/60/90 dias', melhor: true },
      { nome: 'Peças Brasil', valor: 'R$ 31.200,00', prazo: '8 dias', pagamento: '30/60 dias', melhor: false },
      { nome: 'IndMaq', valor: 'R$ 29.800,00', prazo: '15 dias', pagamento: '30 dias', melhor: false },
      { nome: 'TechParts', valor: 'R$ 32.500,00', prazo: '5 dias', pagamento: 'À vista', melhor: false },
    ],
  },
  {
    id: 'COT-0087',
    descricao: 'Embalagens tipo A e B',
    solicitacao: 'SC-0518',
    status: 'completed',
    dataAbertura: '28/03/2026',
    dataEncerramento: '02/04/2026',
    respostas: 3,
    melhorPreco: 'R$ 7.650,00',
    fornecedores: [
      { nome: 'Distribuidora ABC', valor: 'R$ 7.650,00', prazo: '5 dias', pagamento: '30 dias', melhor: true },
      { nome: 'PackPro', valor: 'R$ 8.100,00', prazo: '7 dias', pagamento: '30/60 dias', melhor: false },
      { nome: 'Embalart', valor: 'R$ 9.200,00', prazo: '3 dias', pagamento: 'À vista', melhor: false },
    ],
  },
]

const statusLabels: Record<string, string> = {
  open: 'Aberta',
  completed: 'Encerrada',
  canceled: 'Cancelada',
}

export default function Cotacoes() {
  const [selectedCotacao, setSelectedCotacao] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filteredData = cotacoesData.filter((c) =>
    c.descricao.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const detail = selectedCotacao ? cotacoesData.find(c => c.id === selectedCotacao) : null

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Cotações</h2>
          <p>Controle de cotações automáticas enviadas a fornecedores – integrado ao Fast Supply</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={16} /> Nova Cotação
          </button>
        </div>
      </div>

      {/* info banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        border: '1px solid #bbf7d0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: '#22c55e', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Mail size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#166534', marginBottom: 4 }}>Envio Automático de Cotações</div>
          <div style={{ fontSize: 13, color: '#15803d' }}>
            As cotações são enviadas automaticamente por e-mail para os fornecedores cadastrados na categoria do produto. O sistema sugere a melhor compra baseando-se no melhor preço, forma de pagamento e prazo de entrega.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar cotações..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: detail ? '1fr 1fr' : '1fr', gap: 24 }}>
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descrição</th>
                  <th>Respostas</th>
                  <th>Melhor Preço</th>
                  <th>Encerra em</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCotacao(c.id)}
                    style={{ cursor: 'pointer', background: selectedCotacao === c.id ? '#f0fdf4' : undefined }}
                  >
                    <td style={{ fontWeight: 600, color: '#16a34a' }}>{c.id}</td>
                    <td>{c.descricao}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{c.respostas}</span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}> fornecedores</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#16a34a' }}>{c.melhorPreco}</td>
                    <td style={{ color: '#6b7280', fontSize: 13 }}>{c.dataEncerramento}</td>
                    <td><span className={`status-badge ${c.status === 'open' ? 'processing' : 'completed'}`}>{statusLabels[c.status]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {detail && (
          <div className="card fade-in">
            <div className="card-header">
              <div>
                <span className="card-title">{detail.id} - Comparativo</span>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{detail.descricao}</div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setSelectedCotacao(null)}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="card-body">
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                Propostas dos Fornecedores
              </div>
              {detail.fornecedores.map((f, i) => (
                <div
                  key={i}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: `2px solid ${f.melhor ? '#22c55e' : '#e5e7eb'}`,
                    background: f.melhor ? '#f0fdf4' : 'white',
                    marginBottom: 12,
                    position: 'relative',
                  }}
                >
                  {f.melhor && (
                    <div style={{
                      position: 'absolute', top: -10, right: 12,
                      background: '#22c55e', color: 'white',
                      padding: '2px 10px', borderRadius: 10,
                      fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Trophy size={12} /> MELHOR OPÇÃO
                    </div>
                  )}
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{f.nome}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Valor</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: f.melhor ? '#16a34a' : '#111827' }}>{f.valor}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Prazo</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{f.prazo}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>Pagamento</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{f.pagamento}</div>
                    </div>
                  </div>
                </div>
              ))}
              {detail.status === 'open' && (
                <button className="btn btn-primary" style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}>
                  <CheckCircle2 size={16} /> Aprovar Melhor Opção e Gerar OC
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
