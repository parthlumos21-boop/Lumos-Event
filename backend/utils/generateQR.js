const { execFile } = require('child_process');
const path = require('path');

const SCRIPT_PATH = path.join(__dirname, '..', 'scripts', 'generate_qr.py');

/**
 * Generates high-res, camera-friendly QR Code as Base64 Data URL
 * @param {string} url - Target URL to encode
 * @param {string} format - 'PNG' or 'JPEG'
 * @returns {Promise<string>} Base64 data URL
 */
const generateQRDataUrl = (url, format = 'PNG') => {
  return new Promise((resolve, reject) => {
    execFile('python', [SCRIPT_PATH, url, format], { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        console.error('Error generating QR:', stderr || err);
        return reject(err);
      }
      resolve(stdout.trim());
    });
  });
};

module.exports = { generateQRDataUrl };

