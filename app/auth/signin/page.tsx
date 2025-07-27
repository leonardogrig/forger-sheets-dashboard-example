import { SignInForm } from "@/components/auth/signin-form";
import getSession from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-pattern opacity-80"></div>
      <div className="relative w-full max-w-md space-y-8">
        <SignInForm />
      </div>
    </div>
  );
}
