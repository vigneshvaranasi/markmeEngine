import {model, Schema,Types} from "mongoose";
export const UserSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    fullname:{
        type:String,
        required:true
    },
    profilePhoto:{
        type:String,
        required:true
    },
    gender:{
        type: String,
        enum: ["Male", "Female"],
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    lastOnline:{
        type:Date,
        default:Date.now()
    },
    createdOn:{
        type:Date,
        default:Date.now()
    },
    followingSpaces:[{
        type:Types.ObjectId,
        ref:"Space"
    }],
    managingSpaces:[{
        type:Types.ObjectId,
        ref:"Space"
    }],
    registeredEvents:[{
        type:Types.ObjectId,
        ref:"Event"
    }],
    attendedEvents:[{
        type:Types.ObjectId,
        ref:"Event"
    }],
    managingEvents:[{
        type:Types.ObjectId,
        ref:"Event"
    }],
    notificationPreference:{
        type: Boolean,
        default:true
    }
});

export default model("User", UserSchema);