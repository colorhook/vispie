"use client"

import * as React from "react";
import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{
      shouldRetryOnError: false,
      fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
    }}>{children}</SWRConfig>
  )
}