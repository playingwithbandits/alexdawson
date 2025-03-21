import { useEffect, useRef, useState } from "react";

interface HoverTooltipProps {
  content: string;
  children: React.ReactNode;
}

export function HoverTooltip({ content, children }: HoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsPinned(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPinned(!isPinned);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => !isPinned && setIsVisible(true)}
      onMouseLeave={() => !isPinned && setIsVisible(false)}
      onClick={handleClick}
    >
      {children}
      {(isVisible || isPinned) && (
        <div
          ref={tooltipRef}
          className="absolute z-50  bg-gray-900 text-white text-sm rounded shadow-lg w-[90vw] max-w-[600px]  whitespace-pre-wrap p-4"
          style={{
            left: "50%",
            transform: "translateX(-50%)",
            bottom: "100%",
            marginBottom: "8px",
          }}
        >
          <div dangerouslySetInnerHTML={{ __html: content }} />
          <div
            className="absolute w-2 h-2 bg-gray-900 transform rotate-45"
            style={{
              left: "50%",
              bottom: "-4px",
              transform: "translateX(-50%) rotate(45deg)",
            }}
          />
        </div>
      )}
    </div>
  );
}
