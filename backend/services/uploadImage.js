import cloudinary from "../middleware/cloudinary.js";

export async function uploadImage(
  image,
  folder = "image_grv",
  publicId = null
) {
  if (!image) {
    throw new Error("No image provided");
  }

  const uploadOptions = {
    folder,
    overwrite: true,
  };

  if (publicId) {
    uploadOptions.public_id = publicId;
  }

  try {
    const result = await cloudinary.uploader.upload(image, uploadOptions);
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    if (err.http_code === 409) {
      return { exists: true, public_id: publicId };
    }
    throw err;
  }
}
