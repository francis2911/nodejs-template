const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required(),
});

const id = Joi.object({
  id: Joi.string().required(),
});

const favorite = Joi.object({
  favorite: Joi.boolean().required(),
});

module.exports = { schema, id, favorite };
