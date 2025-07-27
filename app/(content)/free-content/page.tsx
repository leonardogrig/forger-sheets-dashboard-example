import getSession from "@/lib/auth";
import { Gift } from "lucide-react";
import { redirect } from "next/navigation";

export default async function FreeContentPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <Gift className="h-8 w-8 text-blue-500" />
              Free Content
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              This page can be seen by logged in users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
