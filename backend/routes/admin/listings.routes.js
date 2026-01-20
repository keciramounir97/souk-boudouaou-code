const express = require("express");
const { auth, requireRole } = require("../../middleware/auth");
const { upload } = require("../../config/multer");

const getAllController = require("../../controllers/admin/listings/getAll.controller");
const createController = require("../../controllers/admin/listings/create.controller");
const getOneController = require("../../controllers/admin/listings/getOne.controller");
const updateController = require("../../controllers/admin/listings/update.controller");
const deleteController = require("../../controllers/admin/listings/delete.controller");
const updateStatusController = require("../../controllers/admin/listings/updateStatus.controller");

const router = express.Router();
// All listings management is super_admin only
router.use(auth, requireRole("super_admin"));

router.get("/", getAllController.getAllListings);
router.post("/", upload.single("photo"), createController.createListing);
router.get("/:id", getOneController.getOneListing);
router.put("/:id", upload.single("photo"), updateController.updateListing);
router.delete("/:id", deleteController.deleteListing);
router.patch("/:id/status", updateStatusController.updateStatus);

module.exports = router;
