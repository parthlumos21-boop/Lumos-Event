const QRCode = require('../models/QRCode');
const { generateQRDataUrl } = require('../utils/generateQR');
const logger = require('../utils/logger');

const DEFAULT_CODE_ID = 'lumos_public_event_form';

/**
 * GET /api/qr/permanent
 * Fetches the permanent QR Code from MongoDB. If not found, initializes and saves it.
 */
exports.getPermanentQRCode = async (req, res) => {
  try {
    let qrRecord = await QRCode.findOne({ codeId: DEFAULT_CODE_ID });

    // Determine target URL: environment variable > req origin > default localhost:6001
    const origin = req.headers.origin || req.headers.referer;
    let fallbackDomain = 'http://localhost:6001';
    if (origin) {
      try {
        const parsed = new URL(origin);
        fallbackDomain = `${parsed.protocol}//${parsed.host}`;
      } catch (e) {
        // use fallbackDomain
      }
    }
    const targetUrl = process.env.PUBLIC_FORM_URL || `${fallbackDomain}/form`;

    if (!qrRecord) {
      logger.info('QR GENERATION', `Generating permanent QR code for target: ${targetUrl}`);
      const qrDataUrl = await generateQRDataUrl(targetUrl, 'PNG');
      qrRecord = new QRCode({
        codeId: DEFAULT_CODE_ID,
        title: 'Lumos Event Public Registration Form',
        targetUrl,
        qrDataUrl,
        format: 'PNG',
        status: 'active',
        metadata: {
          eventName: 'Lumos Office Opening',
          errorCorrectionLevel: 'H',
          margin: 3,
          width: 1024
        },
        createdBy: {
          role: 'system',
          email: 'system@lumossolution.com'
        }
      });
      await qrRecord.save();
      logger.success('QR INITIALIZED', `Permanent QR saved in MongoDB lumos_qr_codes collection (Target: ${targetUrl})`);
    } else {
      logger.info('PERMANENT QR', `Retrieved permanent QR from MongoDB for ${targetUrl}`);
    }

    res.json({ success: true, qr: qrRecord });
  } catch (error) {
    logger.error('QR RETRIEVAL ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to retrieve permanent QR code', error: error.message });
  }
};

/**
 * POST /api/qr/permanent/sync
 * Admin endpoint to update target URL or re-generate QR code in MongoDB
 */
exports.syncPermanentQRCode = async (req, res) => {
  try {
    const { targetUrl } = req.body;
    if (!targetUrl) {
      return res.status(400).json({ success: false, message: 'Target URL is required for sync.' });
    }

    logger.info('QR RE-SYNC', `Generating refreshed QR code for new target: ${targetUrl}`);
    const qrDataUrl = await generateQRDataUrl(targetUrl, 'PNG');

    const updated = await QRCode.findOneAndUpdate(
      { codeId: DEFAULT_CODE_ID },
      {
        $set: {
          targetUrl,
          qrDataUrl,
          format: 'PNG',
          status: 'active',
          updatedAt: Date.now()
        }
      },
      { upsert: true, new: true }
    );

    logger.success('QR SYNC SUCCESS', `Permanent QR updated in MongoDB for ${targetUrl}`);
    res.json({ success: true, message: 'Permanent QR code synced successfully', qr: updated });
  } catch (error) {
    logger.error('QR SYNC ERROR', error.message, error);
    res.status(500).json({ success: false, message: 'Failed to sync permanent QR code', error: error.message });
  }
};
