import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();

const algorithm = 'aes-192-cbc';

export default {
	encrypt:(key:string)=>{
		const encrypted = CryptoJS.AES.encrypt(key , process.env.SECRET as string);
		return encrypted.toString(CryptoJS.format.OpenSSL);
	},
	decrypt:(key:string)=>{
		const decrypted = CryptoJS.AES.decrypt(key , process.env.SECRET as string);
		return decrypted.toString(CryptoJS.enc.Utf8);
	},
	
};