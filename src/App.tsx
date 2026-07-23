import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Solicitacoes from './pages/Solicitacoes'
import Cotacoes from './pages/Cotacoes'
import OrdensCompra from './pages/OrdensCompra'
import Recebimento from './pages/Recebimento'
import Aprovacoes from './pages/Aprovacoes'
import Fornecedores from './pages/Fornecedores'
import Catalogo from './pages/Catalogo'
import Contratos from './pages/Contratos'
import Projetos from './pages/Projetos'
import Transportadores from './pages/Transportadores'
import NotasFiscais from './pages/NotasFiscais'
import EnvioNotas from './pages/EnvioNotas'
import EmailsAutomaticos from './pages/EmailsAutomaticos'
import Relatorios from './pages/Relatorios'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/cotacoes" element={<Cotacoes />} />
        <Route path="/ordens" element={<OrdensCompra />} />
        <Route path="/recebimento" element={<Recebimento />} />
        <Route path="/aprovacoes" element={<Aprovacoes />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/transportadores" element={<Transportadores />} />
        <Route path="/notas" element={<NotasFiscais />} />
        <Route path="/envio-notas" element={<EnvioNotas />} />
        <Route path="/emails-automaticos" element={<EmailsAutomaticos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}
