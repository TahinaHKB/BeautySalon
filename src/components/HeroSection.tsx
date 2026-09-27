import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Star,
  CheckCircle2,
  Heart
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenBooking,
  onExploreServices
}) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Decorative ambient background blurbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#EADECE]/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[#F3ECE2]/60 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headings & Call to Action */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE9DF] border border-[#DDD3C1] text-xs font-semibold text-[#8C5D47]">
              <Sparkles className="w-3.5 h-3.5 text-[#C8957C]" />
              <span>Institut de Beauté & Bien-Être • Brétigny-sur-Orge (91)</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#2C2420] leading-[1.15]">
              Offrez-vous un <span className="italic font-normal text-[#9F674F]">moment précieux</span> rien que pour vous.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#5A4D45] max-w-2xl leading-relaxed">
              Poussez les portes de notre écrin à Brétigny-sur-Orge. Soins du visage sur-mesure, 
              massages enveloppants aux huiles précieuses, rituel Kobido, beauté du regard et manucure russe. 
              Une parenthèse bienfaisante alliant gestuelle experte et sérénité absolue.
            </p>

            {/* Value checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-sm text-[#463B34]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C8957C] shrink-0" />
                <span>Praticiennes certifiées diplômées d'État</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C8957C] shrink-0" />
                <span>Cosmétiques bio & formules végétales</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C8957C] shrink-0" />
                <span>Annulation sans frais jusqu'à 24h avant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#C8957C] shrink-0" />
                <span>Parking privé gratuit devant l'institut</span>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-3">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-lg shadow-[#9F674F]/25 hover:shadow-xl transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Calendar className="w-5 h-5" />
                <span>Réserver un rendez-vous</span>
              </button>

              <button
                onClick={onExploreServices}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-base font-medium text-[#2C2420] bg-white border border-[#DDD3C1] hover:border-[#C8957C] hover:bg-[#FAF7F2] shadow-xs transition-colors cursor-pointer"
              >
                <span>Consulter la carte des soins</span>
                <ArrowRight className="w-4 h-4 text-[#9F674F]" />
              </button>
            </div>

            {/* Review pill score */}
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-[#2C2420]">4.9 / 5</span>
              <span className="text-xs text-[#8C7A70]">• Plus de 250 clientes fidèles à Brétigny-sur-Orge</span>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Main Image Card with arched border frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 aspect-[4/5] bg-[#EADECE]">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=85"
                  alt="Institut de beauté Un Moment pour Soi"
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                {/* Overlaid Bottom Details */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/50 text-[#2C2420] shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-lg text-[#2C2420]">Institut Un Moment pour Soi</h4>
                      <p className="text-xs text-[#5A4D45] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C8957C]" />
                        22 Rue du Bois de Châtres, Brétigny
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-[#EAE0D3] text-[#8C5D47] text-[11px] font-bold">
                        Ouvert
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-[#E8DFC8]/60 flex items-center justify-between text-xs text-[#6E5B50]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C8957C]" />
                      09:30 – 19:30
                    </span>
                    <span className="font-semibold text-[#9F674F]">
                      Nocturne Jeudi 20h30
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Badge: Annulation Gratuite */}
              <div className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-xl border border-[#E8DFC8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3ECE2] flex items-center justify-center text-[#9F674F]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2C2420]">Annulation Flexible</p>
                  <p className="text-[11px] text-[#8C7A70]">Sans frais jusqu'à 24h avant</p>
                </div>
              </div>

              {/* Floating Badge: Rituel Signature */}
              <div className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-3.5 shadow-xl border border-[#E8DFC8] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5E6DC] flex items-center justify-center text-[#B98166]">
                  <Heart className="w-5 h-5 fill-[#B98166]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2C2420]">Grand Rituel Signature</p>
                  <p className="text-[11px] text-[#8C7A70]">2h de bien-être absolu</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
