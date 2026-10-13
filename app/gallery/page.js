import { pageMeta } from '@/lib/seo';
import GallerySection from '@/components/GallerySection';

export const metadata = pageMeta({
  title: 'Photo Gallery',
  description: 'Photographs of The Art House Victoria Falls: the house, bedrooms, original African art, gardens, veranda and swimming pool.',
  path: '/gallery',
});

export default function GalleryPage() {
  return (
    <main className="page-main inside">
      <GallerySection headingLevel="h1" alt={false} />
    </main>
  );
}
