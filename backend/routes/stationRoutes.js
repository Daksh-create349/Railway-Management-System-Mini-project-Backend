const express = require("express");
const router = express.Router();

const {
  createStation,
  getStations,
  updateStation,
  deleteStation
} = require("../controllers/stationController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


router.post(
  "/",
  auth,
  role("admin"),
  createStation
);


router.get(
  "/",
  getStations
);


router.put(
  "/:id",
  auth,
  role("admin"),
  updateStation
);


router.delete(
  "/:id",
  auth,
  role("admin"),
  deleteStation
);


module.exports = router;
