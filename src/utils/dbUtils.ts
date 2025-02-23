import User from '../models/User'
import Otp from '../models/Otp'
import { UserType } from '../types/UserTypes'
export const getUserById = async (id: string) => {
  try {
    const user = await User.findOne({
      _id: id
    })
    return user
  } catch (err) {
    console.error(err)
    return null
  }
}

export const getUserByEmail = async (email: string) => {
  try {
    const user = await User.findOne({
      email: email
    })
    return user
  } catch (err) {
    console.error(err)
    return null
  }
}

export const getUserByUsername = async (username: string) => {
  try {
    const user = await User.findOne({
      username: username
    })
    return user
  } catch (err) {
    console.error(err)
    return null
  }
}

export const createUser = async ({
  username,
  email,
  password,
  profilePhoto,
  gender,
  fullname
}: UserType) => {
  try {
    const user = new User({
      username: username,
      email: email,
      password: password,
      profilePhoto: profilePhoto,
      gender: gender,
      fullname: fullname
    })
    await user.save()
    return user
  } catch (err) {
    console.error(err)
    return null
  }
}

export const createOTP = async (
  { username, email, password, profilePhoto, gender, fullname }: UserType,
  otp: string
) => {
  try {
    const newOTP = new Otp({
      username: username,
      fullname:fullname,
      email: email,
      password: password,
      profilePhoto: profilePhoto,
      gender: gender,
      otp: otp
    })
    await newOTP.save()
    return newOTP
  } catch (err) {
    console.error(err)
    return null
  }
}

export const getOTP = async (email: string, otp: string) => {
  try {
    const existingOTP = await Otp.findOne({
        email: email,
        otp: otp
    })
    console.log('existingOTP: ', existingOTP);
    return existingOTP
  } catch (err) {
    console.error(err)
    return null
  }
}

export const deleteOTP = async (email: string) => {
    try {
        await Otp.deleteOne({
            email: email
        })
    } catch (err) {
        console.error(err)
    }
}