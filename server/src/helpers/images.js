import sharp from "sharp";
import { _upload } from "./index.js";

export async function webpToBase64(webpUrl) {
  const buffer = await sharp(webpUrl)
    .png()
    .toBuffer();

  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export async function handleImageOrFile(file) {
  try {
    if(file && file.url && file.url.toLowerCase().endsWith('.webp')){
      const pathImg = _upload.getFilePathFromUrl(file.url);
      const img = await webpToBase64(pathImg)
      return img;
    }else if(file && file.url){
      const url = _upload.getFilePathFromUrl(file.url);
      return _upload.convertImageUrltoBase64(url);
    }else{
      throw new Error("Invalid image path or URL provided.");
    }
  } catch (error) {
    console.error("Error handling image:", error);
    throw error;
    
  }
}