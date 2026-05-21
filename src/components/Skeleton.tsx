'use client';

/**
 * Tactical Skeleton Node
 * Pulsed placeholder for high-performance visual transitions.
 */
export function SkeletonCard() {
  return (
    <div style={{
      background: "#111",
      border: "1px solid #222",
      borderRadius: 12,
      padding: 16,
      marginBottom: 12
    }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "#1A1A1A",
          animation: "pulse 1.5s infinite"
        }} />
        <div style={{ flex: 1 }}>
          <div style={{
            height: 12,
            background: "#1A1A1A",
            borderRadius: 6,
            marginBottom: 6,
            width: "40%",
            animation: "pulse 1.5s infinite"
          }} />
          <div style={{
            height: 10,
            background: "#1A1A1A",
            borderRadius: 6,
            width: "25%",
            animation: "pulse 1.5s infinite"
          }} />
        </div>
      </div>
      <div style={{
        height: 14,
        background: "#1A1A1A",
        borderRadius: 6,
        marginBottom: 8,
        animation: "pulse 1.5s infinite"
      }} />
      <div style={{
        height: 14,
        background: "#1A1A1A",
        borderRadius: 6,
        width: "70%",
        animation: "pulse 1.5s infinite"
      }} />
    </div>
  );
}
