"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface SyncStatus {
  lastSync?: {
    id: string;
    status: string;
    rowsUpdated: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
  };
  recentHistory?: Array<{
    id: string;
    status: string;
    rowsUpdated: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
  }>;
}

interface SyncButtonProps {
  onSyncComplete?: () => void;
  isAdmin?: boolean;
}

export function SyncButton({ onSyncComplete, isAdmin = false }: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({});

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch("/api/sync/manual");
      if (response.ok) {
        const data = await response.json();
        setSyncStatus(data);
      }
    } catch (error) {
      console.error("Failed to fetch sync status:", error);
    }
  };

  const handleSync = async () => {
    if (!isAdmin) {
      toast.error("Only admins can trigger manual sync");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/sync/manual", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success(`Sync completed successfully! Updated ${data.rowsUpdated} rows.`);
        await fetchSyncStatus();
        if (onSyncComplete) {
          onSyncComplete();
        }
      } else {
        toast.error(data.error || "Sync failed");
      }
    } catch (error) {
      toast.error("Failed to sync data");
      console.error("Sync error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isAdmin) {
      fetchSyncStatus();
      const interval = setInterval(fetchSyncStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ERROR":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case "ERROR":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-muted-foreground">Data Sync</h3>
              <p className="text-sm text-muted-foreground">
                Admin access required to manually sync data
              </p>
            </div>
            <Button disabled className="min-w-[120px]">
              <RefreshCw className="h-4 w-4 mr-2" />
              Admin Only
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="font-medium">Data Sync</h3>
              <p className="text-sm text-muted-foreground">
                Sync latest data from Google Sheets
              </p>
            </div>
            
            {syncStatus.lastSync && (
              <div className="flex items-center space-x-2 text-sm">
                {getStatusIcon(syncStatus.lastSync.status)}
                <span>
                  Last sync: {new Date(syncStatus.lastSync.startedAt).toLocaleString()}
                </span>
                {syncStatus.lastSync.status === "SUCCESS" && (
                  <span className="text-muted-foreground">
                    ({syncStatus.lastSync.rowsUpdated} rows)
                  </span>
                )}
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSync} 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>
        
        {syncStatus.recentHistory && syncStatus.recentHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Last Sync Attempt</h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {getStatusIcon(syncStatus.recentHistory[0].status)}
                <span>{new Date(syncStatus.recentHistory[0].startedAt).toLocaleString()}</span>
                {getStatusBadge(syncStatus.recentHistory[0].status)}
              </div>
              <div className="text-muted-foreground">
                {syncStatus.recentHistory[0].status === "SUCCESS" && `${syncStatus.recentHistory[0].rowsUpdated} rows`}
                {syncStatus.recentHistory[0].status === "ERROR" && syncStatus.recentHistory[0].errorMessage && (
                  <span className="text-red-600 max-w-[300px] truncate" title={syncStatus.recentHistory[0].errorMessage}>
                    {syncStatus.recentHistory[0].errorMessage}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}