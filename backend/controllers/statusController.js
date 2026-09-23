const Train = require("../models/Train");
const Notification = require("../models/Notification");


const updateStatus = async (req, res, next) => {
  try {
    const train = await Train.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status
      },
      {
        new: true
      }
    );

    if (!train) {
      return res.status(404).json({
        message: "Train not found"
      });
    }

    const users = await Notification.db.collection("users")
      .find()
      .toArray();

    for (let user of users) {
      await Notification.create({
        userId: user._id,
        trainId: train._id,
        message: `Train ${train.trainName} status changed to ${train.status}`,
        type: "Live Status"
      });
    }

    res.json(train);
  } catch (error) {
    next(error);
  }
};


const simulateStatus = async (req, res, next) => {
  try {
    const train = await Train.findById(req.params.id);

    if (!train) {
      return res.status(404).json({
        message: "Train not found"
      });
    }

    const statuses = [
      "On Time",
      "Delayed by 15 mins",
      "Delayed by 30 mins",
      "Departed from Station",
      "Arrived at Station"
    ];

    const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
    train.status = newStatus;
    await train.save();

    const users = await Notification.db.collection("users")
      .find()
      .toArray();

    for (let user of users) {
      await Notification.create({
        userId: user._id,
        trainId: train._id,
        message: `[SIMULATION] Train ${train.trainName} is now ${train.status}`,
        type: "Simulation"
      });
    }

    res.json({
      message: "Train status simulation ran successfully",
      train
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  updateStatus,
  simulateStatus
};
