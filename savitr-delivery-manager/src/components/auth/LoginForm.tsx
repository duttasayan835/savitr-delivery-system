import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/models/User";
import { toast } from 'react-hot-toast';

interface LoginFormData {
  email?: string;
  phone?: string;
  password: string;
  otp?: string;
}

interface ErrorResponse {
  error: string;
  token?: string;
}

interface LoginFormProps {
  role?: UserRole;
  allowRoleSwitch?: boolean;
  showOtpOption?: boolean;
}

export function LoginForm({ role = UserRole.RECIPIENT, allowRoleSwitch = false, showOtpOption = true }: LoginFormProps) {
  const { login, verifyOtp } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState<UserRole>(role);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<LoginFormData>();

  const handleSendOtp = async () => {
    try {
      setIsSubmitting(true);
      // Clean the phone number (remove any non-digit characters)
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      console.log('Sending OTP to cleaned phone:', cleanedPhone);
      
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanedPhone }),
      });

      const result = await response.json() as ErrorResponse;
      if (!response.ok) throw new Error(result.error);

      setShowOtpInput(true);
      toast.success('OTP sent successfully! Please check your phone.');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('OTP send error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      setError("");

      if (currentRole === UserRole.ADMIN) {
        if (!data.email) throw new Error("Email is required for admin login");
        if (!data.password) throw new Error("Password is required for admin login");
        await login(data.email, data.password, UserRole.ADMIN);
        router.push("/admin");
        return;
      }

      // Recipient login - OTP verification
      if (!data.otp) throw new Error("OTP is required");
      if (!phoneNumber) throw new Error("Phone number is required");

      await verifyOtp(phoneNumber, data.otp);
      router.push('/recipient/dashboard');
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Login error:", error);
      setError(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        {allowRoleSwitch && (
          <Tabs 
            defaultValue={role} 
            onValueChange={(value) => {
              setCurrentRole(value as UserRole);
              setShowOtpInput(false);
              reset();
            }} 
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={UserRole.RECIPIENT}>Recipient</TabsTrigger>
              <TabsTrigger value={UserRole.ADMIN}>Admin</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {currentRole === UserRole.ADMIN ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                />
              </div>
              {!showOtpInput ? (
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleSendOtp}
                  disabled={!phoneNumber || phoneNumber.length !== 10 || isSubmitting}
                >
                  {isSubmitting ? "Sending OTP..." : "Generate OTP"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    type="text"
                    {...register("otp", { 
                      required: "OTP is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Please enter a valid 6-digit OTP"
                      }
                    })}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-500">{errors.otp.message}</p>
                  )}
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {showOtpInput && (
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        {currentRole === UserRole.ADMIN && (
          <Link 
            href="/auth/admin/forgot-password" 
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Forgot password?
          </Link>
        )}
        <Link 
          href={currentRole === UserRole.ADMIN ? "/auth/admin/signup" : "/auth/signup"} 
          className="text-sm text-red-600 hover:text-red-700"
        >
          Create account
        </Link>
      </CardFooter>
    </Card>
  );
} 