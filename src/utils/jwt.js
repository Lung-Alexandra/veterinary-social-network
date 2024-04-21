const jwt = require('jsonwebtoken');

require('dotenv').config();

const secret = process.env.JWTSECRET;

function generateToken(userId) {
    return jwt.sign({ userId }, secret);
}


function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { verifyToken ,generateToken };