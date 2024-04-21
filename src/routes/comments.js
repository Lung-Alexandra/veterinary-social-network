const express = require("express");
const commentsController = require("./../controllers/comments.js");
const {authenticateJWT} = require("../middlewares/jwtMiddleware");

const router = express.Router();

router.route('/comment').get( authenticateJWT, async (req, res) => {
    const postId = req.postId;
    try {
        res.render('views/addcomm.njk', {postId: postId});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post for comment form!'});

    }
});
// Read a specific comment by ID
router.route('/comment/:commentId').get(authenticateJWT, commentsController.getComment)


// Create a comment for a specific post
router.route('/comment').post(authenticateJWT, commentsController.createComment)


// Update a comment
router.route('/comment/:commentId').put(authenticateJWT, commentsController.updateComment)

router.route('/comment/:commentId').delete(authenticateJWT, commentsController.deleteComment)


// Read all comments for a specific post
router.route('/comments').get(commentsController.getAllComments)

module.exports= router;