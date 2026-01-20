const express = require("express");
const { auth } = require("../middleware/auth");
const { upload } = require("../config/multer");
const createController = require("../controllers/orders/create.controller");
const getAllController = require("../controllers/orders/getAll.controller");
const updateController = require("../controllers/orders/update.controller");
const deleteController = require("../controllers/orders/delete.controller");

const router = express.Router();

router.post("/", auth, upload.single("photo"), createController.createOrder);
router.get("/", auth, getAllController.getUserOrders);
router.put("/:id", auth, upload.single("photo"), updateController.updateOrder);
router.delete("/:id", auth, deleteController.deleteOrder);

module.exports = router;
