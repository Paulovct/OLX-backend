import { checkSchema } from "express-validator";


export default {
	editAction:checkSchema({
		token:{
			notEmpty:true,
			errorMessage:"Token Necessario"
		},
		name:{
			optional:true,
			trim:true,
			notEmpty:true,
			isLength:{
				options:{min:2}
			},
			errorMessage:"Nome precisa ter pelo menos 2 caracteres"
		},
		email:{
			optional:true,
			isEmail:true,
			normalizeEmail:true,
			errorMessage:"Email Invalido"
		},
		password:{
			optional:true,
			isLength:{
				options:{min:2}
			},
			errorMessage:"Senha precisa ter pelo menos 2 caracteres"
		},
		state:{
			optional:true,
			notEmpty:true,
			errorMessage:"Estado não preenchido"
		}
	})
}