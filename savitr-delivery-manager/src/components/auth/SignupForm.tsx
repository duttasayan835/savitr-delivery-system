import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/models/User";

interface SignupFormData {
  name: string;
  email?: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormProps {
  role?: UserRole;
  includeEmail?: boolean;
}

export function SignupForm({ role = UserRole.RECIPIENT, includeEmail = false }: SignupFormProps) {
  const { signup } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<SignupFormData>();

  const password = watch("password");

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const signupData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role,
        address: data.address
      };

      await signup(signupData);
      router.push(role === UserRole.RECIPIENT ? "/recipient/dashboard" : "/admin");
    } catch (err: Error) {
      console.error("Signup error:", err);
      setError(err.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create {role === UserRole.RECIPIENT ? "Recipient" : ""} Account</CardTitle>
        <CardDescription>Fill in your details to create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters"
                }
              })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">{errors.name.message}</span>
            )}
          </div>

          {includeEmail && (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              {...register("phone", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Please enter a valid Indian phone number"
                }
              })}
            />
            {errors.phone && (
              <span className="text-sm text-red-500">{errors.phone.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address</Label>
            <Input
              id="address"
              type="text"
              placeholder="Enter your complete delivery address"
              {...register("address", {
                required: "Address is required",
                minLength: {
                  value: 5,
                  message: "Address must be at least 5 characters"
                }
              })}
            />
            {errors.address && (
              <span className="text-sm text-red-500">{errors.address.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {errors.password && (
              <span className="text-sm text-red-500">{errors.password.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: value => value === password || "Passwords do not match"
              })}
            />
            {errors.confirmPassword && (
              <span className="text-sm text-red-500">{errors.confirmPassword.message}</span>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link 
            href={role === UserRole.RECIPIENT ? "/auth/recipient/login" : "/auth/login"} 
            className="text-red-600 hover:text-red-700"
          >
            Login here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 