import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditListing = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("fr");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    unit: "unité",
    quantity: "",
    wilaya: "",
    commune: "",
    delivery: false,
    image: "",
    breedingDate: "",
    preparationDate: "",
    averageWeight: "",
    vaccinated: false,
    status: "active",
  });

  const wilayas = [
    "Adrar",
    "Chlef",
    "Laghouat",
    "Oum El Bouaghi",
    "Batna",
    "Béjaïa",
    "Biskra",
    "Béchar",
    "Blida",
    "Bouira",
    "Tamanrasset",
    "Tébessa",
    "Tlemcen",
    "Tiaret",
    "Tizi Ouzou",
    "Algiers",
    "Djelfa",
    "Jijel",
    "Sétif",
    "Saïda",
    "Skikda",
    "Sidi Bel Abbès",
    "Annaba",
    "Guelma",
    "Constantine",
    "Médéa",
    "Mostaganem",
    "M'Sila",
    "Mascara",
    "Ouargla",
    "Oran",
    "El Bayadh",
    "Illizi",
    "Bordj Bou Arréridj",
    "Boumerdès",
    "El Tarf",
    "Tindouf",
    "Tissemsilt",
    "El Oued",
    "Khenchela",
    "Souk Ahras",
    "Tipaza",
    "Mila",
    "Aïn Defla",
    "Naâma",
    "Aïn Témouchent",
    "Ghardaïa",
    "Relizane",
    "Timimoune",
    "Bordj Badji Mokhtar",
    "Ouled Djellal",
    "In Salah",
    "In Guezzam",
    "Touggourt",
    "Djanet",
    "El M'Ghair",
    "Béni Abbès",
    "El Menia",
  ];

  const categories = ["Poulet", "Dinde", "Poussins", "Œufs", "Autre"];
  const units = ["unité", "kg", "plateau", "pièce", "lot"];

  // Translations
  const translations = {
    fr: {
      title: "Modifier l'annonce",
      back: "Retour aux annonces",
      loading: "Chargement de l'annonce...",
      notFound: "Annonce non trouvée",
      notFoundText:
        "L'annonce que vous recherchez n'existe pas ou a été supprimée.",
      backToListings: "Retour à mes annonces",
      listingTitle: "Titre de l'annonce *",
      category: "Catégorie *",
      status: "Statut",
      price: "Prix *",
      unit: "Unité",
      quantity: "Quantité",
      wilaya: "Wilaya *",
      commune: "Commune",
      breedingDate: "Date d'élevage",
      preparationDate: "Date de préparation",
      averageWeight: "Poids moyen (kg)",
      imageUrl: "URL de l'image",
      description: "Description",
      deliveryAvailable: "Livraison disponible",
      vaccinated: "Vacciné",
      cancel: "Annuler",
      update: "Mettre à jour l'annonce",
      saving: "Sauvegarde...",
      error: "Veuillez remplir tous les champs obligatoires",
      success: "Annonce mise à jour avec succès!",
      stats: "Statistiques de l'annonce",
      totalViews: "Vues totales",
      inquiries: "Demandes reçues",
      daysOnline: "Jours en ligne",
      lastUpdate: "Dernière mise à jour",
    },
    en: {
      title: "Edit Listing",
      back: "Back to listings",
      loading: "Loading listing...",
      notFound: "Listing not found",
      notFoundText:
        "The listing you are looking for does not exist or has been deleted.",
      backToListings: "Back to my listings",
      listingTitle: "Listing title *",
      category: "Category *",
      status: "Status",
      price: "Price *",
      unit: "Unit",
      quantity: "Quantity",
      wilaya: "Wilaya *",
      commune: "Commune",
      breedingDate: "Breeding date",
      preparationDate: "Preparation date",
      averageWeight: "Average weight (kg)",
      imageUrl: "Image URL",
      description: "Description",
      deliveryAvailable: "Delivery available",
      vaccinated: "Vaccinated",
      cancel: "Cancel",
      update: "Update listing",
      saving: "Saving...",
      error: "Please fill all required fields",
      success: "Listing updated successfully!",
      stats: "Listing statistics",
      totalViews: "Total views",
      inquiries: "Inquiries received",
      daysOnline: "Days online",
      lastUpdate: "Last update",
    },
    ar: {
      title: "تعديل الإعلان",
      back: "العودة إلى الإعلانات",
      loading: "جاري تحميل الإعلان...",
      notFound: "الإعلان غير موجود",
      notFoundText: "الإعلان الذي تبحث عنه غير موجود أو تم حذفه.",
      backToListings: "العودة إلى إعلاناتي",
      listingTitle: "عنوان الإعلان *",
      category: "الفئة *",
      status: "الحالة",
      price: "السعر *",
      unit: "الوحدة",
      quantity: "الكمية",
      wilaya: "الولاية *",
      commune: "البلدية",
      breedingDate: "تاريخ التربية",
      preparationDate: "تاريخ التحضير",
      averageWeight: "متوسط الوزن (كغ)",
      imageUrl: "رابط الصورة",
      description: "الوصف",
      deliveryAvailable: "توصيل متاح",
      vaccinated: "مطعم",
      cancel: "إلغاء",
      update: "تحديث الإعلان",
      saving: "جاري الحفظ...",
      error: "يرجى ملء جميع الحقول الإلزامية",
      success: "تم تحديث الإعلان بنجاح!",
      stats: "إحصائيات الإعلان",
      totalViews: "إجمالي المشاهدات",
      inquiries: "الاستفسارات المستلمة",
      daysOnline: "الأيام على الإنترنت",
      lastUpdate: "آخر تحديث",
    },
    es: {
      title: "Editar Anuncio",
      back: "Volver a los anuncios",
      loading: "Cargando anuncio...",
      notFound: "Anuncio no encontrado",
      notFoundText: "El anuncio que buscas no existe o ha sido eliminado.",
      backToListings: "Volver a mis anuncios",
      listingTitle: "Título del anuncio *",
      category: "Categoría *",
      status: "Estado",
      price: "Precio *",
      unit: "Unidad",
      quantity: "Cantidad",
      wilaya: "Wilaya *",
      commune: "Comuna",
      breedingDate: "Fecha de cría",
      preparationDate: "Fecha de preparación",
      averageWeight: "Peso promedio (kg)",
      imageUrl: "URL de la imagen",
      description: "Descripción",
      deliveryAvailable: "Entrega disponible",
      vaccinated: "Vacunado",
      cancel: "Cancelar",
      update: "Actualizar anuncio",
      saving: "Guardando...",
      error: "Por favor complete todos los campos obligatorios",
      success: "¡Anuncio actualizado con éxito!",
      stats: "Estadísticas del anuncio",
      totalViews: "Vistas totales",
      inquiries: "Consultas recibidas",
      daysOnline: "Días en línea",
      lastUpdate: "Última actualización",
    },
  };

  const t = translations[language];

  const fetchListing = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const mockListings = [
        {
          id: "POU-ALG-123456-ABC",
          title: "10000 Poulets Fermiers de qualité supérieure",
          description:
            "Poulets fermiers élevés en plein air, nourri aux grains naturels. Viande tendre et savoureuse.",
          price: 2.8,
          unit: "unité",
          days: 5,
          status: "active",
          category: "Poulet",
          wilaya: "Algiers",
          commune: "El Madania",
          sellerName: "Ahmed Benali",
          sellerPhone: "+213 123 45 67 89",
          image:
            "https://source.unsplash.com/300x200/?chicken",
          quantity: 50,
          delivery: true,
          views: 124,
          inquiries: 8,
          createdAt: "2024-01-15",
          createdBy: "user_123",
          breedingDate: "2024-01-10",
          preparationDate: "2024-01-15",
          averageWeight: 2.5,
          vaccinated: true,
          tracking: {
            views: 124,
            inquiries: 8,
            lastUpdated: "2024-01-20",
            statusHistory: [{ status: "active", date: "2024-01-15", by: "user_123" }],
          },
        },
        {
          id: "DIN-BLI-654321-DEF",
          title: "5000 Dindes Fraîches - Promotion spéciale",
          description:
            "Dinde fraîche de première qualité, parfaite pour les occasions spéciales. Poids disponible : 4-8kg.",
          price: 18.0,
          unit: "kg",
          days: 3,
          status: "active",
          category: "Dinde",
          wilaya: "Blida",
          commune: "Blida Centre",
          sellerName: "Fatima Zohra",
          sellerPhone: "+213 123 45 67 90",
          image:
            "https://source.unsplash.com/300x200/?turkey",
          quantity: 15,
          delivery: false,
          views: 89,
          inquiries: 5,
          createdAt: "2024-01-10",
          createdBy: "user_456",
          breedingDate: "2024-01-05",
          preparationDate: "2024-01-10",
          averageWeight: 6.2,
          vaccinated: true,
          tracking: {
            views: 89,
            inquiries: 5,
            lastUpdated: "2024-01-18",
            statusHistory: [{ status: "active", date: "2024-01-10", by: "user_456" }],
          },
        },
      ];
      const foundListing = mockListings.find((listing) => listing.id === id);
      if (foundListing) {
        setListing(foundListing);
        setFormData({
          title: foundListing.title,
          description: foundListing.description,
          category: foundListing.category,
          price: foundListing.price.toString(),
          unit: foundListing.unit,
          quantity: foundListing.quantity.toString(),
          wilaya: foundListing.wilaya,
          commune: foundListing.commune,
          delivery: foundListing.delivery,
          image: foundListing.image,
          breedingDate: foundListing.breedingDate,
          preparationDate: foundListing.preparationDate,
          averageWeight: foundListing.averageWeight ? foundListing.averageWeight.toString() : "",
          vaccinated: foundListing.vaccinated,
          status: foundListing.status,
        });
      } else {
        setMessage({ type: "error", text: t.notFound });
      }
      setLoading(false);
    }, 1000);
  }, [id, t]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedLanguage = localStorage.getItem("language");

    if (savedDarkMode) {
      setTimeout(() => setDarkMode(JSON.parse(savedDarkMode)), 0);
    }

    if (savedLanguage) {
      setTimeout(() => setLanguage(savedLanguage), 0);
    }

    if (!savedUser) {
      navigate("/");
      return;
    }

    const userData = JSON.parse(savedUser);
    setTimeout(() => setUser(userData), 0);
  }, [navigate, id]);

  useEffect(() => {
    if (!user) return;
    setTimeout(() => {
      fetchListing();
    }, 0);
  }, [user, id, fetchListing]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.category ||
      !formData.price ||
      !formData.wilaya
    ) {
      setMessage({
        type: "error",
        text: t.error,
      });
      return;
    }

    setSaving(true);

    // Simulate API call to update listing
    setTimeout(() => {
      setMessage({
        type: "success",
        text: t.success,
      });
      setSaving(false);

      // Redirect back to MyListings after a short delay
      setTimeout(() => {
        navigate("/my-listings");
      }, 1500);
    }, 1500);
  };

  const handleCancel = () => {
    navigate("/my-listings");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {t.notFound}
          </h3>
          <p className="mt-2 text-gray-600">{t.notFoundText}</p>
          <button
            onClick={() => navigate("/my-listings")}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {t.backToListings}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <div
        className={`border-b ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.title}
              </h1>
              <p
                className={`mt-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                ID: {listing.id} • {t.createdAt}:{" "}
                {formatDate(listing.createdAt)}
              </p>
            </div>
            <button
              onClick={() => navigate("/my-listings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? "text-gray-400 hover:bg-gray-700"
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
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Notification Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 border border-green-400 text-green-700"
                : "bg-red-100 border border-red-400 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div
          className={`rounded-xl p-6 shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.listingTitle}
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="Ex: Premium quality farm chickens"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.category}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.status}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="active">{t.active}</option>
                  <option value="inactive">{t.inactive}</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.price}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Unit */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.unit}
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.quantity}
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="1"
                />
              </div>

              {/* Wilaya */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.wilaya}
                </label>
                <select
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <option value="">{t.selectWilaya}</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.commune}
                </label>
                <input
                  type="text"
                  name="commune"
                  value={formData.commune}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder={t.commune}
                />
              </div>

              {/* Breeding Date */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.breedingDate}
                </label>
                <input
                  type="date"
                  name="breedingDate"
                  value={formData.breedingDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Preparation Date */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.preparationDate}
                </label>
                <input
                  type="date"
                  name="preparationDate"
                  value={formData.preparationDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                />
              </div>

              {/* Average Weight */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.averageWeight}
                </label>
                <input
                  type="number"
                  name="averageWeight"
                  value={formData.averageWeight}
                  onChange={handleInputChange}
                  step="0.1"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="0.0"
                />
              </div>

              {/* Image URL */}
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.imageUrl}
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.description}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300"
                  }`}
                  placeholder="Describe your product in detail..."
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="delivery"
                  checked={formData.delivery}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span
                  className={`ml-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.deliveryAvailable}
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="vaccinated"
                  checked={formData.vaccinated}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span
                  className={`ml-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {t.vaccinated}
                </span>
              </label>
            </div>

            {/* Statistics */}
            <div className="border-t pt-6">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {t.stats}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {listing.views}
                  </div>
                  <div className="text-sm text-gray-600">{t.totalViews}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {listing.inquiries}
                  </div>
                  <div className="text-sm text-gray-600">{t.inquiries}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {listing.days}
                  </div>
                  <div className="text-sm text-gray-600">{t.daysOnline}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatDate(listing.tracking.lastUpdated)}
                  </div>
                  <div className="text-sm text-gray-600">{t.lastUpdate}</div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium"
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t.saving}
                  </div>
                ) : (
                  t.update
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditListing;

