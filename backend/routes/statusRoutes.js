const express = require("express");
const router = express.Router();

const {
  updateStatus,
  simulateStatus
} = require("../controllers/statusController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


router.put(
  "/:id",
  auth,
  role("admin", "staff"),
  updateStatus
);


router.post(
  "/:id/simulate",
  auth,
  role("admin", "staff"),
  simulateStatus
);


module.exports = router;
