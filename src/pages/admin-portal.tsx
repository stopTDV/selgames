import { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string;
  adminRequested: boolean;
}

export default function AdminPortal() {
  // const [users, setUsers] = useState<User[]>([]);

  // useEffect(() => {
  //   async function fetchAdminRequestedUsers() {
  //     try {
  //       const response = await fetch('/api/user?adminRequested=true');
  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.statusText}`);
  //       }
  //       const data = await response.json();
  //       setUsers(data); // Store the filtered users in state
  //     } catch (error) {
  //       console.error('Error fetching users with admin requests:', error);
  //     }
  //   }

  //   fetchAdminRequestedUsers();
  // }, []);

  return (
    <div className="flex h-[10rem] w-[70rem] flex-col items-center rounded-xl bg-slate-500">
      <h1 className="mb-2 flex w-full flex-row justify-center rounded-t-xl bg-red-400 py-2">
        Users Who Requested Admin Access
      </h1>
      <div className="h-full w-full overflow-auto">
        <ul className="flex w-full flex-wrap justify-between px-8">
          {/* {users.map((user) => (
            <li key={user._id}>
              {user.email}
            </li>
          ))} */}
          <li className="flex w-[48%] flex-row border-b-2 bg-green-200 py-2">
            dd
            <div className="flex w-full flex-row justify-end gap-2">
              <button className="w-[6.5rem] rounded-xl bg-green-300">
                Approve
              </button>
              <button className="w-[6.5rem] rounded-xl bg-red-300">Deny</button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
