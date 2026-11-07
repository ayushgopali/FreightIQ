import os
import subprocess
import json
import math
from PIL import Image, ImageFilter

MEDIA_DIR = "FreightIQ/frontend/public/media"
SOURCE_DIR = os.path.join(MEDIA_DIR, "source")
SRC_IMG = os.path.join(SOURCE_DIR, "port-night.png")

os.makedirs(SOURCE_DIR, exist_ok=True)
os.makedirs(MEDIA_DIR, exist_ok=True)

# 1. Open original image
orig = Image.open(SRC_IMG).convert("RGB")
orig_w, orig_h = orig.size
print(f"Original image size: {orig_w}x{orig_h}")

# Upscale to 3840x2160 using Lanczos
target_w, target_h = 3840, 2160
img_3840 = orig.resize((target_w, target_h), Image.Resampling.LANCZOS)
img_3840.save(os.path.join(SOURCE_DIR, "port-night-3840.png"), format="PNG", optimize=True)
print("Saved 3840x2160 Lanczos upscaled version in source/ (note: upscaling adds no real detail).")

# 2. Downscaled 1920x1080 and 960x540
img_1920 = img_3840.resize((1920, 1080), Image.Resampling.LANCZOS)
img_960 = img_3840.resize((960, 540), Image.Resampling.LANCZOS)

# Save WebP versions
img_3840.save(os.path.join(MEDIA_DIR, "port-night-3840.webp"), format="WEBP", quality=82, method=6)
img_1920.save(os.path.join(MEDIA_DIR, "port-night-1920.webp"), format="WEBP", quality=85, method=6)
img_960.save(os.path.join(MEDIA_DIR, "port-night-960.webp"), format="WEBP", quality=85, method=6)

# Tiny blurred placeholder (32x18)
placeholder = img_960.resize((32, 18), Image.Resampling.BOX).filter(ImageFilter.GaussianBlur(1.2))
placeholder.save(os.path.join(MEDIA_DIR, "port-night-placeholder.webp"), format="WEBP", quality=50)

