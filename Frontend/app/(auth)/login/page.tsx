import { Suspense } from "react";
import { Login } from "@/components/auth/auth-login";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Suspense>
          <Login />
        </Suspense>
      </div>
    </div>
  );
}