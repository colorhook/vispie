"use client";

import React, { useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Laptop
} from 'lucide-react'
import { SunIcon, MoonIcon } from "@radix-ui/react-icons"
import { IconButton } from '@radix-ui/themes';


export default function ThemeToggle() {
  const { theme, systemTheme, resolvedTheme, setTheme } = useTheme();
  function getVariant(t: string) {
    return t === theme ? 'solid' : 'soft'
  }

  return (
    <div className="flex items-center space-x-2">
      <IconButton radius='full' variant={getVariant("dark")} onClick={() => {
        setTheme('dark');
      }}><MoonIcon /></IconButton>
      <IconButton radius='full' variant={getVariant("light")} onClick={() => {
        setTheme('light')
      }}><SunIcon /></IconButton>
      <IconButton radius='full' variant={getVariant("system")} onClick={() => {
        setTheme('system')
      }}><Laptop size={16} strokeWidth={1.5} /></IconButton>
    </div>
  );
};