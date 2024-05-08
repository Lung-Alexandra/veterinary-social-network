const postsService = require('./../services/posts.js');
const {logger} = require("../utils/logger");
const createPost = async (req, res, next) => {
    try {
        const imagePath = req.file ? req.file.path : null;
        let postInfo = {
            ...req.body,
            imagePath,
            userId: req.session.userId,
        }
        const result = await postsService.createPost(postInfo);
        logger.info(`Created post ${result.id}`);
        res.redirect('/');
    } catch (err) {
        logger.info(err);
        // res.status(500).json({ message: 'Error creating post!' });
        res.redirect('/post')
        next(err);
    }
};
const getPost = async (req, res, next) => {
    const {id} = req.params;

    try {
        const post = await postsService.getPost(parseInt(id));
        if (!post) {
            logger.info(`Post ${id} not found`);
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post. User ${req.session.userId}`);
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        req.session._method = "put";
        logger.info(`Post ${id} modified`);
        res.render('views/post.njk', {post: post, method: "put"})
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error fetching post!'});
        next(error);
    }

};
const modifyPost = async (req, res, next) => {
    const {id} = req.params
    const imagePath = req.file ? req.file.path : null;

    let postInfo = {
        ...req.body,
        imagePath,
        id
    }
    delete req.session._method;
    try {
        const post = await postsService.getPost(parseInt(id));
        if (!post) {
            logger.info(`Post ${id} not found`);
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post.User ${req.session.userId}`);
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        await postsService.modifyPost(post,postInfo);
        logger.info(`Post ${id} updated successfully!`);
        res.redirect('/');

    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error updating post!'});
        next(error);
    }

}
const deletePost = async (req, res, next) => {
    const {id} = req.params;
    try {
        const post = await postsService.getPost(parseInt(id));
        if (!post) {
            logger.info(`Post ${id} not found`);
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            logger.info(`Unauthorized to update this post. User ${req.session.userId}`);
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        await postsService.deletePost(post);
        logger.info(`Post ${id} deleted`);
        res.redirect("/")
    } catch (error) {
        logger.error(error);
        res.status(500).json({message: 'Error deleting post!'});
        next(error)
    }

}
module.exports = {
    createPost,
    getPost,
    modifyPost,
    deletePost
}