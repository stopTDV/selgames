import { NextApiRequest, NextApiResponse } from "next";
import UserModel from "@/server/db/models/UserModel";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import AdminModel from "@/server/db/models/AdminModel";
import { authenticate } from "../../auth/[...nextauth]";
import connectMongoDB from "@/server/db/mongodb";

export enum Label {
  Student = "student",
  Parent = "parent",
  Educator = "educator",
  Administrator_Awaiting_Approval = "administrator_awaiting_approval",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  authenticate(req, res, ["GET", "POST"], true);

  if (req.method === "GET") {
    try {
      await connectMongoDB();
      const users = await UserModel.find({
        label: Label.Administrator_Awaiting_Approval,
      });
      return res.status(HTTP_STATUS_CODE.OK).json(users);
    } catch (error) {
      return res
        .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }
}
