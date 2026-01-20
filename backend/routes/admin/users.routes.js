const express = require("express");
const { auth, requireRole } = require("../../middleware/auth");
const getAllController = require("../../controllers/admin/users/getAll.controller");
const createController = require("../../controllers/admin/users/create.controller");
const updateController = require("../../controllers/admin/users/update.controller");
const deleteController = require("../../controllers/admin/users/delete.controller");

const router = express.Router();
// Users management is strictly super_admin
router.use(auth, requireRole("super_admin"));

router.get("/", getAllController.getAllUsers);
router.post("/", createController.createUser);
router.patch("/:id", updateController.updateUser);
router.delete("/:id", deleteController.deleteUser);

module.exports = router;
