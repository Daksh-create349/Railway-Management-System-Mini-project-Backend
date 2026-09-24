const Passenger = require("../models/Passenger");


const createPassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.create(req.body);
    res.status(201).json(passenger);
  } catch (error) {
    next(error);
  }
};


const getPassengers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const search = req.query.search || "";

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const passengers = await Passenger.find(query)
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(passengers);
  } catch (error) {
    next(error);
  }
};


const getPassengerById = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        message: "Passenger not found"
      });
    }

    res.json(passenger);
  } catch (error) {
    next(error);
  }
};


const updatePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(passenger);
  } catch (error) {
    next(error);
  }
};


const deletePassenger = async (req, res, next) => {
  try {
    await Passenger.findByIdAndDelete(req.params.id);

    res.json({
      message: "Passenger deleted"
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createPassenger,
  getPassengers,
  getPassengerById,
  updatePassenger,
  deletePassenger
};
