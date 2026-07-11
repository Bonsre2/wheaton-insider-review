import segno
NAVY = "#1c3a5e"
urls = {
    "mitsubishi": "https://www.mitsubishicomfort.com",
    "daikin": "https://www.daikincomfort.com",
    "fujitsu": "https://www.fujitsugeneral.com/us/residential/",
    "lg": "https://www.lg.com/us/residential-hvac",
}
for name, url in urls.items():
    qr = segno.make(url, error='m')
    # PNG for docx
    qr.save(f"assets/qr_{name}.png", scale=12, border=2, dark=NAVY, light="white")
    # SVG string for HTML embedding
    qr.save(f"assets/qr_{name}.svg", scale=1, border=2, dark=NAVY, light=None)
print("QR codes generated")
