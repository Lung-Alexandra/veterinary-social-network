const  Joi =require("joi");

const createPost = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  content: Joi.string().min(3).required(),
  tags: Joi.string().min(3).required(),
  dueDate: Joi.date().required(),
});

const updatePost = Joi.object({
  title: Joi.string().min(3).max(40),
  content: Joi.string().min(3),
  dueDate: Joi.date(),
}).min(1);

module.exports= {
  createPost,
  updatePost,
};
