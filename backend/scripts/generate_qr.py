import sys
import io
import base64
import qrcode

def generate(url, fmt='PNG'):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=3
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    save_format = "JPEG" if fmt.upper() == 'JPEG' else "PNG"
    if save_format == 'JPEG':
        img = img.convert('RGB')
    img.save(buf, format=save_format)
    b64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    mime = "image/jpeg" if save_format == 'JPEG' else "image/png"
    return f"data:{mime};base64,{b64}"

if __name__ == '__main__':
    url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:6001/form'
    fmt = sys.argv[2] if len(sys.argv) > 2 else 'PNG'
    print(generate(url, fmt))

