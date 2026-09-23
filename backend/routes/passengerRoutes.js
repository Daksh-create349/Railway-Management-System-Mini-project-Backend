const express = require("express");
const router = express.Router();

const {
  createPassenger,
  getPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger
} = require("../controllers/passengerController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


router.post(
  "/",
  auth,
  createPassenger
);


router.get(
  "/",
  auth,
  role("admin", "staff"),
  getPassengers
);


router.get(
  "/:id",
  auth,
  getPassengerById
);


router.put(
  "/:id",
  auth,
  updatePassenger
);


router.delete(
  "/:id",
  auth,
  role("admin"),
  deletePassenger
);


module.exports = router;
