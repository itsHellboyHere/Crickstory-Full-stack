import type { PixelCrop } from 'react-image-crop';

export async function canvasPreview(
    image: HTMLImageElement,
    canvas: HTMLCanvasElement,
    crop: PixelCrop,
    scale: number = 1,
    rotate: number = 0,
) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Calculate device pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Calculate display size (what the user sees)
    const displayWidth = Math.floor(crop.width * scale);
    const displayHeight = Math.floor(crop.height * scale);

    // Set canvas display size (CSS pixels)
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Set canvas rendering size (actual pixels in memory)
    canvas.width = Math.floor(displayWidth * pixelRatio);
    canvas.height = Math.floor(displayHeight * pixelRatio);

    // Scale context to account for pixel ratio
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    // Calculate crop coordinates
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
    const cropWidth = crop.width * scaleX;
    const cropHeight = crop.height * scaleY;

    // Apply transformations and draw
    ctx.save();
    ctx.translate(displayWidth / 2, displayHeight / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-displayWidth / 2, -displayHeight / 2);

    ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        displayWidth,
        displayHeight,
    );

    ctx.restore();
}