"use client"
import { z } from "zod"; // Use if schema validation is needed
import Link from "next/link"; // Use if you need to link to another page
import { useForm } from "react-hook-form"; // Use if you're using react-hook-form
import { OctagonAlertIcon }from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod"; // Use if you're using react-hook-form with zod
import { useRouter } from "next/navigation"; // Use if you need to navigate programmatically
import { useState } from "react"; // Use if you need to manage local state


import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client"; 

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/alert";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long"),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
export const SignUpView = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
 //When the form is submitted, this code tries to log in the user using email and password. If login succeeds, it redirects to the homepage. If it fails, it shows the error message.
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    
   setError(null);
   setPending(true);
    authClient.signUp.email(
    {
      name: data.name,
      email: data.email,
      password: data.password
    },
    {
      onSuccess: () => {
         setPending(false);
        router.push("/");
      },
      onError: ({error}) => {
        setError(error.message);
      }
    }
  );

 
  };


    return (
      <div className="flex flex-col gap-6">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col    items-center text-center">
                      <h1 className="text-2xl font-bold">
                      let&apos;s get you started
                      </h1>
                      <p className="text-muted-foreground">
                        Please sign up for your account
                      </p>
                  </div>
                  <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                          type="text"
                          placeholder="cloudparth"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                    />
                  
                  </div>
                  <div className="grid gap-3">
                    <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                          type="email"
                          placeholder="parth@gmail.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                    />
                  
                  </div>
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="*********"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {!!error && (
                    <Alert className="estructive/10 border-none">
                      <OctagonAlertIcon className="h-4 w-4 !text-destructive" />
                      <AlertTitle>{JSON.stringify(error)}</AlertTitle>
                    </Alert>
                  )}
                  <Button disabled={pending} className="w-full" type="submit">
                    Sign In
                  </Button>
                 <div className="after:border-border relative text-center text-sm after:absolute
                 after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    or continue with
                  </span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                  <button
                  disabled={pending}
                    variant="outline"
                    type="button"
                    className="w-full"
                    >
                      Google
                    </button>

                    <button
                    disabled={pending}
                    variant="outline"
                    type="button"
                    className="w-full"
                    >
                      Github
                    </button>
                 </div>
                 <div className="text-center text-sm ">
                   Already have an account?{" "} <Link href="/sign-in" className="underline underline-offset-4 text-green-500 hover:text-green-600">
                      Sign In
                    </Link>
                 </div>

                </div>
              </form>

        </Form>
       
        <div className="bg-radial from-green-700 to-green-500 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
          <img src="/logo.svg" className="h-[92px] w-[92px]" />
          <p className="text-2xl font-semibold text-white">
           meet-ai
          </p>
        </div>
      </CardContent>
    </Card>
    <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs
    text-balance *:[a]:underline *:[a]:underline-offset-4">
      By clicking continue,you agree to our <a href="#">Terms of service</a> and <a href="#">Privacy Policy</a>.

    </div>
   </div>


  );
};

