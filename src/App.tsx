/**
 * MINERAL-01 - App Principal
 * 
 * FASE 6.1D: Integración con AppShell y paneles acoplables
 */

import { useState, useRef } from 'react';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  GitBranch,
  Download,
  FileText,
  Bot,
  Globe,
  Clock,
  Ruler,
  Zap,
  Library,
} from 'lucide-react';
import { MissionProvider } from './components/MissionProvider';
import { useMission } from './lib/store';
import { AppShell } from './components/AppShell';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Globe3D, { Globe3DHandle } from './components/Globe3D';
import GlobeControlsPanel from './components/GlobeControlsPanel';
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

type Tab = 'dashboard' | 'map' | 'globe' | 'anomalies' | 'ai' | 'timeline' | 'measurements' | 'layers' | 'joule' | 'matrix' | 'export' | 'docs';

function AppContent() {
  const { state } = useMission();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const globeRef = useRef<Globe3DHandle>(null);
  
  const [activeLayers, setActiveLayers] = useState({
    anomalies: true,
    coverageGaps: true,
    missionArea: true,
    igmeIndicios: false,
  });

  // Navegación agrupada
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

  // Panel de navegación lateral
  const navigation = (
    <nav className="p-2">
      {navigationGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <div className="text-[10px] text-gray-500 font-semibold px-3 py-1 uppercase tracking-wider">
            {group.label}
          </div>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  // Inspector derecho (solo para Globe3D)
  const inspector = activeTab === 'globe' ? (
    <GlobeControlsPanel globeRef={globeRef} />
  ) : null;

  // Contenido central
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return (
          <div className="w-full h-full">
            <MapView activeLayers={activeLayers} />
          </div>
        );
      case 'globe':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center">
                <div className="text-4xl mb-4 animate-pulse">🌍</div>
                <h3 className="text-xl font-bold text-white mb-2">Cargando MINERAL EARTH 3D</h3>
                <p className="text-sm text-gray-400">Inicializando motor CesiumJS...</p>
              </div>
            </div>
          }>
            <Globe3D ref={globeRef} />
          </Suspense>
        );
      case 'anomalies':
        return <AnomalyPanel />;
      case 'ai':
        return <AIPanel />;
      case 'timeline':
        return <TimelinePanel />;
      case 'measurements':
        return <MeasurementsPanel />;
      case 'layers':
        return <LayerCatalogPanel />;
      case 'joule':
        return <JoulePanel />;
      case 'matrix':
        return <IntegrationMatrixView />;
      case 'export':
        return <ExportPanel />;
      case 'docs':
        return <DocumentationPanel />;
      default:
        return <Dashboard />;
    }
  };

  // Visores usan todo el espacio, contenido documental tiene scroll
  const isViewer = activeTab === 'map' || activeTab === 'globe';

  return (
    <AppShell navigation={navigation} inspector={inspector}>
      <div className={`w-full ${isViewer ? 'h-full' : 'h-full overflow-y-auto'}`}>
        {renderContent()}
      </div>
    </AppShell>
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
