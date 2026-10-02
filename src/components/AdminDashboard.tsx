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
  RefreshCw,
  CalendarPlus,
  UserPlus,
  Tag,
  FileText,
  ChevronRight
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
  
  const [activeTab, setActiveTab] = useState<'bookings' | 'manual-booking' | 'services' | 'team' | 'users'>('bookings');

  // Protect the users tab: if practitioner tries to access, redirect to bookings
  useEffect(() => {
    if (!isSuperAdmin && activeTab === 'users') {
      setActiveTab('bookings');
    }
  }, [isSuperAdmin, activeTab]);

  // Bookings list state & filters
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [practitionerFilter, setPractitionerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(''); // YYYY-MM-DD or empty for all
  const [serviceFilter, setServiceFilter] = useState<string>('all'); // Offer / service title
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Manual in-person booking state
  const [manualClientMode, setManualClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientUser, setSelectedClientUser] = useState<UserProfile | null>(null);
  const [manualClientSearch, setManualClientSearch] = useState<string>('');
  const [manualClientName, setManualClientName] = useState<string>('');
  const [manualClientPhone, setManualClientPhone] = useState<string>('');
  const [manualClientEmail, setManualClientEmail] = useState<string>('');
  const [manualSelectedServiceId, setManualSelectedServiceId] = useState<string>('');
  const [manualPractitioner, setManualPractitioner] = useState<string>('');
  const [manualDate, setManualDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manualTimeSlot, setManualTimeSlot] = useState<string>('10:45');
  const [manualNotes, setManualNotes] = useState<string>("Réservation sur place à l'accueil");
  const [manualPaymentMethod, setManualPaymentMethod] = useState<string>("Règlement sur place (CB)");
  const [manualSubmitting, setManualSubmitting] = useState<boolean>(false);
  const [manualBookingResult, setManualBookingResult] = useState<Booking | null>(null);
  const [manualBookingError, setManualBookingError] = useState<string | null>(null);

  // Initialize default manual booking service and practitioner
  useEffect(() => {
    if (!manualSelectedServiceId && services.length > 0) {
      setManualSelectedServiceId(services[0].id);
    }
  }, [services, manualSelectedServiceId]);

  useEffect(() => {
    if (!manualPractitioner && practitioners.length > 0) {
      const defaultName = practitioners[0].displayName || practitioners[0].email.split('@')[0];
      setManualPractitioner(defaultName);
    }
  }, [practitioners, manualPractitioner]);

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

  // Helper to check if a practitioner has a conflicting booking
  const isPractitionerBooked = (practitionerName: string, date: string, timeSlot: string): boolean => {
    if (!practitionerName) return false;
    const target = practitionerName.toLowerCase().trim();
    return allBookings.some((b) => {
      if (b.status === 'cancelled') return false;
      if (b.date !== date || b.timeSlot !== timeSlot) return false;
      const bPrat = (b.practitioner || '').toLowerCase().trim();
      return bPrat === target || bPrat.includes(target) || target.includes(bPrat);
    });
  };

  // Filter bookings
  const filteredBookings = allBookings.filter((b) => {
    const matchesPractitioner = practitionerFilter === 'all' || 
      b.practitioner.toLowerCase().includes(practitionerFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;
    const matchesService = serviceFilter === 'all' || 
      b.serviceTitle.toLowerCase() === serviceFilter.toLowerCase() ||
      b.serviceId === serviceFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      b.customerName.toLowerCase().includes(q) ||
      b.serviceTitle.toLowerCase().includes(q) ||
      b.customerPhone.includes(q) ||
      b.customerEmail.toLowerCase().includes(q);
    return matchesPractitioner && matchesStatus && matchesDate && matchesService && matchesSearch;
  });

  // Summary of offers for dateFilter (or all active bookings if dateFilter is set)
  const bookingsOnSelectedDate = dateFilter 
    ? allBookings.filter(b => b.date === dateFilter && b.status !== 'cancelled')
    : [];

  const offersOnSelectedDateMap: Record<string, { count: number; category: string; revenue: number }> = {};
  bookingsOnSelectedDate.forEach((b) => {
    const t = b.serviceTitle || 'Prestation';
    if (!offersOnSelectedDateMap[t]) {
      offersOnSelectedDateMap[t] = { count: 0, category: b.serviceCategory || '', revenue: 0 };
    }
    offersOnSelectedDateMap[t].count += 1;
    offersOnSelectedDateMap[t].revenue += (b.price || 0);
  });
  const offersOnSelectedDateList = Object.entries(offersOnSelectedDateMap).map(([title, data]) => ({
    title,
    ...data
  })).sort((a, b) => b.count - a.count);

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

  // Handle in-person manual booking creation
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualBookingError(null);
    setManualBookingResult(null);

    const effectiveName = manualClientMode === 'existing' && selectedClientUser 
      ? (selectedClientUser.displayName || selectedClientUser.email.split('@')[0])
      : manualClientName.trim();

    const effectivePhone = manualClientMode === 'existing' && selectedClientUser
      ? (selectedClientUser.phone || manualClientPhone.trim())
      : manualClientPhone.trim();

    const effectiveEmail = manualClientMode === 'existing' && selectedClientUser
      ? selectedClientUser.email
      : (manualClientEmail.trim() || 'accueil@unmomentpoursoi.fr');

    if (!effectiveName || !effectivePhone) {
      setManualBookingError("Veuillez renseigner le nom et le numéro de téléphone de la cliente.");
      return;
    }

    const selectedService = services.find(s => s.id === manualSelectedServiceId) || services[0];
    if (!selectedService) {
      setManualBookingError("Veuillez sélectionner une prestation à réserver.");
      return;
    }

    const manualDateObj = new Date(manualDate);
    const isManualClosedDay = manualDateObj.getDay() === 0 || manualDateObj.getDay() === 1;
    if (isManualClosedDay) {
      setManualBookingError("L'institut est fermé les dimanches et lundis. Veuillez choisir une date entre mardi et samedi.");
      return;
    }

    const effectivePractitioner = manualPractitioner || (practitioners[0]?.displayName || 'Praticienne de l\'institut');

    if (isPractitionerBooked(effectivePractitioner, manualDate, manualTimeSlot)) {
      setManualBookingError(`La praticienne ${effectivePractitioner} a déjà un rendez-vous le ${manualDate} à ${manualTimeSlot}. Veuillez choisir un autre horaire disponible.`);
      return;
    }

    setManualSubmitting(true);
    try {
      const created = await BookingService.createBooking({
        userId: selectedClientUser?.userId || 'walkin-' + Date.now(),
        customerName: effectiveName,
        customerEmail: effectiveEmail,
        customerPhone: effectivePhone,
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        serviceCategory: selectedService.categoryName,
        durationMinutes: selectedService.durationMinutes,
        price: selectedService.price,
        date: manualDate,
        timeSlot: manualTimeSlot,
        practitioner: effectivePractitioner,
        notes: `${manualNotes.trim()} • Mode : ${manualPaymentMethod}`,
        status: 'confirmed'
      });

      setManualBookingResult(created);
      setActionSuccessMsg(`Rendez-vous présentiel enregistré pour ${effectiveName} le ${manualDate} à ${manualTimeSlot} !`);
      setTimeout(() => setActionSuccessMsg(null), 4000);

      // Reset client input fields if new
      if (manualClientMode === 'new') {
        setManualClientName('');
        setManualClientPhone('');
        setManualClientEmail('');
      }
    } catch (err: any) {
      console.warn("Manual booking notice:", err);
      setManualBookingError("Erreur lors de l'enregistrement : " + (err.message || 'Action impossible'));
    } finally {
      setManualSubmitting(false);
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
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={onBackToStorefront}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-xs font-semibold text-[#5A4D45] border border-[#DDD3C1] transition-all cursor-pointer shadow-2xs"
                title="Retourner à la boutique publique"
              >
                <ArrowLeft className="w-4 h-4 text-[#9F674F]" />
                <span className="hidden sm:inline">Retour au site public</span>
              </button>

              <div className="h-6 w-px bg-[#E5DDD0] hidden sm:block"></div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#2C2420]">
                    Un Moment pour Soi
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9F674F] text-white uppercase tracking-wider">
                    {isSuperAdmin ? 'Admin Général' : 'Espace Praticienne'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8C7A70] hidden md:block">
                  Direction de l'institut • Planning, Prise de RDV sur place & Soins
                </p>
              </div>
            </div>

            {/* Right: Admin Profile & Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-[#2C2420]">{displayName}</span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {isSuperAdmin ? 'Administratrice connectée' : 'Praticienne connectée'}
                </span>
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

        {/* Navigation Tabs Bar (Fully Responsive) */}
        <div className="bg-[#FAF7F2] border-t border-[#E5DDD0]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
            
            {/* Mobile Dropdown Selector (visible on small screens) */}
            <div className="md:hidden mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#8C7A70] uppercase tracking-wider shrink-0">
                  Onglet :
                </span>
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as any)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-[#DDD3C1] text-xs font-bold text-[#2C2420] shadow-2xs focus:ring-2 focus:ring-[#C8957C]"
                >
                  <option value="bookings">📅 Planning & Réservations ({confirmedCount})</option>
                  <option value="manual-booking">✍️ Prise de RDV en Présentiel (Nouveau)</option>
                  <option value="services">✨ Gestion des Soins & Offres ({services.length})</option>
                  <option value="team">👥 Équipe des Praticiennes ({practitioners.length})</option>
                  {isSuperAdmin && (
                    <option value="users">🛡️ Gestion des Comptes & Rôles ({allUsers.length})</option>
                  )}
                </select>
              </div>
            </div>

            {/* Horizontal Scrollable Tabs (fluid on all screens) */}
            <div className="relative">
              <nav className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-[#C8957C]/40 scrollbar-track-transparent touch-pan-x">
                
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
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
                  onClick={() => {
                    setActiveTab('manual-booking');
                    setManualBookingResult(null);
                    setManualBookingError(null);
                  }}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                    activeTab === 'manual-booking'
                      ? 'bg-[#9F674F] text-white shadow-xs'
                      : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  <CalendarPlus className="w-4 h-4 text-[#FDEBD0]" />
                  <span>Prise de RDV Présentiel</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                    Accueil
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
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

                <button
                  onClick={() => setActiveTab('team')}
                  className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                    activeTab === 'team'
                      ? 'bg-[#2C2420] text-white shadow-xs'
                      : 'text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#C8957C]" />
                  <span>Équipe des Praticiennes</span>
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`py-2 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
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

              </nav>
            </div>

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
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  
                  {/* Date Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#8C7A70] font-semibold hidden sm:inline">Date:</span>
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                      title="Filtrer par date de soin"
                    />
                    {dateFilter && (
                      <button
                        onClick={() => setDateFilter('')}
                        className="p-1.5 rounded-lg text-[#8C7A70] hover:text-[#2C2420] hover:bg-[#EFE9DF]"
                        title="Effacer le filtre date"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Prestation / Offre Selector */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#8C7A70] font-semibold hidden sm:inline">Offre:</span>
                    <select
                      value={serviceFilter}
                      onChange={(e) => setServiceFilter(e.target.value)}
                      className="py-2 px-3 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C] max-w-[200px] truncate"
                    >
                      <option value="all">Toutes les offres</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title} ({s.price}€)
                        </option>
                      ))}
                    </select>
                  </div>

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

              {/* Quick Date shortcuts */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0EAE1] text-xs">
                <span className="text-[#8C7A70] font-medium text-[11px]">Raccourcis date :</span>
                <button
                  type="button"
                  onClick={() => setDateFilter('')}
                  className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    !dateFilter 
                      ? 'bg-[#2C2420] text-white shadow-2xs' 
                      : 'bg-[#FAF7F2] text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Toutes les dates
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter(new Date().toISOString().split('T')[0])}
                  className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    dateFilter === new Date().toISOString().split('T')[0]
                      ? 'bg-[#9F674F] text-white shadow-2xs' 
                      : 'bg-[#FAF7F2] text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 1);
                    setDateFilter(d.toISOString().split('T')[0]);
                  }}
                  className={`py-1 px-2.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                    dateFilter === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                      ? 'bg-[#9F674F] text-white shadow-2xs' 
                      : 'bg-[#FAF7F2] text-[#6E5B50] hover:bg-[#EFE9DF]'
                  }`}
                >
                  Demain
                </button>
                {serviceFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setServiceFilter('all')}
                    className="ml-auto text-[11px] text-[#9F674F] hover:underline font-semibold"
                  >
                    Réinitialiser le filtre d'offre ({serviceFilter})
                  </button>
                )}
              </div>

              {/* Offer Summary Panel for selected date */}
              {dateFilter && (
                <div className="bg-[#FAF3EC] p-3.5 sm:p-4 rounded-xl border border-[#E8DFC8] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#2C2420] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#9F674F]" />
                      Liste des offres réservées le {new Date(dateFilter + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} :
                      <span className="bg-[#9F674F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {bookingsOnSelectedDate.length} RDV
                      </span>
                    </span>
                    {serviceFilter !== 'all' && (
                      <button
                        onClick={() => setServiceFilter('all')}
                        className="text-[11px] text-[#9F674F] hover:underline font-semibold cursor-pointer"
                      >
                        Afficher toutes les offres de ce jour
                      </button>
                    )}
                  </div>

                  {offersOnSelectedDateList.length === 0 ? (
                    <p className="text-xs text-[#8C7A70] italic">
                      Aucune réservation confirmée pour cette date.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {offersOnSelectedDateList.map(off => (
                        <button
                          key={off.title}
                          type="button"
                          onClick={() => setServiceFilter(serviceFilter === off.title ? 'all' : off.title)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            serviceFilter === off.title
                              ? 'bg-[#2C2420] text-white shadow-xs ring-2 ring-[#9F674F]'
                              : 'bg-white border border-[#DDD3C1] text-[#5A4D45] hover:border-[#9F674F]'
                          }`}
                          title={`Cliquer pour filtrer uniquement sur : ${off.title}`}
                        >
                          <span>{off.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            serviceFilter === off.title ? 'bg-[#9F674F] text-white' : 'bg-[#EAE0D3] text-[#8C5D47]'
                          }`}>
                            {off.count}
                          </span>
                          <span className="text-[10px] opacity-75">({off.revenue}€)</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

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
                            onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
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

        {/* ================= NEW TAB: MANUAL IN-PERSON BOOKING (PRÉSENTIEL / ACCUEIL) ================= */}
        {activeTab === 'manual-booking' && (
          <div className="space-y-6">
            
            {/* Header info */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8DFC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#2C2420] flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-[#9F674F]" />
                  <span>Prise de Rendez-vous en Présentiel & Accueil</span>
                </h3>
                <p className="text-xs text-[#6E5B50] mt-0.5">
                  Enregistrez immédiatement un rendez-vous pour une cliente accueillie en salon ou au téléphone, avec vérification des disponibilités en temps réel.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('bookings')}
                className="py-2 px-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-xs font-bold text-[#5A4D45] border border-[#DDD3C1] transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-[#9F674F]" />
                <span>Voir le Planning</span>
              </button>
            </div>

            {/* Success Card view if booking was just created */}
            {manualBookingResult ? (
              <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-md max-w-xl mx-auto text-center space-y-5 animate-in fade-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-emerald-700 font-bold">
                    Réservation confirmée avec succès
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-[#2C2420]">
                    {manualBookingResult.customerName}
                  </h4>
                  <p className="text-xs text-[#6E5B50]">
                    Rendez-vous enregistré dans Firestore et synchronisé avec le planning de l'institut.
                  </p>
                </div>

                {/* Recap details */}
                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8DFC8] text-xs text-left space-y-2 text-[#5A4D45]">
                  <div className="flex justify-between items-center py-1 border-b border-[#F0EAE1]">
                    <span className="text-[#8C7A70]">Soin réservé :</span>
                    <strong className="text-[#2C2420]">{manualBookingResult.serviceTitle}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#F0EAE1]">
                    <span className="text-[#8C7A70]">Praticienne assignée :</span>
                    <strong className="text-[#9F674F]">{manualBookingResult.practitioner}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#F0EAE1]">
                    <span className="text-[#8C7A70]">Date & Heure :</span>
                    <strong className="text-[#2C2420]">{manualBookingResult.date} à {manualBookingResult.timeSlot}</strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-[#F0EAE1]">
                    <span className="text-[#8C7A70]">Durée & Tarif :</span>
                    <span>{manualBookingResult.durationMinutes} min • <strong>{manualBookingResult.price} €</strong></span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#8C7A70]">Contact cliente :</span>
                    <span>{manualBookingResult.customerPhone}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#2C2420] hover:bg-[#3D322D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4 text-[#E2B7A0]" />
                    <span>Consulter dans le Planning</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManualBookingResult(null);
                      setManualBookingError(null);
                    }}
                    className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#5A4D45] text-xs font-semibold border border-[#DDD3C1] transition-all cursor-pointer"
                  >
                    Enregistrer un autre RDV
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleCreateManualBooking} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] shadow-xs space-y-8 max-w-4xl mx-auto">
                
                {manualBookingError && (
                  <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Action impossible :</strong>
                      <span>{manualBookingError}</span>
                    </div>
                  </div>
                )}

                {/* ================= STEP 1: CLIENT SELECTION ================= */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                    <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#9F674F]" />
                      1. Identification de la Cliente
                    </span>

                    {/* Mode toggle */}
                    <div className="inline-flex rounded-xl bg-[#FAF7F2] p-1 border border-[#DDD3C1]">
                      <button
                        type="button"
                        onClick={() => {
                          setManualClientMode('existing');
                          setManualBookingError(null);
                        }}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          manualClientMode === 'existing'
                            ? 'bg-[#2C2420] text-white shadow-2xs'
                            : 'text-[#6E5B50] hover:text-[#2C2420]'
                        }`}
                      >
                        Cliente inscrite ({allUsers.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualClientMode('new');
                          setSelectedClientUser(null);
                          setManualBookingError(null);
                        }}
                        className={`py-1 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          manualClientMode === 'new'
                            ? 'bg-[#2C2420] text-white shadow-2xs'
                            : 'text-[#6E5B50] hover:text-[#2C2420]'
                        }`}
                      >
                        Nouvelle cliente (Sur place)
                      </button>
                    </div>
                  </div>

                  {manualClientMode === 'existing' ? (
                    <div className="space-y-3">
                      {/* Search among existing registered users */}
                      <div className="relative">
                        <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={manualClientSearch}
                          onChange={(e) => setManualClientSearch(e.target.value)}
                          placeholder="Rechercher cliente par nom, e-mail ou téléphone..."
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                        />
                      </div>

                      {/* Selected user card or user list */}
                      {selectedClientUser ? (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
                              {selectedClientUser.displayName ? selectedClientUser.displayName.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div>
                              <strong className="text-xs text-emerald-950 block font-bold">
                                {selectedClientUser.displayName || 'Client'} ({selectedClientUser.email})
                              </strong>
                              <span className="text-[11px] text-emerald-800">
                                Tél : {selectedClientUser.phone || 'Non renseigné'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedClientUser(null)}
                            className="py-1 px-2.5 rounded-lg text-xs bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 font-semibold cursor-pointer"
                          >
                            Changer de cliente
                          </button>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto divide-y divide-[#F0EAE1] border border-[#E8DFC8] rounded-xl bg-white scrollbar-thin">
                          {allUsers
                            .filter(u => {
                              const q = manualClientSearch.toLowerCase().trim();
                              if (!q) return true;
                              return (
                                (u.displayName && u.displayName.toLowerCase().includes(q)) ||
                                (u.email && u.email.toLowerCase().includes(q)) ||
                                (u.phone && u.phone.includes(q))
                              );
                            })
                            .slice(0, 8)
                            .map(u => (
                              <div
                                key={u.userId}
                                onClick={() => {
                                  setSelectedClientUser(u);
                                  setManualClientName(u.displayName || u.email.split('@')[0]);
                                  setManualClientPhone(u.phone || '');
                                  setManualClientEmail(u.email);
                                }}
                                className="p-3 flex items-center justify-between hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-[#EAE0D3] text-[#8C5D47] font-bold text-xs flex items-center justify-center">
                                    {u.displayName ? u.displayName.charAt(0).toUpperCase() : 'C'}
                                  </div>
                                  <div>
                                    <span className="text-xs font-bold text-[#2C2420] block">
                                      {u.displayName || 'Client'}
                                    </span>
                                    <span className="text-[10px] text-[#8C7A70]">
                                      {u.email} {u.phone && `• ${u.phone}`}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[11px] text-[#9F674F] font-semibold hover:underline">
                                  Sélectionner →
                                </span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* New client inputs */
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                          Nom & Prénom de la cliente *
                        </label>
                        <input
                          type="text"
                          required
                          value={manualClientName}
                          onChange={(e) => setManualClientName(e.target.value)}
                          placeholder="Mme Dupont"
                          className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                          Téléphone portable * (Rappels)
                        </label>
                        <input
                          type="tel"
                          required
                          value={manualClientPhone}
                          onChange={(e) => setManualClientPhone(e.target.value)}
                          placeholder="06 12 34 56 78"
                          className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                          Adresse e-mail (facultative)
                        </label>
                        <input
                          type="email"
                          value={manualClientEmail}
                          onChange={(e) => setManualClientEmail(e.target.value)}
                          placeholder="cliente@exemple.fr"
                          className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ================= STEP 2: SERVICE & TREATMENT SELECTION ================= */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                    <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#9F674F]" />
                      2. Choix de la Prestation
                    </span>
                    <span className="text-[11px] text-[#8C7A70]">
                      {services.length} prestations actives
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {services.map((svc) => {
                      const isSelected = manualSelectedServiceId === svc.id;
                      return (
                        <div
                          key={svc.id}
                          onClick={() => setManualSelectedServiceId(svc.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#9F674F] bg-[#FAF7F2] ring-2 ring-[#9F674F]'
                              : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#9F674F] block">
                              {svc.categoryName}
                            </span>
                            <strong className="text-xs font-bold text-[#2C2420] block mt-0.5">
                              {svc.title}
                            </strong>
                            <p className="text-[10px] text-[#6E5B50] line-clamp-1 mt-0.5">
                              {svc.subtitle || svc.description}
                            </p>
                          </div>
                          <div className="pt-2 mt-2 border-t border-[#F0EAE1] flex items-center justify-between text-xs">
                            <span className="text-[#8C7A70] flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3 text-[#C8957C]" />
                              {svc.durationMinutes} min
                            </span>
                            <span className="font-bold text-[#2C2420]">
                              {svc.price} €
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ================= STEP 3: PRACTITIONER & DATE/TIME ================= */}
                <div className="space-y-4">
                  <div className="border-b border-[#F0EAE1] pb-2">
                    <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#9F674F]" />
                      3. Praticienne, Date & Créneau Horaire
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Practitioner Selector */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                        Praticienne assignée :
                      </label>
                      <select
                        value={manualPractitioner}
                        onChange={(e) => setManualPractitioner(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                      >
                        {practitioners.length === 0 ? (
                          <option value="Praticienne">Praticienne par défaut</option>
                        ) : (
                          practitioners.map((p) => {
                            const name = p.displayName || p.email.split('@')[0];
                            return <option key={p.userId} value={name}>{name}</option>;
                          })
                        )}
                      </select>
                    </div>

                    {/* Date Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                        Date du soin :
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                      />
                    </div>
                  </div>

                  {/* Time slots for that date & practitioner */}
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4D45] mb-2">
                      Créneaux disponibles pour {manualPractitioner || 'la praticienne'} :
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {['09:30', '10:45', '11:30', '14:00', '15:15', '16:30', '17:45', '18:30'].map((slot) => {
                        const isBooked = isPractitionerBooked(manualPractitioner, manualDate, slot);
                        const isSelected = manualTimeSlot === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => !isBooked && setManualTimeSlot(slot)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all relative ${
                              isBooked
                                ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed line-through opacity-60'
                                : isSelected
                                ? 'bg-[#2C2420] text-white shadow-sm ring-2 ring-[#9F674F]'
                                : 'bg-white border border-[#E0D5C3] text-[#5A4D45] hover:bg-[#FAF7F2] cursor-pointer'
                            }`}
                          >
                            <span>{slot}</span>
                            {isBooked && (
                              <span className="block text-[8px] font-normal text-red-500 no-underline tracking-tighter">
                                Occupé
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ================= STEP 4: PAYMENT ON-SITE & NOTES ================= */}
                <div className="space-y-4">
                  <div className="border-b border-[#F0EAE1] pb-2">
                    <span className="text-xs font-bold text-[#8C7A70] uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#9F674F]" />
                      4. Modalité de Règlement & Notes
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                        Mode de paiement sur place :
                      </label>
                      <select
                        value={manualPaymentMethod}
                        onChange={(e) => setManualPaymentMethod(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs font-semibold text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                      >
                        <option value="Règlement sur place (CB)">Règlement sur place (Carte Bancaire)</option>
                        <option value="Règlement sur place (Espèces)">Règlement sur place (Espèces)</option>
                        <option value="Bon / Chèque Cadeau">Bon / Carte Cadeau</option>
                        <option value="Déjà réglé / Abonnement">Déjà réglé / Forfait</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A4D45] mb-1">
                        Remarques ou précisions (optionnel) :
                      </label>
                      <input
                        type="text"
                        value={manualNotes}
                        onChange={(e) => setManualNotes(e.target.value)}
                        placeholder="Ex: Cliente fidèle, demande cabine calme..."
                        className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#DDD3C1] text-xs text-[#2C2420] focus:ring-2 focus:ring-[#C8957C]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-[#F0EAE1] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-[#8C7A70]">
                    * Le rendez-vous sera immédiatement confirmé et bloquera ce créneau pour {manualPractitioner || 'la praticienne'}.
                  </p>

                  <button
                    type="submit"
                    disabled={manualSubmitting || isPractitionerBooked(manualPractitioner, manualDate, manualTimeSlot)}
                    className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-[#B98166] to-[#9F674F] hover:from-[#A87258] hover:to-[#8E5A43] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    <span>{manualSubmitting ? "Enregistrement en cours..." : "Valider le Rendez-vous en Présentiel"}</span>
                  </button>
                </div>

              </form>
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
