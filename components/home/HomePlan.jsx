import SectionHeading from '../SectionHeading';
import StayDetails from '../StayDetails';

export default function HomePlan() {
  return (
    <section className="s-module alt home-plan" id="plan-your-stay">
      <SectionHeading title="Plan Your Stay" />
      <div className="container">
        <StayDetails />
      </div>
    </section>
  );
}
