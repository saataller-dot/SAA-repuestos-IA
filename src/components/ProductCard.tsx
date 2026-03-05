import { useState } from 'react';
import { SparePart } from '../types';
import { ShoppingCart, Car, ImageOff } from 'lucide-react';
import { cn } from '../App';

interface ProductCardProps {
  part: SparePart;
  onAddToCart: (part: SparePart) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3';

export function ProductCard({ part, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const isPlaceholder = !part.fotos || part.fotos.includes(PLACEHOLDER_IMAGE);
  const showNoImageNote = imageError || isPlaceholder;

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 group">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
        <img
          src={part.fotos}
          alt={part.descripcion}
          className={cn(
            "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700",
            showNoImageNote && "opacity-70 grayscale-[50%]"
          )}
          referrerPolicy="no-referrer"
          onError={(e) => {
            setImageError(true);
            (e.target as HTMLImageElement).src = `${PLACEHOLDER_IMAGE}?q=80&w=400&h=300&auto=format&fit=crop`;
          }}
        />
        
        {showNoImageNote && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/20 backdrop-blur-[1px]">
            <div className="bg-white/90 p-3 rounded-full shadow-xl mb-3 scale-110">
              <ImageOff size={24} className="text-gray-600" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white drop-shadow-md bg-gray-900/40 px-3 py-1 rounded-lg">Imagen no disponible</span>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span className="bg-white/90 backdrop-blur-md text-gray-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
            REF: {part.codigo}
          </span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6">
        <div className="flex flex-col mb-4 gap-1">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-bold text-gray-900 leading-tight text-sm sm:text-base md:text-lg">
              {part.descripcion}
            </h3>
            <span className="font-black text-base sm:text-lg md:text-xl text-indigo-600 whitespace-nowrap">
              ${part.precio.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
              <Car size={12} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{part.marca}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          {part.stock !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
              part.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", part.stock > 0 ? "bg-emerald-500" : "bg-red-500")} />
              {part.stock > 0 ? `Stock: ${part.stock}` : 'Sin Stock'}
            </div>
          )}
          <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
            REF: {part.codigo}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(part)}
          disabled={part.stock === 0}
          className={cn(
            "w-full py-3 sm:py-4 rounded-2xl font-black flex items-center justify-center gap-2 sm:gap-3 transition-all text-[10px] sm:text-sm uppercase tracking-widest shadow-lg active:scale-95",
            part.stock === 0 
              ? "bg-gray-100 text-gray-400 shadow-none cursor-not-allowed" 
              : "bg-gray-900 text-white hover:bg-black shadow-gray-200"
          )}
        >
          <ShoppingCart size={16} className="sm:w-[18px] sm:h-[18px]" />
          {part.stock === 0 ? 'Agotado' : 'Añadir al carrito'}
        </button>
      </div>
    </div>
  );
}
