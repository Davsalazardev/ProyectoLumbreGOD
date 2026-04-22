'use strict';

module.exports = function CustomError(errorType = 'Business') {
  Error.captureStackTrace(this, this.constructor);
  this.customErrorType = errorType;
};

require('util').inherits(module.exports, Error);