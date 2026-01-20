/**
 * ALL ROUTES - Master Routes File
 * Imports all controllers and defines all routes
 */

const express = require("express");
const { auth, optionalAuth, requireRole } = require("../middleware/auth");
const { authRateLimiter } = require("../middleware/rateLimiter");
const { upload } = require("../config/multer");
const { validateRequest, sanitizeInput } = require("../middleware/validation");
const { body } = require("express-validator");
const {
  normalizeEmail,
  isDeliverableEmailFormat,
  isDisposableEmail,
} = require("../utils/helpers");

const BLOCK_DISPOSABLE_EMAILS =
  String(process.env.BLOCK_DISPOSABLE_EMAILS || "1").trim() !== "0";

// Import all controllers
const healthController = require("../controllers/health.controller");
const dashboardController = require("../controllers/dashboard.controller");

// Auth controllers
const signupController = require("../controllers/auth/signup.controller");
const loginController = require("../controllers/auth/login.controller");
const logoutController = require("../controllers/auth/logout.controller");
const refreshController = require("../controllers/auth/refresh.controller");
const forgotPasswordController = require("../controllers/auth/forgotPassword.controller");
const verifyOtpController = require("../controllers/auth/verifyOtp.controller");
const resetPasswordController = require("../controllers/auth/resetPassword.controller");
const verifyEmailController = require("../controllers/auth/verifyEmail.controller");
const updateProfileController = require("../controllers/auth/updateProfile.controller");
const recoveryController = require("../controllers/auth/recovery.controller");

// Listing controllers
const createListingController = require("../controllers/listings/create.controller");
const getAllListingsController = require("../controllers/listings/getAll.controller");
const getOneListingController = require("../controllers/listings/getOne.controller");
const updateListingController = require("../controllers/listings/update.controller");
const deleteListingController = require("../controllers/listings/delete.controller");
const updateStatusController = require("../controllers/listings/updateStatus.controller");
const searchListingsController = require("../controllers/listings/search.controller");
const myListingsController = require("../controllers/listings/myListings.controller");

// Order controllers
const createOrderController = require("../controllers/orders/create.controller");
const getAllOrdersController = require("../controllers/orders/getAll.controller");
const updateOrderController = require("../controllers/orders/update.controller");
const deleteOrderController = require("../controllers/orders/delete.controller");

// Photo controllers
const getAllPhotosController = require("../controllers/photos/getAll.controller");
const deletePhotoController = require("../controllers/photos/delete.controller");
const deleteAllPhotosController = require("../controllers/photos/deleteAll.controller");

// Admin Listing controllers
const adminListingsGetAllController = require("../controllers/admin/listings/getAll.controller");
const adminListingsCreateController = require("../controllers/admin/listings/create.controller");
const adminListingsGetOneController = require("../controllers/admin/listings/getOne.controller");
const adminListingsUpdateController = require("../controllers/admin/listings/update.controller");
const adminListingsDeleteController = require("../controllers/admin/listings/delete.controller");
const adminListingsUpdateStatusController = require("../controllers/admin/listings/updateStatus.controller");

// Admin User controllers
const adminUsersGetAllController = require("../controllers/admin/users/getAll.controller");
const adminUsersCreateController = require("../controllers/admin/users/create.controller");
const adminUsersUpdateController = require("../controllers/admin/users/update.controller");
const adminUsersDeleteController = require("../controllers/admin/users/delete.controller");

// Admin Photo controllers
const adminPhotosGetAllController = require("../controllers/admin/photos/getAll.controller");
const adminPhotosDeleteByUserController = require("../controllers/admin/photos/deleteByUser.controller");

// Admin Inquiries & Audit
const adminInquiriesGetAllController = require("../controllers/admin/inquiries/getAll.controller");
const adminAuditClicksController = require("../controllers/admin/audit/clicks.controller");

// Public controllers
const publicListingsGetOneController = require("../controllers/public/listings/getOne.controller");

const router = express.Router();

//==========================================
// HEALTH ROUTES
//==========================================
router.get("/", healthController.getRoot);
router.get("/health", healthController.getHealth);

//==========================================
// AUTH ROUTES
//==========================================
const authRouter = express.Router();
authRouter.use(authRateLimiter);

