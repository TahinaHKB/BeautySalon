import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search, 
  Award, 
  ShieldCheck, 
  ShieldAlert,
  TrendingUp, 
  Users, 
  DollarSign,
  Layers,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { Booking, SalonService, ServiceCategory, UserProfile, UserRole } from '../types/salon';
import { SALON_INFO } from '../data/salonData';
import { BookingService } from '../services/bookingService';
import { ServiceManager } from '../services/serviceManager';
import { UserService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
  onBackToStorefront: () => void;
  services: SalonService[];
  practitioners?: UserProfile[];
  onServicesChanged: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStorefront,
  services,
  practitioners = [],
  onServicesChanged
}) => {
  const { userProfile, currentUser, logout, isSuperAdmin, isPractitioner, userRole } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'users' | 'team'>('bookings');

  // Protect the users tab: if practitioner tries to access, redirect to bookings
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'users') {
      setActiveTab('bookings');
    }
  }, [isSuperAdmin, activeTab]);

  // Bookings list state
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [practitionerFilter, setPractitionerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Users list state (for promotion/demotion)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Service form state (Create / Edit)
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [serviceFormMode, setServiceFormMode] = useState<'create' | 'edit'>('create');

  // Fields for service form
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formCategory, setFormCategory] = useState<ServiceCategory>('visage');
  const [formDuration, setFormDuration] = useState<number>(60);
  const [formPrice, setFormPrice] = useState<number>(65);
  const [formDescription, setFormDescription] = useState('');
  const [formBenefits, setFormBenefits] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formRecommendedFor, setFormRecommendedFor] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  const [savingService, setSavingService] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Real-time subscribe to all bookings
  useEffect(() => {
    const unsubscribe = BookingService.subscribeAllBookings(
      (bookings) => {
        setAllBookings(bookings);
      },
      (err) => {
        console.warn("Admin bookings subscription notice:", err);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time subscribe to all registered users
  useEffect(() => {
    const unsubscribeUsers = UserService.subscribeAllUsers(
      (users) => {
        setAllUsers(users);
      },
      (err) => {
        console.warn("Admin users subscription notice:", err);
      }
    );

    return () => {
      if (unsubscribeUsers) unsubscribeUsers();
    };
  }, []);

  // Filter bookings
  const filteredBookings = allBookings.filter((b) => {
    const matchesPractitioner = practitionerFilter === 'all' || 
      b.practitioner.toLowerCase().includes(practitionerFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.customerName.toLowerCase().includes(q) ||
      b.serviceTitle.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerEmail.toLowerCase().includes(q);
    return matchesPractitioner && matchesStatus && matchesSearch;
  });

  // Filter users
  const filteredUsers = allUsers.filter((u) => {
    const q = userSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.includes(q))
    );
  });

  // Quick KPI Stats
  const totalBookingsCount = allBookings.length;
  const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
  const completedCount = allBookings.filter(b => b.status === 'completed').length;
  const totalRevenue = allBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.price || 0), 0);
  const totalActiveOffers = services.filter(s => s.active !== false).length;
  const verifiedUsersCount = allUsers.filter(u => u.emailVerified).length;

  // Open Form to Add New Service
  const handleOpenAddService = () => {
    setServiceFormMode('create');
    setEditingService(null);
    setFormTitle('');
    setFormSubtitle('');
    setFormCategory('visage');
    setFormDuration(60);
    setFormPrice(70);
    setFormDescription('');
    setFormBenefits('Détente profonde, Teint lumineux');
    setFormImage('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80');
    setFormBadge('');
    setFormRecommendedFor('Tous types de peaux');
    setFormIsActive(true);
    setIsServiceFormOpen(true);
  };

  // Open Form to Edit Service
  const handleOpenEditService = (service: SalonService) => {
    setServiceFormMode('edit');
    setEditingService(service);
    setFormTitle(service.title);
    setFormSubtitle(service.subtitle);
    setFormCategory(service.category);
    setFormDuration(service.durationMinutes);
    setFormPrice(service.price);
    setFormDescription(service.description);
    setFormBenefits(service.benefits.join(', '));
    setFormImage(service.image);
    setFormBadge(service.badge || '');
    setFormRecommendedFor(service.recommendedFor);
    setFormIsActive(service.active !== false);
    setIsServiceFormOpen(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingService(true);
    setActionSuccessMsg(null);

    const categoryNames: Record<ServiceCategory, string> = {
      visage: 'Soins Visage',
      massages: 'Massages & Corps',
      regard: 'Cils & Regard',
      epilation: 'Épilations',
      ongles: 'Onglerie & Spa',
      rituels: 'Rituels Signature'
    };

    const benefitsArray = formBenefits
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    try {
      if (serviceFormMode === 'create') {
        await ServiceManager.createService({
          title: formTitle.trim(),
          subtitle: formSubtitle.trim(),
          category: formCategory,
          categoryName: categoryNames[formCategory],
          durationMinutes: Number(formDuration),
          price: Number(formPrice),
          description: formDescription.trim(),
          benefits: benefitsArray,
          protocol: ['Diagnostic de peau personnalisé', 'Application des actifs', 'Conseil à domicile'],
          recommendedFor: formRecommendedFor.trim() || 'Tous types de peaux',
          badge: formBadge.trim() || undefined,
          image: formImage.trim() || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
          active: formIsActive
        });
        setActionSuccessMsg(`Le soin "${formTitle}" a été publié avec succès !`);
      } else if (editingService) {
        await ServiceManager.updateService(editingService.id, {
          title: formTitle.trim(),
          subtitle: formSubtitle.trim(),
          category: formCategory,
          categoryName: categoryNames[formCategory],
          durationMinutes: Number(formDuration),
          price: Number(formPrice),
          description: formDescription.trim(),
          benefits: benefitsArray,
          recommendedFor: formRecommendedFor.trim(),
          badge: formBadge.trim() || undefined,
          image: formImage.trim(),
          active: formIsActive
        });
        setActionSuccessMsg(`Le soin "${formTitle}" a été mis à jour avec succès !`);
      }

      onServicesChanged();
      setIsServiceFormOpen(false);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement de la prestation : " + (err.message || 'Action impossible'));
    } finally {
      setSavingService(false);
    }
  };

  // Toggle Service Visibility on site
  const handleToggleServiceActive = async (service: SalonService) => {
    try {
      const nextActive = service.active === false ? true : false;
      await ServiceManager.updateService(service.id, { active: nextActive });
      onServicesChanged();
      setActionSuccessMsg(
        nextActive 
          ? `Le soin "${service.title}" est maintenant visible sur le site.` 
          : `Le soin "${service.title}" est désormais masqué du site.`
      );
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (e: any) {
      alert("Impossible de modifier la visibilité : " + e.message);
    }
  };

  // Delete Service
  const handleDeleteService = async (serviceId: string, title: string) => {
    try {
      await ServiceManager.deleteService(serviceId);
      onServicesChanged();
      setActionSuccessMsg(`L'offre "${title}" a été supprimée avec succès.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (e: any) {
      console.warn("Erreur de suppression:", e);
      setActionSuccessMsg("Erreur lors de la suppression de l'offre : " + e.message);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  // Update Booking Status
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await BookingService.updateBookingStatus(bookingId, newStatus);
      setActionSuccessMsg(`Statut du rendez-vous mis à jour (${newStatus}).`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (e: any) {
      setActionSuccessMsg("Erreur mise à jour du rendez-vous : " + e.message);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }
  };

  // Promote / Demote User Role (Client, Practitioner, Admin)
  const handleSetUserRole = async (user: UserProfile, newRole: UserRole) => {
    setUpdatingUserId(user.userId);
    
    // Immediately update local state for instantaneous feedback
    setAllUsers((prev) =>
      prev.map((u) =>
        u.userId === user.userId
          ? {
              ...u,
              role: newRole,
              admin: newRole === 'admin' || newRole === 'practitioner',
              isAdmin: newRole === 'admin' || newRole === 'practitioner',
              isPractitioner: newRole === 'practitioner'
            }
          : u
      )
    );

    try {
      await UserService.setUserRole(user.userId, newRole);
      setActionSuccessMsg(
        `Le compte "${user.displayName || user.email}" a été mis à jour avec le rôle : ${
          newRole === 'practitioner'
            ? 'Praticienne'
            : newRole === 'admin'
            ? 'Administratrice'
            : 'Cliente'
        }.`
      );
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err: any) {
      console.warn("Erreur lors de la modification du rôle:", err);
      setActionSuccessMsg("Erreur lors de la modification du rôle : " + (err.message || 'Action refusée'));
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || 'Gérante';

  return (
    <div className="min-h-screen bg-[#F6F3EE] flex flex-col font-sans text-[#2C2420]">
      
      {/* ================= TOP APPLICATION HEADER ================= */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5DDD0] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand & Admin Indicator */}
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToStorefront}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-xs font-semibold text-[#5A4D45] border border-[#DDD3C1] transition-all cursor-pointer shadow-2xs"
                title="Retourner à la boutique publique"
              >
                <ArrowLeft className="w-4 h-4 text-[#9F674F]" />
                <span className="hidden sm:inline">Retour au site public</span>
              </button>

              <div className="h-6 w-px bg-[#E5DDD0] hidden sm:block"></div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2420]">
                    Un Moment pour Soi
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9F674F] text-white uppercase tracking-wider">
                    Espace Admin
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7A70] hidden md:block">
                  Direction de l'institut • Planning, Offres du site & Rôles
                </p>
              </div>
            </div>

            {/* Right: Admin Profile & Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#2C2420]">{displayName}</span>
                <span className="text-[11px] text-emerald-700 font-medium">Administratrice connectée</span>
              </div>

              <div className="w-9 h-9 rounded-full bg-[#9F674F] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-[#C8957C]/20">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <button
                onClick={async () => {
                  await logout();
                  onBackToStorefront();
                }}
                className="p-2 rounded-xl text-[#8C7A70] hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-[#FAF7F2] border-t border-[#E5DDD0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2.5 scrollbar-none">
              
              <button
                onClick={() => setActiveTab('bookings')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-[#2C2420] text-white shadow-xs'
                    : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#C8957C]" />
                <span>Planning & Réservations</span>
                {confirmedCount > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'bookings' ? 'bg-[#9F674F] text-white' : 'bg-[#E5DDD0] text-[#2C2420]'
                  }`}>
                    {confirmedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-[#2C2420] text-white shadow-xs'
                    : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#C8957C]" />
                <span>Gestion des Soins & Offres</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'services' ? 'bg-[#9F674F] text-white' : 'bg-[#E5DDD0] text-[#2C2420]'
                }`}>
                  {services.length}
                </span>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-[#2C2420] text-white shadow-xs'
                      : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  <Users className="w-4 h-4 text-[#C8957C]" />
                  <span>Gestion des Comptes & Rôles</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === 'users' ? 'bg-[#9F674F] text-white' : 'bg-[#E5DDD0] text-[#2C2420]'
                  }`}>
                    {allUsers.length}
                  </span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('team')}
                className={`py-2 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'team'
                    ? 'bg-[#2C2420] text-white shadow-xs'
                    : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                }`}
              >
                <Award className="w-4 h-4 text-[#C8957C]" />
                <span>Équipe des Praticiennes</span>
              </button>

            </nav>
          </div>
        </div>
      </header>

      {/* ================= MAIN DASHBOARD BODY ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Success / Alert notification banner */}
        {actionSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccessMsg}</span>
            </div>
            <button 
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-700 hover:text-emerald-950 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick KPI Overview Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                RDV Confirmés
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420] mt-1 block">
                {confirmedCount}
              </span>
              <span className="text-[11px] text-[#6E5B50] mt-0.5 block">
                {totalBookingsCount} au total ({completedCount} effectués)
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#9F674F] flex items-center justify-center border border-[#E8DFC8]">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                Chiffre d'Affaires
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420] mt-1 block">
                {totalRevenue} €
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Prévisionnel salon
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                Offres en Ligne
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420] mt-1 block">
                {totalActiveOffers}
              </span>
              <span className="text-[11px] text-[#6E5B50] mt-0.5 block">
                sur {services.length} prestations créées
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#C8957C] flex items-center justify-center border border-[#E8DFC8]">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider block">
                Clients Inscrits
              </span>
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420] mt-1 block">
                {allUsers.length}
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">
                {verifiedUsersCount} e-mails vérifiés
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Users className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* ================= TAB 1: PLANNING & RESERVATIONS ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Filter and search toolbar */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#8C7A70] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par cliente, téléphone, soin..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  
                  {/* Practitioner selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#8C7A70] font-semibold hidden sm:inline">Praticienne:</span>
                    <select
                      value={practitionerFilter}
                      onChange={(e) => setPractitionerFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    >
                      <option value="all">Toutes les praticiennes</option>
                      {practitioners.map(p => {
                        const name = p.displayName || p.email.split('@')[0];
                        return <option key={p.userId} value={name}>{name}</option>;
                      })}
                    </select>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#8C7A70] font-semibold hidden sm:inline">Statut:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="confirmed">Confirmés</option>
                      <option value="completed">Terminés</option>
                      <option value="cancelled">Annulés</option>
                    </select>
                  </div>

                </div>

              </div>
            </div>

            {/* Bookings cards / list */}
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E8DFC8] space-y-3">
                <Calendar className="w-12 h-12 text-[#C8957C] mx-auto opacity-60" />
                <h3 className="font-serif text-lg font-bold text-[#2C2420]">Aucun rendez-vous trouvé</h3>
                <p className="text-xs text-[#8C7A70] max-w-md mx-auto">
                  Aucun créneau ne correspond à vos filtres actuels. Dès qu'un client réserve un soin sur le site, il apparaîtra ici avec l'heure et la praticienne assignée.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div 
                    key={booking.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8DFC8] shadow-xs hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    
                    {/* Left: Date badge & Service */}
                    <div className="flex items-start gap-4">
                      
                      {/* Date box */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FAF7F2] border border-[#E8DFC8] flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-[#8C5D47] uppercase">
                          {new Date(booking.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                        </span>
                        <span className="font-serif text-lg sm:text-2xl font-bold text-[#2C2420]">
                          {new Date(booking.date).getDate()}
                        </span>
                        <span className="text-[10px] font-medium text-[#8C7A70]">
                          {new Date(booking.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </span>
                      </div>

                      {/* Service & Practitioner details */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                            {booking.serviceTitle}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            booking.status === 'confirmed' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status === 'confirmed' && 'Confirmé'}
                            {booking.status === 'completed' && 'Terminé'}
                            {booking.status === 'cancelled' && 'Annulé'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6E5B50]">
                          <span className="font-semibold text-[#9F674F] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C8957C]" />
                            {booking.timeSlot} ({booking.durationMinutes || 60} min)
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-[#2C2420] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-[#C8957C]" />
                            Praticienne : <strong className="text-[#9F674F]">{booking.practitioner}</strong>
                          </span>
                          <span>•</span>
                          <span className="font-bold text-[#2C2420]">{booking.price} €</span>
                        </div>

                        {/* Customer Information */}
                        <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5A4D45]">
                          <span className="font-bold text-[#2C2420] flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-[#8C7A70]" />
                            {booking.customerName}
                          </span>
                          {booking.customerPhone && (
                            <a 
                              href={`tel:${booking.customerPhone}`}
                              className="text-[#9F674F] hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {booking.customerPhone}
                            </a>
                          )}
                          {booking.customerEmail && (
                            <span className="text-[#8C7A70] flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5" />
                              {booking.customerEmail}
                            </span>
                          )}
                        </div>

                        {booking.notes && (
                          <p className="text-xs bg-[#FAF7F2] p-2 rounded-lg text-[#6E5B50] italic mt-1 border border-[#E8DFC8]">
                            Note cliente : « {booking.notes} »
                          </p>
                        )}
                      </div>

                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center">
                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            className="py-2 px-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Marquer Terminé</span>
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt("Précisez le motif d'annulation du rendez-vous :", "Annulation salon");
                              if (reason !== null) {
                                handleUpdateBookingStatus(booking.id, 'cancelled');
                              }
                            }}
                            className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            Annuler RDV
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <span className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Soin effectué
                        </span>
                      )}
                      {booking.status === 'cancelled' && (
                        <span className="text-xs text-red-600 font-medium italic">
                          RDV Annulé
                        </span>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 2: MANAGE SERVICES & OFFERS ================= */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                  Prestations & Soins en Vente sur le Site
                </h3>
                <p className="text-xs text-[#6E5B50] mt-0.5">
                  Gérez les offres présentées au public, modifiez les tarifs, ou ajoutez de nouveaux rituels exclusifs.
                </p>
              </div>

              <button
                onClick={handleOpenAddService}
                className="py-3 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#E2B7A0]" />
                <span>Ajouter un nouveau soin</span>
              </button>
            </div>

            {/* Service Grid or Empty State */}
            {services.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8DFC8] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF3EC] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#9F674F]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C2420]">Aucune offre enregistrée dans Firestore</h4>
                <p className="text-xs text-[#6E5B50] mt-1 mb-6 leading-relaxed">
                  Toutes les offres du site proviennent désormais exclusivement de votre base Firestore. 
                  Cliquez ci-dessous pour créer votre première prestation.
                </p>
                <button
                  onClick={handleOpenAddService}
                  className="py-2.5 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#E2B7A0]" />
                  <span>Ajouter une prestation</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className={`rounded-2xl overflow-hidden border transition-all flex flex-col justify-between ${
                    svc.active === false 
                      ? 'bg-gray-50 border-gray-200 opacity-60' 
                      : 'bg-white border-[#E8DFC8] shadow-xs hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden bg-[#FAF7F2]">
                      <img 
                        src={svc.image} 
                        alt={svc.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-bold text-[#8C5D47] uppercase tracking-wider">
                        {svc.categoryName}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                          svc.active !== false 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-gray-700 text-white'
                        }`}>
                          {svc.active !== false ? 'En ligne' : 'Masqué du site'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-base text-[#2C2420] truncate">
                          {svc.title}
                        </h4>
                      </div>
                      <p className="text-xs text-[#8C7A70] line-clamp-2">
                        {svc.subtitle}
                      </p>
                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#6E5B50] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#C8957C]" />
                          {svc.durationMinutes} min
                        </span>
                        <span className="font-serif font-bold text-lg text-[#9F674F]">
                          {svc.price} €
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFC8] flex items-center justify-between">
                    <button
                      onClick={() => handleToggleServiceActive(svc)}
                      className="text-xs font-semibold text-[#5A4D45] hover:text-[#2C2420] flex items-center gap-1 cursor-pointer"
                    >
                      {svc.active !== false ? (
                        <>
                          <EyeOff className="w-4 h-4 text-[#8C7A70]" />
                          <span>Masquer</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 text-emerald-600" />
                          <span>Afficher</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditService(svc)}
                        className="py-1.5 px-3 rounded-lg bg-white hover:bg-[#EFE9DF] text-xs font-semibold text-[#2C2420] flex items-center gap-1.5 border border-[#DDD3C1] cursor-pointer shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#C8957C]" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id, svc.title)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: USER PROMOTION & ROLES ================= */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                    Gestion des Utilisateurs & Rôles Administrateurs
                  </h3>
                  <p className="text-xs text-[#6E5B50] mt-0.5">
                    Conformément aux règles de sécurité, les nouveaux clients inscrits sont strictement non-administrateurs. 
                    Un administrateur peut promouvoir ou rétrograder un compte en 1 clic.
                  </p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Chercher client..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420]"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8DFC8] text-[#8C7A70] font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Utilisateur</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Vérification E-mail</th>
                      <th className="py-3.5 px-4">Rôle Actuel</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Action sur le compte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0EAE1]">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#8C7A70]">
                          Aucun utilisateur trouvé.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const isUserAdmin = Boolean(user.admin || user.isAdmin || user.role === 'admin');
                        const isCurrentUser = user.userId === currentUser?.uid;

                        return (
                          <tr key={user.userId} className="hover:bg-[#FAF7F2]/50 transition-colors">
                            
                            {/* User name & ID */}
                            <td className="py-4 px-4 sm:px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#EAE0D3] text-[#8C5D47] font-bold flex items-center justify-center text-xs">
                                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div>
                                  <span className="font-bold text-[#2C2420] block">
                                    {user.displayName || 'Client Sans Nom'}
                                    {isCurrentUser && (
                                      <span className="ml-1.5 text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-normal">
                                        Vous
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[11px] text-[#8C7A70] font-mono">
                                    {user.userId.substring(0, 10)}...
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Email & Phone */}
                            <td className="py-4 px-4 text-[#5A4D45]">
                              <div className="space-y-0.5">
                                <span className="block font-medium">{user.email || '—'}</span>
                                {user.phone && (
                                  <span className="text-[11px] text-[#8C7A70] block">{user.phone}</span>
                                )}
                              </div>
                            </td>

                            {/* Email verified badge */}
                            <td className="py-4 px-4">
                              {user.emailVerified ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Vérifié</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  <span>Non vérifié</span>
                                </span>
                              )}
                            </td>

                            {/* Role */}
                            <td className="py-4 px-4">
                              {user.role === 'admin' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#9F674F] text-white shadow-2xs">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  <span>Administratrice</span>
                                </span>
                              ) : user.role === 'practitioner' ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-600 text-white shadow-2xs">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Praticienne</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                  <User className="w-3 h-3" />
                                  <span>Cliente</span>
                                </span>
                              )}
                            </td>

                            {/* Promote / Demote Selector */}
                            <td className="py-4 px-4 sm:px-6 text-right">
                              {isCurrentUser ? (
                                <span className="text-[11px] text-[#8C7A70] italic">Votre compte (connecté)</span>
                              ) : (
                                <div className="inline-flex items-center gap-2">
                                  <select
                                    value={user.role || 'client'}
                                    disabled={updatingUserId === user.userId}
                                    onChange={(e) => handleSetUserRole(user, e.target.value as UserRole)}
                                    className="py-1.5 px-3 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C] cursor-pointer disabled:opacity-50"
                                  >
                                    <option value="client">Cliente</option>
                                    <option value="practitioner">Praticienne</option>
                                    <option value="admin">Administratrice</option>
                                  </select>
                                  {updatingUserId === user.userId && (
                                    <span className="text-[10px] text-[#8C7A70] animate-pulse">...</span>
                                  )}
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 4: PRACTITIONERS TEAM ================= */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            
            <div className="bg-[#FAF3EC] rounded-2xl p-5 border border-[#E8DFC8] text-xs text-[#6E5B50] leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-[#2C2420] flex items-center gap-1.5 text-sm mb-0.5">
                  <Sparkles className="w-4 h-4 text-[#9F674F]" />
                  Équipe des Praticiennes Certifiées
                </p>
                <p>
                  Les praticiennes disposent d'un compte avec accès au tableau de bord (planning & réservations) 
                  et sont sélectionnables par les clientes lors de la réservation en ligne.
                </p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => setActiveTab('users')}
                  className="py-2 px-4 rounded-xl bg-[#2C2420] text-white text-xs font-bold whitespace-nowrap hover:bg-[#3D322D] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Gérer les rôles des comptes
                </button>
              )}
            </div>

            {practitioners.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#E8DFC8] p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#FAF3EC] border border-[#E8DFC8] flex items-center justify-center mx-auto mb-4 text-[#9F674F]">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-[#2C2420]">Aucune praticienne configurée</h4>
                <p className="text-xs text-[#6E5B50] mt-1 mb-6 leading-relaxed">
                  Toutes les praticiennes proviennent désormais des comptes utilisateurs Firestore promus.
                  {isSuperAdmin && " Vous pouvez promouvoir un compte au rôle 'Praticienne' dans l'onglet des comptes."}
                </p>
                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="py-2.5 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
                  >
                    <Users className="w-4 h-4 text-[#E2B7A0]" />
                    <span>Promouvoir un compte en Praticienne</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {practitioners.map((prat) => {
                  const name = prat.displayName || prat.email.split('@')[0] || 'Praticienne';
                  const initials = name.slice(0, 2).toUpperCase();
                  const specialties = prat.specialties && prat.specialties.length > 0 
                    ? prat.specialties 
                    : ['Soins Visage', 'Massages & Rituels'];

                  return (
                    <div 
                      key={prat.userId}
                      className="bg-white rounded-2xl p-6 border border-[#E8DFC8] shadow-xs space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E2B7A0] to-[#9F674F] text-white flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-serif font-bold text-base text-[#2C2420] truncate">
                              {name}
                            </h4>
                            <span className="text-xs font-semibold text-[#8C5D47] block mt-0.5">
                              Praticienne Diplômée
                            </span>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                              Accès Admin & Planning
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#5A4D45] leading-relaxed">
                          {prat.bio || "Praticienne qualifiée dédiée au bien-être et à la beauté sur-mesure de nos clientes."}
                        </p>

                        <div className="space-y-1.5 pt-3 border-t border-[#F0EAE1] text-xs">
                          <span className="font-semibold text-[#2C2420] block text-[11px] uppercase tracking-wider text-[#8C7A70]">
                            Spécialités :
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {specialties.map((s, i) => (
                              <span key={i} className="text-[10px] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E8DFC8] text-[#5A4D45] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#F0EAE1] text-[11px] text-[#6E5B50] space-y-1">
                        <div>
                          <span className="font-semibold text-[#2C2420]">E-mail :</span>{' '}
                          <span className="font-mono text-[10px]">{prat.email}</span>
                        </div>
                        {prat.phone && (
                          <div>
                            <span className="font-semibold text-[#2C2420]">Tél :</span> {prat.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ================= MODAL / DRAWER FOR CREATE & EDIT SERVICE ================= */}
      {isServiceFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E8DFC8] relative my-4 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                  {serviceFormMode === 'create' ? "Ajouter une prestation au site" : "Modifier la prestation"}
                </h3>
                <p className="text-xs text-[#6E5B50]">
                  Les modifications sont appliquées immédiatement sur la boutique en ligne.
                </p>
              </div>
              <button
                onClick={() => setIsServiceFormOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#5A4D45] hover:bg-[#EFE9DF] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Titre du soin *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Rituel Silhouette & Drainage Détox"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs sm:text-sm text-[#2C2420]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Sous-titre / accroche *
                </label>
                <input
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="Ex: Soin décongestionnant aux huiles essentielles de romarin"
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ServiceCategory)}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  >
                    <option value="visage">Soins Visage</option>
                    <option value="massages">Massages & Corps</option>
                    <option value="regard">Cils & Regard</option>
                    <option value="ongles">Onglerie & Spa</option>
                    <option value="epilation">Épilations</option>
                    <option value="rituels">Rituels Signature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Durée (min) *
                  </label>
                  <input
                    type="number"
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    min={15}
                    max={240}
                    step={5}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Prix public (€) *
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    min={5}
                    max={1000}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  Description détaillée du protocole
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="Décrivez les bienfaits sensoriels et les étapes du soin..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Bénéfices clés (séparés par virgules)
                  </label>
                  <input
                    type="text"
                    value={formBenefits}
                    onChange={(e) => setFormBenefits(e.target.value)}
                    placeholder="Éclat immédiat, Peau lissée, Détente"
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                    Badge spécial (optionnel)
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="Best-Seller, Nouveauté..."
                    className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                  URL de la photo d'illustration
                </label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-white border border-[#DDD3C1] text-xs text-[#2C2420]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8DFC8] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#2C2420] block">Publier en ligne immédiatement</span>
                  <span className="text-[11px] text-[#6E5B50]">Ce soin apparaîtra dans le catalogue public et la réservation.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#9F674F] focus:ring-[#9F674F]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsServiceFormOpen(false)}
                  className="py-2.5 px-4 rounded-xl bg-[#FAF7F2] text-xs font-semibold text-[#5A4D45] hover:bg-[#EFE9DF]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="py-2.5 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingService ? "Enregistrement..." : "Enregistrer la prestation"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
