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
import { StripeSettingsModal } from './components/StripeSettingsModal';
import { GiftCardModal } from './components/GiftCardModal';
import { ReviewsSection } from './components/ReviewsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { testConnection } from './firebase/config';
import { Booking, SalonService } from './types/salon';
import { BookingService } from './services/bookingService';

function SalonAppContent() {
  const { currentUser, userProfile } = useAuth();
  
  // Navigation & section tracking
  const [activeSection, setActiveSection] = useState('home');

  // Bookings list for active client
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingServiceTarget, setBookingServiceTarget] = useState<SalonService | null>(null);
  const [bookingPractitionerTarget, setBookingPractitionerTarget] = useState<string | null>(null);

  const [serviceDetail, setServiceDetail] = useState<SalonService | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isStripeConfigOpen, setIsStripeConfigOpen] = useState(false);
  const [isGiftCardOpen, setIsGiftCardOpen] = useState(false);

  // Validate Firestore connection on boot as mandated
  useEffect(() => {
    testConnection();
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
        console.warn('Booking subscription warning:', error);
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
    // Re-fetch bookings automatically through real-time subscription
  };

  const activeBookingsCount = userBookings.filter(b => b.status === 'confirmed').length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col font-sans selection:bg-[#E8D8CE]">
      
      {/* Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenStripeConfig={() => setIsStripeConfigOpen(true)}
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
          onSelectService={(service) => handleOpenBooking(service)}
          onViewServiceDetails={(service) => setServiceDetail(service)}
        />

        {/* Salon Overview: Address, Google Maps link, Hours, Atmosphere */}
        <SalonOverview />

        {/* Practitioners Team */}
        <PractitionersSection
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
        onOpenStripeConfig={() => setIsStripeConfigOpen(true)}
      />

      {/* Modals */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        initialService={bookingServiceTarget}
        initialPractitioner={bookingPractitionerTarget}
        onBookingSuccess={handleBookingSuccess}
        onOpenDashboard={() => setIsDashboardOpen(true)}
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

      <StripeSettingsModal
        isOpen={isStripeConfigOpen}
        onClose={() => setIsStripeConfigOpen(false)}
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
