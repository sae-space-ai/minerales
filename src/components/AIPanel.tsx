import { useState, useRef, useEffect } from 'react';
import { useMission } from '../lib/store';
import { parseCommand, executeCommand, formatResult, AIExecutionResult } from '../lib/mineralAI';
import { Bot, Send, AlertTriangle } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  execution?: AIExecutionResult;
}

export default function AIPanel() {
  const { state } = useMission();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Soy MINERAL-AI, asistente de investigación geoespacial. Puedo ayudarle a:\n\n• Analizar depresiones en el MDT\n• Buscar estructuras lineales\n• Comparar anomalías con registros IGME\n• Generar informes\n• Identificar elementos que requieren revisión humana\n• Preparar inventarios GeoJSON\n\nEscriba una instrucción en lenguaje natural.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    const parsed = parseCommand(input);
    const execution = executeCommand(parsed, state, null); // MDT no cargado en este contexto
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

        {/* Examples */}
        <div className="px-4 py-2 border-t border-gray-700 flex flex-wrap gap-1">
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
