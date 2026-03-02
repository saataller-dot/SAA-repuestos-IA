import { useState, useEffect, useMemo } from 'react';
import { fetchSpareParts } from './services/googleSheets';
import { getAssistantResponse } from './services/gemini';
import { SparePart, Message, CartItem } from './types';
import { Chat } from './components/Chat';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { 
  Search, 
  Package, 
  ChevronRight, 
  Car, 
  Wrench, 
  ShieldCheck,
  Bot,
  ShoppingCart,
  ShoppingBag,
  X,
  MessageCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Default Sheet ID for demo (a public sheet with sample data)
const DEFAULT_SHEET_ID = '1_m_Xf6D-f_p_p_p_p_p_p_p_p_p_p_p_p_p_p_p_p';

export default function App() {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID || DEFAULT_SHEET_ID;
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '';
  
  const [parts, setParts] = useState<SparePart[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSheetLoading, setIsSheetLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

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
    if (!searchQuery.trim()) return []; 
    
    const terms = searchQuery.toLowerCase().trim().split(/\s+/).filter(t => t.length > 1);
    if (terms.length === 0) return [];

    return parts.filter(p => {
      const searchContent = `${p.descripcion} ${p.marca} ${p.codigo}`.toLowerCase();
      // Every term must be present in the content
      return terms.every(term => searchContent.includes(term));
    });
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

  // Cart Functions
  const addToCart = (part: SparePart) => {
    setCart(prev => {
      const existing = prev.find(item => item.codigo === part.codigo);
      if (existing) {
        return prev.map(item => 
          item.codigo === part.codigo 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...part, quantity: 1 }];
    });
    // Optional: show some feedback
  };

  const updateCartQuantity = (codigo: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.codigo === codigo) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (codigo: string) => {
    setCart(prev => prev.filter(item => item.codigo !== codigo));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
    let message = `*Nuevo Pedido - RepuestosIA*\n\n`;
    cart.forEach(item => {
      message += `• ${item.descripcion}\n`;
      message += `  Cant: ${item.quantity} x $${item.precio} = $${(item.precio * item.quantity).toLocaleString()}\n`;
      message += `  Ref: ${item.codigo}\n\n`;
    });
    message += `*Total: $${total.toLocaleString()}*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Wrench size={16} className="sm:w-5 sm:h-5" />
            </div>
            <span className="font-black text-lg sm:text-2xl tracking-tight text-gray-900">Repuestos<span className="text-indigo-600">IA</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
            <a href="#" className="text-indigo-600">Inicio</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Catálogo</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Nosotros</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contacto</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowCart(true)}
              className="relative p-2 sm:p-2.5 bg-gray-50 text-gray-600 hover:text-indigo-600 transition-all rounded-xl sm:rounded-2xl hover:bg-indigo-50 group"
            >
              <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px] group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="h-6 sm:h-8 w-px bg-gray-100 mx-0.5 sm:mx-1" />
            <button className="bg-gray-900 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95">
              Acceso
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12 items-start">
          {/* Desktop Sidebar / Mobile Floating Button */}
          <div className={cn(
            "lg:col-span-4 h-[calc(100vh-100px)] lg:h-[calc(100vh-160px)] lg:sticky lg:top-24 z-40 transition-all duration-500",
            "fixed inset-0 bg-white lg:bg-transparent lg:relative lg:inset-auto",
            showChat ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 lg:translate-y-0 lg:opacity-100 pointer-events-none lg:pointer-events-auto"
          )}>
            <div className="h-full relative lg:bg-white lg:rounded-[2.5rem] lg:border lg:border-gray-100 lg:shadow-xl lg:shadow-gray-100/50 overflow-hidden">
              <button 
                onClick={() => setShowChat(false)}
                className="lg:hidden absolute top-4 right-4 z-50 p-2 bg-gray-100 rounded-full text-gray-500 shadow-sm"
              >
                <X size={20} />
              </button>
              <Chat 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                isLoading={isLoading} 
              />
            </div>
          </div>

          {/* Right Column: Results & Catalog */}
          <div className="lg:col-span-8 space-y-6 sm:space-y-10">
            {/* Hero / Features */}
            {messages.length <= 1 && !searchQuery && (
              <div className="bg-indigo-600 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200 group">
                <div className="relative z-10 max-w-lg">
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-4 sm:mb-6 border border-white/10">
                    <Bot size={12} className="text-indigo-200 sm:w-3.5 sm:h-3.5" /> Nueva Experiencia IA
                  </div>
                  <h1 className="text-2xl sm:text-5xl font-black mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                    Tu taller merece los <span className="text-indigo-200 italic">mejores</span> repuestos.
                  </h1>
                  <p className="text-indigo-100/80 mb-6 sm:mb-8 text-sm sm:text-lg font-medium leading-relaxed">
                    Localiza piezas exactas en nuestro inventario sincronizado en tiempo real.
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    <button 
                      onClick={() => setShowChat(true)}
                      className="bg-white text-indigo-600 px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-base font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                    >
                      Consultar con IA
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4 px-1 sm:px-2">
                      <div className="flex -space-x-2 sm:-space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[8px] sm:text-[10px] font-bold">
                            <Car size={12} className="sm:w-4 sm:h-4" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-indigo-100">+500 Clientes</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 opacity-10 transform rotate-12 group-hover:rotate-0 transition-transform duration-1000 hidden sm:block">
                  <Wrench size={450} />
                </div>
              </div>
            )}

            {/* Search Bar */}
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-[1.5rem] sm:rounded-[2rem] blur-xl group-focus-within:bg-indigo-500/10 transition-all" />
              <div className="relative">
                <Search className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5 sm:w-6 sm:h-6" />
                <input 
                  type="text" 
                  placeholder="Buscar repuesto o modelo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-[1.5rem] sm:rounded-[2rem] pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-6 shadow-sm focus:ring-0 focus:border-indigo-500 outline-none transition-all text-base sm:text-lg font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-2xl font-black text-gray-900 flex items-center gap-2 sm:gap-3">
                  <Package size={22} className="text-indigo-600 sm:w-7 sm:h-7" />
                  {searchQuery ? 'Resultados' : 'Catálogo'}
                  {searchQuery && <span className="text-[10px] sm:text-sm font-bold text-gray-400 bg-gray-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ml-1 sm:ml-2">{filteredParts.length}</span>}
                </h2>
                <div className="hidden sm:flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <span>Ordenar por:</span>
                  <select className="bg-transparent text-gray-900 outline-none cursor-pointer hover:text-indigo-600 transition-colors">
                    <option>Relevancia</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                  </select>
                </div>
              </div>

              {isSheetLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-[2.5rem] h-96 animate-pulse border border-gray-100 shadow-sm" />
                  ))}
                </div>
              ) : filteredParts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                  {filteredParts.map(part => (
                    <ProductCard key={part.codigo} part={part} onAddToCart={addToCart} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-gray-300">
                    <Search size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">No hay resultados</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2 sm:mt-3 text-sm sm:text-base font-medium">
                    Prueba con otras palabras o habla con nuestra IA.
                  </p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-6 sm:mt-8 text-indigo-600 font-black text-xs sm:text-sm uppercase tracking-widest hover:underline"
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-16 text-center border border-gray-100 shadow-sm">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 text-indigo-400">
                    <Search size={32} className="sm:w-10 sm:h-10" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900">Empieza tu búsqueda</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-2 sm:mt-3 text-sm sm:text-base font-medium">
                    Escribe lo que necesitas o usa el asistente IA.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 pt-8 sm:pt-12">
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-50 text-emerald-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} className="sm:w-8 sm:h-8" />
                </div>
                <h4 className="font-black text-base sm:text-lg mb-1 sm:mb-2 text-gray-900">Compra Segura</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Garantía de devolución total.</p>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Car size={24} className="sm:w-8 sm:h-8" />
                </div>
                <h4 className="font-black text-base sm:text-lg mb-1 sm:mb-2 text-gray-900">Envío Express</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Recibe en 24/48 horas.</p>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-gray-100 transition-all duration-500">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-50 text-amber-600 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                  <Wrench size={24} className="sm:w-8 sm:h-8" />
                </div>
                <h4 className="font-black text-base sm:text-lg mb-1 sm:mb-2 text-gray-900">Soporte</h4>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Asesoramiento experto.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Chat Toggle */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 lg:hidden">
        <button 
          onClick={() => setShowCart(true)}
          className="w-14 h-14 bg-white text-gray-900 rounded-2xl shadow-2xl flex items-center justify-center border border-gray-100 relative active:scale-90 transition-transform"
        >
          <ShoppingBag size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all active:scale-90"
        >
          {showChat ? <X size={24} /> : <Bot size={24} />}
        </button>
      </div>

      {/* Cart Modal */}
      <CartModal 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
        items={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12 sm:mt-24 py-8 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-12 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center text-white">
                <Wrench size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="font-black text-xl sm:text-2xl tracking-tight text-gray-900">RepuestosIA</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
              <a href="#" className="hover:text-gray-900 transition-colors">Términos</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Cookies</a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 bg-gray-50 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border border-gray-100">
              <span className="text-[8px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest">Estado:</span>
              <span className="text-[10px] sm:text-xs font-black text-emerald-600">Sincronizado</span>
            </div>
          </div>
          <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-gray-100 text-center text-[8px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
            © 2024 RepuestosIA. Excelencia Automotriz.
          </div>
        </div>
      </footer>
    </div>
  );
}
