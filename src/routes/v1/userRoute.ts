import express, { Router, Request } from "express";
import ENV from './../../configs/default';
import verifyToken from "../../middleware/userMiddleware";


const UserRouter = Router();
import { updateUserNotification, addAction, updateUserEmail, updateUserFullname, updateUserProfilePhoto, updateUserPassword, getSpaceById } from "../../utils/dbUtils";

UserRouter.get('/', (req, res) => {
    res.send('User Route');
});

UserRouter.use(verifyToken);
UserRouter.put('/set/notification', async (req, res) => {
    try {
        const { notification } = req.body;
        if (notification === undefined || typeof notification !== 'boolean') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Notification'
                },
                error: true
            })
            return
        }
        const username = req.user?.username as string;
        await updateUserNotification(username, notification);
        await addAction(username, `Notification Set to ${notification ? 'ON' : 'OFF'}`);
        // TODO : Update in Sevice
        res.send({
            payload: {
                message: `Notification Set to ${notification ? 'ON' : 'OFF'}`
            },
            error: false
        })
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: "Internal Server Error: " + error
            },
            error: true
        })
    }
})

UserRouter.put('/set/updateName', async (req, res) => {
    try {
        const { fullname } = req.body;
        if (fullname === undefined || typeof fullname !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Full Name'
                },
                error: true
            })
            return
        }
        const username = req.user?.username as string;
        await updateUserFullname(username, fullname);
        await addAction(username, `Full Name Updated to ${fullname}`);
        res.send({
            payload: {
                message: `Full Name Updated to ${fullname}`
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: "Internal Server Error: " + err
            },
            error: true
        })
    }
})

UserRouter.put('/set/updateProfilePhoto', async (req, res) => {
    try {
        const { profilePhoto } = req.body;
        if (profilePhoto === undefined || typeof profilePhoto !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Profile Photo'
                },
                error: true
            })
            return
        }
        const username = req.user?.username as string;
        await updateUserProfilePhoto(username, profilePhoto);
        await addAction(username, `Profile Photo Updated to ${profilePhoto}`);
        res.send({
            payload: {
                message: `Profile Photo Updated to ${profilePhoto}`
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: "Internal Server Error: " + err
            },
            error: true
        })
    }
})

UserRouter.put('/set/updatePassword', async (req, res) => {
    try {
        const { password } = req.body;
        if (password === undefined || typeof password !== 'string') {
            res.status(400).send({
                payload: {
                    message: 'Please Provide Password'
                },
                error: true
            })
            return
        }
        const username = req.user?.username as string;
        await updateUserPassword(username, password);
        await addAction(username, `Password Updated`);
        res.send({
            payload: {
                message: `Password Updated`
            },
            error: false
        })
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: "Internal Server Error: " + err
            },
            error: true
        })
    }
})

// Follow Space
UserRouter.put('/space/follow',async (req,res)=>{
    try{
        const {spaceId} =  req.body;
        if(getSpaceById(spaceId) === undefined){
            res.status(400).send({
                payload: {
                    message: 'Invalid Space ID'
                },
                error: true
            })
            return
        }
        else{
            
        }
    }
    catch(err){
        console.error(err);
        res.status(500).send({
            payload: {
                message: "Internal Server Error: " + err
            },
            error: true
        })
    }
})

export default UserRouter;