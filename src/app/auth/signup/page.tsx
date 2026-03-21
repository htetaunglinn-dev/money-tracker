"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Wallet } from "lucide-react";

interface LocalUser {
  id: string;
  username: string;
  email: string;
  password: string;
}

const LOCAL_USERS_KEY = "mt-local-users";

function getLocalUsers(): LocalUser[] {
  try {
    return JSON.parse(sessionStorage.getItem(LOCAL_USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const existingUsers = getLocalUsers();
    if (existingUsers.some((u) => u.email === formData.email)) {
      toast.error("An account with this email already exists");
      setIsLoading(false);
      return;
    }

    // Save user to sessionStorage
    const newUser: LocalUser = {
      id: `local-${Date.now()}`,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    };
    sessionStorage.setItem(
      LOCAL_USERS_KEY,
      JSON.stringify([...existingUsers, newUser])
    );

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        username: formData.username,
        localUser: "true",
        redirect: false,
      });

      if (result?.ok) {
        toast.success("Account created! Welcome aboard.");
        router.push("/dashboard");
      } else {
        toast.error("Failed to create session. Please try again.");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center hero-gradient p-4 gap-6">
      {/* Brand logo above card */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-money-green blur-lg opacity-50 rounded-full" />
          <Wallet className="relative h-8 w-8 text-money-green" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-money-light">
          Money<span className="text-money-green">Tracker</span>
        </span>
      </div>

      <Card className="w-full max-w-md bg-money-dark border-money-green/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Start tracking your money today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-money-green text-money-black hover:bg-money-green/90 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-money-green hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
