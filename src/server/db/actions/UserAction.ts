import { z } from "zod";
import UserModel from "../models/UserModel";
import connectMongoDB from "../mongodb";
import { createUserSchema } from "@/pages/api/users";
import bcrypt from "bcrypt";
import { MongoError } from "mongodb";
import { changePWSchema, userSchema } from "@/utils/types";
import {
  UserAlreadyExistsException,
  UserDoesNotExistException,
  UserCredentialsIncorrectException,
  GenericUserErrorException,
} from "@/utils/exceptions/user";

const SALT_ROUNDS = 10;
const DUP_KEY_ERROR_CODE = 11000;
const idSchema = z.string().length(24);

export async function createUser(data: z.infer<typeof createUserSchema>) {
  await connectMongoDB();

  const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
  const lowercaseEmail = data.email.toLowerCase();

  const userData: z.infer<typeof userSchema> = {
    ...data,
    lowercaseEmail,
    hashedPassword,
    notes: [],
  };

  try {
    return await UserModel.create(userData);
  } catch (e: unknown) {
    let mongoErr = e as MongoError;
    if (
      mongoErr.name === "MongoServerError" &&
      mongoErr.code === DUP_KEY_ERROR_CODE
    ) {
      // Determine if that existing user was deleted or not.
      const existingUser = await UserModel.findOne({
        lowercaseEmail: userData.lowercaseEmail,
      });
      if (existingUser && existingUser.markedToDelete) {
        userData.notes = existingUser.notes; //Transfer deleted notes
        // Update old account
        const result = await UserModel.findByIdAndUpdate(
          existingUser._id,
          { $set: userData, $unset: { markedToDelete: null } },
          {
            new: true,
          },
        ).select("-hashedPassword");

        if (result) {
          return result;
        }
      }
      throw new UserAlreadyExistsException();
    }
    throw e;
  }
}

export async function verifyUser(email: string, password: string) {
  await connectMongoDB();

  const user = await UserModel.findOne(
    {
      lowercaseEmail: email.toLowerCase(),
    },
    { __v: 0 },
  );
  if (!user || user.markedToDelete) throw new UserDoesNotExistException();

  const match = await bcrypt.compare(password, user.hashedPassword);
  if (!match) throw new UserCredentialsIncorrectException();

  const { hashedPassword, ...nonSensitiveUser } = user.toObject();

  return {
    ...nonSensitiveUser,
    _id: nonSensitiveUser._id.toString(),
  };
}

/**
 * Gets a user by their ID.
 * @param {z.infer<typeof idSchema>} id ID of the user to get.
 * @throws {UserDoesNotExistException} If unable to find user
 */
export async function getUser(id: z.infer<typeof idSchema>) {
  await connectMongoDB();
  const user = await UserModel.findById(id).select("-hashedPassword");
  if (!user || user.markedToDelete) {
    throw new UserDoesNotExistException();
  }
  return user;
}

/**
 * Gets a user by their email.
 * @param {z.infer<typeof idSchema>} email Email of the user to get.
 * @throws {UserDoesNotExistException} If unable to find user
 */
export async function getUserByEmail(email: string) {
  await connectMongoDB();
  const user = await UserModel.findOne({
    lowercaseEmail: email.toLowerCase(),
  }).select("-hashedPassword");
  if (!user || user.markedToDelete) {
    throw new UserDoesNotExistException();
  }
  return user;
}

/**
 * Gets user names from list of IDs.
 * @param {string[]} userIds Array of user IDs.
 */
export async function getUserNames(userIds: string[]) {
  await connectMongoDB();

  const users = await UserModel.find(
    { _id: { $in: userIds } },
    { _id: 1, firstName: 1, lastName: 1 },
  );

  const names = users.reduce(
    (acc, user) => {
      acc[user._id.toString()] = `${user.firstName} ${user.lastName}`;
      return acc;
    },
    {} as Record<string, string>,
  );

  return names;
}

/**
 * Edits a user.
 * @param {z.infer<typeof userSchema> & { _id: z.infer<typeof idSchema> }} userInfo Info of the user to find/update.
 * @throws {GenericUserErrorException} If changing email to an email that corresponds to a pre-existing account
 * @throws {UserDoesNotExistException} If unable to find user
 *
 */
