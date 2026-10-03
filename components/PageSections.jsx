import { PAGE_SECTIONS } from '@/lib/site';

// "On this page" jump links shown at the top of the combined pages, so every
// former sub-page is one tap away without a dropdown menu.
export default function PageSections({ page, label = 'On this page' }) {
  const items = PAGE_SECTIONS[page] || [];
  return (
    <nav className="page-sections" aria-label={label}>
      <div className="container">
        <ul>
          {items.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`}>{s.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
