import { IGame } from "../../models/GameModel";
import { faker } from "@faker-js/faker";
import { NonWebGLBuilds, ExtendId } from "@/utils/types";
import mongoose from "mongoose";
import { GamesFilterOutput } from "../GameAction";
let salt = 0;
function createRandomGame(): GamesFilterOutput[number] {
  const appTypeValues = Object.values(NonWebGLBuilds);
  const numBuilds = faker.number.int({ min: 0, max: appTypeValues.length });
  salt++;
  const name = faker.person.fullName() + salt.toString();
  return {
    _id: new mongoose.Types.ObjectId().toString(),
    themes: [],
    tags: [],
    name: name,
    lowercaseName: name.toLowerCase(),
    description: faker.lorem.paragraph(),
    webGLBuild: faker.datatype.boolean(),
    remoteUrl: faker.datatype.boolean(),
    lesson: faker.internet.url(),
    parentingGuide: faker.internet.url(),
    answerKey: faker.internet.url(),
    image: faker.internet.url(),
    videoTrailer: faker.internet.url(),
    builds: Array.from({ length: numBuilds }).map(() => {
      return {
        _id: new mongoose.Types.ObjectId().toString(),
        type: faker.helpers.enumValue(NonWebGLBuilds),
        link: faker.internet.url(),
        instructions: faker.lorem.paragraph(),
      };
    }),
    preview: faker.datatype.boolean(),
  };
}
export const randomGames = (num: number) => {
  return Array.from({ length: num }).map(() => createRandomGame());
};
