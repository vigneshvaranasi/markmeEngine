import {model, Schema,Types} from "mongoose";
export const ActionSchema = new Schema({
    action:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true
    },
    time:{
        type:Date,
        default:Date.now,
        required:true
    }
})

export default model("Action",ActionSchema);