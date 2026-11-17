/**
 * Generates and downloads a high-resolution branded QR flyer card
 * matching the official Lumos office registration card design.
 *
 * @param {string} qrDataUrl - Base64 data URL of the generated QR matrix
 * @param {'png' | 'jpeg'} format - Target file format
 * @returns {Promise<void>}
 */
export const downloadBrandedQRCard = (qrDataUrl, format = 'png') => {
  return new Promise((resolve, reject) => {
    if (!qrDataUrl) {
      reject(new Error('QR data URL is required'));
      return;
    }

    const scale = 2; // 2x Retina resolution
    const cardWidth = 700 * scale;
    const cardHeight = 850 * scale;

    const canvas = document.createElement('canvas');
    canvas.width = cardWidth;
    canvas.height = cardHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    // High quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Fill solid white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cardWidth, cardHeight);

    // 2. Load Lumos Logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    logoImg.onload = () => {
      // Calculate logo dimensions keeping aspect ratio
      const maxLogoW = 260 * scale;
      const maxLogoH = 75 * scale;
      let logoW = logoImg.width;
      let logoH = logoImg.height;

      const ratio = Math.min(maxLogoW / logoW, maxLogoH / logoH);
      logoW = logoW * ratio;
      logoH = logoH * ratio;

      const logoX = (cardWidth - logoW) / 2;
      const logoY = 60 * scale;

      ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

      // 3. Draw Title: "Office Opening & Event Registration"
      const titleY = logoY + logoH + 45 * scale;
      ctx.fillStyle = '#1e293b'; // slate-800
      ctx.font = `700 ${25 * scale}px "Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Office Opening & Event Registration', cardWidth / 2, titleY);

      // 4. Draw Subtitle: "Scan with your phone camera to check-in"
      const subtitleY = titleY + 32 * scale;
      ctx.fillStyle = '#64748b'; // slate-500
      ctx.font = `400 ${17 * scale}px "Switzer", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.fillText('Scan with your phone camera to check-in', cardWidth / 2, subtitleY);

      // 5. Load and Draw Framed QR Code
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';

      qrImg.onload = () => {
        const frameSize = 440 * scale;
        const frameX = (cardWidth - frameSize) / 2;
        const frameY = subtitleY + 45 * scale;
        const frameRadius = 28 * scale;

        // Draw rounded container for QR Code
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(frameX, frameY, frameSize, frameSize, frameRadius);
        } else {
          // Fallback rounded rect
          ctx.moveTo(frameX + frameRadius, frameY);
          ctx.arcTo(frameX + frameSize, frameY, frameX + frameSize, frameY + frameSize, frameRadius);
          ctx.arcTo(frameX + frameSize, frameY + frameSize, frameX, frameY + frameSize, frameRadius);
          ctx.arcTo(frameX, frameY + frameSize, frameX, frameY, frameRadius);
          ctx.arcTo(frameX, frameY, frameX + frameSize, frameY, frameRadius);
          ctx.closePath();
        }

        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = '#e2e8f0'; // light gray border
        ctx.stroke();

        // Draw QR Matrix with padding inside the frame
        const qrPadding = 36 * scale;
        const qrSize = frameSize - qrPadding * 2;
        const qrX = frameX + qrPadding;
        const qrY = frameY + qrPadding;

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // 6. Export and trigger download
        try {
          const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
          const extension = format === 'jpeg' ? 'jpg' : 'png';
          const dataUrl = canvas.toDataURL(mime, 0.96);

          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `lumos-event-qr-card.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          resolve();
        } catch (exportErr) {
          reject(exportErr);
        }
      };

      qrImg.onerror = (err) => reject(new Error('Failed to load QR image on canvas'));
      qrImg.src = qrDataUrl;
    };

    logoImg.onerror = () => {
      // If logo fails to load, fallback to text logo
      ctx.fillStyle = '#31747d';
      ctx.font = `800 ${32 * scale}px "Switzer", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LUMOS', cardWidth / 2, 70 * scale);

      // Trigger title and QR code without image
      const titleY = 130 * scale;
      ctx.fillStyle = '#1e293b';
      ctx.font = `700 ${25 * scale}px "Switzer", sans-serif`;
      ctx.fillText('Office Opening & Event Registration', cardWidth / 2, titleY);

      const subtitleY = titleY + 32 * scale;
      ctx.fillStyle = '#64748b';
      ctx.font = `400 ${17 * scale}px "Switzer", sans-serif`;
      ctx.fillText('Scan with your phone camera to check-in', cardWidth / 2, subtitleY);

      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        const frameSize = 440 * scale;
        const frameX = (cardWidth - frameSize) / 2;
        const frameY = subtitleY + 45 * scale;
        const frameRadius = 28 * scale;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(frameX, frameY, frameSize, frameSize, frameRadius);
        } else {
          ctx.rect(frameX, frameY, frameSize, frameSize);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = '#e2e8f0';
        ctx.stroke();

        const qrPadding = 36 * scale;
        ctx.drawImage(
          qrImg,
          frameX + qrPadding,
          frameY + qrPadding,
          frameSize - qrPadding * 2,
          frameSize - qrPadding * 2
        );

        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const extension = format === 'jpeg' ? 'jpg' : 'png';
        const dataUrl = canvas.toDataURL(mime, 0.96);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `lumos-event-qr-card.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        resolve();
      };
      qrImg.src = qrDataUrl;
    };

    logoImg.src = '/lumos logo-title.png';
  });
};
