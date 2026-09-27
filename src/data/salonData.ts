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

export const PRACTITIONERS: Practitioner[] = [
  {
    id: "emilie",
    name: "Émilie Dupont",
    role: "Fondatrice & Experte Soins Visage",
    experience: "12 ans d'expérience",
    specialties: ["Anti-âge & Kobido", "Peelings doux", "Diagnostic de peau"],
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    bio: "Diplômée d'État et passionnée de dermocosmétique, Émilie allie précision technique et approche sensorielle pour révéler l'éclat naturel de votre peau."
  },
  {
    id: "chloe",
    name: "Chloé Martin",
    role: "Massothérapeute & Praticienne Corps",
    experience: "8 ans d'expérience",
    specialties: ["Massage californien", "Rituel pierres chaudes", "Drainage lymphatique"],
    avatar: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
    bio: "Experte des rituels de relaxation profonde, Chloé dénoue les tensions musculaires et apaise l'esprit grâce à des huiles chaudes botaniques."
  },
  {
    id: "sarah",
    name: "Sarah Benali",
    role: "Artiste Regard & Prothésiste Ongulaire",
    experience: "6 ans d'expérience",
    specialties: ["Rehaussement de cils & Brow Lift", "Manucure Russe", "Semi-permanent"],
    avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=600&q=80",
    bio: "Minutieuse et créative, Sarah sublime votre regard et vos mains avec les techniques les plus douces et durables du marché."
  }
];

