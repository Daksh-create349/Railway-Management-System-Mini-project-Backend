const errorMiddleware = (err, req, res, next) => {

    console.error(err.message);

    let statusCode = err.statusCode || 500;
    let message = err.message || "Server Error";

    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue || {})[0] || "Field";
        message = `${field} already exists`;
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }

    res.status(statusCode).json({
        message
    });

};


module.exports = errorMiddleware;
