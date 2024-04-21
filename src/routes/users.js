const express = require("express");
const usersController = require("./../controllers/users.js");
const {authenticateJWT} = require("../middlewares/jwtMiddleware");

const router = express.Router();

// Read a specific user by ID
router.route("/:id").get( authenticateJWT,usersController.getUser);

// Update a user
router.route("/:id").put( authenticateJWT, usersController.modifyUser);
router.route('/editProfile/:id').get( authenticateJWT, usersController.getProfile);

// Delete a user (implement access control for admins only)
router.route("/:id").delete( authenticateJWT, usersController.deleteUser);

module.exports=router;