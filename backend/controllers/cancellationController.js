const Booking = require("../models/Booking");
const Cancellation = require("../models/Cancellation");
const Train = require("../models/Train");


const cancelBooking = async (req, res, next) => {

    try {

        const booking = await Booking.findById(req.params.id);


        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }


        booking.status = "Cancelled";

        await booking.save();


        const cancellation = await Cancellation.create({

            bookingId: booking._id,

            pnr: booking.pnr,

            reason: req.body.reason,

            refundAmount: booking.fare * 0.8

        });


        const train = await Train.findById(booking.trainId);

        if (train) {
            train.availableSeats++;
            await train.save();
        }


        res.json({
            message: "Booking cancelled",
            cancellation
        });


    }
    catch (error) {
        next(error);
    }

};


module.exports = {
    cancelBooking
};
