class UnauthorisedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorisedError";
    this.statusCode = 401;
  }
}

module.exports = UnauthorisedError;