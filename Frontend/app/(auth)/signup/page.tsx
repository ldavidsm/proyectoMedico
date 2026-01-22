import { SignUp } from "@/components/auth/auth-signup";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <SignUp variant="without-image" />
      </div>
    </div>
  );
}