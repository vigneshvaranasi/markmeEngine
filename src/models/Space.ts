import {model, Schema,Types} from "mongoose";
export const SpaceSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    icon:{
        type:String,
        required:true
    },
    followers:[{
        type:Types.ObjectId,
        ref:"User"
    }],
    admins:[{
        type:Types.ObjectId,
        ref:"User"
    }],
    events:[{
        type:Types.ObjectId,
        ref:"Event"
    }],
    createdOn:{
        type:Date,
        default:Date.now()
    }
})

export default model("Space", SpaceSchema);