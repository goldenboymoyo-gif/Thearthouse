'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CONTACT, NAV, SITE } from '@/lib/site';
import { img } from '@/lib/assets';
import Icon from './Icon';
import ContactForm from './ContactForm';
import { isActive, useChrome } from './chrome-context';

// The dark full-screen panels that slide down from the top of the live site
// (menu on phones, and the address / social / email / phone header icons).
function PopupWin({ name, className = '', closeLeft = false, label, children }) {
  const { open, setOpen } = useChrome();
  const isOpen = open === name;
  return (
    <div
      className={`popup-win ${className} ${isOpen ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      aria-hidden={!isOpen}
    >
      <div className="cover" onClick={() => setOpen(null)} />
      <button
        type="button"
        className={`popup-close ${closeLeft ? 'left' : ''}`}
        onClick={() => setOpen(null)}
        aria-label="Close"
        tabIndex={isOpen ? 0 : -1}
      >
        <Icon name="times" />
      </button>
      <div className="popup-content" onClick={(e) => e.target === e.currentTarget && setOpen(null)}>
        {isOpen ? children : null}
      </div>
    </div>
  );
}

export function MobileMenu() {
  const { pathname, setOpen } = useChrome();
  const [openMenu, setOpenMenu] = useState(null);
  return (
    <PopupWin name="menu" className="mobile-menu" closeLeft label="Menu">
      <ul className="mobile-menu-list">
        {NAV.map((item, index) =>
          item.dropdown ? (
            <li key={item.label} className={`has-submenu ${openMenu === index ? 'open' : ''}`}>
              <button
                type="button"
                className={index === openMenu ? 'active' : ''}
                aria-haspopup="true"
                aria-expanded={openMenu === index}
                onClick={() => setOpenMenu((v) => (v === index ? null : index))}
              >
                {item.label}
                <Icon name="caret-down" className="caret" />
              </button>
              <ul className="mobile-menu-sub">
                {item.dropdown.map((child) => (
                  <li key={child.href}>
                    <Link
                      href={child.href}
                      className={isActive(pathname, child.href) ? 'active' : ''}
                      onClick={() => setOpen(null)}
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ) : (
            <li key={item.href}>
              <Link href={item.href} className={isActive(pathname, item.href) ? 'active' : ''} onClick={() => setOpen(null)}>
                {item.label}
              </Link>
            </li>
          )
        )}
      </ul>
      <div className="mobile-menu-actions">
        <div className="icons">
          <button type="button" onClick={() => setOpen('address')} aria-label="Address">
            <Icon name="location-arrow" />
          </button>
          <button type="button" onClick={() => setOpen('social')} aria-label="Social links">
            <Icon name="share-alt" />
          </button>
          <button type="button" onClick={() => setOpen('email')} aria-label="Email us">
            <Icon name="envelope" />
          </button>
          <button type="button" onClick={() => setOpen('phone')} aria-label="Call us">
            <Icon name="phone" />
          </button>
        </div>
        <a className="btn btn-nav" href={SITE.bookingUrl} target="_blank" rel="noopener noreferrer">
          Book Now
        </a>
      </div>
    </PopupWin>
  );
}

export function AddressPopup() {
  return (
    <PopupWin name="address" label="Address">
      <div className="popup-address" style={{ textAlign: 'center' }}>
        <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer">
          <Icon name="location-arrow" /> {CONTACT.address}
        </a>
        <div className="map-apps">
          <a className="circle-link" href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Google Maps">
            <img src={img('google_map_white_small.png')} alt="Google Maps" />
          </a>
          <a className="circle-link" href={CONTACT.wazeUrl} target="_blank" rel="noopener noreferrer" aria-label="Waze">
            <img src={img('waze_white_small.png')} alt="Waze" />
          </a>
          <a className="circle-link" href={CONTACT.moovitUrl} target="_blank" rel="noopener noreferrer" aria-label="Moovit">
            <img src={img('moovit_white_small.png')} alt="Moovit" />
          </a>
        </div>
      </div>
    </PopupWin>
  );
}

export function SocialPopup() {
  return (
    <PopupWin name="social" label="Social links">
      <div className="popup-social">
        <a className="circle-link" href={CONTACT.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
          <Icon name="facebook" />
        </a>
        <a className="circle-link" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <Icon name="instagram" />
        </a>
      </div>
    </PopupWin>
  );
}

export function PhonePopup() {
  return (
    <PopupWin name="phone" label="Phone">
      <div className="popup-phone">
        <a href={CONTACT.phoneHref}>
          <Icon name="phone" /> <span dir="ltr">{CONTACT.phone}</span>
        </a>
      </div>
    </PopupWin>
  );
}

export function EmailPopup() {
  return (
    <PopupWin name="email" label="Contact Us">
      <div className="popup-email">
        <h3>Contact Us</h3>
        <p>
          Fill out the form or send a direct email to: <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </p>
        <ContactForm variant="popup" />
      </div>
    </PopupWin>
  );
}
