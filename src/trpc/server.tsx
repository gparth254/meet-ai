import 'server-only'; // <-- ensure this file cannot be imported from the client
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

// IMPORTANT: Create a stable getter for the query client that
//            will return the same client during the same request.
export const getQueryClient = cache(makeQueryClient);

// Don't create the tRPC proxy on the server side to avoid SSR issues
// The client will handle all tRPC calls
export const trpc = null;
export const caller = appRouter.createCaller(createTRPCContext);
