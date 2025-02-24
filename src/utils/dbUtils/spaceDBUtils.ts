import User from '../../models/User'
import { SpaceType } from '../../types/SpaceTypes'
import mongoose from 'mongoose'
import Space from '../../models/Space'
import { getUserByUsername } from './userDBUtils'


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
    }).populate('admins').populate('followers');
    if (space) {
      return space;
    }
  } catch (err) {
    console.error(err);
    return null;
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
    });
  } catch (err) {
    console.error(err)
  }
}
export async function unFollowSpace(username: string, spaceId: string) {
  try {
    const user = await getUserByUsername(username);
    if (!user) {
      throw new Error("User not found");
    }
    // remove userId to the followers list of space
    await Space.updateOne({
      _id: spaceId,
    }, {
      $pull:{
        followers: user._id
      }
    })
    // Remove space id to the followingSpaces of user
    await User.updateOne({
      username: username,
    }, {
      $pull: {
        followingSpaces: spaceId
      }
    });
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
          { $pull: { managingSpaces: spaceId } }
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
    return true;
  } catch (err) {
    console.error(err);
    return false;
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

export const isUserAdminofSpace = async(username: string, spaceId:string)=>{
  try{
      const space = await getSpaceById(spaceId);
      if(!space){
          return false;
      }
      let isAdmin = false;
      space.admins.forEach((admin:any)=>{
          if(admin.username.toString() === username){
              isAdmin = true;
          }
      });
      return isAdmin;
  }catch(err){
      console.error(err);
      return false;
  }
}