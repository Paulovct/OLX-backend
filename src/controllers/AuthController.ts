import { Request , Response  } from "express";
import { validationResult , matchedData } from "express-validator";
import { User } from "../models/User";
import { State } from "../models/State";
import encription from "../helpers/encription";






export const signin = async (req:Request , res:Response)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.json({error:errors.mapped()});
		return;
	}
	const data = matchedData(req);

	const user = await User.findOne({email:data.email});

	if(!user){
		res.json({error:"Email e/ou Senha invalidos"});
		return;
	}
	
	
	let match =	encription.decrypt(user.password) === data.password;
	
	if(!match){
		res.json({error:"Email e/ou Senha invalidos"});
		return;
	}

	const payload = (Date.now() + Math.random()).toString();
	const token = encription.encrypt(payload);

	user.token = token;

	await user.save();


	res.json({ token, email:data.email});

}




export const signup = async (req:Request , res:Response)=>{
	const errors = validationResult(req);
	if(!errors.isEmpty()){
		res.json({error:errors.mapped()});
		return;
	}
	const data = matchedData(req);

	const hasEmail = await User.findOne({email:data.email});
	
	if(hasEmail){
		res.json({
			error:{email:"Email já existe"}
		});
		return;
	}

	const stateItem = await State.findById(data.state);
	
	if(!stateItem){
		res.json({error:{
			state:"Estado não encontrado"
		}});
		return;
	}

	
	const passwordHash = encription.encrypt(data.password);

	const payload = (Date.now() + Math.random()).toString();
	const token =  encription.encrypt(payload);

	await User.create({
		name:data.name,
		email:data.email,
		password:passwordHash,
		token,
		state:stateItem._id.toString()
	});
	
	res.status(201);
	res.json({token});
}
