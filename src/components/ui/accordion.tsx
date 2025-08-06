import React, { useState } from "react";

interface AccordionProps {
  children: React.ReactNode;
  type?: "single" | "multiple";
  collapsible?: boolean;
}

export function Accordion({
  children,
  type = "single",
  collapsible = true,
}: AccordionProps) {
  return <div className="divide-y divide-gray-700">{children}</div>;
}

interface AccordionItemProps {
  children: React.ReactNode;
  value: string;
  isOpenDefault?: boolean;
}

export function AccordionItem({
  children,
  value,
  isOpenDefault = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === AccordionTrigger) {
            return React.cloneElement(child, { onClick: toggleOpen, isOpen });
          } else if (child.type === AccordionContent) {
            return React.cloneElement(child, { isOpen });
          }
        }
        return child;
      })}
    </div>
  );
}

interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

export function AccordionTrigger({
  children,
  className = "",
  onClick,
  isOpen = false,
}: AccordionTriggerProps) {
  return (
    <button
      className={`w-full p-2 text-left hover:bg-gray-800 transition-colors text-gray-100 ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {children}
        <svg
          className={`w-5 h-5 transition-transform text-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </button>
  );
}

interface AccordionContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

export function AccordionContent({
  children,
  isOpen = false,
}: AccordionContentProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-gray-900 transition-all duration-200 ease-in-out">
      {children}
    </div>
  );
}
