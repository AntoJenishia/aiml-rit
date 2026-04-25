"use client";

/**
 * Soft ambient gradient blobs — fixed behind all content.
 * Creates a living, subtle blue-purple atmosphere on the white page.
 */
export default function BackgroundGlows() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Top-left large blue glow */}
      <div
        className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-[0.12]"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(80px)" }}
      />
      {/* Top-right violet glow */}
      <div
        className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full opacity-[0.08]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", filter: "blur(90px)" }}
      />
      {/* Centre bottom blue tint */}
      <div
        className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07]"
        style={{ background: "radial-gradient(ellipse, #2563eb 0%, transparent 70%)", filter: "blur(100px)" }}
      />
      {/* Mid-right accent */}
      <div
        className="absolute right-1/4 top-1/2 h-[300px] w-[300px] -translate-y-1/2 rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)", filter: "blur(70px)" }}
      />
    </div>
  );
}
