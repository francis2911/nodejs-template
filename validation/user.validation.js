const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "email", "co", "es"] },
    })
    .required(),
  password: Joi.string().required(),
});

const email = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net", "email", "co", "es"] },
    })
    .required(),
});

module.exports = { userSchema, email };
