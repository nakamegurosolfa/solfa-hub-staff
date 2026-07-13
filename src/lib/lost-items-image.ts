const DEFAULT_MAX_EDGE = 1280;
const DEFAULT_JPEG_QUALITY = 0.82;

export type CompressedLostItemPhoto = {
  dataBase64: string;
  mimeType: string;
  filename: string;
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("画像の読み込みに失敗しました。"));
    image.src = dataUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("画像の圧縮に失敗しました。"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("画像の変換に失敗しました。"));
    reader.readAsDataURL(blob);
  });
}

export async function compressLostItemPhoto(
  file: File,
  maxEdge = DEFAULT_MAX_EDGE,
  quality = DEFAULT_JPEG_QUALITY,
): Promise<CompressedLostItemPhoto> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("画像の圧縮に失敗しました。");
  }

  context.drawImage(image, 0, 0, width, height);

  const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, mimeType, quality);
  const dataBase64 = await blobToBase64(blob);
  const extension = mimeType === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "").trim() || "lost-item";
  const filename = `${baseName}.${extension}`;

  return { dataBase64, mimeType, filename };
}
