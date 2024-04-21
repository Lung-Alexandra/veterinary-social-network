const extractPostId = (req, res, next) => {
    req.postId = req.params.postId;
    next();
};
module.exports = {
    extractPostId,
}