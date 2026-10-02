import { SalonInfo, SalonService, Practitioner } from '../types/salon';

export const SALON_INFO: SalonInfo = {
  name: "Un Moment pour Soi",
  tagline: "Institut de Beauté, Soins Holistiques & Rituels Bien-Être",
  address: "22 Rue du Bois de Châtres",
  postalCode: "91220",
  city: "Brétigny-sur-Orge",
  region: "Essonne, Île-de-France",
  country: "France",
  coordinates: {
    lat: 48.6036887,
    lng: 2.2962037,
  },
  googleMapsUrl: "https://www.google.com/maps/place/Un+Moment+pour+Soi/@48.6035219,2.2939091,17z/data=!4m16!1m9!3m8!1s0x47e5db0c2d1eaf67:0xb7f8d3b2c37c0bd3!2sUn+Moment+pour+Soi!8m2!3d48.6036887!4d2.2962037!9m1!1b1!16s%2Fg%2F11xkjbklkk!3m5!1s0x47e5db0c2d1eaf67:0xb7f8d3b2c37c0bd3!8m2!3d48.6036887!4d2.2962037!16s%2Fg%2F11xkjbklkk?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D",
  phone: "+33 1 69 88 02 45",
  email: "contact@unmomentpoursoi-institut.fr",
  hours: [
    { days: "Lundi", hours: "Fermé", note: "Journée de formation & préparation" },
    { days: "Mardi", hours: "09:30 – 19:30" },
    { days: "Mercredi", hours: "09:30 – 19:30" },
    { days: "Jeudi", hours: "09:30 – 20:30", note: "Nocturne bien-être sur réservation" },
    { days: "Vendredi", hours: "09:30 – 19:30" },
    { days: "Samedi", hours: "09:00 – 18:30" },
    { days: "Dimanche", hours: "Fermé" },
  ],
  amenities: [
    "Parking gratuit réservé aux clients",
    "Cabines climatisées & musique relaxante personnalisée",
    "Tisanes bio & eaux détox offertes",
    "Cosmétiques d'origine naturelle et cruelty-free",
    "Accès mobilité réduite (PMR)",
    "Paiement par carte, Apple Pay & sans contact",
  ]
};

// All practitioners are now sourced exclusively from promoted user accounts in Firestore.
export const PRACTITIONERS: Practitioner[] = [];

// All offers/services are now loaded exclusively from Firestore.
export const SALON_SERVICES: SalonService[] = [];

export const INITIAL_REVIEWS: Array<{
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  serviceTitle: string;
  createdAt: string;
}> = [
  {
    id: "rev-1",
    userId: "client-claire",
    userName: "Claire Mercier",
    rating: 5,
    comment: "Un havre de paix magnifique à Brétigny ! Émilie a des doigts de fée pour le soin Kobido, les traits sont lissés et l'ambiance est si douce. La tisanerie en fin de séance est la cerise sur le gâteau.",
    serviceTitle: "Soin Anti-Âge Liftant & Rituel Kobido",
    createdAt: "2026-09-18T14:20:00.000Z"
  },
  {
    id: "rev-2",
    userId: "client-sophie",
    userName: "Sophie Durand",
    rating: 5,
    comment: "Très facile de réserver en ligne et de payer en toute sécurité. J'ai fait le massage aux pierres chaudes avec Chloé : pure détente, toutes mes tensions dans le dos ont disparu.",
    serviceTitle: "Rituel Thérapeutique aux Pierres Chaudes de Volcan",
    createdAt: "2026-09-22T10:15:00.000Z"
  },
  {
    id: "rev-3",
    userId: "client-nora",
    userName: "Nora B.",
    rating: 5,
    comment: "Manucure Russe impeccable et rehaussement de cils bluffant réalisés par Sarah ! Institut ultra propre, parking juste devant très pratique. Je recommande à 100%.",
    serviceTitle: "Manucure Russe & Pose de Vernis Semi-Permanent",
    createdAt: "2026-09-25T16:40:00.000Z"
  }
];

export const SALON_FAQS = [
  {
    question: "Comment se déroule la réservation en ligne ?",
    answer: "Choisissez votre prestation, sélectionnez votre date, heure et praticienne préférée, puis connectez-vous pour finaliser la réservation avec paiement sécurisé. Une confirmation instantanée avec récapitulatif vous est envoyée."
  },
  {
    question: "Puis-je annuler ou reporter mon rendez-vous ?",
    answer: "Oui ! Depuis votre espace 'Mes Rendez-vous', vous pouvez annuler gratuitement jusqu'à 24 heures avant l'horaire prévu. Un remboursement automatique ou avoir est alors émis selon vos préférences."
  },
  {
    question: "Comment accéder à l'institut à Brétigny-sur-Orge ?",
    answer: "Nous sommes situés au 22 Rue du Bois de Châtres à Brétigny-sur-Orge. Un parking réservé à notre clientèle est à votre disposition gratuitement devant l'institut. Gare RER C Brétigny à 5 min en bus ou taxi."
  },
  {
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, CB), Apple Pay, Google Pay en ligne, ainsi que le paiement sécurisé par Stripe. Sur place, les chèques cadeaux et espèces sont également acceptés."
  },
  {
    question: "Proposez-vous des cartes cadeaux ?",
    answer: "Absolument ! Nos cartes cadeaux sont valables 1 an sur l'ensemble de nos prestations et produits. Vous pouvez en réserver une directement en ligne et l'imprimer ou l'envoyer par email."
  }
];
