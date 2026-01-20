const express = require("express");
const { auth } = require("../middleware/auth");
const getAllController = require("../controllers/photos/getAll.controller");
const deleteController = require("../controllers/photos/delete.controller");
const deleteAllController = require("../controllers/photos/deleteAll.controller");

const router = express.Router();

router.get("/", auth, getAllController.getUserPhotos);
router.delete("/", auth, deleteAllController.deleteAllPhotos);
router.delete("/:id", auth, deleteController.deletePhoto);

module.exports = router;
