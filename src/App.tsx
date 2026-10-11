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
  Clock,
  Ruler,
  Zap,
  Library,
} from 'lucide-react';
import { MissionProvider } from './components/MissionProvider';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import AnomalyPanel from './components/AnomalyPanel';
import IntegrationMatrixView from './components/IntegrationMatrixView';
import ExportPanel from './components/ExportPanel';
import DocumentationPanel from './components/DocumentationPanel';
import AIPanel from './components/AIPanel';
import TimelinePanel from './components/TimelinePanel';
import MeasurementsPanel from './components/MeasurementsPanel';
import JoulePanel from './components/JoulePanel';
import LayerCatalogPanel from './components/LayerCatalogPanel';
import { lazy, Suspense } from 'react';
import { useMission } from './lib/store';

// Carga diferida del globo 3D (CesiumJS es pesado)
const Globe3D = lazy(() => import('./components/Globe3D'));

type Tab = 'dashboard' | 'map' | 'globe' | 'anomalies' | 'ai' | 'timeline' | 'measurements' | 'layers' | 'joule' | 'matrix' | 'export' | 'docs';

function AppContent() {
  const { state } = useMission();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeLayers, setActiveLayers] = useState({
    anomalies: true,
    coverageGaps: true,
    missionArea: true,
    igmeIndicios: false,
  });

  // CORRECCIÓN FASE 6.1C: Navegación agrupada por categorías
  const navigationGroups = [
    {
      label: 'INICIO',
      items: [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      label: 'EXPLORACIÓN',
      items: [
        { id: 'map' as Tab, label: 'Visor 2D', icon: <Map className="w-4 h-4" /> },
        { id: 'globe' as Tab, label: 'Globo 3D', icon: <Globe className="w-4 h-4" /> },
        { id: 'layers' as Tab, label: 'Capas', icon: <Library className="w-4 h-4" /> },
      ],
    },
    {
      label: 'INVESTIGACIÓN',
      items: [
        { id: 'anomalies' as Tab, label: 'Anomalías', icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'ai' as Tab, label: 'MINERAL-AI', icon: <Bot className="w-4 h-4" /> },
        { id: 'measurements' as Tab, label: 'Mediciones', icon: <Ruler className="w-4 h-4" /> },
        { id: 'timeline' as Tab, label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
      ],
    },
    {
      label: 'OPERACIONES',
      items: [
        { id: 'joule' as Tab, label: 'JOULE', icon: <Zap className="w-4 h-4" /> },
        { id: 'matrix' as Tab, label: 'Integración', icon: <GitBranch className="w-4 h-4" /> },
        { id: 'export' as Tab, label: 'Exportar', icon: <Download className="w-4 h-4" /> },
      ],
    },
    {
      label: 'SISTEMA',
      items: [
        { id: 'docs' as Tab, label: 'Documentación', icon: <FileText className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar - CORRECCIÓN FASE 6.1C: Cabecera compacta */}
      <header className="bg-gray-900 border-b border-gray-800 flex-shrink-0 z-50">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛏️</span>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">MINERAL-01</h1>
                <p className="text-[10px] text-gray-500">Command Center v7.3</p>
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

      {/* Navigation - CORRECCIÓN FASE 6.1C: Navegación agrupada y compacta */}
      <nav className="bg-gray-900/50 border-b border-gray-800">
        <div className="px-4 py-2">
          <div className="flex gap-1 overflow-x-auto">
            {navigationGroups.map((group) => (
              <div key={group.label} className="flex items-center gap-1">
                <span className="text-[10px] text-gray-500 font-semibold px-2">{group.label}</span>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                      activeTab === item.id
                        ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                ))}
                <div className="w-px h-6 bg-gray-700 mx-2" />
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Content - CORRECCIÓN FASE 6.1C: Visores usan todo el ancho, contenido documental limitado */}
      <main className="flex-1">
        {/* Visores: usan todo el ancho disponible */}
        {(activeTab === 'map' || activeTab === 'globe') && (
          <div className="h-[calc(100vh-140px)] w-full">
            {activeTab === 'map' && <MapView activeLayers={activeLayers} />}
            {activeTab === 'globe' && (
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
            )}
          </div>
        )}

        {/* Contenido documental: ancho limitado para legibilidad */}
        {activeTab !== 'map' && activeTab !== 'globe' && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'anomalies' && <AnomalyPanel />}
            {activeTab === 'ai' && <AIPanel />}
            {activeTab === 'timeline' && <TimelinePanel />}
            {activeTab === 'measurements' && <MeasurementsPanel />}
            {activeTab === 'layers' && <LayerCatalogPanel />}
            {activeTab === 'joule' && <JoulePanel />}
            {activeTab === 'matrix' && <IntegrationMatrixView />}
            {activeTab === 'export' && <ExportPanel />}
            {activeTab === 'docs' && <DocumentationPanel />}
          </div>
        )}
      </main>

      {/* Status Bar - CORRECCIÓN FASE 6.1C: Barra de estado compacta en lugar de footer */}
      <footer className="bg-gray-900 border-t border-gray-800 flex-shrink-0 z-40">
        <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-500">
          <div className="flex items-center gap-4">
            <span>MINERAL-01 Command Center</span>
            <span className="text-gray-600">|</span>
            <span>v7.3</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Los límites catastrales no acreditan titularidad</span>
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
