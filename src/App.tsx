import { useState, useEffect, useMemo } from 'react';
import { fetchSpareParts } from './services/googleSheets';
import { getAssistantResponse } from './services/gemini';
import { SparePart, Message } from './types';
import { Chat } from './components/Chat';
import { ProductCard } from './components/ProductCard';
import { 
  Search, 
  Settings, 
  Package, 
  AlertCircle, 
  ChevronRight, 
  Car, 
  Wrench, 
  ShieldCheck,
  ExternalLink,
  Bot
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default Sheet ID for demo (a public sheet with sample data)
const DEFAULT_SHEET_ID = '1_m_Xf6D-f_p_p_p_p_p_p_p_p_p_p_p_p_p_p_p_p';

export default function App() {
  const [sheetId, setSheetId] = useState(import.meta.env.VITE_GOOGLE_SHEET_ID || DEFAULT_SHEET_ID);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showChat, setShowChat] = useState(false);

  // Load parts from Google Sheets
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsSheetLoading(true);
        const data = await fetchSpareParts(sheetId);
        if (isMounted) {
          setParts(data || []);
          setIsSheetLoading(false);
          
          // Initial welcome message
          if (messages.length === 0) {
            setMessages([{
              role: 'model',
              text: '¡Hola! Soy tu asistente de **RepuestosIA**. ¿Qué repuesto estás buscando hoy? Dime qué pieza necesitas o para qué vehículo y yo lo buscaré en el inventario.'
            }]);
          }
        }
      } catch (error) {
        console.error("Failed to load parts:", error);
        if (isMounted) {
          setIsSheetLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [sheetId]);

  // Filter parts based on search query
  const filteredParts = useMemo(() => {
    if (!searchQuery) return []; // Don't show anything until a search is performed
    const query = searchQuery.toLowerCase();
    return parts.filter(p => 
      p.descripcion.toLowerCase().includes(query) || 
      p.marca.toLowerCase().includes(query) || 
      p.codigo.toLowerCase().includes(query)
    );
  }, [parts, searchQuery]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await getAssistantResponse(text, newMessages, parts);
      const assistantMsg: Message = { role: 'model', text: response };
      setMessages(prev => [...prev, assistantMsg]);
      
      // Update search query based on AI response (simple heuristic)
      setSearchQuery(text); 
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, hubo un error al procesar tu mensaje." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-black/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white">
              <Wrench size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">Repuestos<span className="text-indigo-600">IA</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="text-black">Inicio</a>
            <a href="#" className="hover:text-black transition-colors">Catálogo</a>
            <a href="#" className="hover:text-black transition-colors">Nosotros</a>
            <a href="#" className="hover:text-black transition-colors">Contacto</a>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-black transition-colors rounded-lg hover:bg-gray-100"
            >
              <Settings size={20} />
            </button>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <button className="bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
              Mi Cuenta
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 bg-white p-6 rounded-3xl border border-black/5 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings size={20} className="text-indigo-600" />
                Configuración de Base de Datos
              </h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-black">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Google Sheet ID</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    placeholder="Pega el ID o la URL completa de tu Google Sheet"
                  />
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                  <span className="flex items-center gap-1"><AlertCircle size={12} className="text-amber-500" /> Puedes pegar la URL completa del navegador o solo el ID.</span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600 underline">
                    <ShieldCheck size={12} /> Importante: El acceso debe ser "Cualquier persona con el enlace" o "Publicado en la web".
                  </span>
                  <span className="text-[10px] opacity-70">Si recibes error 404, revisa que el archivo no sea privado.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Sidebar / Mobile Floating Button */}
          <div className={cn(
            "lg:col-span-4 h-[calc(100vh-160px)] lg:sticky lg:top-24 z-40 transition-all duration-300",
            "fixed inset-0 bg-white lg:bg-transparent lg:relative lg:inset-auto",
            showChat ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto"
          )}>
            <div className="h-full relative">
              <button 
                onClick={() => setShowChat(false)}
                className="lg:hidden absolute top-4 right-4 z-50 p-2 bg-gray-100 rounded-full text-gray-500"
              >
                <ChevronRight className="rotate-90" size={20} />
              </button>
              <Chat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            </div>
          </div>

          {/* Right Column: Results & Catalog */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero / Features */}
            {messages.length <= 1 && !searchQuery && (
              <div className="bg-indigo-600 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                <div className="relative z-10 max-w-lg">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">Encuentra el repuesto perfecto con IA</h1>
                  <p className="text-indigo-100 mb-6 text-base sm:text-lg">
                    Habla con nuestro asistente inteligente para localizar piezas exactas en nuestro inventario sincronizado en tiempo real.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                      <ShieldCheck size={16} className="text-indigo-300" /> Garantía
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-medium">
                      <Car size={16} className="text-indigo-300" /> Todas las Marcas
                    </div>
                  </div>
                </div>
                <div className="absolute -right-12 -bottom-12 opacity-10 transform rotate-12 hidden sm:block">
                  <Wrench size={300} />
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, marca o modelo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-black/5 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 shadow-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-base sm:text-lg"
              />
            </div>

            {/* Results Grid */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package size={24} className="text-indigo-600" />
                  {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo de Repuestos'}
                  {searchQuery && <span className="text-sm font-normal text-gray-400 ml-2">({filteredParts.length} encontrados)</span>}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Ordenar por:</span>
                  <select className="bg-transparent font-semibold text-black outline-none cursor-pointer">
                    <option>Relevancia</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {isSheetLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-black/5" />
                  ))}
                </div>
              ) : filteredParts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredParts.map(part => (
                    <ProductCard key={part.codigo} part={part} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No encontramos lo que buscas</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">
                    Prueba preguntándole al asistente IA o ajustando tu búsqueda.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Empieza tu búsqueda</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2">
                    Escribe lo que necesitas en el buscador o habla con nuestro asistente IA.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="font-bold mb-1">Compra Segura</h4>
                <p className="text-xs text-gray-500">Garantía de devolución en todas las piezas.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                  <Car size={24} />
                </div>
                <h4 className="font-bold mb-1">Envío Express</h4>
                <p className="text-xs text-gray-500">Recibe tus repuestos en 24/48 horas.</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-black/5 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                  <Wrench size={24} />
                </div>
                <h4 className="font-bold mb-1">Soporte Técnico</h4>
                <p className="text-xs text-gray-500">Asesoramiento experto para tu instalación.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Chat Toggle */}
      <button 
        onClick={() => setShowChat(!showChat)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-indigo-700 transition-colors"
      >
        <Bot size={28} />
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-black/5 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                <Wrench size={16} />
              </div>
              <span className="font-bold text-lg tracking-tight">RepuestosIA</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
              <a href="#" className="hover:text-black transition-colors">Términos</a>
              <a href="#" className="hover:text-black transition-colors">Privacidad</a>
              <a href="#" className="hover:text-black transition-colors">Cookies</a>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400 font-medium">CONECTADO A:</span>
              <a 
                href={`https://docs.google.com/spreadsheets/d/${sheetId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Google Sheets <ExternalLink size={12} />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
            © 2024 RepuestosIA. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
