"use client";
import React, { useContext, useState } from "react";
import { cn } from "@/utils/cn";
import Link from "next/link";
import axios from "axios";
import { UserContext, UserContextType } from "@/utils/UserContext";
import { useRouter } from "next/navigation";
import { Button, Input } from "@nextui-org/react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const { setUsername: setLoggedInUsername, setId } = useContext(
    UserContext
  ) as UserContextType;
  const router = useRouter();

  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setName(name.trim());
    setUsername(username.trim());
    setPassword(password.trim());

    if (password !== rePassword) {
      alert("Passwords do not match");
      return;
    }

    if (!/^[a-zA-Z\s]*$/.test(name)) {
      alert("Name can only contain letters and spaces");
      return;
    }

    if (!/^[a-zA-Z0-9\_]*$/.test(username)) {
      alert("Invalid Username");
      return;
    }

    if (password.length < 8 || /^.*\s.*$/.test(password)) {
      alert(
        "Password Must be at least 8 characters long and cannot contain spaces."
      );
      return;
    }

    const { data } = await axios.post("/signup", { name, username, password });
    if (!data.valid) {
      alert("Username already exists");
      return;
    }

    setLoggedInUsername(username);
    setId(data.id);

    router.push("/chats");
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center dark bg-black md:bg-zinc-950">
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
        <h2 className="font-bold text-3xl text-neutral-800 dark:text-neutral-200">
          Welcome to Buzz
        </h2>
        <p className="text-neutral-600 text text-sm max-w-sm mt-2 dark:text-neutral-300">
          Please enter the following information to get started wth your new
          account on Buzz.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <Input
            label="Name"
            className="text-white pt-5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="bordered"
            isInvalid={!/^[a-zA-Z\s]*$/.test(name)}
            errorMessage="Name can only contain letters and spaces"
            required
          />
          <Input
            label="Username"
            className="text-white pt-5"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="bordered"
            isInvalid={!/^[a-zA-Z0-9\_]*$/.test(username)}
            errorMessage="Name can only contain alphanumeric characters and underscores"
            required
          />
          <Input
            label="Password"
            className="text-white pt-5"
            value={password}
            type="password"
            isInvalid={
              password.length > 0 &&
              (password.length < 8 || /^.*\s.*$/.test(password))
            }
            errorMessage="Password Must be at least 8 characters long and cannot contain spaces"
            onChange={(e) => setPassword(e.target.value)}
            variant="bordered"
            required
          />
          <Input
            label="Re-enter Password"
            className="text-white pt-3"
            value={rePassword}
            type="password"
            isInvalid={rePassword.length !== 0 && password !== rePassword}
            errorMessage="Passwords do not match"
            onChange={(e) => setRePassword(e.target.value)}
            variant="bordered"
            required
          />

          <Button
            className="mt-4 mb-6 w-full py-6 font-bold"
            type="submit"
            color="primary"
          >
            Sign Up
          </Button>

          <p className="text-zinc-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:text-primary-300 transition-all"
            >
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
