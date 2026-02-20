import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Review } from "@/lib/mockData";

interface ReviewHighlightsProps {
  reviews: Review[];
}

const ReviewHighlights = ({ reviews }: ReviewHighlightsProps) => {
  if (reviews.length === 0) return null;

  // Collect all highlights and count occurrences
  const highlightCounts: Record<string, number> = {};
  reviews.forEach((review) => {
    review.highlights.forEach((highlight) => {
      highlightCounts[highlight] = (highlightCounts[highlight] || 0) + 1;
    });
  });

  // Sort by count and take top 5
  const topHighlights = Object.entries(highlightCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? "fill-warning text-warning"
                    : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="font-semibold text-foreground">{averageRating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Highlights */}
      {topHighlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topHighlights.map(([highlight, count]) => (
            <Badge
              key={highlight}
              variant="secondary"
              className="bg-success/10 text-success border-0"
            >
              {highlight}
              {count > 1 && <span className="ml-1 opacity-60">({count})</span>}
            </Badge>
          ))}
        </div>
      )}

      {/* Recent Reviews */}
      <div className="space-y-4">
        {reviews.slice(0, 3).map((review) => (
          <div key={review.id} className="border-b border-border pb-4 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-foreground">{review.renterName}</p>
                <p className="text-xs text-muted-foreground">
                  {review.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= review.rating
                        ? "fill-warning text-warning"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewHighlights;
