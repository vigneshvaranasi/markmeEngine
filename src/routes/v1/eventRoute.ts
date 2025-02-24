import express, { Router } from 'express'
import verifyToken from '../../middleware/userMiddleware';
import { CreateEventBody, EventType } from '../../types/EventTypes';
import { createEvent, getAllEvents } from '../../utils/dbUtils/eventDBUtils';
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
        }
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
})

export default EventRoute;