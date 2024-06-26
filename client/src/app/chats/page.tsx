"use client";

import { UserContext } from "@/utils/UserContext";
import { Button, Divider, Textarea } from "@nextui-org/react";
import { useContext, useEffect, useRef, useState } from "react";
import { uniqBy } from "lodash";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ChatsPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: string }>({});
  const [offlineUsers, setOfflineUsers] = useState<{ [key: string]: string }>(
    {}
  );
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<any>([{ text: "" }]);
  const messageBoxRef = useRef<HTMLDivElement | null>(null);
  const { username, id, setUsername, setId } = useContext(UserContext);
  const router = useRouter();

  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;

  useEffect(() => {
    connectToWs();
  }, []);

  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000");

    setWs(ws);

    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }

  useEffect(() => {
    if (selectedUser !== "") {
      axios.get(`/messages/${selectedUser}`).then((response) => {
        setMessages(response.data);
      });
    }
  }, [selectedUser]);

  useEffect(() => {
    axios.get("/users").then((res) => {
      const offlineUsersArr = res.data
        .filter((p: any) => p._id !== id)
        .filter((p: any) => !Object.keys(onlineUsers).includes(p._id));

      const offlineUsers: { [key: string]: string } = {};

      offlineUsersArr.forEach((p: any) => {
        offlineUsers[p._id] = p.username;
      });
      setOfflineUsers(offlineUsers);
    });
  }, [onlineUsers]);

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
    } else if ("text" in messageData) {
      setMessages((prev: any) => [...prev, { ...messageData }]);
    }
  }

  function selectUser(userId: string) {
    setSelectedUser(userId);
  }

  function sendMessage(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault();

    ws?.send(
      JSON.stringify({
        text: newMessage,
        recipient: selectedUser,
        sender: id,
      })
    );

    setMessages((prev: any) => [
      ...prev,
      {
        text: newMessage,
        sender: id,
        recipient: selectedUser,
        _id: Date.now(),
      },
    ]);
    setNewMessage("");
  }

  useEffect(() => {
    const div = messageBoxRef.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  async function logout() {
    await axios.post("/logout");
    setWs(null);
    setUsername("");
    setId("");
    router.push("/login");
  }

  const onlineUsersExcludingCurrent = { ...onlineUsers };
  delete onlineUsersExcludingCurrent[id];
  const messagesWithoutDupes = uniqBy(messages, "_id");

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
        <Divider />
        <div className="flex flex-col gap-2 flex-grow p-2 overflow-y-scroll">
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
              <div className="flex relative items-center justify-center rounded-full text-3xl bg-primary-400 h-10 w-10 text-white">
                {onlineUsers[userId][0].toUpperCase()}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              {onlineUsers[userId]}
            </Button>
          ))}
          {Object.keys(offlineUsers).map((userId) => (
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
              <div className="flex relative items-center justify-center rounded-full text-3xl bg-primary-400 h-10 w-10 text-white">
                {offlineUsers[userId][0].toUpperCase()}
              </div>
              {offlineUsers[userId]}
            </Button>
          ))}
        </div>
        <Divider />
        <div className="p-2 flex items-center justify-between">
          <div className="text-base flex items-center gap-2">
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
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>

            {username}
          </div>
          <Button onClick={logout} size="sm" color="danger" variant="flat">
            Logout
          </Button>
        </div>
      </div>
      <div className="flex w-3/4 flex-col bg-zinc-800">
        {selectedUser !== "" && (
          <>
            <div className="flex-grow p-4 overflow-y-scroll">
              {messagesWithoutDupes.map((message: any, index: any) => (
                <div
                  key={index}
                  className={`flex ${
                    message.sender === id ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`p-2  rounded-xl mb-1 ${
                      message.sender === id ? "bg-primary-400" : "bg-zinc-600"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              <div ref={messageBoxRef}></div>
            </div>
            <form className="p-4 flex gap-4 bg-zinc-900" onSubmit={sendMessage}>
              <Textarea
                value={newMessage}
                onChange={(ev) => setNewMessage(ev.target.value)}
                minRows={1}
                maxRows={5}
                placeholder="Type a message"
              />
              <Button color="primary" type="submit">
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
            </form>
          </>
        )}
        {selectedUser === "" && (
          <div className="flex-grow flex items-center justify-center text-2xl text-zinc-600">
            Select a chat to see messages
          </div>
        )}
      </div>
    </div>
  );
}
