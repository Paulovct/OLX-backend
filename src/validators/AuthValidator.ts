import { checkSchema } from "express-validator";

export default {
	signup:checkSchema({
		name:{
			trim:true,
			notEmpty:true,
			isLength:{
				options:{min:2}
			},
			errorMessage:"Nome precisa ter pelo menos 2 caracteres"
		},
		email:{
			isEmail:true,
			normalizeEmail:true,
			errorMessage:"Email Invalido"
		},
		password:{
			isLength:{
				options:{min:2}
			},
			errorMessage:"Senha precisa ter pelo menos 2 caracteres"
		},
		state:{
			notEmpty:true,
			errorMessage:"Estado não preenchido"
		}
	}),
	signin:checkSchema({
		email:{
			isEmail:true,
			normalizeEmail:true,
			errorMessage:"Digite um email válido"
		},
		password:{
			isLength:{
				options:{min:2}
			},
			errorMessage:"Digite uma senha válida"
		}
	}),
}