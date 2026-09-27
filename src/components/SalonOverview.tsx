import React from 'react';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ExternalLink, 
  Car, 
  Bus, 
  Coffee, 
  Sparkles, 
  ShieldCheck,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { SALON_INFO } from '../data/salonData';

export const SalonOverview: React.FC = () => {
  // Current day in French
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const today = dayNames[new Date().getDay()];

  return (
    <section id="about" className="py-16 sm:py-24 bg-white/70 border-y border-[#E8DFC8]/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-xs font-semibold text-[#8C5D47] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C8957C]" />
            <span>L'Institut & Son Univers</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2C2420] tracking-tight">
            Un havre de paix dédié à votre beauté et votre bien-être
          </h2>
          <p className="mt-4 text-base text-[#6E5B50] leading-relaxed">
            Situé au 22 Rue du Bois de Châtres à Brétigny-sur-Orge, l'institut « Un Moment pour Soi » 
            a été pensé comme une bulle intime et chaleureuse. Ici, chaque soin commence par une écoute attentive 
            et se poursuit dans des cabines spacieuses baignées de lumières tamisées.
          </p>
        </div>

        {/* Atmosphere Gallery: 3 photo cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="group rounded-2xl overflow-hidden shadow-sm border border-[#E8DFC8] bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
              <img 
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=700&q=80" 
                alt="Cabine de soin visage et massage" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-bold text-[#2C2420]">Cabines de Soins Privatives</h3>
              <p className="mt-1 text-xs text-[#6E5B50] leading-relaxed">
                Tables chauffantes ergonomiques, draps de coton doux, musique feutrée et diffusion d'huiles essentielles bio.
              </p>
            </div>
          </div>

          <div className="group rounded-2xl overflow-hidden shadow-sm border border-[#E8DFC8] bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
              <img 
                src="https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=700&q=80" 
                alt="Nail bar et espace manucure" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-bold text-[#2C2420]">Espace Manucure & Regard</h3>
              <p className="mt-1 text-xs text-[#6E5B50] leading-relaxed">
                Un bar à ongles lumineux et équipé d'aspirateurs professionnels pour votre confort lors des manucures russes et poses de vernis.
              </p>
            </div>
          </div>

          <div className="group rounded-2xl overflow-hidden shadow-sm border border-[#E8DFC8] bg-white">
            <div className="aspect-[4/3] overflow-hidden bg-[#FAF7F2]">
              <img 
                src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80" 
                alt="Espace tisanerie bio détox" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-serif text-lg font-bold text-[#2C2420]">Lounge & Tisanerie Bio</h3>
              <p className="mt-1 text-xs text-[#6E5B50] leading-relaxed">
                Prolongez les bienfaits de votre soin autour d'une sélection de thés verts détox, d'infusions bien-être et de douceurs artisanales.
              </p>
            </div>
          </div>
        </div>

        {/* Practical Information Grid: Address, Hours, Access, Interactive Map */}
        <div id="access" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Address, Hours & Amenities */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Address Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DFC8]">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-[#8C5D47]">
                    Adresse & Coordonnées
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#2C2420] mt-1">
                    {SALON_INFO.name}
                  </h3>
                  <p className="text-sm text-[#5A4D45] mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C8957C] shrink-0" />
                    <span>{SALON_INFO.address}, {SALON_INFO.postalCode} {SALON_INFO.city} ({SALON_INFO.region})</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E8DFC8]/60">
                <a 
                  href={`tel:${SALON_INFO.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#DDD3C1] hover:border-[#C8957C] text-[#2C2420] text-sm font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 text-[#C8957C]" />
                  <span>{SALON_INFO.phone}</span>
                </a>
                <a 
                  href={`mailto:${SALON_INFO.email}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-[#DDD3C1] hover:border-[#C8957C] text-[#2C2420] text-sm font-medium transition-colors truncate"
                >
                  <Mail className="w-4 h-4 text-[#C8957C] shrink-0" />
                  <span className="truncate">{SALON_INFO.email}</span>
                </a>
              </div>

              {/* Direct Google Maps Link provided by user */}
              <div className="mt-4">
                <a
                  href={SALON_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#2C2420] hover:bg-[#3D322D] transition-colors shadow-sm"
                >
                  <Navigation className="w-4 h-4 text-[#E2B7A0]" />
                  <span>Ouvrir dans Google Maps (Itinéraire direct)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#E8DFC8]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#C8957C]" />
                  <h4 className="font-serif text-lg font-bold text-[#2C2420]">Horaires d'Ouverture</h4>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#EAE0D3] text-[#8C5D47] font-semibold">
                  Aujourd'hui : {today}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                {SALON_INFO.hours.map((item, idx) => {
                  const isCurrentDay = item.days.toLowerCase().includes(today.toLowerCase());
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center justify-between py-1.5 px-3 rounded-lg ${
                        isCurrentDay ? 'bg-[#EAE0D3]/80 font-bold text-[#2C2420]' : 'text-[#5A4D45]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        {isCurrentDay && <span className="w-1.5 h-1.5 rounded-full bg-[#C8957C]"></span>}
                        {item.days}
                      </span>
                      <div className="text-right">
                        <span>{item.hours}</span>
                        {item.note && (
                          <span className="block text-[10px] font-normal text-[#8C5D47]">
                            {item.note}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Access hints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-[#E8DFC8] flex items-start gap-3">
                <Car className="w-5 h-5 text-[#C8957C] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#2C2420]">En Voiture</p>
                  <p className="text-[#6E5B50] mt-0.5">Accès N104 & N20. Places de stationnement gratuites réservées devant l'institut.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white border border-[#E8DFC8] flex items-start gap-3">
                <Bus className="w-5 h-5 text-[#C8957C] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-[#2C2420]">Transports en commun</p>
                  <p className="text-[#6E5B50] mt-0.5">Gare RER C Brétigny (5 min en bus 227-01 / 227-02 arrêt Bois de Châtres).</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Map & Salon Highlights */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Interactive Embedded Map representation */}
            <div className="rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-md bg-white relative">
              <div className="bg-[#FAF7F2] p-4 border-b border-[#E8DFC8] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2C2420]">
                  <MapPin className="w-4 h-4 text-[#C8957C]" />
                  <span>Localisation exacte à Brétigny-sur-Orge (48.6036, 2.2962)</span>
                </div>
                <a
                  href={SALON_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#9F674F] hover:underline flex items-center gap-1 font-semibold"
                >
                  Plein écran <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Embedded OpenStreetMap iframe focused right on coordinates 48.6036887, 2.2962037 */}
              <div className="h-80 w-full relative bg-[#EADECE]">
                <iframe
                  title="Carte Un Moment pour Soi Brétigny-sur-Orge"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=2.2900%2C48.6000%2C2.3020%2C48.6070&layer=mapnik&marker=48.6036887%2C2.2962037`}
                  className="w-full h-full border-0"
                />
                
                {/* Floating interactive marker pin badge */}
                <div className="absolute top-4 left-4 p-3 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-[#E8DFC8] text-xs max-w-xs">
                  <div className="font-bold text-[#2C2420] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C8957C] animate-pulse"></span>
                    Un Moment pour Soi
                  </div>
                  <p className="text-[11px] text-[#6E5B50] mt-0.5">
                    22 Rue du Bois de Châtres, 91220 Brétigny-sur-Orge
                  </p>
                  <a
                    href={SALON_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold text-[#8C5D47] hover:text-[#2C2420]"
                  >
                    Ouvrir l'itinéraire Google Maps →
                  </a>
                </div>
              </div>

              {/* Amenities list */}
              <div className="p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70] mb-3">
                  Services & Équipements de l'institut
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5A4D45]">
                  {SALON_INFO.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-[#C8957C] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hygiene & Serenity Pledge */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F5EFE6] to-[#FAF7F2] border border-[#E0D5C3] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EAE0D3] flex items-center justify-center text-[#8C5D47] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-[#5A4D45]">
                <h4 className="font-bold text-[#2C2420] text-sm">Charte d'Excellence & Hygiène</h4>
                <p className="mt-1 leading-relaxed">
                  Stérilisation médicale de tous les instruments d'onglerie et de soin, linge individuel à usage unique changé après chaque cliente, 
                  et cosmétiques naturels testés dermatologiquement.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
