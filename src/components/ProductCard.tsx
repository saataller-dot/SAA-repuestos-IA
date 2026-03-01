import { SparePart } from '../types';
import { ShoppingCart, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '../App';

interface ProductCardProps {
  part: SparePart;
}

export function ProductCard({ part }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-video relative overflow-hidden bg-gray-100">
        <img
          src={part.fotos}
          alt={part.descripcion}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=400&h=300&auto=format&fit=crop';
          }}
        />
        <div className="absolute top-3 right-3">
          <span className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full">
            REF: {part.codigo}
          </span>
        </div>
      </div>
      
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-semibold text-gray-900 leading-tight text-sm sm:text-base line-clamp-2">{part.descripcion}</h3>
          <span className="font-mono text-base sm:text-lg font-bold text-indigo-600 whitespace-nowrap">
            ${part.precio.toLocaleString()}
          </span>
        </div>
        
        <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4 flex items-center justify-between">
          <span>Marca: <span className="font-bold text-gray-700">{part.marca}</span></span>
          {part.stock !== undefined && (
            <span className={cn(
              "font-bold px-2 py-0.5 rounded-full text-[9px]",
              part.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {part.stock > 0 ? `Stock: ${part.stock}` : 'Sin Stock'}
            </span>
          )}
        </p>
        
        <button
          className="w-full py-2 sm:py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors bg-black text-white hover:bg-gray-800 text-xs sm:text-sm"
        >
          <ShoppingCart size={16} />
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}
