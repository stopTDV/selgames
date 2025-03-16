import pageAccessHOC from "@/components/HOC/PageAccess";
import EditModal from "@/components/Admin/AccountManagement/EditModal";
import DeleteModal from "@/components/Admin/AccountManagement/DeleteModal";
import { Button } from "@/components/ui/button";
import CrossIcon from "@/components/ui/icons/crossicon";
import WarningIcon from "@/components/ui/icons/warningicon";
import { IAdmin } from "@/server/db/models/AdminModel";
import AdminTabs from "@/components/Admin/AdminTabs";
import { Pages } from "@/utils/consts";
import { UNDELETABLE_EMAILS } from "@/utils/consts";
import { Box, Tooltip } from "@chakra-ui/react";
import { ObjectId } from "mongodb";
import { useEffect, useState } from "react";
import { Pencil, Trash } from "lucide-react";

export type Admin = IAdmin & { _id: ObjectId };

interface User {
  _id: string;
  email: string;
}

const AccountManagementPage = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newEmail, setNewEmail] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [editModalDisclosure, setEditModalDisclosure] = useState(false);
  const [deleteModalDisclosure, setDeleteModalDisclosure] = useState(false);
  const [chosenAdmin, setChosenAdmin] = useState<Admin | null>(null);

  const [adminRequestedUsers, setAdminRequestedUsers] = useState<User[]>([]);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const promise = await fetch("../api/admin");
      const data = await promise.json();
      const removableAdmins = data.filter(
        (admin: Admin) => !UNDELETABLE_EMAILS.includes(admin.email),
      );

      const response = await fetch("../api/users/adminRequests");
      const requestUsers: User[] = await response.json();
      setAdminRequestedUsers(requestUsers);
      setAdmins(removableAdmins);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [editModalDisclosure, deleteModalDisclosure, triggerFetch]);

  const handleAction = async (userID: string, action: "approve" | "deny") => {
    try {
      const response = await fetch("/api/users/adminRequests/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userID, action }),
      });

      if (response.ok) {
        setAdminRequestedUsers((prev) =>
          prev.filter((user) => user._id !== userID),
        );
        setTriggerFetch(!triggerFetch);
      }
    } catch (err) {
      console.error("Error processing user action:", err);
    }
  };

  return (
    <AdminTabs page={Pages.ACCOUNTMANAGEMENT}>
      <div className="px-18 my-6 flex flex-col">
        <div className="flex flex-col gap-6">
          <div className="font-['Poppins'] text-[24pt] font-semibold text-[#1A222B]">
            Approve Requested Admins
          </div>
          <div className="rounded-[8px] border border-[#E2EFFF]">
            <div className="font-['DM Sans'] mx-1 flex flex-row items-center justify-between text-base font-medium leading-7 text-slate-400 ">
              <div className="flex items-center py-3 pl-6 font-inter text-14pt font-medium text-[#7A8086]">
                Email
              </div>
              <div className="flex items-center py-3 pr-6 font-inter text-14pt font-medium text-[#7A8086]">
                Approve or Deny
              </div>
            </div>
            <div className=" border border-[#E2EFFF]"></div>
            {adminRequestedUsers.map((user, index) => {
              return (
                <div
                  className="flex flex-row justify-between border-b border-[#E2EFFF] p-6"
                  key={index}
                >
                  <div className="text-md break-all font-inter text-[#384414B]">
                    {user.email}
                  </div>
                  <div className="flex gap-4 pr-4">
                    <Button
                      variant="mainorange"
                      className="text-base"
                      onClick={() => {
                        handleAction(user._id, "approve");
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="gray"
                      className="text-base"
                      onClick={() => {
                        handleAction(user._id, "deny");
                      }}
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mb-6 mt-12 font-['Poppins'] text-[24pt] font-semibold text-[#1A222B]">
          Manage Admin Accounts
        </div>
        <div className="rounded-[8px] border border-[#E2EFFF]">
          <div className="font-['DM Sans'] mx-1 flex flex-row items-center justify-between text-base font-medium leading-7 text-slate-400 ">
            <div className="flex items-center py-3 pl-6 font-inter text-14pt font-medium text-[#7A8086]">
              Email
            </div>
            <div className="flex items-center py-3 pr-6 font-inter text-14pt font-medium text-[#7A8086]">
              Edit & Delete
            </div>
          </div>
          <div className=" border border-[#E2EFFF]"></div>
          {[...UNDELETABLE_EMAILS, ...admins.map((admin) => admin.email)].map(
            (email, index) => {
              const isUndeletable = index < UNDELETABLE_EMAILS.length;
              return (
                <div
                  className="flex flex-row justify-between border-b border-[#E2EFFF] p-6"
                  key={index}
                >
                  <div className="text-md break-all font-inter text-[#384414B]">
                    {email}
                  </div>
                  {isUndeletable ? (
                    <div className="flex gap-4 pr-4">
                      <Pencil color="#A3AED0" />

                      <Tooltip
                        className="rounded-lg bg-white p-3  text-xs shadow-md"
                        label="This email cannot be removed"
                        placement="bottom"
                        hasArrow
                        arrowSize={16}
                      >
                        <Trash color="#A3AED0" />
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="flex gap-4 pr-4">
                      <Pencil
                        className="cursor-pointer text-blue-primary"
                        onClick={() => {
                          const selectedAdmin = admins.find(
                            (admin) => admin.email === email,
                          );
                          setChosenAdmin(selectedAdmin ? selectedAdmin : null);
                          setEditModalDisclosure(true);
                        }}
                      />
                      <Trash
                        color="#8b0000"
                        className="cursor-pointer"
                        onClick={() => {
                          const selectedAdmin = admins.find(
                            (admin) => admin.email === email,
                          );
                          setChosenAdmin(selectedAdmin ? selectedAdmin : null);
                          setDeleteModalDisclosure(true);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>
      </div>
      <EditModal
        open={editModalDisclosure}
        setOpen={setEditModalDisclosure}
        admin={chosenAdmin}
        fetchData={fetchData}
      />
      <DeleteModal
        open={deleteModalDisclosure}
        setOpen={setDeleteModalDisclosure}
        admin={chosenAdmin}
        fetchData={fetchData}
      />
    </AdminTabs>
  );
};

export default pageAccessHOC(AccountManagementPage);
