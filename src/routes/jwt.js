const jwt = require('jsonwebtoken');

const secret = 'secretkeysecret';

function generateToken(userId) {
    return jwt.sign({ userId }, secret);
}


function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { verifyToken ,generateToken };