import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SalonOverview } from './components/SalonOverview';
import { ServiceCatalog } from './components/ServiceCatalog';
import { ServiceDetailModal } from './components/ServiceDetailModal';
import { PractitionersSection } from './components/PractitionersSection';
import { BookingModal } from './components/BookingModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { GiftCardModal } from './components/GiftCardModal';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { testConnection } from './firebase/config';
import { Booking, SalonService, UserProfile } from './types/salon';
import { BookingService } from './services/bookingService';
import { ServiceManager } from './services/serviceManager';
import { UserService } from './services/userService';

function SalonAppContent() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  
  // Page routing: 'storefront' (public website) or 'admin' (full-page dedicated admin dashboard)
  const [currentView, setCurrentView] = useState<'storefront' | 'admin'>('storefront');

  // Navigation & section tracking
  const [activeSection, setActiveSection] = useState('home');

  // Dynamic services (from Firestore exclusively)
  const [services, setServices] = useState<SalonService[]>([]);
  const [allAdminServices, setAllAdminServices] = useState<SalonService[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState<boolean>(true);

  // Dynamic practitioners (from promoted accounts in Firestore)
  const [practitioners, setPractitioners] = useState<UserProfile[]>([]);
  const [isPractitionersLoading, setIsPractitionersLoading] = useState<boolean>(true);

  // Bookings list for active client
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceTarget, setBookingServiceTarget] = useState<SalonService | null>(null);
  const [bookingPractitionerTarget, setBookingPractitionerTarget] = useState<string | null>(null);

  const [serviceDetail, setServiceDetail] = useState<SalonService | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);

  // Validate Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to hash changes for deep linking to admin (#admin)
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Subscribe to services from Firestore
  useEffect(() => {
    const unsubActive = ServiceManager.subscribeServices((activeList) => {
      setServices(activeList || []);
      setIsServicesLoading(false);
    }, false);

    const unsubAll = ServiceManager.subscribeServices((allList) => {
      setAllAdminServices(allList || []);
    }, true);

    return () => {
      if (unsubActive) unsubActive();
      if (unsubAll) unsubAll();
    };
  }, []);

  // Subscribe to promoted practitioners from Firestore
  useEffect(() => {
    const unsubPractitioners = UserService.subscribePractitioners((list) => {
      setPractitioners(list || []);
      setIsPractitionersLoading(false);
    });

    return () => {
      if (unsubPractitioners) unsubPractitioners();
    };
  }, []);

  // Listen to bookings when user changes
  useEffect(() => {
    const effectiveUserId = currentUser?.uid || userProfile?.userId;
    if (!effectiveUserId) {
      setUserBookings([]);
      return;
    }

    const unsubscribe = BookingService.subscribeUserBookings(
      effectiveUserId,
      (bookings) => {
        setUserBookings(bookings);
      },
      (error) => {
        console.warn('Booking subscription notice:', error);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, userProfile]);

  const handleOpenBooking = (service?: SalonService, practitionerName?: string) => {
    setBookingServiceTarget(service || null);
    setBookingPractitionerTarget(practitionerName || null);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    // Real-time subscription will update userBookings automatically
  };

  const activeBookingsCount = userBookings.filter(b => b.status === 'confirmed').length;

  // ================= DEDICATED FULL-PAGE ADMIN DASHBOARD =================
  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBackToStorefront={() => {
          setCurrentView('storefront');
          if (window.location.hash === '#admin') {
            window.location.hash = '';
          }
        }}
        services={allAdminServices.length > 0 ? allAdminServices : services}
        practitioners={practitioners}
        onServicesChanged={() => {}}
      />
    );
  }

  // ================= PUBLIC STOREFRONT =================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col font-sans selection:bg-[#E8D8CE]">
      
      {/* Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAdmin={() => setCurrentView('admin')}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        bookingsCount={activeBookingsCount}
      />

      <main className="flex-1">
        {/* Hero Banner */}
        <HeroSection
          onOpenBooking={() => handleOpenBooking()}
          onExploreServices={() => {
            const el = document.getElementById('services');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Services & Treatment Catalog */}
        <ServiceCatalog
          services={services}
          isLoading={isServicesLoading}
          onSelectService={(service) => handleOpenBooking(service)}
          onViewServiceDetails={(service) => setServiceDetail(service)}
        />

        {/* Salon Overview: Address, Google Maps link, Hours, Atmosphere */}
        <SalonOverview />

        {/* Practitioners Team */}
        <PractitionersSection
          practitioners={practitioners}
          isLoading={isPractitionersLoading}
          onSelectPractitioner={(practitionerName) => handleOpenBooking(undefined, practitionerName)}
        />

        {/* Verified Reviews Section */}
        <ReviewsSection
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenBooking={() => handleOpenBooking()}
        onOpenGiftCard={() => setIsGiftCardOpen(true)}
      />

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        practitioners={practitioners}
        initialService={bookingServiceTarget}
        initialPractitioner={bookingPractitionerTarget}
        onBookingSuccess={handleBookingSuccess}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />

      <ServiceDetailModal
        service={serviceDetail}
        onClose={() => setServiceDetail(null)}
        onBookService={(service) => {
          setServiceDetail(null);
          handleOpenBooking(service);
        }}
      />

      <CustomerDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        bookings={userBookings}
        onBookNew={() => handleOpenBooking()}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <GiftCardModal
        isOpen={isGiftCardOpen}
        onClose={() => setIsGiftCardOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SalonAppContent />
    </AuthProvider>
  );
}
