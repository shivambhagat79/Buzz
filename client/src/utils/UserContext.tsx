import axios from "axios";
import { createContext, useEffect, useState } from "react";

export interface UserContextType {
  username: string;
  id: string;
  setUsername: (a: string) => void;
  setId: (a: string) => void;
}

export const UserContext = createContext<UserContextType>({
  username: "",
  id: "",
  setUsername: () => {},
  setId: () => {},
});

export function UserContextProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [username, setUsername] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:4000";
    axios.defaults.withCredentials = true;

    axios.get("/profile").then((response) => {
      if (response.data.valid) {
        setUsername(response.data.username);
        setId(response.data.userId);
      }
    });
  }, []);

  return (
    <UserContext.Provider value={{ username, setUsername, id, setId }}>
      {children}
    </UserContext.Provider>
  );
}
