import { useState, useRef, useEffect } from 'react';
import { useMission } from '../lib/store';
import { parseCommand, executeCommand, formatResult, AIExecutionResult } from '../lib/mineralAI';
import { Bot, Send, AlertTriangle, Upload, Info } from 'lucide-react';
import { getDiagnosticInfo, formatDiagnosticInfo } from '../lib/diagnostics';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  execution?: AIExecutionResult;
}

export default function AIPanel() {
  const { state, getLoadedMDT, loadMDT } = useMission();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Soy MINERAL-AI, asistente de investigación geoespacial. Puedo ayudarle a:\n\n• Analizar depresiones en el MDT\n• Buscar estructuras lineales\n• Comparar anomalías con registros IGME\n• Generar informes\n• Identificar elementos que requieren revisión humana\n• Preparar inventarios GeoJSON\n\nEscriba una instrucción en lenguaje natural.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const parsed = parseCommand(input);
    
    // Obtener MDT real si está disponible
    const mdt = getLoadedMDT();
    
    // Verificar si el comando requiere MDT pero no está disponible
    const requiresMDT = parsed.type === 'ANALYZE_DEPRESSIONS' || 
                        parsed.type === 'SEARCH_LINEAR';
    
    if (requiresMDT && !mdt) {
      const execution: AIExecutionResult = {
        commandId: `cmd-${Date.now()}`,
        success: false,
        tool: 'none',
        input: parsed.parameters,
        output: null,
        errors: ['No hay MDT cargado. Por favor, importe un archivo GeoTIFF antes de ejecutar análisis geomorfológicos.'],
        timestamp: new Date().toISOString(),
        duration: 0,
      };
      
      const response = formatResult(execution);
      
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `${response}\n\n💡 **Acción requerida:** Importe un archivo GeoTIFF usando el botón de abajo o desde el Dashboard.`,
        timestamp: new Date().toISOString(),
        execution,
      };
      
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput('');
      return;
    }
    
    // Ejecutar comando con MDT real
    const execution = await executeCommand(parsed, state, mdt);
    const response = formatResult(execution);

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      execution,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImportMDT = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Añadir mensaje de progreso
    const progressMessage: ChatMessage = {
      id: `progress-${Date.now()}`,
      role: 'assistant',
      content: `📥 Importando MDT: ${file.name}\n\nProcesando archivo GeoTIFF...`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, progressMessage]);

    try {
      await loadMDT(file);
      
      // Verificar si se cargó correctamente
      const mdt = getLoadedMDT();
      if (mdt) {
        const successMessage: ChatMessage = {
          id: `success-${Date.now()}`,
          role: 'assistant',
          content: `✅ MDT importado correctamente:\n\n• Archivo: ${file.name}\n• Dimensiones: ${mdt.width} × ${mdt.height}\n• Resolución: ${mdt.resolution.toFixed(2)} m/píxel\n• CRS: ${mdt.crs}\n• NoData: ${mdt.noDataValue}\n\nYa puede ejecutar análisis geomorfológicos.`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev.filter(m => m.id !== progressMessage.id), successMessage]);
      } else {
        throw new Error('El MDT no se cargó correctamente');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Error al importar MDT: ${error instanceof Error ? error.message : 'Error desconocido'}\n\nVerifique que el archivo es un GeoTIFF válido.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev.filter(m => m.id !== progressMessage.id), errorMessage]);
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleShowDiagnostic = () => {
    const diag = getDiagnosticInfo();
    diag.state.mdtLoaded = state.mdt.status === 'COMPLETED';
    diag.state.mdtStatus = state.mdt.status;
    diag.state.lasLoaded = state.lasFile.status === 'COMPLETED';
    diag.state.lasStatus = state.lasFile.status;
    diag.state.mode = state.mode;

    const diagnosticMessage: ChatMessage = {
      id: `diagnostic-${Date.now()}`,
      role: 'assistant',
      content: formatDiagnosticInfo(diag),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, diagnosticMessage]);
    setShowDiagnostic(false);
  };

  const examples = [
    'Analiza todas las depresiones',
    'Busca estructuras lineales próximas al arroyo',
    'Compara con registros mineros IGME',
    'Genera un informe de anomalías',
    'Indica qué resultados requieren revisión humana',
    'Prepara un inventario GeoJSON',
  ];

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">MINERAL-AI</h2>
        <span className="ml-auto px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded text-xs">
          Motor determinista
        </span>
      </div>

      <div className="bg-purple-950/20 border border-purple-800/40 rounded-lg p-3">
        <div className="flex items-center gap-2 text-purple-300 text-xs">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>
            MINERAL-AI es un orquestador determinista. No usa modelos remotos. No inventa resultados científicos.
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden flex flex-col min-h-[400px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-900/40 text-blue-100'
                    : 'bg-gray-800 text-gray-200'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                {msg.execution && (
                  <div className="mt-2 pt-2 border-t border-gray-700 text-[10px] text-gray-500">
                    <div>Herramienta: <code>{msg.execution.tool}</code></div>
                    <div>Duración: {msg.execution.duration.toFixed(2)}ms</div>
                    {msg.execution.errors.length > 0 && (
                      <div className="text-red-400">
                        Errores: {msg.execution.errors.join('; ')}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('es-ES')}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Examples and Actions */}
        <div className="px-4 py-2 border-t border-gray-700">
          <div className="flex flex-wrap gap-1 mb-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-[10px] text-gray-400 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".tif,.tiff,.geotiff"
              onChange={handleImportMDT}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-900/30 hover:bg-teal-900/50 border border-teal-700/50 rounded text-xs text-teal-300 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar MDT
            </button>
            <button
              onClick={handleShowDiagnostic}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-xs text-gray-400 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              Diagnóstico
            </button>
          </div>
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-700 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escriba una instrucción..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 bg-purple-700/40 hover:bg-purple-700/60 disabled:opacity-50 disabled:cursor-not-allowed border border-purple-600/50 rounded-lg text-sm text-purple-200 transition-colors flex items-center gap-1"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
