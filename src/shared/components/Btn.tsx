"use client";

interface BtnProps {
  color: string;
  onClick: () => void;
  children: React.ReactNode;
}

export function Btn({ color, onClick, children }: BtnProps) {
  return (
    <button
      onClick={onClick}
      className="btn-primary"
      style={{
        borderColor: color + "40",
        backgroundColor: color + "12",
        color,
      }}
    >
      {children}
    </button>
  );
}
