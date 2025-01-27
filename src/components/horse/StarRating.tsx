export function StarRating({ score }: { score: number }) {
  return (
    <div className="star-rating">
      {Array.from({ length: 5 }, (_, i) => (
        <i
          key={i}
          className={`fas fa-star ${i < score ? "filled" : "empty"}`}
        />
      ))}
    </div>
  );
}
