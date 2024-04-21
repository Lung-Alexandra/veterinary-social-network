const commentsService = require('./../services/comments.js');
const {isLogin} = require("../routes/util");
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
        console.error(error);
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
            return res.status(404).json({message: 'Comment not found'});
        }
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this comment'});
        }
        req.session._method = "put";
        res.render('views/addcomm.njk', {postId: postId, comment: comment, method: "put"})

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post!'});
        next(error)
    }

};
const createComment = async (req, res, next) => {
    const postId = req.postId;
    const {content} = req.body;
    try {
        await commentsService.createComment(content, postId, req.session.userId);
        res.redirect(`/post/${postId}/comments`)
    } catch (error) {
        console.error(error);
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
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to update the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this comment'});
        }

        // Update the comment
        await commentsService.updateComment(commentId, content);

        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        console.error(error);
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
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to delete the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to delete this comment'});
        }

        // Delete the comment
        await commentsService.deleteComment(commentId)

        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        console.error(error);
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