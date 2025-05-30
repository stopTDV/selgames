import { NextApiResponse, NextApiRequest } from "next";
import { deleteTag } from "@/server/db/actions/TagAction";
import { ObjectId } from "mongodb";
import {
  TagInvalidInputException,
  TagNotFoundException,
  TagException,
} from "@/utils/exceptions/tag";
import { HTTP_STATUS_CODE } from "@/utils/consts";
import { authenticate } from "../../auth/[...nextauth]";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //Authentication
  //Authentication
  const authenticated = await authenticate(req, res, ["DELETE"], true);
  if (authenticated !== true) {
    return authenticated;
  }
  switch (req.method) {
    case "DELETE":
      return deleteTagHandler(req, res);
    default:
      return res.status(HTTP_STATUS_CODE.METHOD_NOT_ALLOWED).send({
        error: `Request method ${req.method} is not allowed`,
      });
  }
}

async function deleteTagHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const potential_id = req.query.id;
    if (!potential_id || Array.isArray(potential_id)) {
      throw new TagInvalidInputException();
    }

    const id: string = potential_id;
    if (!ObjectId.isValid(id)) {
      throw new TagNotFoundException();
    }

    const deletedTag = await deleteTag(id);
    return res.status(HTTP_STATUS_CODE.OK).send(deletedTag);
  } catch (e: any) {
    if (e instanceof TagException) {
      return res.status(e.code).send({ error: e.message });
    }
    return res
      .status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR)
      .send({ error: e.message });
  }
}
