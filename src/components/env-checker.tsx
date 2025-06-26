"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircleIcon, CheckCircleIcon } from "lucide-react";

interface EnvCheck {
  name: string;
  required: boolean;
  value: string | undefined;
  description: string;
}

const requiredEnvVars: EnvCheck[] = [
  {
    name: "DATABASE_URL",
    required: true,
    value: process.env.NEXT_PUBLIC_DATABASE_URL,
    description: "PostgreSQL database connection string"
  },
  {
    name: "NEXT_PUBLIC_STREAM_VIDEO_API_KEY",
    required: true,
    value: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY,
    description: "Stream Video API key for calls"
  },
  {
    name: "STREAM_VIDEO_SECRET_KEY",
    required: true,
    value: process.env.NEXT_PUBLIC_STREAM_VIDEO_SECRET_KEY,
    description: "Stream Video secret key"
  },
  {
    name: "OPENAI_API_KEY",
    required: true,
    value: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    description: "OpenAI API key for AI features"
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    required: false,
    value: process.env.NEXT_PUBLIC_APP_URL,
    description: "Application URL (defaults to localhost:3000)"
  }
];

export const EnvChecker = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [missingRequired, setMissingRequired] = useState<EnvCheck[]>([]);

  useEffect(() => {
    const missing = requiredEnvVars.filter(
      env => env.required && (!env.value || env.value.trim() === "")
    );
    setMissingRequired(missing);
  }, []);

  if (missingRequired.length === 0) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Environment Variables Missing</AlertTitle>
      <AlertDescription>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">
            The following required environment variables are missing:
          </p>
          {showDetails && (
            <div className="space-y-2">
              {missingRequired.map((env) => (
                <div key={env.name} className="text-sm">
                  <strong>{env.name}</strong>: {env.description}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "Show Details"}
            </Button>
            <Button
              size="sm"
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}; 