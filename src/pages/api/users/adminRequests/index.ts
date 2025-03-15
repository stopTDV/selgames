import { NextApiRequest, NextApiResponse } from "next";
import UserModel from "@/server/db/models/UserModel";
import { HTTP_STATUS_CODE } from "@/utils/consts";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    try {
      const users = await UserModel.find({ adminRequest: true });

      if (users.length === 0) {
        return res.status(HTTP_STATUS_CODE.OK).json([]);
      }
      return res.status(HTTP_STATUS_CODE.OK).json(users);
    } catch (error) {
      return res
        .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal Server Error" });
    }
  }
}
