/**
 * Image loading utilities for certificate generation
 * Provides optimized image loading for both Next.js and Fabric.js compatibility
 */

export interface ImageLoaderOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fallbackUrl?: string;
}

/**
 * Load and optimize image for Fabric.js canvas
 * This function preloads images and handles errors gracefully
 */
export const loadOptimizedImage = async (
  imageUrl: string,
  options: ImageLoaderOptions = {}
): Promise<HTMLImageElement | null> => {
  const {
    maxWidth = 200,
    maxHeight = 150,
    quality = 0.9,
    fallbackUrl = "/default-logo.svg",
  } = options;

  try {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Return a promise that resolves when image loads
    return new Promise((resolve) => {
      img.onload = () => {
        // Check if image needs resizing for performance
        if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
          // Create a canvas to resize the image
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(img); // Return original if canvas not available
            return;
          }

          // Calculate new dimensions maintaining aspect ratio
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          let newWidth = maxWidth;
          let newHeight = maxHeight;

          if (aspectRatio > 1) {
            // Landscape
            newHeight = newWidth / aspectRatio;
          } else {
            // Portrait
            newWidth = newHeight * aspectRatio;
          }

          // Set canvas size
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Draw and resize image
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Create new optimized image
          const optimizedImg = new Image();
          optimizedImg.onload = () => resolve(optimizedImg);
          optimizedImg.onerror = () => resolve(img); // Fallback to original
          optimizedImg.src = canvas.toDataURL("image/jpeg", quality);
        } else {
          resolve(img);
        }
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${imageUrl}, trying fallback...`);
        // Try loading fallback image
        if (imageUrl !== fallbackUrl) {
          loadOptimizedImage(fallbackUrl, { ...options, fallbackUrl: "" })
            .then(resolve)
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
      };

      img.src = imageUrl;
    });
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
};

/**
 * Validate image URL and return appropriate source
 */
export const getValidImageUrl = (
  userProvidedUrl?: string,
  templateUrl?: string,
  defaultUrl: string = "/default-logo.svg"
): string => {
  // Priority: User provided > Template > Default
  if (userProvidedUrl && userProvidedUrl.trim()) {
    return userProvidedUrl.trim();
  }

  if (templateUrl && templateUrl.trim()) {
    return templateUrl.trim();
  }

  return defaultUrl;
};

/**
 * Check if image URL is valid (basic validation)
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);
    return (
      ["http:", "https:", "data:"].includes(urlObj.protocol) ||
      url.startsWith("/") || // Local paths
      url.startsWith("./") || // Relative paths
      url.startsWith("../")
    ); // Parent paths
  } catch {
    return false;
  }
};

/**
 * Get image dimensions without loading the full image
 */
export const getImageDimensions = (
  imageUrl: string
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
};
