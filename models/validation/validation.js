const joi = require('joi');

const validationBody = (object, validateWith, res) => {
  const schema = joi.object(object);
  const { error } = schema.validate(validateWith);
  if (error) {
    return res.json({
      status: false,
      message: error.details[0].message,
    });
  }
};
module.exports = validationBody;
