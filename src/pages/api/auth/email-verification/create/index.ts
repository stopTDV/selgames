import { NextApiRequest, NextApiResponse } from "next";
import z from "zod";

import { HTTP_STATUS_CODE } from "@/utils/consts";
import { createEmailVerificationLog } from "@/server/db/actions/VerificationLogAction";
import { sendEmailVerificationEmail } from "@/server/db/actions/EmailAction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "POST":
      return sendEmailVerificationEmailHandler(req, res);
    default:
      return res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).json({
        error: `Request method ${req.method} is not allowed`,
      });
  }
}

const emailObject = z.object({
  email: z.string().email("Email is not valid"),
});

export type EmailData = z.infer<typeof emailObject>;
async function sendEmailVerificationEmailHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let email;
  try {
    const parsedResult = emailObject.safeParse(JSON.parse(req.body));
    if (parsedResult.success) {
      email = parsedResult.data.email;
    } else {
      return res
        .status(HTTP_STATUS_CODE.BAD_REQUEST)
        .send({ message: "Invalid Email" });
    }
    const emailVerificationLog = await createEmailVerificationLog(email);
    await sendEmailVerificationEmail(email, emailVerificationLog.token);

    return res
      .status(HTTP_STATUS_CODE.CREATED)
      .send({ message: "Succesfully sent email verification email" });
  } catch (e: any) {
    console.error(e);
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}
