const usersService = require('./../services/users.js');

const getUser = async (req, res, next) => {

    const {id} = req.params;
    if (req.session.userId === parseInt(id)) {
        try {
            const user = await usersService.getUser(id);
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }

            res.render('views/user.njk', {user: user});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error fetching user!'});
            next(error);
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
};
const modifyUser = async (req, res, next) => {
    const {id} = req.params;
    const {name, email, bio} = req.body;
    if (req.session.userId === parseInt(id) || req.session.role === "ADMIN") {
        try {
            const user = await usersService.modifyUser(id, name, email, bio);
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }
            console.log('User updated successfully!');
            res.redirect(`/user/${id}`)
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error updating user!'});
            next(error)
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
}
const deleteUser = async (req, res, next) => {
    const {id} = req.params;
    if (req.session.userId === parseInt(id) || req.session.role === "ADMIN") {
        try {
            const user = await usersService.getUser(id);
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }
            await usersService.deleteUser(id);
            console.log('User deleted successfully!');
            res.redirect('/users');
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error deleting user!'});
            next(error)
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
}
module.exports = {
    getUser,
    modifyUser,
    deleteUser
}