const  Joi =require("joi");

const validatePostFields = Joi.object({
  title: Joi.string().min(3).max(40).required(),
  content: Joi.string().min(3).required(),
  tags: Joi.string().min(3).required(),
  type: Joi.string().valid('TEXT', 'TEXTIMAGE').required(),
});



module.exports= {
  validatePostFields,
};
