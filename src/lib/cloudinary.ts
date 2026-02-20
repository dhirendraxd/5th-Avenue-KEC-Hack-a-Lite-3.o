const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = () => {
  return Boolean(cloudName && uploadPreset);
};

const dataUrlToBlob = async (dataUrl: string): Promise<Blob> => {
  const response = await fetch(dataUrl);
  if (!response.ok) {
    throw new Error("Failed to process image for upload.");
  }
  return response.blob();
};

const uploadOneImage = async (
  dataUrl: string,
  index: number,
): Promise<string> => {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const blob = await dataUrlToBlob(dataUrl);
  const formData = new FormData();
  formData.append("file", blob, `equipment_${Date.now()}_${index}.jpg`);
  formData.append("upload_preset", uploadPreset as string);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await response.json();

  if (!response.ok) {
    const message =
      payload?.error?.message || "Failed to upload image to Cloudinary.";
    throw new Error(message);
  }

  return payload.secure_url as string;
};

export const uploadImagesToCloudinary = async (
  dataUrls: string[],
): Promise<string[]> => {
  return Promise.all(
    dataUrls.map((dataUrl, index) => uploadOneImage(dataUrl, index)),
  );
};
