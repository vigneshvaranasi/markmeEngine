import { Router } from "express";
import { createSpace,deleteSpaceById,updateSpaceDetails } from "../../utils/dbUtils";
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

// Update Space Details
SpaceRouter.put('/update', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const {spaceId,spaceDetails} = req.body;        
        await updateSpaceDetails(username,spaceId,spaceDetails);
        res.send({
            payload: { 
                message: "Space Details Updated"
            }
        });
    } catch (err) {
      console.error(err);
      res.status(500).send({
        payload: { message: "Internal Server Error" },
        error: true,
      });
    }
});

// Delete Space
SpaceRouter.delete('/delete', async (req, res) => {
    try {
        const {spaceId} = req.body;
        const username = req.user?.username as string;
        await deleteSpaceById(spaceId,username);
        res.send({
            payload: { 
                message: "Space Deleted Successfully" 
            },
            error: false,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: { 
                message: "Internal Server Error" 
            },
            error: true,
        });
    }
});

export default SpaceRouter;