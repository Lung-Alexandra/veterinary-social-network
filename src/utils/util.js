const bcrypt = require('bcrypt');

function isLogin(req) {
    return req.session.token !== undefined;
}
// Hash password before saving user
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}
async function comparePassword(pass1, pass2){
    return await bcrypt.compare(pass1, pass2)
}

module.exports={isLogin, hashPassword, comparePassword}