'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import MobileHeader from './MobileHeader';
import { AddressPopup, EmailPopup, MobileMenu, PhonePopup, SocialPopup } from './Popups';
import FloatingButtons from './FloatingButtons';
import { ChromeContext } from './chrome-context';

// Header, mobile header, the full-screen popups they open and the floating
// buttons — the parts of the live site that stay on screen on every page.
export default function SiteChrome() {
  const pathname = usePathname();
  const [open, setOpenState] = useState(null);

  const setOpen = useCallback((name) => setOpenState(name), []);

  useEffect(() => {
    setOpenState(null);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', Boolean(open));
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpenState(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <ChromeContext.Provider value={{ open, setOpen, pathname }}>
      <Header />
      <MobileHeader />
      <MobileMenu />
      <AddressPopup />
      <SocialPopup />
      <EmailPopup />
      <PhonePopup />
      <FloatingButtons />
    </ChromeContext.Provider>
  );
}
