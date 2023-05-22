import mongoose from "mongoose";


type UserType = {
	name:string;
	email:string;
	state:string;
	password:string;
	token:string;
}


const modelSchema = new mongoose.Schema<UserType>({
	name:String,
	email:String,
	state:String,
	password:String,
	token:String
})


export const User = mongoose.model("users" , modelSchema );