import mongoose, { Schema } from "mongoose";
import { z } from "zod";
import { buildSchema, gameSchema, AllBuilds } from "../../../utils/types";
import { ITheme } from "./ThemeModel";
import { ITag } from "./TagModel";

export interface IGame extends z.infer<typeof gameSchema> {}
export type populatedGame = Omit<IGame, "tags" | "themes"> & {
  tags: ITag[];
} & { themes: ITheme[] };
export type populatedGameWithId = Omit<IGame, "tags" | "themes"> & {
  tags: (ITag & { _id: string })[];
  themes: (ITheme & { _id: string })[];
};

export interface IBuild extends z.infer<typeof buildSchema> {}

//You must use mongoose.Schema.Types.ObjectId when defining Schemas that contain an ObjectId.
const BuildSchema = new Schema<IBuild>({
  type: { type: String, enum: Object.values(AllBuilds), required: true },
  link: { type: String, required: true },
  instructions: { type: String },
});

const GameSchema = new Schema<IGame>(
  {
    name: { type: String, required: true, unique: true },
    lowercaseName: {
      type: String,
      required: true,
      select: false,
    },
    themes: {
      type: [Schema.Types.ObjectId],
      ref: "Theme",
      default: [],
      required: false,
    },
    tags: {
      type: [Schema.Types.ObjectId],
      ref: "Tag",
      default: [],
      required: false,
    },
    description: { type: String, required: true },
    webGLBuild: { type: Boolean, default: false },
    remoteUrl: { type: Boolean, default: false },
    builds: { type: [BuildSchema], default: [] },
    lesson: { type: String },
    parentingGuide: { type: String },
    answerKey: { type: String },
    videoTrailer: { type: String },
    preview: { type: Boolean, required: true },
    image: { type: String, required: true },
    popularity: { type: Number, default: 0 },
  },
  { versionKey: false },
);

const GameModel =
  (mongoose.models.Game as mongoose.Model<IGame>) ??
  mongoose.model("Game", GameSchema);

export default GameModel;
