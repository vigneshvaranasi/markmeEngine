import User from '../models/User'
import Otp from '../models/Otp'
import Action from '../models/Action'
import Space from '../models/Space'
import { UserType } from '../types/UserTypes'
import {SpaceType} from '../types/SpaceTypes'
import mongoose from 'mongoose'

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
    const adminUsernames = new Set([...admin, username]);
    const admins = await User.find({ 
      username: { 
        $in: Array.from(adminUsernames) 
      } 
    });

    if (!admins.some(user => user.username === username)) {
      throw new Error("Creator not found in the database");
    }

    // create new space
    const space = new Space({
      name,
      icon,
      admins: admins.map(admin => admin._id)
    });

    await space.save();

    // add space id to the managingSpaces of all admins
    await User.updateMany(
      { _id: { $in: admins.map(admin => admin._id) } },
      { $addToSet: { managingSpaces: space._id } }
    );
    return space;
  } catch (err) {
    console.error(err);
    return null;
  }
};


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
    if (!user) {
      throw new Error("User not found");
    }
    // add userId to the followers list of space
    await Space.updateOne({
      _id: spaceId,
    }, {
      $addToSet: {
        followers: user._id
      }
    })
    // add space id to the followingSpaces of user
    await User.updateOne({
      username: username,
    }, {
      $addToSet: {
        followingSpaces: spaceId
      }
    })
  } catch (err) {
    console.error(err)
  }
}



export async function updateSpaceDetails(username: string, spaceId: string, spaceDetails: SpaceType) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    const space = await Space.findOne({
      _id: spaceId,
      admins: user._id,
    });

    if (!space) {
      throw new Error("You are not an admin of this space");
    }
    const { name, icon, admins } = spaceDetails;

    if (name) 
      space.name = name;
    if (icon) 
      space.icon = icon;

    if (admins) {
      // If admins array is empty keep only the current user as the admin
      if (admins.length === 0) {
        await Space.updateOne(
          { _id: spaceId }, 
          { admins: [user._id] }
        );
        // Remove this space from all other users
        await User.updateMany(
          { managingSpaces: spaceId }, 
          { $pull: { managingSpaces: spaceId }}
        );
        await User.updateOne(
          { _id: user._id }, 
          { $addToSet: { managingSpaces: spaceId } }
        );
      } 
      else {
        const validAdmins: mongoose.Types.ObjectId[] = [];
        for (const adminUsername of admins) {
          const admin = await getUserByUsername(adminUsername);
          if (!admin) {
            throw new Error(`Admin not found: ${adminUsername}`);
          }
          validAdmins.push(admin._id);
        }

        // Update space with the new admin list
        await Space.updateOne(
          { _id: spaceId }, 
          { admins: validAdmins }
        );
        // remove space from other who are not dmins now
        await User.updateMany(
          { managingSpaces: spaceId }, 
          { $pull: { managingSpaces: spaceId } }
        );
        // add space id to new admin details
        await User.updateMany(
          { _id: { $in: validAdmins } }, 
          { $addToSet: { managingSpaces: spaceId } }
        );
      }
    }

    await space.save();
  } catch (err) {
    console.error(err);
  }
}

export async function deleteSpaceById(spaceId: string, username: string) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    const space = await Space.findOne({
      _id: spaceId,
      admins: user._id,
    });

    if (!space) {
      throw new Error("You are not an admin of this space");
    }

    // remove spaceId from all admins managingSpaces
    await User.updateMany(
      { _id: { $in: space.admins } },
      { $pull: { managingSpaces: spaceId } }
    );
    // remove spaceId for followers
    await User.updateMany(
      { followingSpaces: spaceId },
      { $pull: { followingSpaces: spaceId } }
    );
    // delete space
    await Space.deleteOne({ _id: spaceId });

  } catch (err) {
    console.error(err);
  }
}
