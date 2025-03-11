import User from '../../models/User'
import Otp from '../../models/Otp'
import Action from '../../models/Action'
import Space from '../../models/Space'
import Event from '../../models/Event'
import { UserType } from '../../types/UserTypes'
import { SpaceType } from '../../types/SpaceTypes'
import mongoose, { Date } from 'mongoose'
import { getEventById } from './eventDBUtils'
import { createSpace } from './spaceDBUtils'
import { EventType } from '../../types/EventTypes'

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
    const spaceName = username + "'s Space"
    const newDefaultSpace = await createSpace(username,spaceName, profilePhoto, [] );
    if(!newDefaultSpace){
      return null;
    }
    user.managingSpaces.addToSet(newDefaultSpace._id);
    await user.save();
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


export const getUserEvents = async (username: string) => {
  try {
    const user = await getUserByUsername(username)
    if (!user) {
      return null
    }
    const currentDate = new Date()

    const allSpacesId = [
      ...user.followingSpaces.map(space => space._id),
      ...user.managingSpaces.map(space => space._id)
    ]
    const spaces = await Space.find({ _id: { $in: allSpacesId } }).populate(
      'events'
    )
    const allEventIds = spaces.flatMap(space =>
      space.events.map(event => event._id)
    )

    const events: any = await Event.find({
      _id: { $in: allEventIds }
    })
      .populate('spaceId', 'name')
      .populate('hosts', 'fullname username')
      .populate('managers', 'fullname username')
      .populate('attendees', 'fullname username')
      .populate('checkedIn', 'fullname username')

    if (!events) {
      return null
    }
    const eventsWithManagerFlag = events.map((event: any) => {
      const isManager = event.managers.some(
        (manager: any) => manager.username.toString() === username
      )
      return {
        ...event.toObject(),
        isManager
      }
    })
    const pastEvents = eventsWithManagerFlag.filter(
      (event: any) => event.status === 'Archived'
    )
    const upcomingEvents = eventsWithManagerFlag.filter(
      (event: any) =>  event.status === "Upcoming" || event.status === "Live"
    )

    return { pastEvents, upcomingEvents }
  } catch (err) {
    console.error(err)
    return null
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
export const unmarkUser = async (username:string,eventId:string)=>{
  try{
    const user = await getUserByUsername(username);
    if(!user){
      return null;
    }
    const event = await Event.findOne({_id:eventId});
    if(!event){
      return null;
    }
    event.attendees.pull(user._id);
    await event.save();
    user.registeredEvents.pull(event._id);
    await user.save();
    return event;
  }
  catch(err){
    console.error(err);
    return null;
  }
}

export const markmeUser = async (username:string,eventId:string)=>{
  try{
    const user = await getUserByUsername(username);
    if(!user){
      return null;
    }
    const event = await getEventById(eventId);
    if(!event){
      return null;
    }
    event.attendees.addToSet(user._id);
    await event.save();
    user.registeredEvents.addToSet(eventId);
    await user.save();
    return event;    
  }
  catch(err){
    console.error(err)
    return null;
  }
}