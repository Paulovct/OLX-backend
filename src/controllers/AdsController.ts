import { Request , Response  } from "express";
import { Category } from "../models/Categories";
import { User } from "../models/User";
import { Ads } from "../models/Ads";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import jimp from "jimp";
import { State } from "../models/State";
import { isValidObjectId } from "mongoose";


dotenv.config();


const adImage =  async (buffer:any)=>{
	let newImg = `${uuidv4()}.jpg`;
	let tmpImg = await jimp.read(buffer);
	tmpImg.cover(500,500).quality(80).write(`./public/media/${newImg}`);
	return newImg;
}


export const addAction = async (req:Request , res:Response)=>{
	let { title , price , priceneg , desc , cat , token} = req.body;

	while(token.includes(" ")){
 		token = token.replace(" ","+");
 	}

	const user = await User.findOne({token});

	if(!user){
		res.json({error:"Não Autorizado"});
		return;
	}


	if(!title || !cat){
		res.json({error:"Titulo ou categoria não preenchidos"})
	}
	if(!isValidObjectId(cat)){
		res.json({error:"ID de categoria invalido"});
		return;
	}
	const catCheck = await Category.findById(cat);
	if(!catCheck){
		res.json({error:"Categoria inexistente"});
		return;
	}
	if(price){
		price = price.replace("R$ ","").replace(",",".").replace(".","");
		price = parseFloat(price);
	} else {
		price = 0;
	}


	const newAd = new Ads();

	newAd.status = "true";
	newAd.iduser = user._id.toString();
	newAd.title = title;
	newAd.state = user.state;
	newAd.datecreated = new Date();
	newAd.price = price;
	newAd.pricenegotiable = (priceneg =="true") ? true : false; 
	newAd.description = desc;
	newAd.views = 0;
	newAd.category = cat;

	if(req.files && req.files.img){
		if(req.files.img instanceof Array){
			for(let i in req.files.img){
				if(["image/jpeg","image/jpg","image/png"].includes(req.files.img[i].mimetype)){
					let url = await adImage(req.files.img[i].data);
					newAd.images.push({
					url,
					default:false
					})
				}
			}
		} else {
			if(["image/jpeg","image/jpg","image/png"].includes(req.files.img.mimetype)){
				let url = await adImage(req.files.img.data);
				newAd.images.push({
					url,
					default:false
				})
			}
		}
	}
	if(newAd.images.length > 0){
		newAd.images[0].default = true;
	}

	await newAd.save();

	res.status(201);
	res.json({
		id:newAd._id
	});
}


export const getList = async (req:Request , res:Response)=>{
	let { sort = "asc" , offset = 0 , limit = 8 , q , cat , state} = req.query;
	let total = 0;

	let filters:any = {
		status:true
	};

	if(q){
		filters.title = {"$regex":q , "$options":"i"};
	}
	if(cat) {
		const c = await Category.findOne({slug:cat.toString().toLowerCase()});
		if(c){
			filters.category = c._id;
		}
	}
	if(state){
		const s = await State.findOne({name:state.toString().toUpperCase()});
		if(s){
			filters.state = s._id.toString();
		}
	}

	const adsTotal =  await Ads.find({});

	total = adsTotal.length;

	const adsData = await Ads.find(filters)
		.sort({datecreated:(sort =="desc" ? -1 : 1)})
		.skip(parseInt(offset.toString()))
		.limit(parseInt(limit.toString()))
		.exec();
	let ads = [];

	for(let i in adsData){
		let image;
		let defaultImg = adsData[i].images.find(e=> e.default);

		if(defaultImg){
			image = `${process.env.BASE}/media/${defaultImg.url}`;
		} else {
			image =  `${process.env.BASE}/media/default.jpg`;
		}

		ads.push({
			id:adsData[i]._id,
			title:adsData[i].title,
			price:adsData[i].price,
			pricenegotiable:adsData[i].pricenegotiable,
			image
		});
	}

	res.json({ads , total});

}



