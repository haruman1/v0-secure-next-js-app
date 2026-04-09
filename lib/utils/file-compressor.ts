/**
 * Client-side file compression utility
 * Focuses on reducing image size to ~1MB while maintaining quality.
 */

export async function compressImage(file: File, targetSizeMB: number = 1): Promise<File> {
  // Only target images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If already under 0.8MB, don't compress to avoid quality loss (user asked for higher quality but small)
  if (file.size < 800 * 1024) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Adaptive scaling: If image is massive (e.g. 4K+), scale down to more reasonable dimensions
        const MAX_DIM = 2500;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Quality iteration to hit target size if possible
        let quality = 0.85; // Start with high quality as requested
        
        const tryCompress = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file);
              }
              
              // If still too large (> targetSizeMB + 10%) and quality > 0.4, try again
              if (blob.size > targetSizeMB * 1024 * 1024 * 1.1 && q > 0.4) {
                tryCompress(q - 0.1);
              } else {
                resolve(new File([blob], file.name, {
                  type: 'image/jpeg', // Force JPEG for better compression
                  lastModified: Date.now(),
                }));
              }
            },
            'image/jpeg',
            q
          );
        };

        tryCompress(quality);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export function validateFileSize(file: File, maxMB: number = 10): boolean {
  return file.size <= maxMB * 1024 * 1024;
}
