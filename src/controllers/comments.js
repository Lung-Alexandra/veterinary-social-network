const commentsService = require('./../services/comments.js');
const {isLogin} = require("../utils/util");
const {logger} = require("../utils/logger");
const getAllComments = async (req, res, next) => {
    const postId = req.postId;
    try {
        const comments = await commentsService.getAllComments(postId);
        res.render('views/comments.njk', {
            comments: comments,
            auth: isLogin(req),
            userId: req.session.userId,
            role: req.session.role,
            postId: postId
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error fetching comments!'});
        next(error)
    }
}
const getComment = async (req, res, next) => {
    const postId = req.postId;
    const {commentId} = req.params;

    try {
        const comment = await commentsService.getComment(commentId);
        if (!comment) {
            logger.info(`Comment ${commentId} not found`);
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to delete the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post. User ${comment.authorId}`);
            return res.status(403).json({message: 'Unauthorized to delete this comment'});
        }

        req.session._method = "put";

        res.render('views/addcomm.njk', {postId: postId, comment: comment, method: "put"})

    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error fetching post!'});
        next(error)
    }

};
const createComment = async (req, res, next) => {
    const postId = req.postId;
    const {content} = req.body;
    try {
        await commentsService.createComment(content, postId, req.session.userId);
        logger.info(`Created comment for ${postId}`);
        res.redirect(`/post/${postId}/comments`)
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error creating comment!'});
        next(error)
    }
};
const updateComment = async (req, res, next) => {
    const postId = req.postId;
    const {commentId} = req.params;
    const {content} = req.body;

    try {
        let comment = await commentsService.getComment(commentId);
        if (!comment) {
            logger.info(`Comment ${commentId} not found`);
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to delete the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post. User ${comment.authorId}`);
            return res.status(403).json({message: 'Unauthorized to delete this comment'});
        }

        // Update the comment
        await commentsService.updateComment(commentId, content);
        logger.info(`Create comment ${commentId} successfully`);
        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error updating comment'});
        next(error)
    }

}
const deleteComment = async (req, res, next) => {
    const postId = req.postId;
    const {commentId} = req.params;
    try {
        const comment = await commentsService.getComment(commentId)
        if (!comment) {
            logger.info(`Comment ${commentId} not found`);
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to delete the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post. User ${comment.authorId}`);
            return res.status(403).json({message: 'Unauthorized to delete this comment'});
        }

        // Delete the comment
        await commentsService.deleteComment(commentId)
        logger.info( `Created comment ${comment.id} of user ${comment.authorId}`);
        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error deleting comment'});
        next(error)
    }
}
module.exports = {
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
}