import React, { useState } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  CreditCard,
  Heart,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SALON_INFO } from '../data/salonData';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  bookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAuth,
  onOpenDashboard,
  onOpenAdmin,
  activeSection,
  setActiveSection,
  bookingsCount
}) => {
  const { currentUser, userProfile, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isLoggedIn = Boolean(currentUser || userProfile);
  const displayName = userProfile?.displayName || currentUser?.displayName || 'Cliente';

  const navLinks = [
    { id: 'services', label: 'Soins & Tarifs' },
    { id: 'about', label: "L'Institut" },
    { id: 'team', label: 'Notre Équipe' },
    { id: 'reviews', label: 'Avis Clients' },
    { id: 'access', label: 'Plan & Accès' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFC8]/60 transition-all shadow-xs">
      {/* Top micro announcement bar */}
      <div className="bg-[#2C2420] text-[#E8DFC8] text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-4">
        <span className="hidden sm:inline-flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#C8957C]" />
          {SALON_INFO.address}, {SALON_INFO.city}
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="inline-flex items-center gap-1">
          <Phone className="w-3.5 h-3.5 text-[#C8957C]" />
          {SALON_INFO.phone}
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:inline text-[#E8D8CE]">
          Nocturne le jeudi jusqu'à 20h30 — Réservations 24h/24 en ligne
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button 
            onClick={() => setActiveSection('home')}
            className="flex items-center gap-3 text-left group focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#C8957C] to-[#E2B7A0] flex items-center justify-center text-white shadow-sm ring-2 ring-[#C8957C]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="block font-serif text-2xl font-bold tracking-tight text-[#2C2420] group-hover:text-[#9F674F] transition-colors">
                Un Moment pour Soi
              </span>
              <span className="block text-[11px] tracking-widest uppercase text-[#8C7A70] font-medium">
                Institut de Beauté • Brétigny-sur-Orge
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveSection(link.id);
                  const el = document.getElementById(link.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`text-sm font-medium transition-colors hover:text-[#9F674F] cursor-pointer ${
                  activeSection === link.id ? 'text-[#9F674F] font-semibold' : 'text-[#5A4D45]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Action buttons (Right) */}
          <div className="flex items-center gap-3">
            {/* Admin Dashboard shortcut (if admin) */}
            {isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#9F674F] hover:bg-[#88543E] text-white shadow-xs transition-colors cursor-pointer"
                title="Gérer les offres du salon et les rendez-vous"
              >
                <ShieldCheck className="w-4 h-4 text-[#FDEBD0]" />
                <span className="hidden sm:inline">Administration</span>
              </button>
            )}

            {/* My Bookings link (if logged in) */}
            {isLoggedIn && (
              <button
                onClick={onOpenDashboard}
                className="relative inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg text-[#2C2420] bg-white border border-[#E0D5C3] hover:border-[#C8957C] hover:bg-[#FAF7F2] shadow-2xs transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#C8957C]" />
                <span className="hidden sm:inline">Mes RDV</span>
                {bookingsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#C8957C] text-white">
                    {bookingsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#F3ECE2] transition-colors focus:outline-none"
                >
                  {userProfile?.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt={displayName} 
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-[#C8957C]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#C8957C]/20 text-[#9F674F] flex items-center justify-center font-semibold text-xs">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden md:inline text-xs font-medium text-[#2C2420] max-w-[110px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8C7A70]" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-[#E8DFC8] py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#F0EAE1]">
                      <p className="text-xs font-semibold text-[#2C2420] truncate">{displayName}</p>
                      <p className="text-[11px] text-[#8C7A70] truncate">{userProfile?.email || currentUser?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded bg-[#9F674F] text-white">
                          Gérante / Admin
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#9F674F] bg-[#FAF5F0] hover:bg-[#F3ECE2] flex items-center gap-2 border-b border-[#F0EAE1]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#9F674F]" />
                        Panneau Admin : Offres & Planning
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#2C2420] hover:bg-[#FAF7F2] flex items-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#C8957C]" />
                      Mes réservations & annulations
                    </button>
                    <div className="border-t border-[#F0EAE1] my-1"></div>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg text-[#2C2420] bg-white border border-[#E0D5C3] hover:border-[#C8957C] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-[#C8957C]" />
                <span>Connexion</span>
              </button>
            )}

            {/* Main Primary CTA: Réserver un soin */}
            <button
              onClick={onOpenBooking}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Prendre RDV</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#5A4D45] hover:bg-[#F3ECE2]"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-b border-[#E8DFC8] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setActiveSection(link.id);
                  setMobileMenuOpen(false);
                  const el = document.getElementById(link.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left py-2 px-3 rounded-lg text-sm font-medium text-[#2C2420] hover:bg-[#EFE9DF]"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8DFC8]/60 flex flex-col gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#9F674F] text-white text-sm font-semibold"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FDEBD0]" />
                  Administration (Offres & Planning)
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white">Gérer</span>
              </button>
            )}

            {isLoggedIn ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg bg-white border border-[#E0D5C3] text-sm font-medium text-[#2C2420]"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C8957C]" />
                    Mes Rendez-vous ({bookingsCount})
                  </span>
                  <span className="text-xs text-[#C8957C]">Gérer / Annuler</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-white border border-[#E0D5C3] text-sm font-semibold text-[#2C2420] text-center"
              >
                Se connecter (Client ou Démo)
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-[#B98166] to-[#9F674F] text-white font-semibold text-center text-sm shadow-md"
            >
              Prendre Rendez-vous en ligne
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
