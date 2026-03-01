import { SparePart } from '../types';
import { ShoppingCart, Car } from 'lucide-react';
import { cn } from '../App';

interface ProductCardProps {
  part: SparePart;
  onAddToCart: (part: SparePart) => void;
}

export function ProductCard({ part, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 group">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
        <img
          src={part.fotos}
          alt={part.descripcion}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&h=300&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            REF: {part.codigo}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2 gap-4">
          <h3 className="font-bold text-gray-900 leading-tight text-lg line-clamp-2">{part.descripcion}</h3>
          <span className="font-black text-xl text-indigo-600 whitespace-nowrap">
            ${part.precio.toLocaleString()}
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <Car size={14} />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{part.marca}</span>
          </div>
          {part.stock !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
              part.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", part.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
              {part.stock > 0 ? `Stock: ${part.stock}` : 'Sin Stock'}
            </div>
          )}
        </div>
        
        <button
          onClick={() => onAddToCart(part)}
          disabled={part.stock === 0}
          className={cn(
            "w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-sm uppercase tracking-widest shadow-lg active:scale-95",
            part.stock === 0 
              ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed" 
              : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
          )}
        >
          <ShoppingCart size={18} />
          {part.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  );
}
