const {validateCommentField} = require("./../validations/comments.js");

const validateComment = async (req, res, next) => {
    try {
        await validateCommentField.validateAsync(req.body);
        next();
    } catch (error) {
        res.status(500).json({message: `${error}`});
    }
};

module.exports = validateComment;
