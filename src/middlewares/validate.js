const httpError =require("../utils/httpError.js");

const validate = (validationSchema) => (req, res, next) => {
  const validationResult = validationSchema.validate(req.body);

  if (validationResult.error) {
    return next(new httpError(400, validationResult.error.details[0].message));
  }

  next();
};

module.exports={ validate};
