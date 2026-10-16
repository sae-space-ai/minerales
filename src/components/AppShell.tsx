/**
 * MINERAL COMMAND CENTER - App Shell
 * 
 * Layout de 3 columnas con paneles acoplables:
 * - Navegación lateral izquierda
 * - Visor central
 * - Inspector derecho (opcional)
 * - Panel inferior de resultados (opcional)
 */

import { useState, createContext, useContext } from 'react';

interface AppShellContextType {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  setLeftPanelOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setBottomPanelOpen: (open: boolean) => void;
}

const AppShellContext = createContext<AppShellContextType | null>(null);

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error('useAppShell must be used within AppShellProvider');
  }
  return context;
}

interface AppShellProps {
  children: React.ReactNode;
  navigation: React.ReactNode;
  inspector?: React.ReactNode;
  bottomPanel?: React.ReactNode;
}

export function AppShell({ children, navigation, inspector, bottomPanel }: AppShellProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

  return (
    <AppShellContext.Provider
      value={{
        leftPanelOpen,
        rightPanelOpen,
        bottomPanelOpen,
        setLeftPanelOpen,
        setRightPanelOpen,
        setBottomPanelOpen,
      }}
    >
      <div className="h-screen flex flex-col bg-gray-950 text-gray-100 overflow-hidden">
        {/* Header compacto */}
        <header className="flex-shrink-0 bg-gray-900 border-b border-gray-800 z-50">
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⛏️</span>
              <div>
                <h1 className="text-base font-bold text-white leading-tight">MINERAL-01</h1>
                <p className="text-[10px] text-gray-500">Command Center v6.1D</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
                title="Panel de herramientas"
              >
                {leftPanelOpen ? '◀' : '▶'} Herramientas
              </button>
              {inspector && (
                <button
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
                  title="Inspector"
                >
                  {rightPanelOpen ? '▶' : '◀'} Inspector
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left panel - Navigation & Tools */}
          {leftPanelOpen && (
            <aside className="flex-shrink-0 w-64 bg-gray-900 border-r border-gray-800 overflow-y-auto">
              {navigation}
            </aside>
          )}

          {/* Center - Viewer */}
          <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-gray-950">
            {children}
          </main>

          {/* Right panel - Inspector */}
          {rightPanelOpen && inspector && (
            <aside className="flex-shrink-0 w-80 bg-gray-900 border-l border-gray-800 overflow-y-auto">
              {inspector}
            </aside>
          )}
        </div>

        {/* Bottom panel - Results */}
        {bottomPanelOpen && bottomPanel && (
          <div className="flex-shrink-0 h-64 bg-gray-900 border-t border-gray-800 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
              <h3 className="text-sm font-semibold text-white">Resultados</h3>
              <button
                onClick={() => setBottomPanelOpen(false)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
              >
                ✕ Cerrar
              </button>
            </div>
            <div className="p-4">
              {bottomPanel}
            </div>
          </div>
        )}

        {/* Status bar */}
        <footer className="flex-shrink-0 bg-gray-900 border-t border-gray-800 z-40">
          <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center gap-4">
              <span>MINERAL-01 Command Center</span>
              <span className="text-gray-600">|</span>
              <span>v6.1D</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Los límites catastrales no acreditan titularidad</span>
            </div>
          </div>
        </footer>
      </div>
    </AppShellContext.Provider>
  );
}
