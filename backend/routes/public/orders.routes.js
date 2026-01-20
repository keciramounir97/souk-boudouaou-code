const express = require("express");
const getOneController = require("../../controllers/public/orders/getOne.controller");

const router = express.Router();

router.get("/:id", getOneController.getOneOrder);

module.exports = router;
