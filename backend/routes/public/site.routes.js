const express = require("express");
const movingHeaderController = require("../../controllers/public/site/movingHeader.controller");
const heroSlidesController = require("../../controllers/public/site/heroSlides.controller");
const ctaController = require("../../controllers/public/site/cta.controller");
const footerController = require("../../controllers/public/site/footer.controller");
const logoController = require("../../controllers/public/site/logo.controller");

const router = express.Router();

router.get("/moving-header", movingHeaderController.getMovingHeader);
router.get("/hero-slides", heroSlidesController.getHeroSlides);
router.get("/cta", ctaController.getCta);
router.get("/footer", footerController.getFooter);
router.get("/logo", logoController.getLogo);

module.exports = router;
