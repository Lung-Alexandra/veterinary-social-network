const postsService = require('./../services/posts.js');
const createPost = async (req, res, next) => {
    try {
        const imagePath =  req.file ? req.file.path : null;
        let postInfo = {
            ...req.body,
            imagePath ,
            userId: req.session.userId,
        }
        const result = await postsService.createPost(postInfo);

        res.redirect('/');
    } catch (err) {
        console.error(err);
        // res.status(500).json({ message: 'Error creating post!' });
        res.redirect('/post')
        next(err);
    }
};
const getPost = async (req, res, next) => {
    const {id} = req.params;

    try {
        const post = await postsService.getPost(id);
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }
        req.session._method = "put";
        res.render('views/post.njk', {post: post, method: "put"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post!'});
        next(error);
    }

};
const modifyPost = async (req, res, next) => {
    const {id} = req.params
    const imagePath =  req.file ? req.file.path : null;

    let postInfo = {
        ...req.body,
        imagePath,
        id
    }

    try {
        const post = await postsService.getPost(id);
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        await postsService.modifyPost(postInfo);
        console.log('Post updated successfully!');
        res.redirect('/');

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating post!'});
        next(error);
    }

}
const deletePost = async (req,res,next)=>{
    const {id} = req.params;
    try {
        const post = await postsService.getPost(id);
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        await postsService.deletePost(post);

        res.redirect("/")
    } catch (error) {
        console.error(error);
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