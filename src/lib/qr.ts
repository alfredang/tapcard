import QRCode from "qrcode";

export interface QrStyle {
  dark?: string; // foreground color
  light?: string; // background color
  margin?: number;
  width?: number;
}

/** Data URL (PNG) — convenient for <img> previews and downloads. */
export async function qrDataUrl(text: string, style: QrStyle = {}) {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "H", // high — leaves room for a center logo overlay
    margin: style.margin ?? 2,
    width: style.width ?? 512,
    color: {
      dark: style.dark ?? "#000000",
      light: style.light ?? "#ffffff",
    },
  });
}

/** Raw SVG string — crisp at any size, good for print/PDF. */
export async function qrSvg(text: string, style: QrStyle = {}) {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: style.margin ?? 2,
    width: style.width ?? 512,
    color: {
      dark: style.dark ?? "#000000",
      light: style.light ?? "#ffffff",
    },
  });
}
