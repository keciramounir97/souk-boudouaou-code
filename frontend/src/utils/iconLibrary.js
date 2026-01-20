/**
 * Icon Library - Over 100 icons organized by domains
 * For use in listing custom fields
 */

import {
  // Transportation & Delivery
  Truck, Package, PackageCheck, PackageX, Box, Boxes, ShoppingCart, ShoppingBag,
  // Time & Age
  Clock, Calendar, CalendarDays, CalendarClock, Timer, Hourglass,
  // Animals & Livestock
  Dog, Cat, Rabbit, Fish, Bird, Egg,
  // Health & Medical
  ShieldCheck, Heart, HeartPulse, Pill, Syringe, Stethoscope, Activity, Crosshair,
  // Food & Agriculture
  Wheat, Apple, Carrot, Milk, Coffee, UtensilsCrossed, ChefHat,
  // Measurement & Weight
  Weight, Scale, Ruler, Gauge, BarChart, TrendingUp, TrendingDown,
  // Location & Geography
  MapPin, Map, Navigation, Compass, Globe, Building, Home, Factory,
  // People & Users
  Users, User, UserCheck, UserPlus, Baby,
  // Status & Availability
  CheckCircle, XCircle, AlertCircle, Info, Star, StarOff, ThumbsUp, ThumbsDown,
  // Quality & Condition
  Award, Medal, Trophy, Sparkles, Gem, Crown, BadgeCheck, BadgeAlert,
  // Nature & Environment
  Leaf, TreePine, Flower, Sun, Cloud, Droplet, Wind, Mountain,
  // Tools & Equipment
  Wrench, Hammer, Cog, Settings, Scissors, Paintbrush,
  // Communication
  Phone, Mail, MessageSquare, Bell, Radio, Video,
  // Finance & Payment
  DollarSign, Coins, Wallet, CreditCard, Receipt,
  // Technology
  Smartphone, Laptop, Monitor, Camera, Printer, Wifi, Bluetooth,
  // Sports & Activities
  Dumbbell, Bike, Car, Plane, Ship, Train, Bus,
  // Miscellaneous
  Tag, Tags, Bookmark, BookOpen, FileText, File, Folder, Image, Music,
  // Default shapes
  Circle, Square, Hexagon, Triangle,
} from "lucide-react";

