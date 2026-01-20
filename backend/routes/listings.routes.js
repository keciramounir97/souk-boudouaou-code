const express = require("express");
const { auth, optionalAuth } = require("../middleware/auth");
const { upload } = require("../config/multer");
const createController = require("../controllers/listings/create.controller");
const getAllController = require("../controllers/listings/getAll.controller");
const getOneController = require("../controllers/listings/getOne.controller");
const updateController = require("../controllers/listings/update.controller");
const deleteController = require("../controllers/listings/delete.controller");
const updateStatusController = require("../controllers/listings/updateStatus.controller");
const searchController = require("../controllers/listings/search.controller");
const myListingsController = require("../controllers/listings/myListings.controller");

const router = express.Router();

// Specific routes first to avoid ID collision
router.get("/search", searchController.searchListings);

// Collection routes
router.post("/", auth, upload.single("photo"), createController.createListing);
router.get("/", getAllController.getAllListings);

// ID routes
router.get("/:id", optionalAuth, getOneController.getOneListing);
router.put(
  "/:id",
  auth,
  upload.single("photo"),
  updateController.updateListing
);
router.delete("/:id", auth, deleteController.deleteListing);
router.patch("/:id/status", auth, updateStatusController.updateStatus);

module.exports = router;
