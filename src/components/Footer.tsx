import React from 'react';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  ExternalLink,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenGiftCard: () => void;
  onOpenStripeConfig: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenGiftCard,
  onOpenStripeConfig
}) => {
  return (
    <footer className="bg-[#211B17] text-[#E8D8CE] border-t border-[#3D322D] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#3D322D]">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#C8957C] to-[#E2B7A0] flex items-center justify-center text-[#211B17] font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-serif text-xl font-bold tracking-tight text-white">
                  Un Moment pour Soi
                </span>
                <span className="block text-[10px] tracking-widest uppercase text-[#C8957C] font-medium">
                  Institut de Beauté
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A8988E] leading-relaxed">
              Votre sanctuaire de douceur et de haute expertise esthétique à Brétigny-sur-Orge. 
              Soins du visage, modelages corps, rituel Kobido et mise en beauté.
            </p>

            <div className="pt-2">
              <a
                href={SALON_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#E2B7A0] hover:text-white transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Voir sur Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Col 2: Coordinates & Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Nous Contacter
            </h4>
            <div className="space-y-2.5 text-xs text-[#A8988E]">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C8957C] shrink-0 mt-0.5" />
                <span>{SALON_INFO.address}<br />{SALON_INFO.postalCode} {SALON_INFO.city}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C8957C] shrink-0" />
                <a href={`tel:${SALON_INFO.phone}`} className="hover:text-white transition-colors">{SALON_INFO.phone}</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C8957C] shrink-0" />
                <a href={`mailto:${SALON_INFO.email}`} className="hover:text-white transition-colors">{SALON_INFO.email}</a>
              </p>
            </div>
          </div>

          {/* Col 3: Hours Summary */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Horaires de l'Institut
            </h4>
            <div className="space-y-1.5 text-xs text-[#A8988E]">
              <p className="flex justify-between">
                <span>Mardi – Vendredi :</span>
                <span className="text-white font-medium">09:30 – 19:30</span>
              </p>
              <p className="flex justify-between text-[#E2B7A0] font-medium">
                <span>Nocturne Jeudi :</span>
                <span>jusqu'à 20:30</span>
              </p>
              <p className="flex justify-between">
                <span>Samedi :</span>
                <span className="text-white font-medium">09:00 – 18:30</span>
              </p>
              <p className="flex justify-between text-stone-500">
                <span>Dimanche & Lundi :</span>
                <span>Fermé</span>
              </p>
            </div>
          </div>

          {/* Col 4: Quick Actions */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white tracking-wide">
              Réservations & Cadeaux
            </h4>
            <div className="space-y-2">
              <button
                onClick={onOpenBooking}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] transition-all text-center shadow-xs cursor-pointer"
              >
                Prendre Rendez-vous en ligne
              </button>
              <button
                onClick={onOpenGiftCard}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-[#E8D8CE] bg-[#2E2520] hover:bg-[#3D322D] border border-[#4A3C33] transition-colors text-center cursor-pointer"
              >
                Offrir une Carte Cadeau
              </button>
              <button
                onClick={onOpenStripeConfig}
                className="w-full py-1.5 px-3 text-[11px] text-[#A8988E] hover:text-white transition-colors text-center"
              >
                API Stripe & Intégration
              </button>
            </div>
          </div>

        </div>

        {/* Bottom micro bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C7A70] gap-4">
          <p>
            © {new Date().getFullYear()} Un Moment pour Soi. Tous droits réservés. 22 Rue du Bois de Châtres, Brétigny-sur-Orge.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Annulation sans frais jusqu'à 24h</span>
            <span>•</span>
            <span>Paiement sécurisé</span>
            <span>•</span>
            <span>Mentions Légales</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
