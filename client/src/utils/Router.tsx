import { useContext } from "react";
import { UserContext, UserContextType } from "./UserContext";
import { useRouter } from "next/navigation";

export default function Router() {
  const { username, id } = useContext(UserContext) as UserContextType;

  const router = useRouter();

  if (username !== "" && id !== "") {
    router.push("/chats");
  } else {
    router.push("/login");
  }

  return <div></div>;
}