// Icon categories organized by domain
export const iconCategories = {
  transportation: {
    name: "Transport & Livraison",
    icons: [
      { name: "Truck", component: Truck, label: "Camion" },
      { name: "Package", component: Package, label: "Colis" },
      { name: "PackageCheck", component: PackageCheck, label: "Colis vérifié" },
      { name: "PackageX", component: PackageX, label: "Colis annulé" },
      { name: "Box", component: Box, label: "Boîte" },
      { name: "Boxes", component: Boxes, label: "Boîtes" },
      { name: "ShoppingCart", component: ShoppingCart, label: "Panier" },
      { name: "ShoppingBag", component: ShoppingBag, label: "Sac" },
    ],
  },
  time: {
    name: "Temps & Âge",
    icons: [
      { name: "Clock", component: Clock, label: "Horloge" },
      { name: "Calendar", component: Calendar, label: "Calendrier" },
      { name: "CalendarDays", component: CalendarDays, label: "Calendrier jours" },
      { name: "CalendarClock", component: CalendarClock, label: "Calendrier horloge" },
      { name: "Timer", component: Timer, label: "Minuteur" },
      { name: "Hourglass", component: Hourglass, label: "Sablier" },
    ],
  },
  animals: {
    name: "Animaux & Bétail",
    icons: [
      { name: "Dog", component: Dog, label: "Chien" },
      { name: "Cat", component: Cat, label: "Chat" },
      { name: "Rabbit", component: Rabbit, label: "Lapin" },
      { name: "Fish", component: Fish, label: "Poisson" },
      { name: "Bird", component: Bird, label: "Oiseau" },
      { name: "Egg", component: Egg, label: "Œuf" },
      { name: "Package", component: Package, label: "Produit" },
      { name: "Box", component: Box, label: "Boîte" },
    ],
  },
  health: {
    name: "Santé & Médical",
    icons: [
      { name: "ShieldCheck", component: ShieldCheck, label: "Bouclier vérifié" },
      { name: "Heart", component: Heart, label: "Cœur" },
      { name: "HeartPulse", component: HeartPulse, label: "Pouls" },
      { name: "Pill", component: Pill, label: "Pilule" },
      { name: "Syringe", component: Syringe, label: "Seringue" },
      { name: "Stethoscope", component: Stethoscope, label: "Stéthoscope" },
      { name: "Activity", component: Activity, label: "Activité" },
      { name: "Crosshair", component: Crosshair, label: "Viseur" },
    ],
  },
  food: {
    name: "Alimentation & Agriculture",
    icons: [
      { name: "Wheat", component: Wheat, label: "Blé" },
      { name: "Apple", component: Apple, label: "Pomme" },
      { name: "Carrot", component: Carrot, label: "Carotte" },
      { name: "Milk", component: Milk, label: "Lait" },
      { name: "Coffee", component: Coffee, label: "Café" },
      { name: "UtensilsCrossed", component: UtensilsCrossed, label: "Couverts" },
      { name: "ChefHat", component: ChefHat, label: "Toque" },
      { name: "Fish", component: Fish, label: "Poisson" },
    ],
  },
  measurement: {
    name: "Mesure & Poids",
    icons: [
      { name: "Weight", component: Weight, label: "Poids" },
      { name: "Scale", component: Scale, label: "Balance" },
      { name: "Ruler", component: Ruler, label: "Règle" },
      { name: "Gauge", component: Gauge, label: "Jauge" },
      { name: "BarChart", component: BarChart, label: "Graphique" },
      { name: "TrendingUp", component: TrendingUp, label: "Hausse" },
      { name: "TrendingDown", component: TrendingDown, label: "Baisse" },
    ],
  },
  location: {
    name: "Localisation",
    icons: [
      { name: "MapPin", component: MapPin, label: "Épingle" },
      { name: "Map", component: Map, label: "Carte" },
      { name: "Navigation", component: Navigation, label: "Navigation" },
      { name: "Compass", component: Compass, label: "Boussole" },
      { name: "Globe", component: Globe, label: "Globe" },
      { name: "Building", component: Building, label: "Bâtiment" },
      { name: "Home", component: Home, label: "Maison" },
      { name: "Factory", component: Factory, label: "Usine" },
    ],
  },
  people: {
    name: "Personnes",
    icons: [
      { name: "Users", component: Users, label: "Utilisateurs" },
      { name: "User", component: User, label: "Utilisateur" },
      { name: "UserCheck", component: UserCheck, label: "Utilisateur vérifié" },
      { name: "UserPlus", component: UserPlus, label: "Ajouter utilisateur" },
      { name: "Baby", component: Baby, label: "Bébé" },
      { name: "Users", component: Users, label: "Groupe" },
      { name: "User", component: User, label: "Personne" },
    ],
  },
  status: {
    name: "Statut & Disponibilité",
    icons: [
      { name: "CheckCircle", component: CheckCircle, label: "Vérifié" },
      { name: "XCircle", component: XCircle, label: "Annulé" },
      { name: "AlertCircle", component: AlertCircle, label: "Alerte" },
      { name: "Info", component: Info, label: "Info" },
      { name: "Star", component: Star, label: "Étoile" },
      { name: "StarOff", component: StarOff, label: "Étoile désactivée" },
      { name: "ThumbsUp", component: ThumbsUp, label: "Pouce levé" },
      { name: "ThumbsDown", component: ThumbsDown, label: "Pouce baissé" },
    ],
  },
  quality: {
    name: "Qualité & Condition",
    icons: [
      { name: "Award", component: Award, label: "Récompense" },
      { name: "Medal", component: Medal, label: "Médaille" },
      { name: "Trophy", component: Trophy, label: "Trophée" },
      { name: "Sparkles", component: Sparkles, label: "Étincelles" },
      { name: "Gem", component: Gem, label: "Gemme" },
      { name: "Crown", component: Crown, label: "Couronne" },
      { name: "BadgeCheck", component: BadgeCheck, label: "Badge vérifié" },
      { name: "BadgeAlert", component: BadgeAlert, label: "Badge alerte" },
    ],
  },
  nature: {
    name: "Nature & Environnement",
    icons: [
      { name: "Leaf", component: Leaf, label: "Feuille" },
      { name: "TreePine", component: TreePine, label: "Pin" },
      { name: "Flower", component: Flower, label: "Fleur" },
      { name: "Sun", component: Sun, label: "Soleil" },
      { name: "Cloud", component: Cloud, label: "Nuage" },
      { name: "Droplet", component: Droplet, label: "Goutte" },
      { name: "Wind", component: Wind, label: "Vent" },
      { name: "Mountain", component: Mountain, label: "Montagne" },
    ],
  },
  tools: {
    name: "Outils & Équipement",
    icons: [
      { name: "Wrench", component: Wrench, label: "Clé" },
      { name: "Hammer", component: Hammer, label: "Marteau" },
      { name: "Cog", component: Cog, label: "Engrenage" },
      { name: "Settings", component: Settings, label: "Paramètres" },
      { name: "Scissors", component: Scissors, label: "Ciseaux" },
      { name: "Paintbrush", component: Paintbrush, label: "Pinceau" },
      { name: "Wrench", component: Wrench, label: "Réparation" },
    ],
  },
  communication: {
    name: "Communication",
    icons: [
      { name: "Phone", component: Phone, label: "Téléphone" },
      { name: "Mail", component: Mail, label: "Mail" },
      { name: "MessageSquare", component: MessageSquare, label: "Message" },
      { name: "Bell", component: Bell, label: "Cloche" },
      { name: "Radio", component: Radio, label: "Radio" },
      { name: "Video", component: Video, label: "Vidéo" },
      { name: "Phone", component: Phone, label: "Appel" },
    ],
  },
  finance: {
    name: "Finance & Paiement",
    icons: [
      { name: "DollarSign", component: DollarSign, label: "Dollar" },
      { name: "Coins", component: Coins, label: "Pièces" },
      { name: "Wallet", component: Wallet, label: "Portefeuille" },
      { name: "CreditCard", component: CreditCard, label: "Carte de crédit" },
      { name: "Receipt", component: Receipt, label: "Reçu" },
      { name: "DollarSign", component: DollarSign, label: "Prix" },
      { name: "Coins", component: Coins, label: "Argent" },
    ],
  },
  technology: {
    name: "Technologie",
    icons: [
      { name: "Smartphone", component: Smartphone, label: "Smartphone" },
      { name: "Laptop", component: Laptop, label: "Ordinateur portable" },
      { name: "Monitor", component: Monitor, label: "Moniteur" },
      { name: "Camera", component: Camera, label: "Caméra" },
      { name: "Printer", component: Printer, label: "Imprimante" },
      { name: "Wifi", component: Wifi, label: "WiFi" },
      { name: "Bluetooth", component: Bluetooth, label: "Bluetooth" },
    ],
  },
  sports: {
    name: "Sports & Activités",
    icons: [
      { name: "Dumbbell", component: Dumbbell, label: "Haltère" },
      { name: "Bike", component: Bike, label: "Vélo" },
      { name: "Car", component: Car, label: "Voiture" },
      { name: "Plane", component: Plane, label: "Avion" },
      { name: "Ship", component: Ship, label: "Bateau" },
      { name: "Train", component: Train, label: "Train" },
      { name: "Bus", component: Bus, label: "Bus" },
    ],
  },
  miscellaneous: {
    name: "Divers",
    icons: [
      { name: "Tag", component: Tag, label: "Étiquette" },
      { name: "Tags", component: Tags, label: "Étiquettes" },
      { name: "Bookmark", component: Bookmark, label: "Signet" },
      { name: "BookOpen", component: BookOpen, label: "Livre ouvert" },
      { name: "FileText", component: FileText, label: "Fichier texte" },
      { name: "File", component: File, label: "Fichier" },
      { name: "Folder", component: Folder, label: "Dossier" },
      { name: "Image", component: Image, label: "Image" },
      { name: "Music", component: Music, label: "Musique" },
      { name: "Circle", component: Circle, label: "Cercle" },
      { name: "Square", component: Square, label: "Carré" },
      { name: "Hexagon", component: Hexagon, label: "Hexagone" },
      { name: "Triangle", component: Triangle, label: "Triangle" },
    ],
  },
};

// Get all icons as a flat array
export const getAllIcons = () => {
  const allIcons = [];
  Object.values(iconCategories).forEach((category) => {
    category.icons.forEach((icon) => {
      allIcons.push({
        ...icon,
        category: category.name,
      });
    });
  });
  return allIcons;
};

// Get icon by name
export const getIconByName = (iconName) => {
  const allIcons = getAllIcons();
  return allIcons.find((icon) => icon.name === iconName) || allIcons.find((icon) => icon.name === "Package");
};

// Get icons by category
export const getIconsByCategory = (categoryKey) => {
  return iconCategories[categoryKey]?.icons || [];
};
