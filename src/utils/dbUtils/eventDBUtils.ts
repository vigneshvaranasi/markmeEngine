import Event from "../../models/Event";
import Space from "../../models/Space";
import { EventType } from "../../types/EventTypes";
import { addAction } from "./actionDBUtils";
import { getSpaceById, isUserAdminofSpace } from "./spaceDBUtils";
import { getUserByUsername } from "./userDBUtils";


// To Get All the Events from the DB
export const getAllEvents = async () => {
    try {
        const events = await Event.find().populate('spaceId');
        return events;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// To get events by its space
export const getEventsBySpaceId = async (spaceId: string) => {
    try {
        const isSpace = await getSpaceById(spaceId);
        if (!isSpace) {
            return null;
        }
        const events = await Event.find({
            spaceId: spaceId
        }).populate('spaceId');
        if (events.length === 0) {
            return [];
        }
        return events;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function createEvent(username: string, spaceId: string, eventDetails: EventType) {
    try {
        // Validate User is there & admin of the space
        const isUserAdmin = await isUserAdminofSpace(username, spaceId);
        if (!isUserAdmin) {
            return null;
        }
        const space = await getSpaceById(spaceId);
        if (!space) {
            return null;
        }
        // add all the admins of the space as managers
        const admins = space.admins;
        const adminUserIds = admins.map(admin => {
            return admin._id.toString();
        })
        // create event
        const newEvent = new Event({
            spaceId: spaceId,
            attendees: [],
            managers: [],
            capacity: eventDetails.capacity,
            description: eventDetails.description,
            checkedIn: [],
            contactDetails: eventDetails.contactDetails,
            hosts: [],
            name: eventDetails.name,
            poster: eventDetails.poster,
            status: eventDetails.status,
            timings: {
                start: eventDetails.timings.start,
                end: eventDetails.timings.end
            },
            venue: {
                name: eventDetails.venue.name,
                address: eventDetails.venue.address
            },
            visibility: eventDetails.visibility
        })

        newEvent.managers.addToSet(...adminUserIds);
        // add event to the space
        space.events.addToSet(newEvent._id)
        await space.save();
        // change in User document by adding this event id to the user document
        for(const userId of adminUserIds){
            const user = await getUserByUsername(userId);
            if(user){
                user.managingEvents.addToSet(newEvent._id);
                await user.save();
            }
        }

        await newEvent.save();
        // notify followers, admins & managers TO-DO Add Service
        // add action log
        await addAction(username, `Created Event ${newEvent.name} in space: ${space.name}`);
        return newEvent;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}