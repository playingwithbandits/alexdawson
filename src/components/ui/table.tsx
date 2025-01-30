interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <table className="w-full border-collapse rounded-lg overflow-hidden">
      {children}
    </table>
  );
}

export function TableBody({ children }: TableProps) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }: TableProps) {
  return (
    <tr className="border-b border-black transition-colors">{children}</tr>
  );
}

export function TableCell({
  children,
  className = "",
}: TableProps & { className?: string }) {
  return <td className={`p-3 text-sm ${className}`}>{children}</td>;
}
