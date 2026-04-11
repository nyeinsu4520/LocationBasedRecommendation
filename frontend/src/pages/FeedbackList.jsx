import { useEffect, useState } from "react";
import { feedbackApi } from "../api/feedbackApi";

export default function FeedbackList({ eventId }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [data, avg] = await Promise.all([
          feedbackApi.getByEvent(eventId),
          feedbackApi.getAverage(eventId),
        ]);
        setFeedbacks(data);
        setAverage(avg.average);
        setCount(avg.count);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [eventId]);

  if (loading) return null;
  if (feedbacks.length === 0) return (
    <div className="text-sm text-slate-400 text-center py-4">
      No feedback yet for this event.
    </div>
  );

  return (
    <div className="mt-4 space-y-3">
      {/* Average rating summary */}
      <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-900">
            {average.toFixed(1)}
          </div>
          <div className="text-amber-400 text-sm">
            {"★".repeat(Math.round(average))}{"☆".repeat(5 - Math.round(average))}
          </div>
          <div className="text-xs text-slate-500">{count} review{count !== 1 ? "s" : ""}</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const starCount = feedbacks.filter(f => f.rating === star).length;
            const pct = count > 0 ? (starCount / count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-3">{star}</span>
                <span className="text-amber-400 text-xs">★</span>
                <div className="flex-1 bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 w-4">{starCount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual reviews */}
      {feedbacks.map((f) => (
        <div key={f.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="text-amber-400 text-sm flex items-center gap-1">
              {"★".repeat(f.rating)}
              <span className="text-slate-200">{"★".repeat(5 - f.rating)}</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {f.username || `User #${f.userId}`}
            </span>
          </div>
          {f.comment && (
            <p className="text-sm text-slate-600 mt-2">{f.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}