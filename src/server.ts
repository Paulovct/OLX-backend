import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload"
import apiRoutes from "./routes/apiRoutes";
import {mongoConnect} from "./database/mongo"


dotenv.config();

mongoConnect();

const server = express();

server.use(cors());

server.use(express.json());

server.use(express.urlencoded({extended:true}));

server.use(fileUpload());

server.use(express.static("public"));


server.use(apiRoutes);

server.use((req , res)=>{
	res.send({error:"Rota Não Encontrada"})
})

server.listen(process.env.PORT , ()=>   console.log("Api On"));