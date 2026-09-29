import GallerySection from '@/components/GallerySection';

export const metadata = {
  title: 'Gallery',
  description: 'Photographs of The Art House Victoria Falls – the house, bedrooms, gardens, veranda and swimming pool.',
  alternates: { canonical: '/gallery' },
};

export default function GalleryPage() {
  return (
    <main className="page-main inside">
      <GallerySection headingLevel="h1" alt={false} />
    </main>
  );
}
