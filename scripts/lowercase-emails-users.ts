import "dotenv/config";

import mongoose from "mongoose";
import connectMongoDB from "../src/server/db/mongodb";
import UserModel from "../src/server/db/models/UserModel";

(async () => {
  await connectMongoDB();
  try {
    console.log("Adding lowercaseEmail to users...");
    const result = await UserModel.updateMany(
      { lowercaseEmail: { $exists: false } },
      [
        {
          $set: {
            lowercaseEmail: { $toLower: "$email" },
          },
        },
      ],
    );
    console.log("Done!");
  } catch (e) {
    console.error("Migration failed: ", e);
  } finally {
    mongoose.connection.close();
  }
})();
