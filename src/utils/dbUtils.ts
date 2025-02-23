import User from '../models/User'
import Otp from '../models/Otp'
import Action from '../models/Action'
import Space from '../models/Space'
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
      fullname: fullname,
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

export const addAction = async (username: string, action: string) => {
  try {
    const newAction = new Action({
      username: username,
      action: action
    })
    await newAction.save()
  } catch (err) {
    console.error(err)
  }
}

export const updateUserNotification = async (username: string, notification: boolean) => {
  try {
    await User.updateOne({
      username: username
    }, {
      $set: {
        notificationPreference: notification
      }
    })
  } catch (err) {
    console.error(err)
  }
}

export const updateUserEmail = async (username: string, email: string) => {
  try {
    await User.updateOne({
      username: username
    }, {
      $set: {
        email: email
      }
    })
  } catch (err) {
    console.error(err)
  }
}

export const updateUserFullname = async (username: string, fullname: string) => {
  try {
    await User.updateOne({
      username: username
    }, {
      $set: {
        fullname: fullname
      }
    })
  } catch (err) {
    console.error(err)
  }
}

export const updateUserProfilePhoto = async (username: string, profilePhoto: string) => {
  try {
    await User.updateOne({
      username: username
    }, {
      $set: {
        profilePhoto: profilePhoto
      }
    })
  } catch (err) {
    console.error(err)
  }
}

export const updateUserPassword = async (username: string, password: string) => {
  try {
    await User.updateOne({
      username: username
    }, {
      $set: {
        password: password
      }
    })
  } catch (err) {
    console.error(err)
  }
}


export const createSpace = async (username: string, name: string, icon: string, admin: string[]) => {
  try {
    const admins = await User.find({
      username: {
        $in: [...admin, username]
      }
    });
    const space = new Space({
      name: name,
      icon: icon,
      admins: admins.map(admin => admin._id)
    });
    await space.save();
    return space;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getSpaceById(spaceId: string) {
  try {
    const space = await Space.findOne({
      _id: spaceId
    })
    if (space) {
      return space;
    }
  } catch (err) {
    console.error(err)
  }
}

export async function followSpace(username: string, spaceId: string) {
  try {
    const user = await getUserByUsername(username);
    if (user) {
      await Space.updateOne({
        _id: spaceId,
      }, {
        $push: {
          followers: user._id
        }
      })
      await User.updateOne({
        username: username,
      }, {
        $push: {
          followingSpaces: spaceId
        }
      }
      )
    }

  } catch (err) {
    console.error(err)
  }
}