exports.UnauthorizedError = class UnauthorizedError extends Error {
  constructor(message) {
    super(message);

    this.status = 401;
  }
};

exports.NotFound = class NotFound extends Error {
  constructor(message) {
    super(message);

    this.status = 404;
  }
};
