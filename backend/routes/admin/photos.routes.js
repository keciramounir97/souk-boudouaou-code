const express = require("express");
const { auth, requireRole } = require("../../middleware/auth");
const getAllController = require("../../controllers/admin/photos/getAll.controller");
const deleteByUserController = require("../../controllers/admin/photos/deleteByUser.controller");

const router = express.Router();
router.use(auth, requireRole("super_admin"));

router.get("/", getAllController.getAllPhotos);
router.delete("/:userId", deleteByUserController.deletePhotosByUser);

module.exports = router;
