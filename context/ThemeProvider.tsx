"use client"
 
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Theme } from '@radix-ui/themes';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <Theme accentColor="iris" grayColor="mauve">
        {children}
      </Theme>
    </NextThemesProvider>
  )
}