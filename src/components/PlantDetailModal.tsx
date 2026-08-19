import React, { useState } from 'react';
import { X, MapPin, Store, MessageCircle, QrCode, BookOpen, Check, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Plant } from '../types/plant';
import { CareBadge } from './CareBadge';

interface PlantDetailModalProps {
  plant: Plant | null;
  onClose: () => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({ plant, onClose }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!plant) return null;

  // URL pública de acesso a esta planta
  const plantUrl = `${window.location.origin}${window.location.pathname}#p-${plant.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(plantUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Tons & Flores! Vi a planta *${plant.name}* (Tag #${plant.id}) no site e gostaria de mais informações!`
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      
      {/* Container Principal Mobile-First */}
      <div className="relative w-full max-w-md bg-stone-50 rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[92vh]">
        
        {/* Barra Superior */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
              TF
            </div>
            <span className="font-serif-title font-bold text-stone-900 text-sm">Tons & Flores</span>
            <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              #{plant.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowQrModal(!showQrModal)}
              title="Ver QR Code"
              className="p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-full transition-colors"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll Suave */}
        <div className="overflow-y-auto hide-scrollbar flex-1 pb-6">
          
          {/* Foto Principal */}
          <div className="relative h-64 bg-stone-200">
            <img 
              src={plant.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{plant.location}</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                plant.status === 'disponivel' 
                  ? 'bg-emerald-600 text-white' 
                  : plant.status === 'reservada' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-stone-600 text-white'
              }`}>
                {plant.status === 'disponivel' ? 'Disponível na Loja' : plant.status === 'reservada' ? 'Reservada' : 'Vendida'}
              </span>
            </div>
          </div>

          {/* Seção de Informações da Planta */}
          <div className="p-5 space-y-5">
            
            {/* Título & Preço */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                <span>{plant.category}</span>
                <span className="text-2xl font-extrabold text-stone-900 font-sans">
                  R$ {plant.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 font-serif-title mt-0.5">
                {plant.name}
              </h2>
              <p className="text-xs text-stone-500 italic mt-0.5">
                {plant.scientificName} • {plant.potSize}
              </p>
            </div>

            {/* Badges de Cuidados Básicos (Cards Coloridos) */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Iluminação — cor do container muda com o valor */}
              <div className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border ${
                plant.light === 'sol-pleno'
                  ? 'bg-amber-50 border-amber-200/70'
                  : plant.light === 'meia-sombra'
                  ? 'bg-orange-50 border-orange-200/70'
                  : 'bg-stone-100 border-stone-200'
              }`}>
                <CareBadge type="light" value={plant.light} />
              </div>
              {/* Rega — cor do container muda com o valor */}
              <div className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border ${
                plant.watering === 'baixa'
                  ? 'bg-blue-50 border-blue-200/70'
                  : plant.watering === 'moderada'
                  ? 'bg-sky-50 border-sky-200/70'
                  : 'bg-indigo-50 border-indigo-200/70'
              }`}>
                <CareBadge type="watering" value={plant.watering} />
              </div>
              {/* Pet Friendly — cor do container muda com o valor */}
              <div className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border ${
                plant.petFriendly
                  ? 'bg-emerald-50 border-emerald-200/70'
                  : 'bg-rose-50 border-rose-200/70'
              }`}>
                <CareBadge type="pets" value={plant.petFriendly} />
              </div>
            </div>

            {/* Guia de Cultivo & Cuidados */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wide text-stone-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Guia de Cultivo da Espécie
              </h3>

              <div className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                {plant.wateringTip && (
                  <p className="bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    <strong className="text-blue-900 block mb-0.5">💧 Como Regar:</strong>
                    {plant.wateringTip}
                  </p>
                )}
                {plant.careInstructions && (
                  <p className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/70">
                    <strong className="text-stone-800 block mb-0.5">✨ Dicas de Cuidado:</strong>
                    {plant.careInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Informações deste Vaso na Loja */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 p-4 rounded-2xl space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wide text-emerald-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-emerald-700" />
                Informações deste Vaso na Loja
              </h3>
              <div className="text-xs text-emerald-950 space-y-1.5 divide-y divide-emerald-200/60">
                <div className="flex justify-between pt-1">
                  <span className="text-emerald-700 font-medium">Localização física:</span>
                  <span className="font-semibold">{plant.location}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-emerald-700 font-medium">Tamanho / Tipo do vaso:</span>
                  <span className="font-semibold">{plant.potSize}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-emerald-700 font-medium">Código da Etiqueta:</span>
                  <span className="font-mono font-bold">#{plant.id}</span>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2 pt-1">
              <a 
                href={`https://wa.me/?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com a Tons & Flores no WhatsApp
              </a>

              <button 
                onClick={handleCopyLink}
                className="w-full bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Link Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Link Direto desta Planta
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Modal de Exibição do QR Code */}
        {showQrModal && (
          <div className="absolute inset-0 z-30 bg-stone-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="bg-white p-5 rounded-2xl shadow-xl flex flex-col items-center space-y-3 max-w-xs">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-800">
                Tons & Flores • #{plant.id}
              </span>
              <QRCodeSVG 
                value={plantUrl} 
                size={180} 
                level="H" 
                includeMargin={true}
                className="rounded-lg border p-1"
              />
              <div className="text-xs font-bold text-stone-900">{plant.name}</div>
              <div className="text-[10px] text-stone-500">Escaneie para abrir esta ficha no celular</div>
            </div>
            <button 
              onClick={() => setShowQrModal(false)}
              className="mt-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Fechar QR Code
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
