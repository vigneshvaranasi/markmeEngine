import { Router } from "express";
import { createSpace, deleteSpaceById, getFullSpaceById, getSpaceById, updateSpaceDetails } from "../../utils/dbUtils/spaceDBUtils";
import verifyToken from "../../middleware/userMiddleware";
import { addAction } from "../../utils/dbUtils/actionDBUtils";
const SpaceRouter = Router();

SpaceRouter.get("/", (req, res) => {
    res.send("Space Route");
});

SpaceRouter.use(verifyToken);

// get Space by ID
SpaceRouter.get('/get/:id',async (req,res)=>{
    try {
        const { id } = req.params;
        if (id === undefined) {
            res.status(400).send({
                payload: {
                    message: "Please Provide Space Id"
                },
                error: true
            });
            return;
        }
        const space = await getFullSpaceById(id);
        if (!space) {
            res.status(400).send({
                payload: {
                    message: "Space Not Found"
                },
                error: true
            });
            return;
        }
        res.send({
            payload: {
                space: space
            },
            error: false
        });
    } catch (err) {
        console.error(err);
        res.status(500).send({
            payload: {
                message: "Internal Server Error"
            },
            error: true
        });
    }
})

// Create Space
SpaceRouter.post('/create', async (req, res) => {
    try {
        const { name, icon, admin }: { name: string, icon: string, admin: string[] } = req.body;
        if (name === undefined || icon === undefined || admin === undefined) {
            res.status(400).send({
                payload: {
                    message: "Please Provide All Required Fields"
                },
                error: true
            })
            return;
        }
        const username = req.user?.username as string;
        const space = await createSpace(username, name, icon, admin);
        if (!space) {
            throw new Error("Space Creation Failed")
        }
        await addAction(username, `Space Created: ${name}`);
        res.send({
            payload: {
                message: "Space Created Successfully",
                space: {
                    name: space?.name,
                    icon: space?.icon,
                    admins: space?.admins,
                    followers: space?.followers,
                }
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

// Update Space Details
SpaceRouter.put('/update', async (req, res) => {
    try {
        const username = req.user?.username as string;
        const { spaceId, spaceDetails } = req.body;
        if (spaceId === undefined) {
            res.status(400).send({
                payload: {
                    message: "Please Provide Space Id"
                },
                error: true
            });
            return;
        }
        if (spaceDetails === undefined) {
            res.status(400).send({
                payload: {
                    message: "Please Provide Space Details"
                },
                error: true
            });
            return;
        }

        const updatedSpace=await updateSpaceDetails(username, spaceId, spaceDetails);
        if(updatedSpace){
            await addAction(username, `Update Space Details ${spaceDetails.name} of id: ${spaceDetails.id}`);
            res.send({
                payload: {
                    message: "Space Details Updated"
                },
                error: false
            });
            return;
        }else{
            res.status(400).send({
                payload: {
                    message: "Update not Possible right now"
                },
                error: true
            });
            return;
        }
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
        const { spaceId } = req.body;
        const username = req.user?.username as string;
        if (spaceId === undefined) {
            res.status(400).send({
                payload: {
                    message: "Please Provide Space Id"
                },
                error: true
            });
            return;
        }

        await deleteSpaceById(spaceId, username);
        await addAction(username, `Deleted Space of id: ${spaceId}`);
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