import { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  adminRequested: boolean;
}

export default function AdminPortal() {
  const [users, setUsers] = useState<User[]>([]);

  const fetchAdminRequestedUsers = async () => {
    try {
      const response = await fetch("/api/users/adminRequests");

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Error fetching users:", err);
    }
  };

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
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userID ? { ...user, adminRequested: false } : user,
          ),
        );
      } else {
        console.log("Error");
      }
    } catch (err) {
      console.error("Error processing user action:", err);
    }
  };

  useEffect(() => {
    fetchAdminRequestedUsers();
  }, []);

  return (
    <div className="flex h-[10rem] w-[70rem] flex-col items-center rounded-xl bg-slate-100">
      <h1 className="mb-2 flex w-full flex-row justify-center rounded-t-xl bg-blue-primary py-3 text-white">
        Users Who Requested Admin Access
      </h1>
      <div className="h-full w-full overflow-auto">
        <ul className="flex w-full flex-wrap justify-between px-8">
          {users.map((user) => (
            <li
              className="flex w-[48%] flex-row border-b-2 py-3"
              key={user._id}
            >
              {user.email}
              <div className="flex w-full flex-row justify-end gap-2">
                <button
                  className="w-[6.5rem] rounded-xl bg-green-200"
                  onClick={() => handleAction(user._id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="w-[6.5rem] rounded-xl bg-red-200"
                  onClick={() => handleAction(user._id, "deny")}
                >
                  Deny
                </button>
              </div>
            </li>
          ))}
          <li className="flex w-[48%] flex-row border-b-2 py-3">
            temp@gmail
            <div className="flex w-full flex-row justify-end gap-2">
              <button className="w-[6.5rem] rounded-xl bg-green-200">
                Approve
              </button>
              <button className="w-[6.5rem] rounded-xl bg-red-200">Deny</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
