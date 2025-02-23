import { Router } from "express";
import Space from "../../models/Space";
import { createSpace, followSpace } from "../../utils/dbUtils";
import verifyToken from "../../middleware/userMiddleware";
const SpaceRouter = Router();

SpaceRouter.get("/", (req, res) => {
  res.send("Space Route");
});

SpaceRouter.use(verifyToken);

// Create Space
SpaceRouter.post('/create', async(req,res)=>{
    try{
        const {name, icon, admin}: {name: string, icon: string, admin: string[]} = req.body;
        if(name === undefined || icon === undefined || admin === undefined){
            res.status(400).send({
                payload:{
                    message: "Please Provide All Required Fields"
                },
                error: true
            })
            return;
        }
        const username = req.user?.username as string;
        const space = await createSpace(username,name, icon, admin);
        res.send({
            payload:{
                message: "Space Created Successfully",
                space: {
                    name: space?.name,
                    icon: space?.icon,
                    admins: space?.admins,
                    followers: space?.followers,

                }
            }
        })
    }catch(err){
        console.error(err);
        res.status(500).send({
            payload:{
                message: "Internal Server Error: "+err
            },
            error: true
        })
    }
})




export default SpaceRouter;