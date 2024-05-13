const  Joi =require("joi");

const validateCommentField = Joi.object({
  content: Joi.string().min(1).required(),
});

module.exports= {
  validateCommentField,
};
