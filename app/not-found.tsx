import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            The page you requested could not be found. This could be due to a
            mistyped URL or the page may have been moved or deleted.
          </p>
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}