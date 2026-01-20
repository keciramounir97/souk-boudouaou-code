import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  API_ORIGIN,
  getListingDetails,
  getListings,
} from "../api/dataService";
import { normalizeImageUrl } from "../utils/images";

const ListingDetails = ({ darkMode = false, language = "fr" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCallCenter, setShowCallCenter] = useState(false);
  const [user, setUser] = useState(null);
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [similar, setSimilar] = useState([]);

  // Traductions complètes
  const translations = {
    fr: {
      back: "Retour",
      contactSeller: "Contacter via le centre d'appel",
      description: "Description",
      productDetails: "Détails du produit",
      sellerInfo: "Informations du vendeur",
      location: "Localisation",
      status: "Statut",
      active: "Actif",
      inactive: "Inactif",
      deliveryAvailable: "Livraison disponible",
      deliveryNotAvailable: "Livraison non disponible",
      vaccinated: "Vacciné",
      notVaccinated: "Non vacciné",
      breedingDate: "Date d'élevage",
      preparationDate: "Date de préparation",
      averageWeight: "Poids moyen",
      kg: "kg",
      quantity: "Quantité",
      price: "Prix",
      days: "jours",
      views: "vues",
      inquiries: "demandes",
      similarListings: "Annonces similaires",
      wilaya: "Wilaya",
      commune: "Commune",
      phone: "Téléphone",
      email: "Email",
      category: "Catégorie",
      createdAt: "Date de publication",
      share: "Partager",
      report: "Signaler",
      loading: "Chargement...",
      notFound: "Annonce non trouvée",
      memberSince: "Membre depuis",
      verifiedSeller: "Vendeur vérifié",
      editListing: "Modifier l'annonce",
      interested: "Je suis intéressé",
      callCenter: "Centre d'Appel",
      callCenterDescription:
        "Notre centre d'appel vous met en relation avec les meilleurs éleveurs et fermiers du pays en toute confiance",
      callNow: "Appeler maintenant",
      copyNumber: "Copier le numéro",
      copied: "Numéro copié!",
      availableHours: "Disponible 7j/7 de 8h à 22h",
      quickConnection: "Connexion directe avec l'éleveur",
      professionalService: "Service professionnel garanti",
      secureTransaction: "Transaction sécurisée",
      trustedPartners: "Partenaires de confiance",
      qualityAssurance: "Qualité garantie",
      bestFarmers: "Meilleurs éleveurs du pays",
      secureConnection: "Connexion sécurisée",
      premiumQuality: "Produits de qualité premium",
      directContact: "Contact direct avec producteur",
    },
    en: {
      back: "Back",
      contactSeller: "Contact via call center",
      description: "Description",
      productDetails: "Product details",
      sellerInfo: "Seller information",
      location: "Location",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      deliveryAvailable: "Delivery available",
      deliveryNotAvailable: "Delivery not available",
      vaccinated: "Vaccinated",
      notVaccinated: "Not vaccinated",
      breedingDate: "Breeding date",
      preparationDate: "Preparation date",
      averageWeight: "Average weight",
      kg: "kg",
      quantity: "Quantity",
      price: "Price",
      days: "days",
      views: "views",
      inquiries: "inquiries",
      similarListings: "Similar listings",
      wilaya: "Wilaya",
      commune: "Commune",
      phone: "Phone",
      email: "Email",
      category: "Category",
      createdAt: "Publication date",
      share: "Share",
      report: "Report",
      loading: "Loading...",
      notFound: "Listing not found",
      memberSince: "Member since",
      verifiedSeller: "Verified seller",
      editListing: "Edit listing",
      interested: "I'm interested",
      callCenter: "Call Center",
      callCenterDescription:
        "Our call center connects you with the best breeders and farmers in the country with complete trust",
      callNow: "Call now",
      copyNumber: "Copy number",
      copied: "Number copied!",
      availableHours: "Available 7 days a week from 8 AM to 10 PM",
      quickConnection: "Direct connection with breeder",
      professionalService: "Professional service guaranteed",
      secureTransaction: "Secure transaction",
      trustedPartners: "Trusted partners",
      qualityAssurance: "Quality guaranteed",
      bestFarmers: "Best farmers in the country",
      secureConnection: "Secure connection",
      premiumQuality: "Premium quality products",
      directContact: "Direct contact with producer",
    },
    ar: {
      back: "عودة",
      contactSeller: "الاتصال عبر مركز الاتصال",
      description: "الوصف",
      productDetails: "تفاصيل المنتج",
      sellerInfo: "معلومات البائع",
      location: "الموقع",
      status: "الحالة",
      active: "نشط",
      inactive: "غير نشط",
      deliveryAvailable: "توصيل متاح",
      deliveryNotAvailable: "توصيل غير متاح",
      vaccinated: "مطعم",
      notVaccinated: "غير مطعم",
      breedingDate: "تاريخ التربية",
      preparationDate: "تاريخ التحضير",
      averageWeight: "متوسط الوزن",
      kg: "كغ",
      quantity: "الكمية",
      price: "السعر",
      days: "أيام",
      views: "مشاهدة",
      inquiries: "استفسار",
      similarListings: "إعلانات مشابهة",
      wilaya: "الولاية",
      commune: "البلدية",
      phone: "الهاتف",
      email: "البريد الإلكتروني",
      category: "الفئة",
      createdAt: "تاريخ النشر",
      share: "مشاركة",
      report: "الإبلاغ",
      loading: "جاري التحميل...",
      notFound: "الإعلان غير موجود",
      memberSince: "عضو منذ",
      verifiedSeller: "بائع موثوق",
      editListing: "تعديل الإعلان",
      interested: "أنا مهتم",
      callCenter: "مركز الاتصال",
      callCenterDescription:
        "مركز الاتصال لدينا يربطك بأفضل المربين والمزارعين في البلاد بكل ثقة",
      callNow: "اتصل الآن",
      copyNumber: "نسخ الرقم",
      copied: "تم نسخ الرقم!",
      availableHours: "متاح 7 أيام في الأسبوع من 8 صباحاً إلى 10 مساءً",
      quickConnection: "اتصال مباشر مع المربي",
      professionalService: "خدمة مهنية مضمونة",
      secureTransaction: "معاملة آمنة",
      trustedPartners: "شركاء موثوقون",
      qualityAssurance: "جودة مضمونة",
      bestFarmers: "أفضل المزارعين في البلاد",
      secureConnection: "اتصال آمن",
      premiumQuality: "منتجات بجودة ممتازة",
      directContact: "اتصال مباشر مع المنتج",
    },
    es: {
      back: "Volver",
      contactSeller: "Contactar a través del centro de llamadas",
      description: "Descripción",
      productDetails: "Detalles del producto",
      sellerInfo: "Información del vendedor",
      location: "Ubicación",
      status: "Estado",
      active: "Activo",
      inactive: "Inactivo",
      deliveryAvailable: "Entrega disponible",
      deliveryNotAvailable: "Entrega no disponible",
      vaccinated: "Vacunado",
      notVaccinated: "No vacunado",
      breedingDate: "Fecha de cría",
      preparationDate: "Fecha de preparación",
      averageWeight: "Peso promedio",
      kg: "kg",
      quantity: "Cantidad",
      price: "Precio",
      days: "días",
      views: "vistas",
      inquiries: "consultas",
      similarListings: "Anuncios similares",
      wilaya: "Wilaya",
      commune: "Comuna",
      phone: "Teléfono",
      email: "Email",
      category: "Categoría",
      createdAt: "Fecha de publicación",
      share: "Compartir",
      report: "Reportar",
      loading: "Cargando...",
      notFound: "Anuncio no encontrado",
      memberSince: "Miembro desde",
      verifiedSeller: "Vendedor verificado",
      editListing: "Editar anuncio",
      interested: "Estoy interesado",
      callCenter: "Centro de Llamadas",
      callCenterDescription:
        "Nuestro centro de llamadas te conecta con los mejores criadores y agricultores del país con total confianza",
      callNow: "Llamar ahora",
      copyNumber: "Copiar número",
      copied: "¡Número copiado!",
      availableHours: "Disponible 7 días a la semana de 8 AM a 10 PM",
      quickConnection: "Conexión directa con el criador",
      professionalService: "Servicio profesional garantizado",
      secureTransaction: "Transacción segura",
      trustedPartners: "Socios de confianza",
      qualityAssurance: "Calidad garantizada",
      bestFarmers: "Mejores agricultores del país",
      secureConnection: "Conexión segura",
      premiumQuality: "Productos de calidad premium",
      directContact: "Contacto directo con productor",
    },
  };

  const t = translations[language];

  // Call center phone number
  const callCenterNumber = "+213 561 23 45 67";

  // Fetch listing by ID from backend
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const json = await getListingDetails(id);
        if (!json.success) throw new Error(json.message || "Failed to load");
        const l = json.data.listing;
        setListing({
          ...l,
          images: (l.images || []).map((fn) => normalizeImageUrl(fn)),
          days: Math.max(
            1,
            Math.floor(
              (Date.now() - new Date(l.createdAt).getTime()) /
                (24 * 60 * 60 * 1000)
            )
          ),
        });
        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, [id]);

  // Simuler le chargement des données
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // user setup only
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!listing) return;
      try {
        const json = await getListings();
        const arr = Array.isArray(json.data)
          ? json.data
          : json.data?.listings || [];
        const sim = arr
          .filter(
            (x) =>
              (x.id || x._id) !== (listing.id || listing._id) &&
              (x.category || "") === (listing.category || "")
          )
          .slice(0, 6)
          .map((x) => {
            let images = x.images || [];
            if (!Array.isArray(images)) images = [];
            return { ...x, images };
          });
        setSimilar(sim);
      } catch (e) {
        console.error("Similar listings error:", e);
      }
    })();
  }, [listing]);

  const formatNumber = (number) => {
    return new Intl.NumberFormat("fr-FR").format(number);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleInterestedClick = () => {
    setShowCallCenter(!showCallCenter);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(
        language === "fr"
          ? "Lien copié dans le presse-papier!"
          : language === "ar"
          ? "تم نسخ الرابط!"
          : language === "es"
          ? "¡Enlace copiado al portapapeles!"
          : "Link copied to clipboard!"
      );
    }
  };

  const handleEditListing = () => {
    navigate(`/edit-listing/${listing.id}`);
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(callCenterNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const isOwner = user && listing && user.id === listing.createdBy;

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className={`mt-4 ${darkMode ? "text-white" : "text-gray-600"}`}>
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className="text-center">
          <h2
            className={`text-2xl font-bold mb-4 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.notFound}
          </h2>
          <button
            onClick={() => navigate(-1)}
            className={`px-6 py-3 rounded-lg font-medium ${
              darkMode
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {t.back}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900" : "bg-gray-50"
      } transition-colors duration-300`}
    >
      {/* Header avec bouton retour */}
      <div
        className={`border-b ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "text-white hover:bg-gray-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t.back}
            </button>

            <div className="flex gap-2">
              {isOwner && (
                <button
                  onClick={handleEditListing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode
                      ? "text-green-400 hover:bg-gray-700"
                      : "text-green-600 hover:bg-gray-100"
                  }`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  {t.editListing}
                </button>
              )}
              <button
                onClick={handleShare}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? "text-white hover:bg-gray-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {t.share}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne de gauche - Images et informations principales */}
          <div className="space-y-6">
            {/* Galerie d'images */}
            <div
              className={`rounded-xl overflow-hidden shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="relative">
                <img
                  src={listing.images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-96 object-cover"
                />

                {/* Navigation des images */}
                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) =>
                            (prev - 1 + listing.images.length) %
                            listing.images.length
                        )
                      }
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % listing.images.length
                        )
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Indicateurs d'images */}
                {listing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white scale-125"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Miniatures */}
              {listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-orange-500 ring-2 ring-orange-200"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div
              className={`rounded-xl p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        listing.status === "active"
                          ? "bg-green-100 text-green-800 border border-green-300"
                          : "bg-gray-100 text-gray-800 border border-gray-300"
                      }`}
                    >
                      {listing.status === "active" ? t.active : t.inactive}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        darkMode
                          ? "bg-gray-700 text-gray-300 border border-gray-600"
                          : "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {listing.category}
                    </span>
                  </div>
                  <h1
                    className={`text-2xl font-bold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {listing.title}
                  </h1>
                </div>
                <div
                  className={`text-3xl font-bold ${
                    darkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {formatNumber(listing.price)} DA
                  <span
                    className={`text-sm font-normal ${
                      darkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    / {listing.unit}
                  </span>
                </div>
              </div>

              {/* Métriques */}
              <div className="flex gap-6 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {formatNumber(listing.views)} {t.views}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {formatNumber(listing.inquiries)} {t.inquiries}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {listing.days} {t.days}
                  </span>
                </div>
              </div>

              {/* Bouton Je suis intéressé */}
              <button
                onClick={handleInterestedClick}
                className={`w-full py-4 px-4 rounded-lg font-medium transition-colors text-lg ${
                  darkMode
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {t.interested}
              </button>

              {/* Informations du centre d'appel (affichées conditionnellement) */}
              {showCallCenter && (
                <div
                  className={`mt-4 p-6 rounded-lg border ${
                    darkMode
                      ? "bg-orange-900/20 border-orange-700"
                      : "bg-orange-50 border-orange-200"
                  }`}
                >
                  <h3
                    className={`text-xl font-semibold mb-4 flex items-center gap-3 ${
                      darkMode ? "text-white" : "text-orange-900"
                    }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {t.callCenter}
                  </h3>

                  {/* Message principal */}
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      darkMode ? "bg-orange-800/40" : "bg-orange-100"
                    }`}
                  >
                    <p
                      className={`text-lg font-medium text-center ${
                        darkMode ? "text-orange-200" : "text-orange-800"
                      }`}
                    >
                      {t.callCenterDescription}
                    </p>
                  </div>

                  {/* Numéro de téléphone */}
                  <div className="flex items-center justify-between mb-6 p-4 bg-white/50 rounded-lg">
                    <div>
                      <span
                        className={`text-2xl font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {callCenterNumber}
                      </span>
                      <p
                        className={`text-sm mt-1 ${
                          darkMode ? "text-orange-200" : "text-orange-600"
                        }`}
                      >
                        {t.availableHours}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${callCenterNumber}`}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          darkMode
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        {t.callNow}
                      </a>
                      <button
                        onClick={handleCopyNumber}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          darkMode
                            ? "bg-orange-600 text-white hover:bg-orange-700"
                            : "bg-orange-500 text-white hover:bg-orange-600"
                        }`}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        {copiedNumber ? t.copied : t.copyNumber}
                      </button>
                    </div>
                  </div>

                  {/* Avantages du service */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? "bg-orange-800/30" : "bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-green-600" : "bg-green-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span
                        className={darkMode ? "text-orange-200" : "text-orange-800"}
                      >
                        {t.bestFarmers}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? "bg-orange-800/30" : "bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-green-600" : "bg-green-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span
                        className={darkMode ? "text-orange-200" : "text-orange-800"}
                      >
                        {t.qualityAssurance}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? "bg-orange-800/30" : "bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-green-600" : "bg-green-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span
                        className={darkMode ? "text-orange-200" : "text-orange-800"}
                      >
                        {t.secureConnection}
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        darkMode ? "bg-orange-800/30" : "bg-white"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          darkMode ? "bg-green-600" : "bg-green-100"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span
                        className={darkMode ? "text-orange-200" : "text-orange-800"}
                      >
                        {t.directContact}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Colonne de droite - Détails et informations vendeur */}
          <div className="space-y-6">
            {/* Description */}
            <div
              className={`rounded-xl p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.description}
              </h2>
              <p
                className={`leading-relaxed ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                {listing.description}
              </p>
            </div>

            {/* Détails du produit */}
            <div
              className={`rounded-xl p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.productDetails}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.category}:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {listing.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.quantity}:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {formatNumber(listing.quantity)}
                  </span>
                </div>
                {listing.averageWeight && (
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {t.averageWeight}:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {listing.averageWeight} {t.kg}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.deliveryAvailable}:
                  </span>
                  <span
                    className={
                      listing.delivery ? "text-green-600" : "text-red-600"
                    }
                  >
                    {listing.delivery
                      ? t.deliveryAvailable
                      : t.deliveryNotAvailable}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.vaccinated}:
                  </span>
                  <span
                    className={
                      listing.vaccinated ? "text-green-600" : "text-red-600"
                    }
                  >
                    {listing.vaccinated ? t.vaccinated : t.notVaccinated}
                  </span>
                </div>
                {listing.breedingDate && (
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {t.breedingDate}:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {formatDate(listing.breedingDate)}
                    </span>
                  </div>
                )}
                {listing.preparationDate && (
                  <div className="flex justify-between">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      {t.preparationDate}:
                    </span>
                    <span className={darkMode ? "text-white" : "text-gray-900"}>
                      {formatDate(listing.preparationDate)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.createdAt}:
                  </span>
                  <span className={darkMode ? "text-white" : "text-gray-900"}>
                    {formatDate(listing.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations du vendeur */}
            <div
              className={`rounded-xl p-6 shadow-lg ${
                darkMode ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h2
                className={`text-xl font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.sellerInfo}
              </h2>
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {listing.sellerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {listing.sellerName}
                  </h3>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    {listing.wilaya}, {listing.commune}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.memberSince} 2023
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    {t.verifiedSeller}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Annonces similaires */}
        <div className="mt-12">
          <h2
            className={`text-2xl font-bold mb-6 ${
              darkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {t.similarListings}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {similar
              .filter((item) => item.id !== listing.id && (item.category || "") === (listing.category || ""))
              .slice(0, 3)
              .map((similarListing) => (
                <div
                  key={similarListing.id}
                  className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
                    darkMode
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  } border`}
                  onClick={() => navigate(`/listing/${similarListing.id}`)}
                >
                  <img
                    src={normalizeImageUrl(similarListing.images?.[0])}
                    alt={similarListing.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3
                      className={`font-semibold mb-2 line-clamp-2 ${
                        darkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {similarListing.title}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-lg font-bold ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {formatNumber(similarListing.price)} DA
                      </span>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        / {similarListing.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {similarListing.wilaya}
                      </span>
                      <span
                        className={darkMode ? "text-gray-400" : "text-gray-600"}
                      >
                        {similarListing.days} {t.days}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;

