import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

// 32x32 is the standard size for tab favicons
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default async function Icon() {
  const filePath = path.join(process.cwd(), "public", "logo.png");
  const buffer = fs.readFileSync(filePath);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:image/png;base64,${base64}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <img
          src={dataUrl}
          style={{
            width: "82%", // Adds perfect padding so the logo doesn't touch browser tab borders
            height: "82%",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
