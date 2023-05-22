import mongoose from "mongoose";

type StateType = {
	name:string;
}

const modelSchema = new mongoose.Schema<StateType>({
	name:String,
})


export const State = mongoose.model("states" , modelSchema );