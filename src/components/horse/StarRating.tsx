export function StarRating({ score }: { score: number }) {
  // Round to nearest 0.5
  const roundedScore = Math.floor(score * 2) / 2;

  return (
    <div className="star-rating-wrapper flex items-center gap-[1rem]">
      {score.toFixed(2)}
      <div className="star-rating">
        {Array.from({ length: 5 }, (_, i) => {
          const starValue = i + 1;
          const isHalfStar = roundedScore === starValue - 0.5;

          return (
            <i
              key={i}
              className={`fas ${
                roundedScore >= starValue
                  ? "fa-star filled"
                  : isHalfStar
                  ? "fa-star-half-alt filled"
                  : "fa-star empty"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
