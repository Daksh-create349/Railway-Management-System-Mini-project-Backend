const Train = require("../models/Train");


const createTrain = async (req, res, next) => {

    try {

        const train = await Train.create(req.body);

        res.status(201).json(train);

    }
    catch (error) {
        next(error);
    }
};


const getTrains = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        const query = {};

        if (req.query.search) {
            query.$or = [
                { trainName: { $regex: req.query.search, $options: "i" } },
                { trainNumber: { $regex: req.query.search, $options: "i" } }
            ];
        }

        if (req.query.source) {
            query.source = {
                $regex: req.query.source,
                $options: "i"
            };
        }

        if (req.query.destination) {
            query.destination = {
                $regex: req.query.destination,
                $options: "i"
            };
        }

        const trains = await Train.find(query)
            .skip((page - 1) * limit)
            .limit(limit);

        res.json(trains);

    }
    catch (error) {
        next(error);
    }

};



const getSeatAvailability = async (req, res, next) => {

    try {

        const train = await Train.findById(req.params.id);

        if (!train) {
            return res.status(404).json({
                message: "Train not found"
            });
        }

        res.json({
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            totalSeats: train.totalSeats,
            availableSeats: train.availableSeats,
            status: train.status
        });

    }
    catch (error) {
        next(error);
    }

};



const updateTrain = async (req, res, next) => {

    try {

        const train = await Train.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(train);

    }
    catch (error) {
        next(error);
    }

};



const deleteTrain = async (req, res, next) => {

    try {

        await Train.findByIdAndDelete(req.params.id);

        res.json({
            message: "Train deleted"
        });

    }
    catch (error) {
        next(error);
    }

};



module.exports = {
    createTrain,
    getTrains,
    getSeatAvailability,
    updateTrain,
    deleteTrain
};
