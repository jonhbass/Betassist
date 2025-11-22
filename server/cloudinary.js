/* eslint-env node */
/* global process */
// ...existing code...
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary (opcional - usa localStorage se não configurado)
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Upload de imagem para Cloudinary
 * @param {string} base64Image - Imagem em base64
 * @returns {Promise<string>} URL da imagem ou base64 original se Cloudinary não configurado
 */
export async function uploadReceipt(base64Image) {
  // Se Cloudinary não configurado, retorna base64 para localStorage
  if (!isConfigured) {
    console.log('ℹ️ Cloudinary não configurado - usando localStorage');
    return base64Image;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'starwin-receipts',
      resource_type: 'image',
      transformation: [
        { width: 1000, crop: 'limit' }, // Limita largura máxima
        { quality: 'auto' }, // Otimização automática
      ],
    });

    console.log('✅ Upload Cloudinary bem-sucedido:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('❌ Erro no upload Cloudinary:', error.message);
    // Fallback para base64 em caso de erro
    return base64Image;
  }
}

export { isConfigured };
