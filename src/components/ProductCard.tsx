import { useState } from 'react';
import { SparePart } from '../types';
import { ShoppingCart, Car, ImageOff, X, Maximize2 } from 'lucide-react';
import { cn } from '../App';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  part: SparePart;
  onAddToCart: (part: SparePart) => void;
}

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3';

export function ProductCard({ part, onAddToCart }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isPlaceholder = !part.fotos || part.fotos.includes(PLACEHOLDER_IMAGE);
  const showNoImageNote = imageError || isPlaceholder;

  return (
    <>
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-500 group">
      <div 
        className="aspect-[4/3] relative overflow-hidden bg-gray-50 cursor-zoom-in"
        onClick={() => setIsModalOpen(true)}
      >
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
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
          <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-50 group-hover:scale-100" size={32} />
        </div>
        
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

    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
        >
          <motion.button
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
          >
            <X size={32} />
          </motion.button>

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={part.fotos}
              alt={part.descripcion}
              className="w-full h-full object-contain rounded-3xl shadow-2xl"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `${PLACEHOLDER_IMAGE}?q=80&w=1200&h=800&auto=format&fit=crop`;
              }}
            />
            <div className="mt-6 text-center">
              <h3 className="text-white text-xl sm:text-2xl font-black uppercase tracking-widest mb-2">{part.descripcion}</h3>
              <p className="text-white/50 text-sm font-bold tracking-[0.3em] uppercase">{part.marca} • REF: {part.codigo}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
