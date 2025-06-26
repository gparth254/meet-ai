"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, DatabaseIcon, RefreshCwIcon } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a database connection error
    const isDbError = error.message.includes('ECONNREFUSED') || 
                     error.message.includes('database') ||
                     error.message.includes('NeonDbError');
    
    if (isDbError) {
      return { hasError: true, error };
    }
    
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Database error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="text-center max-w-md">
            <Alert variant="destructive">
              <DatabaseIcon className="h-4 w-4" />
              <AlertTitle>Database Connection Error</AlertTitle>
              <AlertDescription>
                <div className="mt-2 space-y-2">
                  <p className="text-sm">
                    Unable to connect to the database. This could be because:
                  </p>
                  <ul className="text-sm list-disc list-inside text-left space-y-1">
                    <li>Database server is not running</li>
                    <li>DATABASE_URL is not configured correctly</li>
                    <li>Database credentials are incorrect</li>
                    <li>Network connectivity issues</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.open('/setup-db', '_blank')}
                className="w-full"
              >
                <DatabaseIcon className="h-4 w-4 mr-2" />
                Database Setup Guide
              </Button>
              
              <div className="text-xs text-muted-foreground">
                Error: {this.state.error?.message}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 