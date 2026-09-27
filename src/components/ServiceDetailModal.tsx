import React from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Calendar, 
  Heart,
  ShieldCheck,
  Coffee
} from 'lucide-react';
import { SalonService } from '../types/salon';
import { SALON_INFO } from '../data/salonData';

interface ServiceDetailModalProps {
  service: SalonService | null;
  onClose: () => void;
  onBookService: (service: SalonService) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onBookService
}) => {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#E8DFC8] relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-[#2C2420] hover:bg-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className="relative h-64 bg-[#FAF7F2] overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-[#B98166] text-white text-xs font-semibold mb-2">
              {service.categoryName} {service.badge ? `• ${service.badge}` : ''}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {service.title}
            </h2>
            <p className="text-xs text-[#E8D8CE] italic mt-1">
              {service.subtitle}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8]">
            <div>
              <span className="text-[11px] text-[#8C7A70] font-medium uppercase tracking-wider block">Durée</span>
              <span className="font-serif text-lg font-bold text-[#2C2420] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4 text-[#C8957C]" />
                {service.durationMinutes} min
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#8C7A70] font-medium uppercase tracking-wider block">Tarif</span>
              <span className="font-serif text-lg font-bold text-[#9F674F] mt-0.5 block">
                {service.price} € TTC
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[11px] text-[#8C7A70] font-medium uppercase tracking-wider block">Lieu</span>
              <span className="text-xs font-semibold text-[#2C2420] mt-1 block">
                Cabine privative
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#8C7A70] mb-2">
              Description du Rituel
            </h3>
            <p className="text-sm text-[#5A4D45] leading-relaxed">
              {service.description}
            </p>
          </div>

          {/* Key Benefits */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-bold text-[#8C7A70] mb-3">
              Bénéfices constatés
            </h3>
            <div className="space-y-2">
              {service.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-[#463B34]">
                  <CheckCircle2 className="w-4 h-4 text-[#C8957C] shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Protocol Steps */}
          {service.protocol && service.protocol.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider font-bold text-[#8C7A70] mb-3">
                Déroulement & Protocole de soin
              </h3>
              <div className="space-y-2.5">
                {service.protocol.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#5A4D45]">
                    <span className="w-5 h-5 rounded-full bg-[#EAE0D3] text-[#8C5D47] font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="p-4 rounded-xl bg-[#F5EFE6] border border-[#E0D5C3] text-xs text-[#5A4D45]">
            <span className="font-bold text-[#2C2420] block mb-1">Pour qui ?</span>
            {service.recommendedFor}
          </div>

          {/* Free amenities note */}
          <div className="flex items-center gap-3 text-xs text-[#8C7A70] pt-2">
            <Coffee className="w-4 h-4 text-[#C8957C]" />
            <span>Infusion bio & mignardises offertes en fin de soin dans notre lounge de relaxation.</span>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="p-6 bg-[#FAF7F2] border-t border-[#E8DFC8] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#8C7A70] block">Prix du soin</span>
            <span className="font-serif text-2xl font-bold text-[#2C2420]">{service.price} €</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs font-semibold text-[#5A4D45] hover:bg-white transition-colors cursor-pointer"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                onBookService(service);
              }}
              className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Réserver ce soin ({service.price} €)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
