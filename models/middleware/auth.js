const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers.authorization;
    if (bearerHeader) {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1]
        if (bearerToken) {
            return jwt.verify(bearerToken, process.env.JWT_SECRET, function (err, decoded) {
                if (err) {
                    return res.json({
                        success: false,
                        message: "Failed to authenticate token.",
                    });
                }
                req.token = bearerToken;
                return next();
            })
        }

    } else { return res.sendStatus(403) }

}

module.exports = verifyToken

