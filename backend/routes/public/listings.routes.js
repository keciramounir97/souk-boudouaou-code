const express = require("express");
const { optionalAuth } = require("../../middleware/auth");
const getOneController = require("../../controllers/public/listings/getOne.controller");
const createInquiryController = require("../../controllers/public/listings/createInquiry.controller");

const router = express.Router();

router.get("/:slugOrId", optionalAuth, getOneController.getOneListing);
router.post(
  "/:slugOrId/inquiries",
  optionalAuth,
  createInquiryController.createInquiry
);

module.exports = router;
