const usersService = require('./../services/users.js');
const {logger} = require("../utils/logger");

const getProfile = async (req, res, next)  => {
    const {id} = req.params;
    if (req.session.userId === id || req.session.role === "ADMIN") {
        try {
            const user = await usersService.getUser(id);
            if (!user) {
                logger.info(`User ${id} not found`);
                return res.status(404).json({message: 'User not found!'});
            }
            logger.info(`Edit profile for user ${user.id}`);
            res.render('views/editProfile.njk', {user: user});
        } catch (error) {
            logger.error(error);
            res.status(500).json({message: 'Error fetching user!'});
            next(error)
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
}

const getUser = async (req, res, next) => {

    const {id} = req.params;
    if (req.session.userId === id) {
        try {
            const user = await usersService.getUser(id);
            if (!user) {
                logger.info(`User ${id} not found`);
                return res.status(404).json({message: 'User not found!'});
            }
            logger.info(`Get profile for user ${user.id}`);
            res.render('views/user.njk', {user: user});

        } catch (error) {
            logger.error(error);
            res.status(500).json({message: 'Error fetching user!'});
            next(error);
        }
    } else {
        logger.info('Unauthorized access');
        return res.status(403).json({message: 'Unauthorized access'});
    }
};
const modifyUser = async (req, res, next) => {
    const {id} = req.params;
    const {name, email, bio} = req.body;
    if (req.session.userId === id || req.session.role === "ADMIN") {
        try {
            const user = await usersService.getUser(id)
            if (!user) {
                logger.info(`User ${id} not found`);
                return res.status(404).json({message: 'User not found!'});
            }

            await usersService.modifyUser(id, name, email, bio);
            if(email !== user.email) {
                await usersService.deleteUser(id);
            }
            logger.info(`User ${user.id} updated successfully!`);
            res.redirect(`/user/${id}`)
        } catch (error) {
            logger.error(error);
            res.status(500).json({message: 'Error updating user!'});
            next(error)
        }
    } else {
        logger.info(`Unauthorized access`);
        return res.status(403).json({message: 'Unauthorized access'});
    }
}
const deleteUser = async (req, res, next) => {
    const {id} = req.params;
    if (req.session.userId === id || req.session.role === "ADMIN") {
        try {
            const user = await usersService.getUser(id);
            if (!user) {
                logger.info(`User ${id} not found`);
                return res.status(404).json({message: 'User not found!'});
            }
            await usersService.deleteUser(id);
            logger.info(`User ${id} deleted successfully!`);
            // if user deletes his account redirect to main page
            if (req.session.userId === id) {
                res.redirect(`/logout`);
            } else {
                // if it's not user it means it's admin that delete another account
                res.redirect('/users');
            }

        } catch (error) {
            logger.error(error);
            res.status(500).json({message: 'Error deleting user!'});
            next(error)
        }
    } else {
        logger.info(`Unauthorized access`);
        return res.status(403).json({message: 'Unauthorized access'});
    }
}
module.exports = {
    getUser,
    modifyUser,
    deleteUser,
    getProfile
}