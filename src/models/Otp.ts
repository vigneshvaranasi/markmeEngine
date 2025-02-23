import { model, Schema, Types } from 'mongoose'
export const OtpSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  fullname:{
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 600
  }
})

export default model('Otp', OtpSchema)