"use client";

import { UserContext } from "@/utils/UserContext";
import { Button, Textarea } from "@nextui-org/react";
import { useContext, useEffect, useState } from "react";

export default function ChatsPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: string }>({});
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { id } = useContext(UserContext);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    setWs(ws);

    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlineUsers(usersArray: any) {
    const users: { [key: string]: string } = {};

    usersArray.forEach(({ userId, username }: any) => {
      users[userId] = username;
    });

    setOnlineUsers(users);
  }

  function handleMessage(event: MessageEvent) {
    const messageData = JSON.parse(event.data);

    if ("online" in messageData) {
      showOnlineUsers(messageData.online);
    }
  }

  function selectUser(userId: string) {
    setSelectedUser(userId);
  }

  const onlineUsersExcludingCurrent = { ...onlineUsers };
  delete onlineUsersExcludingCurrent[id];

  return (
    <div className="flex h-screen text-zinc-200 dark">
      <div className="w-1/4 bg-zinc-950 flex flex-col">
        <div className="flex items-center gap-2 text-3xl p-4 text-primary-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          Buzz
        </div>
        <div className="flex flex-col gap-2 flex-grow p-2 overflow-scroll">
          {Object.keys(onlineUsersExcludingCurrent).map((userId) => (
            <Button
              onClick={() => {
                selectUser(userId);
              }}
              key={userId}
              variant={selectedUser === userId ? "flat" : "solid"}
              color={selectedUser === userId ? "primary" : "default"}
              className={`justify-start gap-3 p-4 py-8 ${
                selectedUser === userId ? "" : "bg-zinc-900"
              }`}
            >
              <div className="flex items-center justify-center rounded-full text-3xl bg-primary-400 h-10 w-10 text-white">
                {onlineUsers[userId][0].toUpperCase()}
              </div>
              {onlineUsers[userId]}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex w-3/4 flex-col bg-zinc-800">
        {selectedUser !== "" && (
          <div className="bg-zinc-900 p-4 flex items-center gap-4">
            <div className="flex items-center justify-center rounded-full text-3xl bg-primary-400 h-10 w-10 text-white">
              {onlineUsers[selectedUser][0].toUpperCase()}
            </div>
            <div className="text-xl">{onlineUsers[selectedUser]}</div>
          </div>
        )}
        <div className="flex-grow">Messages</div>
        <div className="p-4 flex gap-4 bg-zinc-900">
          <Textarea className="" minRows={1} maxRows={5} />
          <Button color="primary">
            Send
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
