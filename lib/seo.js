import { SITE } from './site';

// Page metadata with matching Open Graph / Twitter tags, so every page shares
// with its own title, description, photo and address.
export function pageMeta({ title, description, path, image, absolute = false }) {
  const shareTitle = absolute ? title : `${title} | The Art House`;
  const img = image || SITE.shareImage;
  return {
    title: absolute ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE.name,
      type: 'website',
      locale: 'en_GB',
      url: path,
      title: shareTitle,
      description,
      images: [{ url: img, alt: shareTitle }],
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images: [img] },
  };
}
