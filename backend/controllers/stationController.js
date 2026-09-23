const Station = require("../models/Station");


const createStation = async (req, res, next) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    next(error);
  }
};


const getStations = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const search = req.query.search || "";

    const query = {
      $or: [
        { stationName: { $regex: search, $options: "i" } },
        { stationCode: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } }
      ]
    };

    const stations = await Station.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(stations);
  } catch (error) {
    next(error);
  }
};


const updateStation = async (req, res, next) => {
  try {
    const station = await Station.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(station);
  } catch (error) {
    next(error);
  }
};


const deleteStation = async (req, res, next) => {
  try {
    await Station.findByIdAndDelete(req.params.id);

    res.json({
      message: "Station deleted"
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createStation,
  getStations,
  updateStation,
  deleteStation
};
