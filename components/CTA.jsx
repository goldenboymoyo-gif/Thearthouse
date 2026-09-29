import Link from 'next/link';

// Call to action in the live site's own button style (green, uppercase).
export default function CTA({ href, children, className = '' }) {
  const external = /^https?:/.test(href);
  return (
    <div className={`section-cta ${className}`}>
      {external ? (
        <a className="btn btn-xl" href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link className="btn btn-xl" href={href}>
          {children}
        </Link>
      )}
    </div>
  );
}
