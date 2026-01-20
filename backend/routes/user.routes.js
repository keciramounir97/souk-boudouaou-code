const express = require("express");
const { auth } = require("../middleware/auth");
const myListingsController = require("../controllers/listings/myListings.controller");
const getOrdersController = require("../controllers/orders/getAll.controller");

const router = express.Router();

router.get("/my-listings", auth, myListingsController.getMyListings);
router.get("/orders", auth, getOrdersController.getUserOrders);

module.exports = router;
