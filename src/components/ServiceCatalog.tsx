import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Clock, 
  Search, 
  SlidersHorizontal, 
  ArrowRight, 
  Check, 
  Calendar,
  Info
} from 'lucide-react';
import { SALON_SERVICES } from '../data/salonData';
import { SalonService, ServiceCategory } from '../types/salon';

interface ServiceCatalogProps {
  onSelectService: (service: SalonService) => void;
  onViewServiceDetails: (service: SalonService) => void;
}

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  onSelectService,
  onViewServiceDetails
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'duration'>('featured');

  const categories = [
    { id: 'all', label: 'Toutes les Prestations' },
    { id: 'visage', label: 'Soins Visage' },
    { id: 'massages', label: 'Massages & Corps' },
    { id: 'regard', label: 'Cils & Regard' },
    { id: 'ongles', label: 'Onglerie & Spa' },
    { id: 'epilation', label: 'Épilations' },
    { id: 'rituels', label: 'Rituels Signature' },
  ];

  const filteredServices = useMemo(() => {
    return SALON_SERVICES.filter((svc) => {
      const matchesCategory = selectedCategory === 'all' || svc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        svc.title.toLowerCase().includes(q) ||
        svc.subtitle.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.categoryName.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes;
      return 0; // default order
    });
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE9DF] text-xs font-semibold text-[#8C5D47] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C8957C]" />
            <span>Carte des Soins & Tarifs</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2C2420] tracking-tight">
            Des rituels sur-mesure pour sublimer votre éclat
          </h2>
          <p className="mt-3 text-base text-[#6E5B50]">
            Tous nos soins incluent un diagnostic de peau offert et une boisson bien-être en tisanerie. 
            Réservation immédiate avec choix de votre créneau horaire.
          </p>
        </div>

        {/* Filter controls */}
        <div className="space-y-4 mb-10">
          
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#2C2420] text-white shadow-sm'
                    : 'bg-white text-[#5A4D45] hover:bg-[#EFE9DF] border border-[#E0D5C3]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar & Sort dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un soin (Kobido, massage, manucure...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#C8957C]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C7A70] hover:text-[#2C2420]"
                >
                  Effacer
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <SlidersHorizontal className="w-4 h-4 text-[#8C7A70]" />
              <span className="text-xs text-[#6E5B50] font-medium hidden sm:inline">Trier par :</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="py-2 px-3 rounded-xl bg-white border border-[#DDD3C1] text-xs font-medium text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#C8957C] cursor-pointer"
              >
                <option value="featured">Recommandés</option>
                <option value="price-asc">Prix : croissant</option>
                <option value="price-desc">Prix : décroissant</option>
                <option value="duration">Durée du soin</option>
              </select>
            </div>
          </div>

        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFC8] p-8">
            <p className="text-base text-[#5A4D45]">Aucune prestation ne correspond à votre recherche "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#2C2420] text-white text-xs font-semibold"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Service Image with badges */}
                  <div className="aspect-[16/10] overflow-hidden bg-[#FAF7F2] relative">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-75 transition-opacity" />
                    
                    {/* Category pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-bold text-[#8C5D47] shadow-xs">
                      {service.categoryName}
                    </div>

                    {/* Badge if present */}
                    {service.badge && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#B98166] text-white text-[11px] font-bold shadow-xs">
                        {service.badge}
                      </div>
                    )}

                    {/* Duration badge on image bottom */}
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1.5 drop-shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-[#E2B7A0]" />
                      <span>{service.durationMinutes} minutes</span>
                    </div>

                    {/* Price tag on image bottom right */}
                    <div className="absolute bottom-3 right-3 text-white flex items-baseline gap-1 drop-shadow-sm">
                      {service.originalPrice && (
                        <span className="text-xs line-through text-white/70">
                          {service.originalPrice} €
                        </span>
                      )}
                      <span className="font-serif text-xl font-bold text-white">
                        {service.price} €
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-[#2C2420] group-hover:text-[#9F674F] transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-[#8C7A70] italic mt-1">
                      {service.subtitle}
                    </p>

                    <p className="text-xs text-[#5A4D45] mt-3 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Key benefits list */}
                    <div className="mt-4 pt-4 border-t border-[#F0EAE1] space-y-1.5">
                      {service.benefits.slice(0, 2).map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#463B34]">
                          <Check className="w-3.5 h-3.5 text-[#C8957C] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card footer CTA buttons */}
                <div className="p-6 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewServiceDetails(service)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold text-[#5A4D45] bg-[#FAF7F2] border border-[#DDD3C1] hover:bg-[#EFE9DF] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-[#8C7A70]" />
                      <span>Détails & Protocole</span>
                    </button>

                    <button
                      onClick={() => onSelectService(service)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Réserver</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
