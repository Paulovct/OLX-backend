import {connect} from "mongoose";
import dotenv from "dotenv";

dotenv.config();


export const mongoConnect = async()=>{
	try{

		console.log("Conectando...");
		await connect(process.env.DB as string,{});

		console.log("Mongo conectado");

	}catch(error){
		console.log(error)
	}
}