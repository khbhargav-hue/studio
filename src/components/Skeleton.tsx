'use client';

export function SkeletonCard() {
  return (
    <div style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 12,
      overflow: "hidden",
      marginBottom: 12
    }}>
      <div style={{
        height: 160,
        background: "#1A1A1A",
        animation: "pulse 1.5s ease-in-out infinite"
      }} />
      <div style={{ padding: 14 }}>
        <div style={{
          height: 14,
          background: "#1A1A1A",
          borderRadius: 6,
          marginBottom: 8,
          width: "60%",
          animation: "pulse 1.5s ease-in-out infinite"
        }} />
        <div style={{
          height: 12,
          background: "#1A1A1A",
          borderRadius: 6,
          width: "40%",
          animation: "pulse 1.5s ease-in-out infinite"
        }} />
      </div>
    </div>
  );
}