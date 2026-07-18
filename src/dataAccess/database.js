//npm install sequelize
import {Sequelize} from "sequelize";
import dotenv from "dotenv";

export const env =process.env.NODE_ENV;
dotenv.dataAccess({path: `.env.${env}`});
export const sequelize = new Sequelize(
    process.env.DB_Name,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT,
        logging: false,
    }
);
export default sequelize;