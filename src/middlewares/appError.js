/**
 * Error personalize for errors to appear in the console
 * and in the response
 */
export class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${this.statusCode}`.startsWith('4') ? 'internal fail' : 'error';
    this.isOperational = true; // error controlado por nosotros

    // Asegura que el nombre de la clase se mantenga en el stack trace
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}