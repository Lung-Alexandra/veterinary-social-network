async function isAdmin(req, res, next) {

    if (req.session.role === "ADMIN") {
        next();
    } else {
        return res.status(401).json({message: 'Unauthorized: Not an admin'});
    }

}
module.exports={isAdmin}