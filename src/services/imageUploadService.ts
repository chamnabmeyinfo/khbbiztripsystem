import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface ImageUploadOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeBytes?: number; // Target max size in bytes for fallback base64 (default: 65000 = ~65KB)
  onProgress?: (status: string) => void;
}

/**
 * Resizes and compresses an image client-side to ensure ultra-compact byte footprint.
 * Iteratively scales down and optimizes quality until the output is strictly within safe storage limits.
 */
export const compressImageClient = async (
  fileOrBlob: File | Blob,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    maxSizeBytes?: number;
  } = {}
): Promise<{ blob: Blob; dataUrl: string }> => {
  const {
    maxWidth = 1000,
    maxHeight = 750,
    quality = 0.78,
    maxSizeBytes = 65000 // 65 KB safety limit per image
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const srcUrl = event.target?.result as string;
      if (!srcUrl) {
        return reject(new Error('Empty image payload'));
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let currentWidth = img.width;
        let currentHeight = img.height;

        // Maintain aspect ratio within bounds
        if (currentWidth > maxWidth) {
          currentHeight = Math.round((currentHeight * maxWidth) / currentWidth);
          currentWidth = maxWidth;
        }
        if (currentHeight > maxHeight) {
          currentWidth = Math.round((currentWidth * maxHeight) / currentHeight);
          currentHeight = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, currentWidth);
        canvas.height = Math.max(1, currentHeight);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Canvas 2D context not available'));
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        let currentQuality = quality;
        let finalDataUrl = canvas.toDataURL('image/jpeg', currentQuality);

        // Iterative compression if size exceeds safety limit
        let attempts = 0;
        while (finalDataUrl.length > maxSizeBytes && attempts < 5) {
          attempts++;
          currentQuality = Math.max(0.45, currentQuality - 0.1);
          currentWidth = Math.round(currentWidth * 0.85);
          currentHeight = Math.round(currentHeight * 0.85);

          canvas.width = Math.max(1, currentWidth);
          canvas.height = Math.max(1, currentHeight);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          finalDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUrl: finalDataUrl });
            } else {
              // Fallback blob conversion from dataUrl
              const arr = finalDataUrl.split(',');
              const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              resolve({ blob: new Blob([u8arr], { type: mime }), dataUrl: finalDataUrl });
            }
          },
          'image/jpeg',
          currentQuality
        );
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(fileOrBlob);
  });
};

/**
 * Universal image upload helper.
 * 1. Compresses image client-side to ensure ultra-low size.
 * 2. Attempts upload to Firebase Cloud Storage (returns permanent CDN URL).
 * 3. If storage upload fails/offline, falls back safely to ultra-compact Data URL.
 */
export const uploadImage = async (
  file: File | Blob,
  options: ImageUploadOptions = {}
): Promise<string> => {
  const {
    folder = 'packages',
    maxWidth = 1000,
    maxHeight = 750,
    quality = 0.78,
    maxSizeBytes = 65000,
    onProgress
  } = options;

  onProgress?.('Optimizing photo...');

  // Step 1: Client-side compression
  const { blob, dataUrl } = await compressImageClient(file, {
    maxWidth,
    maxHeight,
    quality,
    maxSizeBytes
  });

  // Step 2: Attempt Firebase Storage upload if available
  if (storage) {
    try {
      onProgress?.('Saving to cloud storage...');
      const cleanFileName = `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
      const storagePath = `uploads/${folder}/${cleanFileName}`;
      const storageReference = ref(storage, storagePath);

      const uploadResult = await uploadBytes(storageReference, blob, {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=31536000'
      });

      const downloadUrl = await getDownloadURL(uploadResult.ref);
      onProgress?.('Upload complete');
      return downloadUrl;
    } catch (storageError) {
      console.warn('Firebase Storage upload notice (falling back to optimized payload):', storageError);
    }
  }

  // Step 3: Fallback to lightweight optimized Base64
  onProgress?.('Ready');
  return dataUrl;
};
