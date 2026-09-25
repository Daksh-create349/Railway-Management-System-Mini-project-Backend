const Booking = require("../models/Booking");


const dashboard = async (req, res, next) => {

    try {


        const totalBookings = await Booking.countDocuments();


        const revenue = await Booking.aggregate([

            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: "$fare"
                    }
                }
            }

        ]);


        const status = await Booking.aggregate([

            {
                $group: {
                    _id: "$status",
                    count: {
                        $sum: 1
                    }
                }
            },

            {
                $sort: {
                    count: -1
                }
            }

        ]);


        res.json({

            totalBookings,

            revenue:
                revenue[0]?.totalRevenue || 0,

            status

        });


    }
    catch (error) {
        next(error);
    }

};


module.exports = {
    dashboard
};