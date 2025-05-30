import { ObjectId } from "mongodb";
import AdminModel, { IAdmin } from "../models/AdminModel";
import connectMongoDB from "../mongodb";
import {
  AdminAlreadyExistsException,
  AdminDoesNotExistException,
} from "@/utils/exceptions/admin";
import UserModel from "../models/UserModel";
import { UserLabel } from "@/utils/types";

export async function createAdmin(data: IAdmin) {
  await connectMongoDB();
  data.lowercaseEmail = data.email.toLowerCase();
  const existingAdmin = await AdminModel.findOne({
    lowercaseEmail: data.email.toLowerCase(),
  });
  if (existingAdmin) throw new AdminAlreadyExistsException();
  try {
    const admin = await AdminModel.create(data);
    const correspondingUser = await UserModel.findOne({
      lowercaseEmail: admin.lowercaseEmail,
    });
    if (correspondingUser) {
      await UserModel.findByIdAndUpdate(correspondingUser._id, {
        label: UserLabel.Administrator,
      });
    }
    return admin.toObject();
  } catch (e) {
    throw e;
  }
}

export async function deleteAdmin(data: ObjectId) {
  await connectMongoDB();
  try {
    const admin = await AdminModel.findById(data);
    if (!admin) {
      throw new AdminDoesNotExistException();
    }
    const deletedAdmin = await AdminModel.findOneAndDelete({
      lowercaseEmail: admin.email.toLowerCase(),
    });
    if (!deletedAdmin) {
      throw new AdminDoesNotExistException();
    }
    const correspondingUser = await UserModel.findOne({
      lowercaseEmail: admin.email.toLowerCase(),
    });
    if (correspondingUser) {
      await UserModel.findByIdAndUpdate(correspondingUser._id, {
        label: UserLabel.Student,
      });
    }
    return deletedAdmin.toObject();
  } catch (e) {
    throw e;
  }
}

export async function getAdminByEmail(email: string) {
  await connectMongoDB();
  try {
    const admin = await AdminModel.findOne({
      lowercaseEmail: email.toLowerCase(),
    });
    return admin ? admin : {};
  } catch (e) {
    throw e;
  }
}

export async function getAllAdmins() {
  await connectMongoDB();
  try {
    const admins = await AdminModel.find({}).sort({ lowercaseEmail: 1 });
    return admins ? admins : {};
  } catch (e) {
    throw e;
  }
}
