import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DatabaseIcon, GlobeIcon, DownloadIcon, CopyIcon } from "lucide-react";
import Link from "next/link";

export default function SetupDbPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Database Setup</h1>
          <p className="text-muted-foreground">
            Choose your preferred database option to get started
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Local PostgreSQL */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Local PostgreSQL
              </CardTitle>
              <CardDescription>
                Install PostgreSQL on your machine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Steps:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Download PostgreSQL from postgresql.org</li>
                  <li>Install with default settings</li>
                  <li>Create database: <code>meet_ai</code></li>
                  <li>Update DATABASE_URL in .env.local</li>
                </ol>
              </div>
              <Button asChild className="w-full">
                <a href="https://www.postgresql.org/download/" target="_blank" rel="noopener noreferrer">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Download PostgreSQL
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Cloud Database */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="h-5 w-5" />
                Cloud Database
              </CardTitle>
              <CardDescription>
                Use a cloud database service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Recommended:</strong></p>
                <ul className="space-y-1 text-xs">
                  <li>• <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Neon</a> (Free tier)</li>
                  <li>• <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase</a> (Free tier)</li>
                  <li>• <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Railway</a> (Free tier)</li>
                </ul>
              </div>
              <Button asChild className="w-full">
                <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">
                  <GlobeIcon className="h-4 w-4 mr-2" />
                  Try Neon (Free)
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Docker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DatabaseIcon className="h-5 w-5" />
                Docker
              </CardTitle>
              <CardDescription>
                Run PostgreSQL in Docker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p><strong>Command:</strong></p>
                <code className="block text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=meet_ai -p 5432:5432 -d postgres
                </code>
              </div>
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText('docker run --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=meet_ai -p 5432:5432 -d postgres');
                }}
                className="w-full"
              >
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy Command
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Environment Variables */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>
              Update your .env.local file with the correct DATABASE_URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <DatabaseIcon className="h-4 w-4" />
              <AlertTitle>Required Environment Variable</AlertTitle>
              <AlertDescription>
                Add this to your .env.local file:
              </AlertDescription>
            </Alert>
            
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <code className="text-sm">
                DATABASE_URL="postgresql://username:password@host:port/database"
              </code>
            </div>

            <div className="text-sm space-y-2">
              <p><strong>Examples:</strong></p>
              <ul className="space-y-1 text-xs">
                <li>• Local: <code>postgresql://postgres:password@localhost:5432/meet_ai</code></li>
                <li>• Neon: <code>postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb</code></li>
                <li>• Supabase: <code>postgresql://postgres:password@db.xxx.supabase.co:5432/postgres</code></li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              After setting up your database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <ol className="list-decimal list-inside space-y-1">
                <li>Update DATABASE_URL in .env.local</li>
                <li>Run: <code>npm run db:push</code></li>
                <li>Run: <code>npm run dev</code></li>
                <li>Sign up and create your first agent</li>
              </ol>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/">
                  Go to Home
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 