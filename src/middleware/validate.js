/**
 * Request validation middleware
 * @param {Function} validator - Validation function
 */
function validate(validator) {
  return (req, res, next) => {
    const errors = validator(req);

    if (errors && errors.length > 0) {
      const error = new Error("Validation Error");
      error.statusCode = 400;
      error.array = () => errors;
      return next(error);
    }

    next();
  };
}
