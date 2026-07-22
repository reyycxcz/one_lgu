import { ImageResponse } from "next/og";

export const alt = "OneLGU - Digital Portal for Dingras, Ilocos Norte";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0B2818",
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(0,177,94,0.35), transparent 60%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: "#00B15E",
            }}
          />
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "white" }}>
            OneLGU
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.15,
          }}
        >
          Digitalizing Local Government
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            color: "#9FE8BE",
            textAlign: "center",
            maxWidth: 820,
          }}
        >
          Barangay services online for Dingras, Ilocos Norte
        </div>
      </div>
    ),
    { ...size }
  );
}
