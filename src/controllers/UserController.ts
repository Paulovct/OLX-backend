import { Request , Response  } from "express";
import { State } from "../models/State";
import { User } from "../models/User";
import { Ads } from "../models/Ads"; 
import { Category } from "../models/Categories";
import { validationResult , matchedData } from "express-validator";
import encription from "../helpers/encription";



export const getStates = async (req:Request , res:Response)=>{
	const states = await State.find({});
	res.json({states});
}


export const info = async (req:Request , res:Response)=>{
	let { token } = req.query;
	if( typeof token == "string"){
		while(token.includes(" ")){
			token = token.replace(" ", "+")
		}
	}
	
	const user = await User.findOne({token});

	if(user){
		const ads = await Ads.find({iduser:user.id});
		const state = await State.findById(user.state);
		let adList:any = [];

		for(let i in ads){
			let cat = await Category.findOne({slug:ads[i].category});
			adList.push({...ads[i].toJSON(),category:cat? cat.slug : ""});
		}

		res.json({
			name:user.name,
			email:user.email,
			state:state,
			ads:adList
		});
	}
}



export const editAction = async (req:Request , res:Response)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.json({error:errors.mapped()});
		return;
	}
	const data = matchedData(req);
	let {token} = data;
	while(token.includes(" ")){
		token = data.token.replace(" ", "+")
	}
	const user = await User.findOne({token});

	if(user){
		if(data.name)user.name = data.name;

		if(data.email){
			const emailCheck = await User.findOne({email:data.email});
			if(emailCheck){
				res.json({error:"Email Existente"});
				return;
			}
			user.email = data.email
		}

		if(data.password)user.password = encription.encrypt(data.password);

		if(data.state){
			const stateCheck = await State.findOne({name:data.state});
			if(!stateCheck){
				res.json({error:"Estado não cadatrado"});
				return;
			}
			user.state = stateCheck._id.toString();
		}

		await user.save();
	}
	res.json({result:true});
}

