"use client";

type StarProps = {
  color: "red" | "green";
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotate?: number;
};

export default function Star({
  color,
  size,
  top,
  left,
  right,
  bottom,
  rotate = 0,
}: StarProps) {
  return (
    <svg
      className={`star-decoration ${
        color === "red" ? "star-red" : "star-green"
      }`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{
        top,
        left,
        right,
        bottom,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <path d="M12 0L14.39 8.22H23.05L16.33 13.31L18.72 21.53L12 16.44L5.28 21.53L7.67 13.31L0.95 8.22H9.61L12 0Z" />
    </svg>
  );
}
