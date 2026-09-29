export default function SectionHeading({ title, as: Tag = 'h2', id }) {
  return (
    <div className="section-header" data-aos="fade-up">
      <Tag className="s-title" id={id}>
        {title}
      </Tag>
      <hr />
    </div>
  );
}
