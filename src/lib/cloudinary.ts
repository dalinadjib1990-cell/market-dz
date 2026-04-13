import axios from 'axios';

const CLOUD_NAME = 'doaxziqm7';
const UPLOAD_PRESET = 'nadjib dali';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('فشل رفع الصورة. يرجى المحاولة مرة أخرى.');
  }
};
