import { X, ShoppingCart, Trash2, Plus, Minus, MessageCircle } from 'lucide-react';
import { CartItem } from '../types';
import { cn } from '../App';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (codigo: string, delta: number) => void;
  onRemoveItem: (codigo: string) => void;
  onCheckout: () => void;
}

export function CartModal({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: CartModalProps) {
  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <ShoppingCart size={16} className="sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">Tu Carrito</h2>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">{items.length} productos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <ShoppingCart size={40} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">El carrito está vacío</h3>
              <p className="text-gray-500 text-sm mt-1">Explora nuestro catálogo y añade lo que necesites.</p>
              <button 
                onClick={onClose}
                className="mt-6 text-indigo-600 font-bold text-sm hover:underline"
              >
                Volver al catálogo
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.codigo} 
                className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-2xl sm:rounded-3xl border border-transparent hover:border-indigo-100 transition-all group"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                  <img 
                    src={item.fotos} 
                    alt={item.descripcion} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">{item.descripcion}</h4>
                    <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">{item.marca} • {item.codigo}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-sm">
                      <button 
                        onClick={() => onUpdateQuantity(item.codigo, -1)}
                        disabled={item.quantity <= 1}
                        className="p-1 hover:bg-gray-50 text-gray-400 disabled:opacity-30 transition-colors"
                      >
                        <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-[10px] sm:text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.codigo, 1)}
                        className="p-1 hover:bg-gray-50 text-gray-400 transition-colors"
                      >
                        <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-indigo-600">${(item.precio * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.codigo)}
                  className="p-1.5 sm:p-2 text-gray-300 hover:text-red-500 transition-colors self-start"
                >
                  <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-500 font-medium">Total estimado</span>
              <span className="text-lg sm:text-2xl font-black text-gray-900">${total.toLocaleString()}</span>
            </div>
            <button 
              onClick={onCheckout}
              className="w-full bg-emerald-600 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-[0.98] text-xs sm:text-base"
            >
              <MessageCircle size={18} className="sm:w-5 sm:h-5" />
              WhatsApp
            </button>
            <p className="text-[9px] sm:text-[10px] text-center text-gray-400 font-medium">
              Serás redirigido a WhatsApp para finalizar tu pedido.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
