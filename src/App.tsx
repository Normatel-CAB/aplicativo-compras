import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Solicitacoes from './pages/Solicitacoes'
import OrdensCompra from './pages/OrdensCompra'
import Fornecedores from './pages/Fornecedores'
import NotasFiscais from './pages/NotasFiscais'
import EnvioNotas from './pages/EnvioNotas'
import MapaCotacao from './pages/MapaCotacao'
import EmailsAutomaticos from './pages/EmailsAutomaticos'
import Configuracoes from './pages/Configuracoes'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/solicitacoes" element={<Solicitacoes />} />
        <Route path="/ordens" element={<OrdensCompra />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/notas" element={<NotasFiscais />} />
        <Route path="/envio-notas" element={<EnvioNotas />} />
        <Route path="/mapa-cotacao" element={<MapaCotacao />} />
        <Route path="/emails-automaticos" element={<EmailsAutomaticos />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}
