const express = require("express");
const { auth, requireRole } = require("../../middleware/auth");
const { upload } = require("../../config/multer");

const movingHeaderController = require("../../controllers/admin/site/movingHeader.controller");
const heroSlidesController = require("../../controllers/admin/site/heroSlides.controller");
const ctaController = require("../../controllers/admin/site/cta.controller");
const footerController = require("../../controllers/admin/site/footer.controller");
const logoController = require("../../controllers/admin/site/logo.controller");

const router = express.Router();
router.use(auth);

// Moving Header - super_admin only
router.get("/moving-header", requireRole("super_admin"), movingHeaderController.getMovingHeader);
router.put("/moving-header", requireRole("super_admin"), movingHeaderController.updateMovingHeader);

// Hero Slides - super_admin only
router.get("/hero-slides", requireRole("super_admin"), heroSlidesController.getHeroSlides);
router.put("/hero-slides", requireRole("super_admin"), heroSlidesController.updateHeroSlides);
router.post(
  "/hero-slides",
  requireRole("super_admin"),
  upload.single("photo"),
  heroSlidesController.addHeroSlide
);
router.delete("/hero-slides/:id", requireRole("super_admin"), heroSlidesController.deleteHeroSlide);

// CTA - super_admin only
router.get("/cta", requireRole("super_admin"), ctaController.getCta);
router.put("/cta", requireRole("super_admin"), upload.single("photo"), ctaController.updateCta);

// Footer - ADMIN or super_admin
router.get("/footer", requireRole("ADMIN", "super_admin"), footerController.getFooter);
router.put("/footer", requireRole("ADMIN", "super_admin"), footerController.updateFooter);

// Logo - super_admin only
router.get("/logo", requireRole("super_admin"), logoController.getLogo);
router.put("/logo", requireRole("super_admin"), upload.fields([
  { name: "logoLight", maxCount: 1 },
  { name: "logoDark", maxCount: 1 }
]), logoController.updateLogo);

module.exports = router;
