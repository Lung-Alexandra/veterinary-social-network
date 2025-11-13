const express = require("express");
const postsController = require("./../controllers/posts.js");
const router = express.Router();
const {authenticateJWT} = require("./../middlewares/jwtMiddleware.js");
const validatePost = require("./../middlewares/validatePost.js");
const uploadMiddleware = require("./../middlewares/uploadMiddleware");
// uploadMiddleware(folderName, fieldName) returns an array of middlewares
// [ multer.single(fieldName), cloudinaryUploadMiddleware ]
// call it with the desired folder and field name, then spread into route handlers
const upload = uploadMiddleware("upload", "imagePath");

// Read
router.route('/').get( authenticateJWT, async (req, res) => {
    res.render('views/post.njk');
});
router.route('/').post( authenticateJWT, ...upload, validatePost, postsController.createPost);

// Read a specific post by ID
router.route("/:id").get( authenticateJWT, ...upload, postsController.getPost);

// Update a post
router.route("/:id").put( authenticateJWT, ...upload, validatePost, postsController.modifyPost);

// Delete a post
router.route("/:id").delete( authenticateJWT, postsController.deletePost);

module.exports = router;