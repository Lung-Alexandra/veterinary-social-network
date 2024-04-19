const {verifyToken} = require("../routes/jwt");

function authenticateJWT(req, res, next) {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({message: 'Unauthorized: Missing JWT token'});
    }
    try {
        const decoded = verifyToken(token); // Verificarea token-ul
        req.session.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized: Invalid JWT token'});
    }
}
module.exports={authenticateJWT}