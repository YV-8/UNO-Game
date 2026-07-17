/**
 * Envía una respuesta HTTP estandarizada de exito.
 * Solo incluye la propiedad 'data' si contiene info
 * @param {Response} res - Objeto de respuesta de Express
 * @param {number} statusCode - Codigo de estado
 * @param {string} message - Mensaje descriptivo
 * @param {any} data - Los datos  al cliente
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data })
  });
};