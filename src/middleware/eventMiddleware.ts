import ENV from "../configs/default";
import { Request, Response, NextFunction } from "express";
import { getEventById } from "../utils/dbUtils/eventDBUtils";
import { getUserByUsername } from "../utils/dbUtils/userDBUtils";

export const isEventManager = async(req: Request, res: Response, next: NextFunction) =>{
    try{
        const user = req.user?.username as string;
        const userId = await getUserByUsername(user);
        if(!userId){
            throw new Error('User not found');
        }
        const eventId = req.body.eventId;
        const event = await getEventById(eventId);
        if(!event){
            throw new Error('Event not found');
        }
        let isUserManager = event.managers.some((manager: any)=>{
            return manager.username === user;
        });
        if(!event.spaceId){
            throw new Error('Event does not belong to any space');
        }
        let spaceAdmins = (event.spaceId as any).admins;
        let isSpaceAdmin = spaceAdmins.some((admin:any)=>{
            return admin.toString()===userId._id.toString();
        })
        isUserManager = isUserManager || isSpaceAdmin;
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