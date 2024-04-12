class httpError extends Error {
  errorMessage;
  statusCode;
  constructor(statusCode, errorMessage) {
    super();
    this.errorMessage = errorMessage;
    this.statusCode = statusCode;
  }
}

export default httpError;
