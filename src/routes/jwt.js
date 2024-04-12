const jwt = require('jsonwebtoken');

const secret = 'your_secret_key_here'; // Inlocuieste cu o cheie secreta

function generateToken(userId) {
    return jwt.sign({ userId }, secret);
}


function verifyToken(token) {
    return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };