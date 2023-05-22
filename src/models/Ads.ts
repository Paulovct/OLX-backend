import mongoose from "mongoose";

type AdsType = {
	iduser:string;
	state:string;
	category:string;
	images:[{
		url:string;
		default:boolean;
	}];
	datecreated:Date;
	title:string;
	price:number;
	pricenegotiable:boolean;
	description:string;
	views:number;
	status:string;
}

const modelSchema = new mongoose.Schema<AdsType>({
	iduser:String,
	state:String,
	category:String,
	images:[Object],
	datecreated:Date,
	title:String,
	price:Number,
	pricenegotiable:Boolean,
	description:String,
	views:Number,
	status:String
})


export const Ads = mongoose.model("ads" , modelSchema );