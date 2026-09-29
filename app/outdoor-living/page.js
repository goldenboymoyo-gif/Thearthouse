import OutdoorLiving from '@/components/OutdoorLiving';

export const metadata = {
  title: 'Outdoor Living at its finest',
  description: 'Outdoor living at The Art House Victoria Falls – an outdoor bath and shower beneath the African stars.',
  alternates: { canonical: '/outdoor-living' },
};

export default function OutdoorLivingPage() {
  return (
    <main className="page-main inside">
      <OutdoorLiving headingLevel="h1" />
    </main>
  );
}
