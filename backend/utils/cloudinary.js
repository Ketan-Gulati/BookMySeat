import dotenv from "dotenv";
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"

dotenv.config({
  path: ".env",
});

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/* console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET); */

// Upload file
const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    fs.unlinkSync(localFilePath); // delete local file after upload

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

// Delete file
const deleteFromCloudinary = async (publicId) => {
  return await cloudinary.uploader.destroy(publicId);
};

export { uploadOnCloudinary, deleteFromCloudinary };