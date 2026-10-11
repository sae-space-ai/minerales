import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  GitBranch,
  Download,
  FileText,
  Layers,
  Bot,
  Globe,
} from 'lucide-react';
import { MissionProvider } from './components/MissionProvider';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import AnomalyPanel from './components/AnomalyPanel';
import IntegrationMatrixView from './components/IntegrationMatrixView';
import ExportPanel from './components/ExportPanel';
import DocumentationPanel from './components/DocumentationPanel';
import AIPanel from './components/AIPanel';
import { lazy, Suspense } from 'react';
import { useMission } from './lib/store';

// Carga diferida del globo 3D (CesiumJS es pesado)
const Globe3D = lazy(() => import('./components/Globe3D'));

type Tab = 'dashboard' | 'map' | 'globe' | 'anomalies' | 'ai' | 'matrix' | 'export' | 'docs';

function AppContent() {
  const { state } = useMission();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeLayers, setActiveLayers] = useState({
    anomalies: true,
    coverageGaps: true,
    missionArea: true,
    igmeIndicios: false,
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'map', label: 'Visor 2D', icon: <Map className="w-4 h-4" /> },
    { id: 'globe', label: 'GLOBO 3D', icon: <Globe className="w-4 h-4" /> },
    { id: 'anomalies', label: 'Anomalías', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'ai', label: 'MINERAL-AI', icon: <Bot className="w-4 h-4" /> },
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
                <p className="text-xs text-gray-500">FireCycle AI × GEOOBS-AI — Fase 2</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500" />
                {Object.entries(activeLayers).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setActiveLayers((prev) => ({ ...prev, [key]: !value }))}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
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
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                state.mode === 'REAL'
                  ? 'bg-green-950/30 border-green-800/40'
                  : 'bg-amber-950/30 border-amber-800/40'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  state.mode === 'REAL' ? 'bg-green-400' : 'bg-amber-400'
                }`}></div>
                <span className={`text-xs font-mono ${
                  state.mode === 'REAL' ? 'text-green-300' : 'text-amber-300'
                }`}>
                  {state.mode === 'REAL' ? 'REAL' : 'DEMO'}
                </span>
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
        {activeTab === 'globe' && (
          <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center">
                  <div className="text-4xl mb-4 animate-pulse">🌍</div>
                  <h3 className="text-xl font-bold text-white mb-2">Cargando MINERAL EARTH 3D</h3>
                  <p className="text-sm text-gray-400">Inicializando motor CesiumJS...</p>
                </div>
              </div>
            }>
              <Globe3D />
            </Suspense>
          </div>
        )}
        {activeTab === 'anomalies' && <AnomalyPanel />}
        {activeTab === 'ai' && <AIPanel />}
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
              <span>FireCycle AI: pergolessi9-star/firecycle-ai</span>
              <span>GEOOBS-AI: sae-space-ai/GEOOBS-AI</span>
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

function App() {
  return (
    <MissionProvider>
      <AppContent />
    </MissionProvider>
  );
}

export default App;