export async function editUser(
  userInfo: z.infer<typeof userSchema> & { _id: z.infer<typeof idSchema> },
) {
  await connectMongoDB();
  if (!userInfo.notes) {
    userInfo.notes = [];
  }
  const existingUser = await UserModel.findOne({
    lowercaseEmail: userInfo.email.toLowerCase(),
  });

  if (existingUser && existingUser.toObject()._id.toString() != userInfo._id) {
    if (existingUser.markedToDelete) {
      // Transfer notes info and delete old user

      userInfo.notes = [...userInfo.notes, ...existingUser.notes];
      await UserModel.findByIdAndDelete(existingUser.id);
    } else {
      throw new UserAlreadyExistsException();
    }
  }
  userInfo.lowercaseEmail = userInfo.email.toLowerCase();
  // Ensures new notes don't overide old ones
  const { notes, ...newUserInfo } = userInfo;
  console.log(notes);
  const result = await UserModel.findByIdAndUpdate(
    userInfo._id,
    { $set: newUserInfo, $push: { notes: { $each: notes } } },
    {
      new: true,
    },
  ).select("-hashedPassword");

  if (!result) {
    throw new UserDoesNotExistException();
  }
  return result;
}

/**
 * Edits user password.
 * @param {z.infer<typeof changePWSchema>} passwordInfo Password info of user.
 * @param {string} id ID of the user.
 * @throws {UserDoesNotExistException} If unable to find user
 * @throws {UserCredentialsIncorrectException} If old password doesn't match user's current password
 * @throws {GenericServerErrorException} If unable to update user
 */
export async function editPassword(
  passwordInfo: z.infer<typeof changePWSchema>,
  id: string,
) {
  await connectMongoDB();
  const user = await UserModel.findById(id);
  if (!user || user.markedToDelete) {
    throw new UserDoesNotExistException();
  }

  // Compare the old password provided by the user with the hashed password stored in the database
  const oldPasswordMatch = await bcrypt.compare(
    passwordInfo.oldpassword,
    user.hashedPassword,
  );
  if (!oldPasswordMatch) {
    throw new UserCredentialsIncorrectException();
  }

  const hashedPassword = await bcrypt.hash(passwordInfo.password, SALT_ROUNDS);

  // Update the user's password
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { $set: { hashedPassword } },
    { new: true },
  );

  // Check if user was able to be found/updated
  if (!updatedUser) {
    throw new UserDoesNotExistException();
  }
}

/**
 * Resets user password with token
 * TODO: Update to accept token and verify that token matches created token for password reset.
 *       Otherwise, this route should NOT be used in production, since it does not require proper verification.
 *       Next dev: Change newPassword to match a similar structure as passwordInfo as shown in editPassword,
 *       instead taking in a token for verification and handling the token flow for proper verification/deletion
 *       after use.
 * @param {string} newPassword The new password to set for the user.
 * @param {string} id ID of the user.
 * @throws {UserDoesNotExistException} If unable to find user.
 * @throws {GenericUserErrorException} If unable to update user.
 */
export async function resetPassword(newPassword: string, id: string) {
  await connectMongoDB();

  const user = await UserModel.findById(id);
  if (!user || user.markedToDelete) {
    throw new UserDoesNotExistException();
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { $set: { hashedPassword } },
    { new: true },
  );

  if (!updatedUser) {
    throw new GenericUserErrorException();
  }
}

/**
 * Delete a user by their ID.
 * @param {z.infer<typeof idSchema>} id ID of the user to delete.
 * @throws {UserDoesNotExistException} If unable to find user
 */
export async function deleteUser(id: z.infer<typeof idSchema>) {
  await connectMongoDB();
  const date = new Date();
  date.setDate(date.getDate() + 30); //Expiration date is 30 days from when the account has been deleted.
  //Also needs to set markedToDelete flag on all of the items in the notes list
  const user = await UserModel.findByIdAndUpdate(
    id,
    {
      $set: {
        markedToDelete: date,
        "notes.$[elem].markedToDelete": date,
      },
    },
    {
      new: true,
      runValidators: true,
      arrayFilters: [{ "elem.markedToDelete": { $exists: false } }],
    },
  ).select("-hashedPassword");
  if (!user) {
    throw new UserDoesNotExistException();
  }
  return user;
}

/**
 * Permanently deletes all users and notes that should have been deleted 30 days ago.
 */
export async function deleteUsersGDPR() {
  await connectMongoDB();
  //Delete all users where curr_date is gt than expiration date
  const curr_date = new Date();
  const deletedUsers = await UserModel.deleteMany({
    markedToDelete: { $lte: curr_date },
  }); //Replace with findMany for testing.
  //Delete all notes in users where curr_dae is gt than expiration date
  //This only occurs for users that have been recreated but still have notes that must be deleted
  const deletedNotes = await UserModel.updateMany({
    $pull: { notes: { markedToDelete: { $lte: curr_date } } },
  });
  return {
    deletedUsersCount: deletedUsers.deletedCount,
    usersWithDeletedNotesCount: deletedNotes.modifiedCount,
  };
}
