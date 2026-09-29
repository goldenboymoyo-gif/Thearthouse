import ArticlePreview from '@/components/ArticlePreview';

export const metadata = {
  title: 'Published Articles',
  description: 'Articles published about The Art House Victoria Falls.',
  alternates: { canonical: '/articles' },
};

export default function ArticlesPage() {
  return (
    <main className="page-main inside">
      <ArticlePreview headingLevel="h1" alt={false} />
    </main>
  );
}
