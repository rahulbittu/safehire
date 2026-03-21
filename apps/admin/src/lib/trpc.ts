"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@verifyme/api";

export const trpc = createTRPCReact<AppRouter>();
