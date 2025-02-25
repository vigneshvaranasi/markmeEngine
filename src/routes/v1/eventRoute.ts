import express, { Router } from 'express'
import verifyToken from '../../middleware/userMiddleware';
import { CreateEventBody, EventManager, EventType, UpdateEventBody } from '../../types/EventTypes';
import { addContactDetails, addEventHosts, addEventManagers, createEvent, getAllEvents, removeEventHosts, removeEventManagers, updateEventDetails, removeContactDetails, checkInUser, unCheckInUser, getAttendees, getCheckIns, getManagers } from '../../utils/dbUtils/eventDBUtils';
import { isEventManager } from '../../middleware/eventMiddleware';
const EventRoute = Router();

EventRoute.get('/', (req, res) => {
    res.send('Event Route');
});

EventRoute.use(verifyToken);

// Get Events
EventRoute.get('/getAll', async (req, res) => {
    try {
        const username = req.user?.username as string;
        if (!username) {
            res.status(401).send({
                payload: {
                    message: 'Unauthorized Access'
                },
                error: true
            })
            return;
        }
        const events = await getAllEvents();
        if (!events) {
            throw new Error('Events Fetch Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Got All the Events',
                events: events
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + err
            },
            error: true
        })
    }
});

EventRoute.post('/create', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { spaceId, eventDetails }: CreateEventBody = req.body
        const event = await createEvent(username, spaceId, eventDetails);
        if (!event) {
            throw new Error('Event Creation Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Event Created',
                event: event
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + err
            },
            error: true
        })
    }
});

EventRoute.use(isEventManager);
EventRoute.put('/update', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, eventDetails }: UpdateEventBody = req.body;
        const event = await updateEventDetails(username, eventId, eventDetails);
        if (!event) {
            throw new Error('Event Update Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Event Updated',
                event: event
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + err
            },
            error: true
        })
    }
})

EventRoute.put('/addManager', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, managerDetails } = req.body;
        const updatedManagers = await addEventManagers(username, eventId, managerDetails)
        if (!updatedManagers) {
            throw new Error('Event Manager Addition Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Event Manager Added',
                managers: updatedManagers
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})
EventRoute.put('/removeManager', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, managerDetails } = req.body;
        const updatedManagers = await removeEventManagers(username, eventId, managerDetails)
        if (!updatedManagers) {
            throw new Error('Event Manager Deletion Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Event Manager Removed',
                managers: updatedManagers
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})
EventRoute.put('/addHost', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, hostsDetails } = req.body;
        const updatedHosts = await addEventHosts(username, eventId, hostsDetails)
        if (!updatedHosts) {
            throw new Error('Host Addition Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Host Added',
                hosts: updatedHosts
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})
EventRoute.put('/removeHost', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, hostsDetails } = req.body;
        const updatedHosts = await removeEventHosts(username, eventId, hostsDetails)
        if (!updatedHosts) {
            throw new Error('Host Deletion Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Host Deleted',
                hosts: updatedHosts
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})
EventRoute.put('/addContact', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, contactDetails } = req.body;
        const updatedContact = await addContactDetails(username, eventId, contactDetails)
        if (!updatedContact) {
            throw new Error('Contact Details Addition Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Contact Details Added',
                contactDetails: updatedContact
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})
EventRoute.put('/removeContact', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { eventId, contactDetails } = req.body;
        const updatedContact = await removeContactDetails(username, eventId, contactDetails)
        if (!updatedContact) {
            throw new Error('Contact Details Deletion Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Contact Details Deleted',
                contactDetails: updatedContact
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }

})

EventRoute.put('/checkIn', async (req, res) => {
    try {
        const { eventId, username } = req.body;
        if (eventId === undefined || typeof eventId !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Event ID'
                },
                error: true
            })
            return
        }
        if (username === undefined || typeof username !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Username'
                },
                error: true
            })
            return
        }
        const event = await checkInUser(username, eventId);
        if (!event) {
            throw new Error('Check In Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Checked In'
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }
})
EventRoute.put('/uncheckIn', async (req, res) => {
    try {
        const { eventId, username } = req.body;
        if (eventId === undefined || typeof eventId !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Event ID'
                },
                error: true
            })
            return
        }
        if (username === undefined || typeof username !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Username'
                },
                error: true
            })
            return
        }
        const event = await unCheckInUser(username, eventId);
        if (!event) {
            throw new Error('unCheck In Failed');
        }
        res.status(200).send({
            payload: {
                message: 'unChecked In'
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }
})

EventRoute.get('/getAteendees', async (req, res) => {
    try {
        const { eventId } = req.body;
        if (eventId === undefined || typeof eventId !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Event ID'
                },
                error: true
            })

        }
        const attendees = await getAttendees(eventId);
        if (!attendees) {
            throw new Error('Attendees Fetch Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Got attendees',
                attendees: attendees
            },
            error: false
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }
})
EventRoute.get('/getCheckins', async (req, res) => {
    try {
        const { eventId } = req.body;
        if (eventId === undefined || typeof eventId !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Event ID'
                },
                error: true
            })

        }
        const checkins = await getCheckIns(eventId);
        if (!checkins) {
            throw new Error('Checkins Fetch Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Got Checkins',
                checkins: checkins
            },
            error: false
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }
})
EventRoute.get('/getManagers', async (req, res) => {
    try {
        const { eventId } = req.body;
        if (eventId === undefined || typeof eventId !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Event ID'
                },
                error: true
            })

        }
        const managers = await getManagers(eventId);
        if (!managers) {
            throw new Error('Managers Fetch Failed');
        }
        res.status(200).send({
            payload: {
                message: 'Got managers',
                managers: managers
            },
            error: false
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: 'Internal Server Error: ' + error
            },
            error: true
        })
    }
})


export default EventRoute;