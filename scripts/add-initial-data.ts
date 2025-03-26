import "dotenv/config";
import { UNDELETABLE_EMAILS } from "@/utils/consts";
import { AdminAlreadyExistsException } from "@/utils/exceptions/admin";
import mongoose from "mongoose";
import AdminModel from "@/server/db/models/AdminModel";
import HomePageModel from "@/server/db/models/HomePageModel";
import GameModel from "@/server/db/models/GameModel";
import { AllBuilds } from "@/utils/types";

const addNondeletableEmails = async () => {
  for (const email of UNDELETABLE_EMAILS) {
    const admin = { email: email, lowercaseEmail: email.toLowerCase() };
    try {
      const existingAdmin = await AdminModel.findOne({
        lowercaseEmail: admin.email.toLowerCase(),
      });
      if (existingAdmin) throw new AdminAlreadyExistsException();
      await AdminModel.create(admin);
      console.log(`Admin ${admin.email} has been added to database.`);
    } catch (e) {
      if (e instanceof AdminAlreadyExistsException) {
        console.log(
          `Admin ${admin.email} has already been added to database before.`,
        );
      } else {
        console.log(
          `Admin ${admin.email} could not be added to database. Please try again.`,
        );
        console.log(e);
      }
    }
  }
};

const addGameboyData = async () => {
  const gameBoy = {
    mdTitle: "Title",
    mdDescription: "**Description**",
    gameBoyTitle: "Check out what's new!",
    gameBoys: [
      {
        description: "Description of Game 1",
      },
      {
        description: "Description of Game 2",
      },
      {
        description: "Description of Game 3",
      },
    ],
    singleton: true,
  };
  try {
    await HomePageModel.create(gameBoy);
    console.log("Gameboy data has been added to database.");
  } catch (e) {
    console.log(
      "Gameboy data either could not be added to database or is already there. Please try again.",
    );
  }
};

const addInitialGame = async () => {
  const game = {
    name: "Sample Game",
    lowercaseName: "sample game",
    description:
      "This is a sample game to demonstrate the platform's capabilities.",
    webGLBuild: false,
    remoteUrl: false,
    builds: [
      {
        type: AllBuilds.windows,
        link: "https://example.com/sample-game-windows",
        instructions: "Download and run the installer",
      },
    ],
    lesson: "https://example.com/sample-lesson",
    parentingGuide: "https://example.com/sample-parenting-guide",
    answerKey: "https://example.com/sample-answer-key",
    videoTrailer: "https://example.com/sample-trailer",
    preview: false,
    image: "https://example.com/sample-image.jpg",
    popularity: 0,
  };

  try {
    await GameModel.create(game);
    console.log("Initial game has been added to database.");
  } catch (e) {
    console.log(
      "Initial game could not be added to database or already exists.",
    );
    console.log(e);
  }
};

const addAllData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    // add emails admins cannot delete from database
    await addNondeletableEmails();
    // add data for gameboys in home page
    await addGameboyData();
    // add initial game
    await addInitialGame();
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  } finally {
    mongoose.connection.close();
  }
};

addAllData();