# 3. 3:4 Mobile Crop focused on cranes & bulk carrier
# Cranes are around 26% to 62% width. Bulk carrier is around 30% to 68% width. Center ~ 47% = 1805 px on 3840.
crop_w = int(target_h * 3 / 4) # 2160 * 0.75 = 1620
center_x = int(target_w * 0.47) # 1804
crop_left = max(0, center_x - crop_w // 2)
crop_right = crop_left + crop_w
crop_box = (crop_left, 0, crop_right, target_h)
img_mobile_full = img_3840.crop(crop_box) # 1620 x 2160 (3:4)

# Mobile sizes: 900x1200 (1200 tall) and 450x600 (600 tall)
img_mob_1200 = img_mobile_full.resize((900, 1200), Image.Resampling.LANCZOS)
img_mob_600 = img_mobile_full.resize((450, 600), Image.Resampling.LANCZOS)

img_mob_1200.save(os.path.join(MEDIA_DIR, "port-night-mobile-1200.webp"), format="WEBP", quality=85, method=6)
img_mob_600.save(os.path.join(MEDIA_DIR, "port-night-mobile-600.webp"), format="WEBP", quality=85, method=6)

mob_placeholder = img_mob_600.resize((24, 32), Image.Resampling.BOX).filter(ImageFilter.GaussianBlur(1.2))
mob_placeholder.save(os.path.join(MEDIA_DIR, "port-night-mobile-placeholder.webp"), format="WEBP", quality=50)

# 4. Generate AVIF variants using ffmpeg with fast libsvtav1
def make_avif(input_path, output_path, w, h=None):
    scale_filter = f"scale={w}:{h}" if h else f"scale={w}:-1"
    cmd = [
        "ffmpeg", "-y", "-i", input_path,
        "-vf", scale_filter,
        "-c:v", "libsvtav1",
        "-preset", "9",
        "-crf", "32",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

print("Encoding AVIF files with fast libsvtav1...")
make_avif(os.path.join(MEDIA_DIR, "port-night-3840.webp"), os.path.join(MEDIA_DIR, "port-night-3840.avif"), 3840, 2160)
make_avif(os.path.join(MEDIA_DIR, "port-night-1920.webp"), os.path.join(MEDIA_DIR, "port-night-1920.avif"), 1920, 1080)
make_avif(os.path.join(MEDIA_DIR, "port-night-960.webp"), os.path.join(MEDIA_DIR, "port-night-960.avif"), 960, 540)
make_avif(os.path.join(MEDIA_DIR, "port-night-mobile-1200.webp"), os.path.join(MEDIA_DIR, "port-night-mobile-1200.avif"), 900, 1200)
make_avif(os.path.join(MEDIA_DIR, "port-night-mobile-600.webp"), os.path.join(MEDIA_DIR, "port-night-mobile-600.avif"), 450, 600)
print("AVIF encoding complete.")

# Clean up any leftover test files
for t in ["test_svt.avif", "test_960.avif"]:
    tp = os.path.join(MEDIA_DIR, t)
    if os.path.exists(tp):
        os.remove(tp)

# 5. Measure total media size
total_bytes = 0
for f in os.listdir(MEDIA_DIR):
    fp = os.path.join(MEDIA_DIR, f)
    if os.path.isfile(fp):
        size = os.path.getsize(fp)
        total_bytes += size
        print(f"  {f}: {size / 1024:.1f} KB")

print(f"Total landing public media size (excluding source/): {total_bytes / (1024*1024):.2f} MB (Target: < 10 MB)")

# 6. Automatic Bright Warm Lights Detection
# Sample on 960x540 for fast clustering
pixels = img_960.load()
w960, h960 = img_960.size
bright_points = []

for y in range(h960):
    for x in range(w960):
        r, g, b = pixels[x, y]
        lum = 0.299 * r + 0.587 * g + 0.114 * b
        is_warm = (r > 195 and g > 140 and b < 170 and r > b + 25)
        is_crane_warning = (r > 210 and g < 110 and b < 110) # Red warning light on top of crane
        if lum > 175 and (is_warm or is_crane_warning):
            bright_points.append({
                "x": x / w960 * 100.0,
                "y": y / h960 * 100.0,
                "lum": lum,
                "is_warning": is_crane_warning,
                "color": "#FF3B30" if is_crane_warning else "#FFD479"
            })

# Cluster nearby points within 2.0% radius
clusters = []
for pt in bright_points:
    merged = False
    for cl in clusters:
        dist = math.hypot(cl["x"] - pt["x"], cl["y"] - pt["y"])
        if dist < 2.0:
            cl["x"] = (cl["x"] * cl["count"] + pt["x"]) / (cl["count"] + 1)
            cl["y"] = (cl["y"] * cl["count"] + pt["y"]) / (cl["count"] + 1)
            cl["lum"] = max(cl["lum"], pt["lum"])
            cl["count"] += 1
            merged = True
            break
    if not merged:
        clusters.append({
            "x": pt["x"],
            "y": pt["y"],
            "lum": pt["lum"],
            "count": 1,
            "is_warning": pt["is_warning"],
            "color": pt["color"]
        })

clusters = [c for c in clusters if c["count"] >= 2]
clusters.sort(key=lambda c: (c["count"] * c["lum"]), reverse=True)
top_lights = clusters[:45]

for idx, l in enumerate(top_lights):
    l["id"] = f"light-{idx}"
    l["radius"] = round(1.2 + min(3.0, l["count"] * 0.15), 1)
    l["intensity"] = round(min(1.0, l["lum"] / 255.0), 2)
    l["x"] = round(l["x"], 2)
    l["y"] = round(l["y"], 2)
    del l["count"]
    del l["lum"]
    if l["is_warning"]:
        l["type"] = "crane-warning"
    elif l["x"] < 15 and l["y"] < 30:
        l["type"] = "lighthouse"
    else:
        l["type"] = "ambient-flicker"

config_dir = "FreightIQ/frontend/src/config"
os.makedirs(config_dir, exist_ok=True)
with open(os.path.join(config_dir, "portLights.json"), "w") as f:
    json.dump(top_lights, f, indent=2)

print(f"Generated {len(top_lights)} detected light positions into src/config/portLights.json")
