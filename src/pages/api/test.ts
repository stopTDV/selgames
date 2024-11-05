import connectMongoDB from "@/server/db/mongodb";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { testConnection, testRender } = req.query;

  try {
    if (testConnection === "true") {
      await connectMongoDB();
      return res.status(HTTP_STATUS_CODE.OK).json({
        message: "Database connection successful",
      });
    }

    if (testRender === "true") {
      return res.status(HTTP_STATUS_CODE.OK).json({
        message: "Render test successful",
      });
    }

    return res.status(HTTP_STATUS_CODE.BAD_REQUEST).json({
      error: "No test parameter specified",
    });
  } catch (error: any) {
    return res.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).json({
      error: error.message,
    });
  }
}
