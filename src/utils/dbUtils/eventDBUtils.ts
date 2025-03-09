import Event from "../../models/Event";
import Space from "../../models/Space";
import { EventContactDetail, EventHost, EventManager, EventType } from "../../types/EventTypes";
import { addAction } from "./actionDBUtils";
import { getSpaceById, isUserAdminofSpace } from "./spaceDBUtils";
import { getUserById, getUserByUsername } from "./userDBUtils";


// To Get All the Events from the DB
export const getAllEvents = async (username:string) => {
    try {
        const events = await Event.find()
        .populate('spaceId', 'name')
        .populate('hosts', 'fullname username')
        .populate('managers', 'fullname username')
        .populate('attendees', 'fullname username')
        .populate('checkedIn', 'fullname username');
        if (events.length === 0) {
            return [];
        }

        const currentDate = new Date();
        const allUpcomingEvents = events.filter((event:any) => new Date(event.timings.start) > currentDate);

        const eventsWithManagerFlag = allUpcomingEvents.map((event: any) => {
            const isManager = event.managers.some((manager: any) => manager.username.toString() === username);
            return {
                ...event.toObject(),
                isManager
            };
        });

        return eventsWithManagerFlag;
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

// To get Event by _id
export const getEventById = async (eventId: string) => {
    try {
        const event = await Event.findById(eventId).populate('spaceId').populate('managers');
        if (!event) {
            return null;
        }
        return event;
    } catch (err) {
        console.error(err);
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
        // console.log('adminUserIds: ', adminUserIds);
        
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
            poster: eventDetails.poster || "",
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
        for (const userId of adminUserIds) {
            const user = await getUserById(userId);
            if (user) {
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

export async function deleteEvent(username: string, eventId: string) {
    try {
        const event = await getEventById(eventId);
        if (!event) {
            return null;
        }
        if(!event.spaceId){
            return null;
        }
        const spaceId = (event.spaceId as any)._id.toString();
        // console.log('spaceId: ', spaceId);
        
        // const space = await getSpaceById(spaceId);
        // if (!space) {
        //     return null;
        // }
        // const isUserAdmin = await isUserAdminofSpace(username, spaceId);
        // if (!isUserAdmin) {
        //     return null;
        // }
        // const managers = event.managers;
        // const deleteEventFromManaging = managers.forEach(async (manager: any) => {
        //     const user = await getUserById(manager);
        //     if (user) {
        //         user.managingEvents.pull(eventId);
        //         await user.save();
        //     }
        // })
        // const registered = event.attendees;
        // const deleteEventFromRegistered = registered.forEach(async (reg: any) => {
        //     const user = await getUserById(reg);
        //     if (user) {
        //         user.registeredEvents.pull(eventId);
        //         await user.save();
        //     }
        // })
        // const attendees = event.checkedIn;
        // const deleteEventFromCheckedIn = attendees.forEach(async (att: any) => {
        //     const user = await getUserById(att);
        //     if (user) {
        //         user.attendedEvents.pull(eventId);
        //         await user.save();
        //     }
        // });
        // await Promise.all([deleteEventFromManaging, deleteEventFromRegistered, deleteEventFromCheckedIn]);
        // space.events.pull(eventId);
        // await space.save();
        // const deletedEvent = await Event.deleteOne({_id:eventId});
        // // notify service TO-DO
        // await addAction(username, `Deleted Event ${event.name} from space: ${space.name}`);
        // return deletedEvent;
    } catch (error) {
        return null;
    }
}


// update event details
export async function updateEventDetails(username: string, eventId: string, eventDetails: EventType) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        if (eventDetails.name == undefined || eventDetails.description == undefined || eventDetails.timings.start == undefined || eventDetails.timings.end == undefined || eventDetails.status == undefined || eventDetails.venue.name == undefined || eventDetails.venue.address == undefined || eventDetails.visibility == undefined || eventDetails.poster == undefined || eventDetails.feedbackURL == undefined || eventDetails.capacity == undefined) {
            return null;
        }
        const updatedEvent = await Event.updateOne({ _id: eventId }, {
            $set: {
                name: eventDetails.name,
                description: eventDetails.description,
                status: eventDetails.status,
                timings: {
                    start: eventDetails.timings.start,
                    end: eventDetails.timings.end
                },
                venue: {
                    name: eventDetails.venue.name,
                    address: eventDetails.venue.address
                },
                visibility: eventDetails.visibility,
                poster: eventDetails.poster,
                feedbackURL: eventDetails.feedbackURL,
                capacity: eventDetails.capacity
            }
        })
        await addAction(username, `Updated Event ${event.name} of spaceid: ${event.spaceId}`);
        return updatedEvent;
    } catch (err) {
        console.error(err);
        return null;
    }
}

// add an event manager
export async function addEventManagers(username: string, eventId: string, managerDetails: EventManager) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        const manager = await getUserByUsername(managerDetails);
        if (!manager) {
            return null;
        }
        event.managers.addToSet(manager._id);
        await event.save();
        manager.managingEvents.addToSet(event._id);
        await manager.save()
        await addAction(username, `Added Manager ${manager.username} to Event ${event.name}`);
        return event.managers;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
export async function removeEventManagers(username: string, eventId: string, managerDetails: EventManager) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        const manager = await getUserByUsername(managerDetails);
        if (!manager) {
            return null;
        }
        event.managers.pull(manager._id);
        await event.save();
        manager.managingEvents.pull(event._id);
        await manager.save()
        await addAction(username, `Removed Manager ${manager.username} from Event ${event.name}`);
        return event.managers;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

// add an event host
export async function addEventHosts(username: string, eventId: string, hostsDetails: EventHost) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        const host = await getUserByUsername(hostsDetails);
        if (!host) {
            return null;
        }
        event.hosts.addToSet(host._id);
        await event.save();
        await addAction(username, `Added Host ${host.username} to Event ${event.name}`);
        return event.hosts;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
export async function removeEventHosts(username: string, eventId: string, hostsDetails: EventHost) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        const host = await getUserByUsername(hostsDetails);
        if (!host) {
            return null;
        }
        event.hosts.pull(host._id);
        await event.save();
        await addAction(username, `Remove Host ${host.username} from Event ${event.name}`);
        return event.hosts;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

// add contact Details
export async function addContactDetails(username: string, eventId: string, contactDetails: EventContactDetail) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        event.contactDetails.push(contactDetails)
        await event.save();
        await addAction(username, `Added Contact Details to Event ${event.name}`);
        return event.contactDetails;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}
export async function removeContactDetails(username: string, eventId: string, contactDetails: EventContactDetail) {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return null;
        }
        (event.contactDetails as any).pull(contactDetails)
        await event.save();
        await addAction(username, `Remove Contact Details to Event ${event.name}`);
        return event.contactDetails;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

export async function isAttendee(username: string, eventId: string) {
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return false;
        }
        const event = await Event.findById(eventId).select('attendees');
        if (!event) {
            return false;
        }
        const isAttendee = event.attendees.some((att: any) => {
            return att.toString() === user._id.toString();
        })
        return isAttendee;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function isCheckedIn(username: string, eventId: string) {
    try {
        const user = await getUserByUsername(username);
        if (!user) {
            return false;
        }
        const event = await Event.findById(eventId).select('checkedIn');
        if (!event) {
            return false;
        }
        const isCheckedIn = event.checkedIn.some((att: any) => {
            return att.toString() === user._id.toString();
        })
        return isCheckedIn;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function checkInUser(username: string, eventId: string) {
    try {
        const user = await getUserByUsername(username)
        if (!user) {
            return null;
        }
        const isAtt = await isAttendee(username, eventId);
        if (!isAtt) {
            return null;
        }
        const event = await Event.updateOne({
            _id: eventId
        }, {
            $addToSet: {
                checkedIn: user._id
            }
        })
        return event;
    } catch (err) {
        console.error(err);
        return null;
    }
}
export async function unCheckInUser(username: string, eventId: string) {
    try {
        const user = await getUserByUsername(username)
        if (!user) {
            return null;
        }
        const isCheck = await isCheckedIn(username, eventId);
        if (!isCheck) {
            return null;
        }
        const event = await Event.updateOne({ _id: eventId }, {
            $pull: {
                checkedIn: user._id
            }
        })
        return event;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getAttendees(eventId: string) {
    try {
        const event = await Event.findById(eventId).populate('attendees').select('attendees');
        if (!event) {
            return null;
        }
        return event.attendees;
    }
    catch (err) {
        console.error(err);
        return null;
    }
}

export async function getCheckIns(eventId: string) {
    try {
        const event = await Event.findById(eventId).populate('checkedIn').select('checkedIn');
        if (!event) {
            return null;
        }
        return event.checkedIn;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function getManagers(eventId: string) {
    try {
        const event = await Event.findById(eventId).populate('managers').select('managers');
        if (!event) {
            return null;
        }
        return event.managers;
    } catch (err) {
        console.error(err);
        return null;
    }
}
