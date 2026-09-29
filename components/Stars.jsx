import Icon from './Icon';

export default function Stars({ count = 5 }) {
  return (
    <div className="stars" role="img" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <Icon key={i} name="star" />
      ))}
    </div>
  );
}
