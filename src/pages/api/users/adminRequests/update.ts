import { NextApiRequest, NextApiResponse } from "next";
import UserModel from "@/server/db/models/UserModel";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import AdminModel from "@/server/db/models/AdminModel";
import { authenticate } from "../../auth/[...nextauth]";
import connectMongoDB from "@/server/db/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  authenticate(req, res, ["POST"], true);
  if (req.method === "POST") {
    await connectMongoDB();
    const { userID, action } = req.body;

    if (!userID || !action) {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ Message: "User ID and action are required" });
    }

    if (action !== "approve" && action !== "deny") {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .json({ Message: "Invalid Action: Must be 'approve' or 'deny'" });
    }

    try {
      const user = await UserModel.findById(userID);
      if (!user) {
        return res
          .status(HTTP_STATUS_CODE.NOT_FOUND)
          .json({ Message: "User not found" });
      }

      if (action === "approve") {
        await AdminModel.create({
          email: user.email,
          lowercaseEmail: user.lowercaseEmail,
        });
        await UserModel.updateOne(
          { _id: userID },
          { $set: { label: "administrator" } },
        );
      } else if (action === "deny") {
        await UserModel.updateOne(
          { _id: userID },
          { $set: { label: "student" } },
        );
      }
      return res.status(HTTP_STATUS_CODE.OK).json({ Message: "Success" });
    } catch (error) {
      return res
        .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }
}