export const getItem = async (req:Request , res:Response)=>{
	let { id , other = null } = req.query;
	if(!id){
		res.json({error:"Produto Inexistente"});
		return;
	}
	if(!isValidObjectId(id)){
		res.json({id});

		return;
	}
	const ad = await Ads.findById(id);

	if(!ad){
		res.json({error:"Produto Inexistente"});
		return;
	}
	ad.views++;

	ad.save();

	let images= [];
	for(let i in ad.images){
		images.push(`${process.env.BASE}/media/${ad.images[i].url}`);
	}

	let category = await Category.findById(ad.category);
	let userInfo = await User.findById(ad.iduser);
	let stateInfo = await State.findById(ad.state);

	let others = [];

	if(other){
		const otherData = await Ads.find({status:true,iduser:ad.iduser});

		for(let i in otherData){
			if(otherData[i]._id.toString() !== ad._id.toString()){
				let image = `${process.env.BASE}/media/default.jpg`;

				let defaultImg = otherData[i].images.find(e=> e.default);
				if(defaultImg){
					image = `${process.env.BASE}/media/${defaultImg.url}`;
				}

				others.push({
					id:otherData[i]._id,
					title:otherData[i].title,
					price:otherData[i].price,
					pricenegotiable:otherData[i].pricenegotiable,
					image
				})
			}
		}
	}

	if(!category || !userInfo || !stateInfo){
		res.json({error:"Algo deu errado"});
		return;
	}

	res.json({
		id:ad._id,
		title:ad.title,
		price:ad.price,
		pricenegotiable:ad.pricenegotiable,
		description:ad.description,
		datecreated:ad.datecreated,
		views:ad.views,
		images,
		category,
		userInfo:{
			name:userInfo.name,
			email:userInfo.email
		},
		stateName:stateInfo.name,
		others
	});
}



export const editAction = async (req:Request , res:Response)=>{
	let { id  } = req.params;
	let {title , status , price , priceneg , cat , token , desc  } = req.body;
	if(!id){
		res.json({error:"Produto Inexistente"});
		return;
	}
	if(!isValidObjectId(id)){
		res.json({error:"ID Invalido"});
		return;
	}
	const ad = await Ads.findById(id);

	if(!ad){
		res.json({error:"Produto Inexistente"});
		return;
	}

	const user = await User.findOne({token});

	if(!user){
		res.json({error:"Token Invalido"});
		return;
	}

	if(user._id.toString() !== ad.iduser){
		res.json({error:"Este anúncio não é seu"});
		return;
	}

	let updates:any = {};

	if(title){
		updates.title = title;
	}
	if(price){
		price = price.replace("R$ ","").replace(",",".").replace(".","");
		updates.price = parseFloat(price);
	}
	if(priceneg){
		updates.pricenegotiable = priceneg;
	}
	if(status){
		updates.status = status;
	}
	if(desc){
		updates.description = desc;
	}
	if(cat){
		const category = await Category.findOne({slug:cat});
		if(!category){
			res.json({error:"Categorua inexistente"});
			return;
		}
		updates.category = category._id.toString();
	}

	if(req.files && req.files.img){
		updates.images = [];
		if(req.files.img instanceof Array){
			for(let i in req.files.img){
				if(["image/jpeg","image/jpg","image/png"].includes(req.files.img[i].mimetype)){
					let url = await adImage(req.files.img[i].data);
					updates.images.push({
					url,
					default:false
					})
				}
			}
		} else {
			if(["image/jpeg","image/jpg","image/png"].includes(req.files.img.mimetype)){
				let url = await adImage(req.files.img.data);
				updates.images.push({
					url,
					default:false
				})
			}
		}
	}
	if(updates.images.length > 0){
		updates.images[0].default = true;
	}

	await Ads.findByIdAndUpdate(id , {$set:updates});

	res.json({error:""});
}



export const getCategories = async (req:Request , res:Response)=>{
	const categories = await Category.find({});

	let cats = [];

	for(let i in categories){
		cats.push({
			...categories[i].toJSON(),
			img:`${process.env.BASE}/assets/images/${categories[i].slug}.png`
		})
	}

	res.json(cats);
}