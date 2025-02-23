import mongoose from 'mongoose';
import {configDotenv} from 'dotenv';
import ENV from './default';
configDotenv();
const {DATABASE_URL} = ENV;

const connectDB = async()=>{
    try{
        await mongoose.connect(DATABASE_URL!,{
            dbName:'markme'
        });
        console.log('Connected to MongoDB');
    }catch(err){
        console.error("Error in Connecting to MongoDB",err);
        process.exit(1);
    }
}

export default connectDB;