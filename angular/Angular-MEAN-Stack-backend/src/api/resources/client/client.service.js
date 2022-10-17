import Joi from "@hapi/joi";

export default {
  validateCreateSchema(body) {
    const schema = Joi.object().keys({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
    });
    const { error, value } = Joi.validate(body, schema);
    if (error && error.details) {
      return {error};
    }
    return { value };
  },
  validateUpdateSchema(body) {
    const schema = Joi.object().keys({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().optional(),
    });
    const { error, value } = Joi.validate(body, schema);
    if (error && error.details) {
      return {error};
    }
    return { value };
  },
};
