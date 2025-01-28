import { FormEntry } from "@/lib/generator/predictions";

interface FormHistoryTableProps {
  formEntries: FormEntry[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function FormHistoryTable({ formEntries }: FormHistoryTableProps) {
  return (
    <div className="form-history-table-wrapper">
      <table className="form-history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Pos</th>
            <th>Course</th>
            <th>Distance</th>
            <th>Going</th>
            <th>Weight</th>
            <th>OR</th>
            <th>Prize</th>
            <th>Jockey</th>
            <th>Comment</th>
          </tr>
        </thead>
        <tbody>
          {formEntries.map((entry, index) => (
            <tr key={index}>
              <td>{formatDate(entry.date)}</td>
              <td>
                {entry.position}/{entry.totalRunners}
                {entry.beatenBy && ` (${entry.beatenBy})`}
              </td>
              <td>{entry.course}</td>
              <td>{entry.distance}</td>
              <td>{entry.going}</td>
              <td>{entry.weight}</td>
              <td>{entry.raceClass}</td>
              <td>{entry.prize}</td>
              <td>{entry.jockey}</td>
              <td>{entry.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
