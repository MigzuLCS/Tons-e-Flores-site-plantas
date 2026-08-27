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
      <div className="relative w-full max-w-md bg-brand-surface rounded-3xl shadow-xl overflow-hidden border border-brand-border flex flex-col max-h-[92vh]">
        
        {/* Barra Superior */}
        <div className="sticky top-0 z-20 bg-brand-surface/95 backdrop-blur-md px-5 py-3.5 flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-brand-olive-light text-brand-olive flex items-center justify-center text-xs font-serif-title font-bold shadow-xs border border-brand-olive-border">
              TF
            </div>
            <span className="font-serif-title font-bold text-brand-text text-sm">Tons & Flores</span>
            <span className="text-[10px] font-mono font-bold bg-brand-olive-light text-brand-olive-text border border-brand-olive-border px-2 py-0.5 rounded-full">
              #{plant.id}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => setShowQrModal(!showQrModal)}
              title="Ver QR Code"
              className="p-2 text-brand-text-muted hover:text-brand-olive hover:bg-brand-olive-light rounded-full transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-subtle rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll Suave */}
        <div className="overflow-y-auto hide-scrollbar flex-1 pb-6 bg-brand-bg">
          
          {/* Foto Principal */}
          <div className="relative h-64 bg-brand-surface-subtle">
            <img 
              src={plant.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80'} 
              alt={plant.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-brand-surface/90 backdrop-blur-md text-brand-text text-xs px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-xs border border-brand-border">
              <MapPin className="w-3.5 h-3.5 text-brand-olive" />
              <span>{plant.location}</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-xs ${
                plant.status === 'disponivel' 
                  ? 'bg-brand-olive text-white' 
                  : plant.status === 'reservada' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-brand-nude text-white'
              }`}>
                {plant.status === 'disponivel' ? 'Disponível na Loja' : plant.status === 'reservada' ? 'Reservada' : 'Vendida'}
              </span>
            </div>
          </div>

          {/* Seção de Informações da Planta */}
          <div className="p-5 space-y-5">
            
            {/* Título & Preço */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-brand-olive uppercase tracking-wider">
                <span>{plant.category}</span>
                <span className="text-2xl font-extrabold text-brand-text font-sans">
                  R$ {plant.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-brand-text font-serif-title mt-0.5">
                {plant.name}
              </h2>
              <p className="text-xs text-brand-text-muted italic mt-0.5">
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
                  : 'bg-brand-surface-subtle border-brand-border'
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
                  ? 'bg-brand-nude-light border-brand-nude-border'
                  : 'bg-brand-surface-subtle border-brand-border'
              }`}>
                <CareBadge type="pets" value={plant.petFriendly} />
              </div>
            </div>

            {/* Guia de Cultivo & Cuidados */}
            <div className="bg-brand-surface p-4.5 rounded-2xl border border-brand-border shadow-xs space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wide text-brand-text flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-brand-olive" />
                Guia de Cultivo da Espécie
              </h3>

              <div className="text-xs text-brand-text space-y-2.5 leading-relaxed">
                {plant.wateringTip && (
                  <p className="bg-blue-50/50 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <strong className="text-blue-900 dark:text-blue-200 block mb-0.5">💧 Como Regar:</strong>
                    {plant.wateringTip}
                  </p>
                )}
                {plant.careInstructions && (
                  <p className="bg-brand-surface-subtle p-2.5 rounded-xl border border-brand-border">
                    <strong className="text-brand-text block mb-0.5">✨ Dicas de Cuidado:</strong>
                    {plant.careInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Ficha Botânica Detalhada (Perenual API) */}
            {(plant.family || plant.origin || plant.cycle || plant.bloomingSeason || plant.pestsDiseases || plant.toxicity) && (
              <div className="bg-brand-surface p-4.5 rounded-2xl border border-brand-border shadow-xs space-y-2.5">
                <h3 className="font-bold text-xs uppercase tracking-wide text-brand-text flex items-center gap-1.5 border-b border-brand-border pb-1.5">
                  🌿 Ficha Botânica Detalhada
                </h3>
                <div className="text-xs text-brand-text space-y-1.5">
                  {plant.family && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Família:</span>
                      <span className="font-semibold">{plant.family}</span>
                    </div>
                  )}
                  {plant.origin && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Origem:</span>
                      <span className="font-semibold text-right max-w-[200px] break-words">{plant.origin}</span>
                    </div>
                  )}
                  {plant.cycle && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Ciclo:</span>
                      <span className="font-semibold">{plant.cycle}</span>
                    </div>
                  )}
                  {plant.bloomingSeason && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Floração:</span>
                      <span className="font-semibold">{plant.bloomingSeason}</span>
                    </div>
                  )}
                  {plant.pestsDiseases && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Pragas comuns:</span>
                      <span className="font-semibold text-right max-w-[200px] break-words">{plant.pestsDiseases}</span>
                    </div>
                  )}
                  {plant.toxicity && (
                    <div className="flex justify-between">
                      <span className="text-brand-text-muted">Toxicidade:</span>
                      <span className="font-semibold text-right max-w-[200px] break-words text-brand-nude-text">{plant.toxicity}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informações deste Vaso na Loja */}
            <div className="bg-brand-olive-light/60 border border-brand-olive-border p-4 rounded-2xl space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wide text-brand-olive-text flex items-center gap-1.5">
                <Store className="w-4 h-4 text-brand-olive" />
                Informações deste Vaso na Loja
              </h3>
              <div className="text-xs text-brand-text space-y-1.5 divide-y divide-brand-olive-border/60">
                <div className="flex justify-between pt-1">
                  <span className="text-brand-olive-text font-medium">Localização física:</span>
                  <span className="font-semibold">{plant.location}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-brand-olive-text font-medium">Tamanho / Tipo do vaso:</span>
                  <span className="font-semibold">{plant.potSize}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-brand-olive-text font-medium">Código da Etiqueta:</span>
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
                className="w-full bg-brand-olive hover:bg-brand-olive-hover text-white font-semibold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com a Tons & Flores no WhatsApp
              </a>

              <button 
                onClick={handleCopyLink}
                className="w-full bg-brand-surface hover:bg-brand-surface-subtle text-brand-text border border-brand-border font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-olive" />
                    <span className="text-brand-olive-text font-semibold">Link Copiado com Sucesso!</span>
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
          <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs p-6 flex flex-col items-center justify-center text-center animate-in fade-in">
            <div className="bg-brand-surface p-5 rounded-2xl shadow-xl flex flex-col items-center space-y-3 max-w-xs border border-brand-border">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-olive font-serif-title">
                Tons & Flores • #{plant.id}
              </span>
              <QRCodeSVG 
                value={plantUrl} 
                size={180} 
                level="H" 
                includeMargin={true}
                className="rounded-lg border border-brand-border p-1 bg-white"
              />
              <div className="text-xs font-bold text-brand-text">{plant.name}</div>
              <div className="text-[10px] text-brand-text-muted">Escaneie para abrir esta ficha no celular</div>
            </div>
            <button 
              onClick={() => setShowQrModal(false)}
              className="mt-4 px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Fechar QR Code
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
