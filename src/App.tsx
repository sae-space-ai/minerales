import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  GitBranch,
  Download,
  FileText,
  Layers,
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import AnomalyPanel from './components/AnomalyPanel';
import IntegrationMatrixView from './components/IntegrationMatrixView';
import ExportPanel from './components/ExportPanel';
import DocumentationPanel from './components/DocumentationPanel';

type Tab = 'dashboard' | 'map' | 'anomalies' | 'matrix' | 'export' | 'docs';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeLayers, setActiveLayers] = useState({
    anomalies: true,
    coverageGaps: true,
    missionArea: true,
    igmeIndicios: false,
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'map', label: 'Visor', icon: <Map className="w-4 h-4" /> },
    { id: 'anomalies', label: 'Anomalías', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'matrix', label: 'Integración', icon: <GitBranch className="w-4 h-4" /> },
    { id: 'export', label: 'Exportar', icon: <Download className="w-4 h-4" /> },
    { id: 'docs', label: 'Docs', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top Bar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛏️</span>
              <div>
                <h1 className="text-lg font-bold text-white leading-tight">MINERAL-01</h1>
                <p className="text-xs text-gray-500">Investigación documental · integraciones pendientes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500" />
                {Object.entries(activeLayers).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveLayers((prev) => ({ ...prev, [key]: !value }))}
                    disabled={key !== 'missionArea'}
                    title={key !== 'missionArea' ? 'Sin datos científicos reales disponibles para esta capa' : 'Mostrar u ocultar la envolvente LAZ'}
                    className={`px-2 py-1 rounded text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                      value
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                        : 'bg-gray-800 text-gray-500 border border-gray-700'
                    }`}
                  >
                    {key === 'anomalies' ? 'Anomalías' :
                     key === 'coverageGaps' ? 'Huecos' :
                     key === 'missionArea' ? 'Área' : 'IGME'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/30 border border-red-800/40 rounded-lg">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-300 font-mono">NO CONCLUYENTE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'map' && (
          <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <MapView activeLayers={activeLayers} />
          </div>
        )}
        {activeTab === 'anomalies' && <AnomalyPanel />}
        {activeTab === 'matrix' && <IntegrationMatrixView />}
        {activeTab === 'export' && <ExportPanel />}
        {activeTab === 'docs' && <DocumentationPanel />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <div>
              <span className="text-gray-400">MINERAL-01</span> — Misión geoespacial de investigación de indicios mineros
            </div>
            <div className="flex items-center gap-4">
              <span>FIRECYCLE: integración pendiente</span>
              <span>GEOOBS-AI: integración pendiente</span>
            </div>
          </div>
          <div className="mt-2 text-center text-[10px] text-gray-600">
            Los límites catastrales no acreditan titularidad. La morfología no prueba actividad extractiva.
            Revisión humana requerida para toda conclusión.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
