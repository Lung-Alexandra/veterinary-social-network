const {validatePostFields} = require("./../validations/posts.js");

const validatePost = async (req, res, next) => {
    try {
        await validatePostFields.validateAsync(req.body);
        next();
    } catch (error) {
        res.status(500).json({message: `${error}`});
    }
};

module.exports = validatePost;
