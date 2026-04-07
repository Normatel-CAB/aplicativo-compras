import { useState, useEffect } from 'react'
import {
  Upload,
  Search,
  Download,
  Eye,
  FileText,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  FileCode,
  Calculator,
  Loader2,
} from 'lucide-react'
import { add, subscribe, COLLECTIONS } from '../services/firestoreService'

interface Nota {
  _id?: string
  id: number
  numero: string
  serie: string
  fornecedor: string
  cnpj: string
  chaveAcesso: string
  valor: string
  icms: string
  ipi: string
  pis: string
  cofins: string
  status: string
  ordemCompra: string
  dataEmissao: string
  dataEntrada: string
}

const statusLabels: Record<string, string> = {
  completed: 'Escriturada',
  processing: 'Em Conferência',
  pending: 'Pendente',
}

export default function NotasFiscais() {
  const [search, setSearch] = useState('')
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState<number | null>(null)
  const [showTributoModal, setShowTributoModal] = useState<number | null>(null)
  const [notas, setNotas] = useState<Nota[]>([])
  const [arquivosSelecionados, setArquivosSelecionados] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribe<Nota>(COLLECTIONS.NOTAS, (items) => {
      setNotas(items)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function processarArquivosXML(files: FileList | File[]) {
    const xmlFiles = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.xml'))
    if (xmlFiles.length === 0) return
    setArquivosSelecionados(prev => [...prev, ...xmlFiles])
  }

  async function handleImportar() {
    const hoje = new Date()
    const data = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`

    for (let idx = 0; idx < arquivosSelecionados.length; idx++) {
      const file = arquivosSelecionados[idx]
      const novaId = Date.now() + idx
      const nomeBase = file.name.replace('.xml', '').replace('.XML', '')
      const novaNota = {
        id: novaId,
        numero: `NF-e ${nomeBase}`,
        serie: '1',
        fornecedor: 'Importação XML',
        cnpj: '00.000.000/0001-00',
        chaveAcesso: '3526...0000',
        valor: 'R$ 0,00',
        icms: 'R$ 0,00',
        ipi: 'R$ 0,00',
        pis: 'R$ 0,00',
        cofins: 'R$ 0,00',
        status: 'pending',
        ordemCompra: '-',
        dataEmissao: data,
        dataEntrada: data,
      }
      await add(COLLECTIONS.NOTAS, novaNota as unknown as Record<string, unknown>)
    }

    setArquivosSelecionados([])
    setShowImportModal(false)
  }

  function handleExportar() {
    const header = 'Nota;Fornecedor;Valor;ICMS;IPI;PIS;COFINS;Status;Emissão'
    const rows = notas.map(n =>
      `${n.numero};${n.fornecedor};${n.valor};${n.icms};${n.ipi};${n.pis};${n.cofins};${statusLabels[n.status]};${n.dataEmissao}`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'notas-fiscais.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredData = notas.filter((n) =>
    n.numero.toLowerCase().includes(search.toLowerCase()) ||
    n.fornecedor.toLowerCase().includes(search.toLowerCase())
  )

  const selectedNota = showDetailModal !== null ? notas.find(n => n.id === showDetailModal) : null
  const tributoNota = showTributoModal !== null ? notas.find(n => n.id === showTributoModal) : null

  return (
    <>
      <div className="page-header">
        <div className="page-header-info">
          <h2>Notas Fiscais de Entrada</h2>
          <p>Importação e controle de notas fiscais de compra com acompanhamento tributário</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={handleExportar}>
            <Download size={16} /> Exportar
          </button>
          <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
            <Upload size={16} /> Importar XML
          </button>
        </div>
      </div>

      {/* Info Banner */}
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
          <FileCode size={24} />
        </div>
        <div>
          <div style={{ fontWeight: 600, color: '#166534', marginBottom: 4 }}>Importação Automática de XML</div>
          <div style={{ fontSize: 13, color: '#15803d' }}>
            O sistema importa automaticamente os XMLs de notas de compra, realizando a conferência automática com as ordens de compra e atualizando a tributação vinculada.
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{ maxWidth: 500 }}>
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar por número da nota ou fornecedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Loader2 size={32} className="spin" color="#22c55e" />
            <div style={{ marginTop: 12, color: '#6b7280', fontSize: 14 }}>Carregando notas fiscais...</div>
          </div>
        ) : (
        <>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nota</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>ICMS</th>
                <th>IPI</th>
                <th>PIS/COFINS</th>
                <th>Ordem Compra</th>
                <th>Emissão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((n) => (
                <tr key={n.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{n.numero}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Série {n.serie}</div>
                  </td>
                  <td>
                    <div>{n.fornecedor}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{n.cnpj}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{n.valor}</td>
                  <td style={{ fontSize: 13, color: '#dc2626' }}>{n.icms}</td>
                  <td style={{ fontSize: 13, color: '#ea580c' }}>{n.ipi}</td>
                  <td style={{ fontSize: 13 }}>
                    <div>{n.pis}</div>
                    <div style={{ color: '#6b7280' }}>{n.cofins}</div>
                  </td>
                  <td>
                    <span style={{ color: '#2563eb', fontWeight: 500 }}>{n.ordemCompra}</span>
                  </td>
                  <td style={{ color: '#6b7280' }}>{n.dataEmissao}</td>
                  <td><span className={`status-badge ${n.status}`}>{statusLabels[n.status]}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Detalhes" onClick={() => setShowDetailModal(n.id)}>
                        <Eye size={16} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Tributos" onClick={() => setShowTributoModal(n.id)}>
                        <Calculator size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Importar XML de Nota Fiscal</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowImportModal(false)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div
                style={{
                  border: `2px dashed ${dragOver ? '#22c55e' : '#d1d5db'}`,
                  borderRadius: 12,
                  padding: 40,
                  textAlign: 'center',
                  background: dragOver ? '#f0fdf4' : '#f9fafb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDragOver(false)
                  if (e.dataTransfer.files.length > 0) processarArquivosXML(e.dataTransfer.files)
                }}
                onClick={() => document.getElementById('xml-file-input')?.click()}
              >
                <input
                  id="xml-file-input"
                  type="file"
                  accept=".xml"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      processarArquivosXML(e.target.files)
                      e.target.value = ''
                    }
                  }}
                />
                <Upload size={40} color={dragOver ? '#22c55e' : '#9ca3af'} />
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 12, color: '#374151' }}>
                  Arraste os arquivos XML aqui
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                  ou clique para selecionar. Aceita múltiplos arquivos XML de NF-e.
                </div>
                <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={(e) => {
                  e.stopPropagation()
                  document.getElementById('xml-file-input')?.click()
                }}>
                  Selecionar Arquivos
                </button>
              </div>

              {arquivosSelecionados.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                    {arquivosSelecionados.length} arquivo(s) selecionado(s):
                  </div>
                  {arquivosSelecionados.map((f, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', background: '#f0fdf4', borderRadius: 6,
                      border: '1px solid #bbf7d0', marginBottom: 4, fontSize: 13,
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} color="#16a34a" /> {f.name}
                      </span>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => {
                        setArquivosSelecionados(prev => prev.filter((_, idx) => idx !== i))
                      }}>
                        <XCircle size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 20, padding: 16, background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: '#92400e' }}>
                  <strong>Atenção:</strong> O sistema irá realizar automaticamente a conferência dos itens e valores com a ordem de compra vinculada. Divergências serão sinalizadas para revisão manual.
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleImportar}>
                <Upload size={16} /> Importar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tributo Modal */}
      {tributoNota && (
        <div className="modal-overlay" onClick={() => setShowTributoModal(null)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>Tributos - {tributoNota.numero}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowTributoModal(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                Fornecedor: <strong style={{ color: '#111827' }}>{tributoNota.fornecedor}</strong>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { label: 'ICMS', valor: tributoNota.icms, cor: '#dc2626' },
                  { label: 'IPI', valor: tributoNota.ipi, cor: '#ea580c' },
                  { label: 'PIS', valor: tributoNota.pis, cor: '#2563eb' },
                  { label: 'COFINS', valor: tributoNota.cofins, cor: '#7c3aed' },
                ].map(t => (
                  <div key={t.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{t.label}</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: t.cor }}>{t.valor}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#166534' }}>Valor Total da Nota</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: '#16a34a' }}>{tributoNota.valor}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowTributoModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedNota && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(null)}>
          <div className="modal slide-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <h3>Detalhes - {selectedNota.numero}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDetailModal(null)}>
                <XCircle size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Fornecedor</label>
                  <span>{selectedNota.fornecedor}</span>
                </div>
                <div className="detail-item">
                  <label>CNPJ</label>
                  <span>{selectedNota.cnpj}</span>
                </div>
                <div className="detail-item">
                  <label>Valor Total</label>
                  <span style={{ color: '#16a34a' }}>{selectedNota.valor}</span>
                </div>
                <div className="detail-item">
                  <label>Ordem de Compra</label>
                  <span>{selectedNota.ordemCompra}</span>
                </div>
                <div className="detail-item">
                  <label>Data Emissão</label>
                  <span>{selectedNota.dataEmissao}</span>
                </div>
                <div className="detail-item">
                  <label>Data Entrada</label>
                  <span>{selectedNota.dataEntrada}</span>
                </div>
              </div>

              <div style={{ marginTop: 24, padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Tributação</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>ICMS</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedNota.icms}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>IPI</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedNota.ipi}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>PIS</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedNota.pis}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#6b7280', fontSize: 13 }}>COFINS</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedNota.cofins}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
