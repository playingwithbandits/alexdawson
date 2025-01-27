import { useSidebarStore } from "@/store/useSidebarStore";

interface RaceDayMenuProps {
  selectedDate: string | null;
  onDateSelect: (date: string | null) => void;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const suffix = getDaySuffix(day);

  return date
    .toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/\d+/, day + suffix);
}

function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function RaceDayMenu({ selectedDate, onDateSelect }: RaceDayMenuProps) {
  const { close } = useSidebarStore();
  // Example dates - these would come from your data
  const raceDays = [
    "2024-03-20",
    "2024-03-21",
    "2024-03-22",
    // ... more dates
  ];

  const handleDateSelect = (date: string) => {
    onDateSelect(date);
    close();
  };

  return (
    <div className="race-day-menu">
      <div className="menu-header">
        <h2
          onClick={() => onDateSelect(null)}
          className={`menu-title ${selectedDate ? "clickable" : ""}`}
        >
          Race Days
        </h2>
      </div>
      <ul>
        {raceDays.map((date) => (
          <li key={date}>
            <button
              className={`race-day-button ${
                selectedDate === date ? "active" : ""
              }`}
              onClick={() => handleDateSelect(date)}
            >
              {formatDate(date)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