authRouter.post(
  "/signup",
  [
    body("username")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters"),
    body("email")
      .custom((value) => {
        const email = normalizeEmail(value);
        if (!isDeliverableEmailFormat(email)) {
          throw new Error("Valid email is required");
        }
        if (BLOCK_DISPOSABLE_EMAILS && isDisposableEmail(email)) {
          throw new Error("Temporary email addresses are not allowed");
        }
        return true;
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    body("fullName").optional().trim().isLength({ min: 2 }),
    body("wilaya").optional().trim(),
  ],
  validateRequest,
  sanitizeInput,
  signupController.signup
);

authRouter.post("/login", loginController.login);
authRouter.post("/logout", logoutController.logout);
authRouter.post("/refresh", refreshController.refresh);
authRouter.post("/forgot-password", forgotPasswordController.forgotPassword);
authRouter.post("/verify-otp", verifyOtpController.verifyOtp);
authRouter.post("/reset-password", resetPasswordController.resetPassword);
authRouter.post(
  "/verify-email/request",
  verifyEmailController.requestVerification
);
authRouter.post(
  "/verify-email/confirm",
  verifyEmailController.confirmVerification
);
authRouter.get("/recovery/options", recoveryController.getOptions);
authRouter.post("/recovery/request", recoveryController.requestRecovery);
authRouter.put("/update", auth, updateProfileController.updateProfile);

router.use("/auth", authRouter);
router.use("/api/auth", authRouter);

//==========================================
// DASHBOARD ROUTES
//==========================================
router.get("/api/dashboard/user", auth, dashboardController.getUserDashboard);
router.get(
  "/api/dashboard/admin",
  auth,
  requireRole("ADMIN", "super_admin"),
  dashboardController.getAdminDashboard
);
router.get(
  "/api/dashboard/super",
  auth,
  requireRole("super_admin"),
  dashboardController.getSuperDashboard
);

//==========================================
// LISTING ROUTES (User)
//==========================================
router.post(
  "/api/listings",
  auth,
  upload.single("photo"),
  createListingController.createListing
);
router.get("/api/listings", getAllListingsController.getAllListings);
router.get("/api/listings/search", searchListingsController.searchListings);
router.get(
  "/api/listings/:id",
  optionalAuth,
  getOneListingController.getOneListing
);
router.put(
  "/api/listings/:id",
  auth,
  upload.single("photo"),
  updateListingController.updateListing
);
router.delete("/api/listings/:id", auth, deleteListingController.deleteListing);
router.patch(
  "/api/listings/:id/status",
  auth,
  updateStatusController.updateStatus
);
router.get("/api/user/my-listings", auth, myListingsController.getMyListings);

//==========================================
// ORDER ROUTES (User)
//==========================================
router.post(
  "/api/orders",
  auth,
  upload.single("photo"),
  createOrderController.createOrder
);
router.get("/api/orders", auth, getAllOrdersController.getUserOrders);
router.get("/api/user/orders", auth, getAllOrdersController.getUserOrders);
router.put(
  "/api/orders/:id",
  auth,
  upload.single("photo"),
  updateOrderController.updateOrder
);
router.delete("/api/orders/:id", auth, deleteOrderController.deleteOrder);

//==========================================
// PHOTO ROUTES (User)
//==========================================
router.get("/api/user/photos", auth, getAllPhotosController.getUserPhotos);
router.delete("/api/user/photos/:id", auth, deletePhotoController.deletePhoto);
router.delete(
  "/api/user/photos",
  auth,
  deleteAllPhotosController.deleteAllPhotos
);

//==========================================
// ADMIN LISTING ROUTES
//==========================================
router.get(
  "/api/admin/listings",
  auth,
  requireRole("ADMIN", "super_admin"),
  adminListingsGetAllController.getAllListings
);
router.post(
  "/api/admin/listings",
  auth,
  requireRole("ADMIN", "super_admin"),
  upload.single("photo"),
  adminListingsCreateController.createListing
);
router.get(
  "/api/admin/listings/:id",
  auth,
  requireRole("ADMIN", "super_admin"),
  adminListingsGetOneController.getOneListing
);
router.put(
  "/api/admin/listings/:id",
  auth,
  requireRole("ADMIN", "super_admin"),
  upload.single("photo"),
  adminListingsUpdateController.updateListing
);
router.delete(
  "/api/admin/listings/:id",
  auth,
  requireRole("ADMIN", "super_admin"),
  adminListingsDeleteController.deleteListing
);
router.patch(
  "/api/admin/listings/:id/status",
  auth,
  requireRole("ADMIN", "super_admin"),
  adminListingsUpdateStatusController.updateStatus
);

//==========================================
// ADMIN USER ROUTES
//==========================================
router.get(
  "/api/admin/users",
  auth,
  requireRole("super_admin"),
  adminUsersGetAllController.getAllUsers
);
router.post(
  "/api/admin/users",
  auth,
  requireRole("super_admin"),
  adminUsersCreateController.createUser
);
router.patch(
  "/api/admin/users/:id",
  auth,
  requireRole("super_admin"),
  adminUsersUpdateController.updateUser
);
router.delete(
  "/api/admin/users/:id",
  auth,
  requireRole("super_admin"),
  adminUsersDeleteController.deleteUser
);

//==========================================
// ADMIN PHOTO ROUTES
//==========================================
router.get(
  "/api/admin/photos",
  auth,
  requireRole("super_admin"),
  adminPhotosGetAllController.getAllPhotos
);
router.delete(
  "/api/admin/photos/:userId",
  auth,
  requireRole("super_admin"),
  adminPhotosDeleteByUserController.deletePhotosByUser
);

//==========================================
// ADMIN INQUIRIES & AUDIT
//==========================================
router.get(
  "/api/admin/inquiries",
  auth,
  requireRole("super_admin"),
  adminInquiriesGetAllController.getAllInquiries
);
router.get(
  "/api/admin/audit/clicks",
  auth,
  requireRole("super_admin"),
  adminAuditClicksController.getClicks
);

//==========================================
// PUBLIC API ROUTES
//==========================================
router.get(
  "/api/public/listings/:slugOrId",
  optionalAuth,
  publicListingsGetOneController.getOneListing
);

// Public Site Settings Routes
const publicSiteRoutes = require("./public/site.routes");
router.use("/api/public/site", publicSiteRoutes);

// Admin Site Settings Routes
const adminSiteRoutes = require("./admin/site.routes");
router.use("/api/admin/site", adminSiteRoutes);

module.exports = router;
