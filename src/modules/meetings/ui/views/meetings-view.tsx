"use client";

import { DataPagination } from "@/components/data-pagination";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const MeetingsView = () => {
    const trpc = useTRPC();
    const router = useRouter();
    const [filters, setFilters] = useMeetingsFilters();
    
    const { data, error } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({
        ...filters,
    }));

    // Handle authentication errors
    useEffect(() => {
        if (error && error.message?.includes('You must be logged in')) {
            console.log('Authentication error detected, redirecting to sign-in');
            router.push('/sign-in');
        }
    }, [error, router]);

    // Handle row clicks - navigate to meeting details
    const handleRowClick = (meeting: any) => {
        console.log('Meeting clicked:', meeting);
        router.push(`/meetings/${meeting.id}`);
    };

    // If there's an authentication error, show loading while redirecting
    if (error && error.message?.includes('You must be logged in')) {
        return <MeetingsViewLoading />;
    }

    // If there's any other error, show error state
    if (error) {
        return (
            <ErrorState
                title="Failed to load meetings"
                description={error.message || "An unexpected error occurred"}
            />
        );
    }

    // Show loading state while data is being fetched
    if (!data) {
        return <MeetingsViewLoading />;
    }

    // Show empty state if no meetings
    if (data.items.length === 0) {
        return (
            <EmptyState
                title="No meetings found"
                description="Create your first meeting to get started"
            />
        );
    }

    return (
        <div className="space-y-4">
            <DataTable 
                data={data.items} 
                columns={columns} 
                onRowClicks={handleRowClick}
            />
            <DataPagination
                page={filters.page}
                totalPages={data.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
            />
        </div>
    );
};

export const MeetingsViewLoading = () => {
    return (
        <LoadingState
            title="Loading Meetings"
            description="This may take a few seconds"
        />
    );
};

export const MeetingsViewError = () => {
    return (
        <ErrorState
            title="Failed to load meetings"
            description="There was an error loading your meetings. Please try again."
        />
    );
};


