import ENV from "../configs/default";
import { Request, Response, NextFunction } from "express";
import { getEventById } from "../utils/dbUtils/eventDBUtils";

export const isEventManager = async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const user = req.user?.username as string;
        const eventId = req.body.eventId;
        const event = await getEventById(eventId);
        if(!event){
            throw new Error('Event not found');
        }
        const isUserManager = event.managers.some((manager: any)=>{
            return manager.username === user;
        })
        if(!isUserManager){
            throw new Error('You are not a manager of this event');
        }
        next();
    }catch(err){
        console.error(err);
        res.status(401).send({
            payload:{
                message: 'Unauthorized: ' + err
            },
            error: true
        })
    }
}