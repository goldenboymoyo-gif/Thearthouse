'use client';

import { createContext, useContext } from 'react';

export const ChromeContext = createContext({ open: null, setOpen: () => {}, pathname: '/' });

export const useChrome = () => useContext(ChromeContext);

export function isActive(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
