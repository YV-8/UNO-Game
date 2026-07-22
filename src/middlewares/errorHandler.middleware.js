import { appError } from './appError.js';
/**
 * Middleware to handle errors in the application
 * @param {Error} err - The error object
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 * @param {NextFunction} next - The next middleware function
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  //  Errores Especificos de SQL / Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Registro duplicado: Algunos de los datos enviados ya existen en el sistema.';
  }
  else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }
  else if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message = 'Database error occurred.';
  }
  
  if (err.isOperational) {
    return res.status(statusCode).json({
      message: message,
    });
  }

  //Errores No Controlados Bugs caidas de bd
  console.error('ERROR NO CONTROLADO:', err);

  return res.status(500).json({
    message: 'Something went wrong on the server.',
  });
};
