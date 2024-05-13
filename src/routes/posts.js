const express = require("express");
const postsController = require("./../controllers/posts.js");
const router = express.Router();
const {authenticateJWT} = require("./../middlewares/jwtMiddleware.js");
const validatePost = require("./../middlewares/validatePost.js");
const uploadMiddleware = require("./../middlewares/uploadMiddleware");
const upload = uploadMiddleware("upload");

// Read
router.route('/').get( authenticateJWT, async (req, res) => {
    res.render('views/post.njk');
});
router.route('/').post( authenticateJWT, upload.single('imagePath'),validatePost,postsController.createPost);

// Read a specific post by ID
router.route("/:id").get( authenticateJWT, upload.single('imagePath'),postsController.getPost);

// Update a post
router.route("/:id").put( authenticateJWT, upload.single('imagePath'),validatePost, postsController.modifyPost);

// Delete a post
router.route("/:id").delete( authenticateJWT, postsController.deletePost);

module.exports = router;