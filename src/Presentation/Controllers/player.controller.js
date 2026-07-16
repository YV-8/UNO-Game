import { StatusError } from "../../Middlewares/errorHandler.middleware";
import Player from './src/DataAccess/Models/Player.js'

export const getPlayer = async (res, req, next) => {
    try{
        const player = await Player.findAll();
        sendSuccess(res, player, 'Successfully');
    }catch (error){
        next(error);
    }
}

/**
 * 
 * @param {Object} res 
 * object response 
 * @param {*} data 
 * 
 * @param {string} message 
 * @param {number} statusCode 
 */
export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
