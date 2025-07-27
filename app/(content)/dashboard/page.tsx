import getSession from "@/lib/auth";
import { isUserAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const isAdmin = await isUserAdmin(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Product performance insights from Google Sheets data
            </p>
          </div>

          <DashboardClient isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
