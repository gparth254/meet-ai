"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { input } from "@/components/ui/input";
import { Button} from "@/components/ui/button";

export default function Home() {
  const { data: session } = authClient.session.useSession();
  const[name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const onSubmit = () => {
  authClient.signUp.email(
    {
      email,
      name,
      password,
    },
    {
      onError: () => {
        window.alert("Something went wrong");
      },
      onSuccess: () => {
        window.alert("Success");
      },
    }
  );
};

if (session){
     return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Welcome back!</h1>
        <p className="text-gray-600">You are logged in as {session.user.email}</p>
      </div>
     )

     
}


  return (
    <div className="flex flex-col items-center justify-center min-h-screen  ">
      <input
        placeholder="name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        placeholder="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button onClick={onSubmit} className="mt-4">
        create user </Button>
    </div>
  );
  
}
