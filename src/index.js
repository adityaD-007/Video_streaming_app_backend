import dotenv from "dotenv"
import DBConnect from "./configurations/DBConnect.js";

dotenv.config({
    path: './.env'
})

DBConnect();