import { OLBGTip } from "@/types/racing";

interface DashboardContentProps {
  olbgTips?: OLBGTip[];
}

export function DashboardContent({ olbgTips }: DashboardContentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tips Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Today&apos;s Tips</h2>

        {/* OLBG Tips */}
        {olbgTips && olbgTips.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">OLBG Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {olbgTips.map((tip: OLBGTip, index: number) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow">
                  <div className="font-semibold">{tip.horseName}</div>
                  <div className="text-sm text-gray-600">
                    Tips: {tip.winTips}/{tip.winTotal} WIN ({tip.winPerc}%),{" "}
                    {tip.ewTips}/{tip.ewTotal} E/W ({tip.ewPerc}%)
                    {tip.napTips > 0 &&
                      `, ${tip.napTips}/${tip.napTotal} NAP (${tip.napPerc}%)`}
                  </div>
                  <div className="text-sm text-gray-500 mt-2">
                    {tip.expertCount} experts | {tip.commentCount} comments
                  </div>
                  {tip.comment && (
                    <div className="mt-2 text-sm text-gray-700 italic">
                      &ldquo;{tip.comment}&rdquo;
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
