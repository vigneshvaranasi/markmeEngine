import ENV from "../configs/default";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getUserByUsername } from "../utils/dbUtils/userDBUtils";
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            username: string;
            email: string;
        };
    }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).send({
                payload: {
                    message: "Unauthorized Access",
                },
                error: true,
            });
            return;
        }
        const decoded: any = jwt.verify(token, ENV.JWT_SECRET!);
        const user: any = await getUserByUsername(decoded.username);
        if (!user) {
            res.status(401).send({
                payload: {
                    message: "Unauthorized Access",
                },
                error: true,
            });
            return;
        }
        req.user = {
            username: decoded.username,
            email: user.email
        };
        next();
    } catch (error) {
        console.error(error);
        res.status(500).send({
            payload: {
                message: "Internal Server Error" + error,
            },
            error: true,
        });
    }
};

export default verifyToken;