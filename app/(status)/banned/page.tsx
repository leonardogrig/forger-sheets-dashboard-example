import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Mail } from "lucide-react";

export default function BannedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            Account Suspended
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Your account has been suspended and you cannot access the
            application at this time.
          </p>
          <p className="text-gray-600">
            If you believe this is an error or would like to appeal this
            decision, please contact our support team.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mt-6">
            <Mail className="w-4 h-4" />
            <span>Contact admin for further instructions</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
