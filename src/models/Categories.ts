import mongoose from "mongoose";

type CategoryType = {
	name:string;
	slug:string;
}


const modelSchema = new mongoose.Schema<CategoryType>({
	name:String,
	slug:String
})


export const Category = mongoose.model("categories" , modelSchema );