export const SALON_SERVICES: SalonService[] = [
  // --- SOINS VISAGE ---
  {
    id: "soin-eclat-hydratant",
    title: "Soin Éclat Sublime & Hydratation Profonde",
    subtitle: "Bain d'hydratation intense à l'acide hyaluronique végétal",
    category: "visage",
    categoryName: "Soins Visage",
    durationMinutes: 60,
    price: 65,
    description: "Un rituel revitalisant sur-mesure pour réhydrater les couches profondes de l'épiderme, lisser les ridules de déshydratation et illuminer le teint terne.",
    benefits: [
      "Teint instantanément lumineux et repulpé",
      "Élimination des toxines et impuretés en douceur",
      "Modelage facial relaxant au quartz rose"
    ],
    protocol: [
      "Démaquillage et double nettoyage aux eaux florales",
      "Gommage enzymatique doux sans grains",
      "Vapeur tiède aromatique et extraction délicate",
      "Masque bio-cellulose ultra-hydratant",
      "Massage liftant manuel aux roll-ons de quartz",
      "Application du sérum et soin protecteur personnalisé"
    ],
    recommendedFor: "Peaux fatiguées, déshydratées ou exposées au stress urbain.",
    badge: "Coup de Cœur",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "soin-anti-age-kobido",
    title: "Soin Anti-Âge Liftant & Rituel Kobido",
    subtitle: "Lifting naturel japonais & stimulation collagénique",
    category: "visage",
    categoryName: "Soins Visage",
    durationMinutes: 75,
    price: 85,
    originalPrice: 95,
    description: "Véritable art ancestral japonais, ce soin tonifie les 40 muscles du visage, stimule la microcirculation et relance la synthèse naturelle de collagène et d'élastine.",
    benefits: [
      "Effet tenseur immédiat sans injection",
      "Ovale du visage redessiné et pommettes rehaussées",
      "Détente neuromusculaire totale"
    ],
    protocol: [
      "Préparation de la peau au lait soyeux",
      "Stimulation des méridiens énergétiques faciaux",
      "Gestuelle rythmée Kobido (percussions légères, pétrissages)",
      "Masque tenseur au collagène marin et algues",
      "Sérum concentré régénérant appliqué sous cryo-sticks"
    ],
    recommendedFor: "Peaux matures, perte de fermeté ou prévention anti-âge globale.",
    badge: "Signature",
    image: "https://images.unsplash.com/photo-1512290900672-1f02e1c953bb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "peeling-doux-renovateur",
    title: "Peeling Doux AHA & Rénovation Cutanée",
    subtitle: "Grain de peau affiné et uniformité du teint",
    category: "visage",
    categoryName: "Soins Visage",
    durationMinutes: 45,
    price: 55,
    description: "Une exfoliation douce aux acides de fruits d'origine végétale pour estomper les irrégularités, resserrer les pores et raviver la clarté cutanée.",
    benefits: [
      "Grain de peau lisse comme de la soie",
      "Atténuation des micro-tâches pigmentaires",
      "Régénération cellulaire accélérée"
    ],
    protocol: [
      "Nettoyage purifiant à l'eau florale de romarin",
      "Application du complexe d'acides de fruits AHA/PHA",
      "Neutralisation et bain d'eau thermale apaisante",
      "Masque crème réparateur aux céramides",
      "Émulsion solaire protectrice indice 50+"
    ],
    recommendedFor: "Teints brouillés, peaux à imperfections ou pores dilatés.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80"
  },

  // --- CORPS & MASSAGES ---
  {
    id: "massage-relaxant-huiles",
    title: "Massage Relaxant Corps aux Huiles Précieuses",
    subtitle: "Évasion sensorielle enveloppante de la tête aux pieds",
    category: "massages",
    categoryName: "Massages & Corps",
    durationMinutes: 60,
    price: 75,
    description: "Un modelage californien fluide et harmonieux aux huiles tièdes d'argan bio et de fleur d'oranger. Chaque mouvement dissipe les tensions et procure un lâcher-prise absolu.",
    benefits: [
      "Libération profonde des tensions nerveuses et musculaires",
      "Amélioration de la circulation lymphatique",
      "Nourrit intensément l'épiderme grâce aux huiles tièdes"
    ],
    protocol: [
      "Choix personnalisé de la synergie d'huiles essentielles",
      "Respiration guidée et réchauffement des extrémités",
      "Mouvements longs et enveloppants sur le dos et les membres",
      "Pressions douces sur les points de détente dorsale",
      "Infusion tiède offerte en espace lounge"
    ],
    recommendedFor: "Stress accumulé, besoin urgent de déconnexion et de réconfort.",
    badge: "Best-Seller",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rituel-pierres-chaudes",
    title: "Rituel Thérapeutique aux Pierres Chaudes de Volcan",
    subtitle: "Chaleur pénétrante des galets basaltiques",
    category: "massages",
    categoryName: "Massages & Corps",
    durationMinutes: 90,
    price: 110,
    description: "La magie des pierres volcaniques chauffées à 50°C combinée à des manœuvres douces pour dissoudre les nœuds musculaires les plus rebelles.",
    benefits: [
      "Effet décontracturant profond sur le dos et les lombaires",
      "Action thermale stimulante sur le métabolisme",
      "Sensation de cocon de chaleur durable"
    ],
    protocol: [
      "Disposition des pierres sur les points énergétiques (chakras)",
      "Effleurages manuels à l'huile de sésame chaude",
      "Modelage doux avec les galets de basalte tièdes",
      "Enveloppement chaud des pieds et des trapèzes",
      "Réveil en douceur et thé vert détox"
    ],
    recommendedFor: "Contractures musculaires récurrentes, période hivernale, fatigue physique.",
    badge: "Luxe",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "gommage-enveloppement-detox",
    title: "Gommage Satin & Enveloppement Hydratant Velours",
    subtitle: "Peau douce comme la soie & détoxification cutanée",
    category: "massages",
    categoryName: "Massages & Corps",
    durationMinutes: 50,
    price: 65,
    description: "Un gommage aux cristaux de sel marin et d'amande douce suivi d'un enveloppement corporel nourrissant au beurre de karité bio.",
    benefits: [
      "Élimine toutes les cellules mortes sans agresser",
      "Restaure le film hydrolipidique de la peau",
      "Sensation de légèreté immédiate"
    ],
    protocol: [
      "Exfoliation circulaire au sel d'Epsom et amande",
      "Rinçage sous douche tiède aux jets hydromassants",
      "Enveloppement chauffant sous couverture thermique",
      "Hydratation finale par effleurages soyeux"
    ],
    recommendedFor: "Avant les vacances, avant un événement ou pour préparer la peau au soleil.",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80"
  },

  // --- CILS & REGARD ---
  {
    id: "rehaussement-cils-keratine",
    title: "Rehaussement de Cils Yumilash avec Soin Kératine",
    subtitle: "Courbure naturelle spectaculaire pour 6 à 8 semaines",
    category: "regard",
    categoryName: "Cils & Regard",
    durationMinutes: 60,
    price: 60,
    description: "Courbez délicatement vos cils naturels dès la racine pour ouvrir le regard sans mascara ni faux-cils. Comprend la teinture noire intense et un bain réparateur à la kératine.",
    benefits: [
      "Regard de biche dès le réveil, sans maquillage",
      "Résistant à l'eau, aux séances de sport et au sauna",
      "Nourrit et épaissit les cils naturels"
    ],
    protocol: [
      "Pose de patchs hydrogel contour des yeux",
      "Choix du silicone adapté à la longueur de vos cils",
      "Mise en forme délicate cil à cil",
      "Teinture végétale noire brillante",
      "Soin nourrissant fortifiant à la kératine pure"
    ],
    recommendedFor: "Cils droits ou tombants, femmes actives recherchant un gain de temps matinal.",
    badge: "Tendance",
    image: "https://images.unsplash.com/photo-1588510860829-e854bcfbfaeb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "browlift-restructuration",
    title: "Brow Lift & Restructuration des Sourcils au Fil",
    subtitle: "Ligne de sourcils étoffée et discipline parfaite",
    category: "regard",
    categoryName: "Cils & Regard",
    durationMinutes: 45,
    price: 45,
    description: "Redéfinissez votre arcade sourcilière avec le Brow Lift qui rehausse les poils de sourcils pour un effet dense, combiné à une épilation nette au fil.",
    benefits: [
      "Comble visuellement les zones clairsemées",
      "Fixe les sourcils indisciplinés",
      "Harmonise l'équilibre du visage"
    ],
    protocol: [
      "Brossage et diagnostic de morphologie du visage",
      "Lotion assouplissante et fixation de la courbure",
      "Épilation nette et précise au fil de coton",
      "Teinture ton sur ton sur-mesure",
      "Sérum huile de ricin protecteur"
    ],
    recommendedFor: "Sourcils asymétriques, fins ou indisciplinés.",
    image: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80"
  },

  // --- ONGLERIE & MAINS/PIEDS ---
  {
    id: "manucure-russe-semi-permanent",
    title: "Manucure Russe & Pose de Vernis Semi-Permanent",
    subtitle: "Cuticules immaculées & tenue parfaite jusqu'à 4 semaines",
    category: "ongles",
    categoryName: "Onglerie",
    durationMinutes: 60,
    price: 48,
    description: "Le summum de la manucure moderne : nettoyage minutieux de l'ongle et des cuticules à la fraiseuse de précision, suivi d'une pose de vernis sous cuticule pour repousser la démarcation.",
    benefits: [
      "Tenue ultra-longue durée sans s'écailler",
      "Finition ultra-propre et raffinée",
      "Large choix parmi plus de 80 teintes élégantes"
    ],
    protocol: [
      "Mise en forme symétrique des ongles naturels",
      "Travail soigné des cuticules à sec à l'embout diamant",
      "Dégraissage et base protectrice enrichie en vitamines",
      "Double couche de vernis couleur haut éclat",
      "Finition Top Coat miroir et huile nutritive pour cuticules"
    ],
    recommendedFor: "Mains soignées au quotidien, tenue garantie sans éclatements.",
    badge: "Populaire",
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "beaute-pieds-spa-callus",
    title: "Beauté des Pieds Spa & Soin Anti-Callosités",
    subtitle: "Pieds légers, doux et soignés en profondeur",
    category: "ongles",
    categoryName: "Onglerie",
    durationMinutes: 55,
    price: 52,
    description: "Un véritable rituel podologique esthétique pour retrouver des pieds de bébé. Bain d'eau tiède aux huiles apaisantes, traitement doux des callosités et massage délassant.",
    benefits: [
      "Élimination des talons fendillés et callosités sans râpe agressive",
      "Sensation immédiate de légèreté",
      "Ongles coupés, limés et polis avec brillance"
    ],
    protocol: [
      "Bain bouillonnant aux sels relaxants",
      "Patchs exfoliants formulés aux acides de fruits",
      "Retrait délicat des peaux mortes",
      "Gommage sucre & menthe poivrée",
      "Massage réflexe de la voûte plantaire"
    ],
    recommendedFor: "Pieds secs ou fatigués par la marche et les talons.",
    image: "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=800&q=80"
  },

  // --- ÉPILATIONS ---
  {
    id: "forfait-epilation-integrale",
    title: "Forfait Épilation Douceur Cire Végétale",
    subtitle: "Jambes complètes + Maillot intégral + Aisselles",
    category: "epilation",
    categoryName: "Épilations",
    durationMinutes: 60,
    price: 62,
    originalPrice: 75,
    description: "Notre formule complète à la cire tiède naturelle enrichie en azulène calmant, idéale pour les peaux les plus sensibles et réactives.",
    benefits: [
      "Repousse ralentie et poils visiblement affinés",
      "Formule hypoallergénique sans colophane",
      "Soin post-épilation apaisant offert"
    ],
    protocol: [
      "Désinfection préalable et application de talc végétal",
      "Application de la cire pelable basse température",
      "Extraction rapide avec un minimum d'inconfort",
      "Application de l'huile tiède anti-repousse et camomille"
    ],
    recommendedFor: "Toutes celles qui souhaitent une peau nette pendant 3 à 4 semaines.",
    badge: "Pack Éco",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=80"
  },

  // --- RITUELS SIGNATURE & FORFAITS ---
  {
    id: "rituel-un-moment-pour-soi",
    title: "Le Grand Rituel Signature « Un Moment pour Soi »",
    subtitle: "La parenthèse bien-être absolue de 2 heures",
    category: "rituels",
    categoryName: "Rituels Signature",
    durationMinutes: 120,
    price: 145,
    originalPrice: 165,
    description: "Le rituel signature le plus complet de notre institut : Soin du visage sur-mesure (60 min) suivi d'un massage corporel relaxant à la bougie parfumée tiède (60 min). Servi avec plateau douceur thé bio & macarons artisanaux.",
    benefits: [
      "Détente absolue du corps et réactivation cellulaire du visage",
      "Le cadeau idéal pour se ressourcer ou faire plaisir à un proche",
      "Moment privé privilégié avec nos meilleures attentions"
    ],
    protocol: [
      "Entretien d'accueil et diagnostic personnalisé",
      "Soin visage complet adapté à la saison",
      "Massage à la bougie tiède au beurre de soja et monoï",
      "Pause gourmande dans notre tisanerie lounge"
    ],
    recommendedFor: "Cadeau d'anniversaire, fête des mères ou grand moment de ressourcement personnel.",
    badge: "Exclusivité",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
  }
];

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
