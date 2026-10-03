'use client';

import { createContext, useContext } from 'react';

export const ChromeContext = createContext({ open: null, setOpen: () => {}, pathname: '/' });

export const useChrome = () => useContext(ChromeContext);

export function isActive(pathname, href, match = []) {
  if (href === '/') return pathname === '/';
  return [href, ...match].some((p) => pathname === p || pathname.startsWith(p + '/'));
}
