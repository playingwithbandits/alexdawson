import { useEffect, useRef, useState } from "react";

interface HoverTooltipProps {
  content: string;
  children: React.ReactNode;
  defaultStrikethrough?: boolean;
}

export function HoverTooltip({
  content,
  children,
  defaultStrikethrough,
}: HoverTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(defaultStrikethrough);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStrikethrough(!isStrikethrough);
  };

  return (
    <div
      className={`relative inline-block ${
        isStrikethrough ? "opacity-50 line-through" : ""
      }`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={handleClick}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-50  bg-gray-900 text-white text-sm rounded shadow-lg w-[90vw] max-w-[500px]  whitespace-pre-wrap p-4"
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
