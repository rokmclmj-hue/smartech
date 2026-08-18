"""
숏츠 조립 공통 라이브러리 — build_short.py(파일럿)에서 검증된 레이아웃을 재사용 가능한 함수로 분리.
사람 얼굴/음성 없음. 자막+정지이미지 Ken Burns 효과+배경음악(Close Up 고정).
"""
import os
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

W, H = 1080, 1920
FPS = 30
FONT_BOLD = r"C:\Windows\Fonts\malgunbd.ttf"
FONT_REG = r"C:\Windows\Fonts\malgun.ttf"

RED = (192, 0, 32)      # edred
INK = (11, 11, 12)       # ink
WHITE = (255, 255, 255)

MUSIC_PATH = r"C:\Users\rokmc\smartech\블로그\assets\music\close-up.mp3"


def make_background(img: Image.Image) -> Image.Image:
    bg = img.convert("RGB")
    scale = max(W / bg.width, H / bg.height)
    bg = bg.resize((int(bg.width * scale), int(bg.height * scale)), Image.LANCZOS)
    left = (bg.width - W) // 2
    top = (bg.height - H) // 2
    bg = bg.crop((left, top, left + W, top + H))
    bg = bg.filter(ImageFilter.GaussianBlur(40))
    bg = ImageEnhance.Brightness(bg).enhance(0.45)
    return bg


def make_foreground(img: Image.Image, max_w=1040, max_h=1400) -> Image.Image:
    fg = img.convert("RGB")
    scale = min(max_w / fg.width, max_h / fg.height)
    fg = fg.resize((int(fg.width * scale), int(fg.height * scale)), Image.LANCZOS)
    return fg


def caption_block_height(lines):
    line_h = 92
    return line_h * len(lines) + 60


def draw_caption_attached(canvas, lines, box_left, box_right, box_top, highlight_words=None):
    draw = ImageDraw.Draw(canvas, "RGBA")
    font = ImageFont.truetype(FONT_BOLD, 62)
    highlight_words = highlight_words or []
    line_h = 92
    box_h = caption_block_height(lines)
    draw.rectangle([box_left, box_top, box_right, box_top + box_h], fill=(0, 0, 0, 190))
    ty = box_top + 30
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        tx = (W - tw) // 2
        color = WHITE
        for hw in highlight_words:
            if hw in line:
                color = (255, 214, 100)
        draw.text((tx, ty), line, font=font, fill=color)
        ty += line_h
    return box_h


def render_scene(image_path, caption_lines, duration_s, highlight_words=None,
                  zoom_from=1.0, zoom_to=1.08, is_full_bleed=False):
    n_frames = int(duration_s * FPS)
    src = Image.open(image_path)
    bg = make_background(src)
    fg = None if is_full_bleed else make_foreground(src)

    img_left = img_top = 0
    if fg is not None:
        cap_h = caption_block_height(caption_lines) if caption_lines else 0
        block_h = fg.height + cap_h
        block_top = (H - block_h) // 2
        img_left = (W - fg.width) // 2
        img_top = block_top

    frames = []
    for i in range(n_frames):
        t = i / max(n_frames - 1, 1)
        zoom = zoom_from + (zoom_to - zoom_from) * t
        frame = bg.copy()

        if is_full_bleed:
            src_rgb = src.convert("RGB")
            scale = max(W / src_rgb.width, H / src_rgb.height) * zoom
            fs = src_rgb.resize((int(src_rgb.width * scale), int(src_rgb.height * scale)), Image.LANCZOS)
            left = (fs.width - W) // 2
            top = (fs.height - H) // 2
            frame = fs.crop((left, top, left + W, top + H))
        else:
            frame.paste(fg, (img_left, img_top))
            if caption_lines:
                draw_caption_attached(
                    frame, caption_lines, img_left, img_left + fg.width,
                    img_top + fg.height, highlight_words,
                )

        frames.append(cv2.cvtColor(np.array(frame), cv2.COLOR_RGB2BGR))
    return frames


def render_closing():
    n_frames = int(4.0 * FPS)
    frames = []
    base = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(base, "RGBA")

    font_logo = ImageFont.truetype(FONT_BOLD, 96)
    font_sub = ImageFont.truetype(FONT_BOLD, 52)
    font_url = ImageFont.truetype(FONT_REG, 44)

    logo = "SMARTECH"
    bbox = draw.textbbox((0, 0), logo, font=font_logo)
    draw.text(((W - (bbox[2]-bbox[0])) // 2, 820), logo, font=font_logo, fill=WHITE)
    draw.rounded_rectangle([W//2 - 40, 950, W//2 + 40, 958], radius=4, fill=RED)

    sub = "진공펌프 수리 · 부품 문의"
    bbox = draw.textbbox((0, 0), sub, font=font_sub)
    draw.text(((W - (bbox[2]-bbox[0])) // 2, 1000), sub, font=font_sub, fill=WHITE)

    url = "smartechvacuum.com"
    bbox = draw.textbbox((0, 0), url, font=font_url)
    draw.text(((W - (bbox[2]-bbox[0])) // 2, 1080), url, font=font_url, fill=(255, 214, 100))

    for i in range(n_frames):
        t = i / max(n_frames - 1, 1)
        alpha = min(1.0, t / 0.25)
        frame = Image.new("RGB", (W, H), INK)
        blended = Image.blend(frame, base, alpha)
        frames.append(cv2.cvtColor(np.array(blended), cv2.COLOR_RGB2BGR))
    return frames


def build_video(scenes, out_path, music_path=MUSIC_PATH, tmp_dir=None):
    """
    scenes: [{image, caption(list[str] or None), highlight(list[str] or None),
              duration(float), is_full_bleed(bool)}]
    첫 씬은 보통 thumbnail(is_full_bleed=True), 마지막에 클로징 카드 자동 추가.
    """
    tmp_dir = tmp_dir or os.path.dirname(out_path)
    os.makedirs(tmp_dir, exist_ok=True)

    all_frames = []
    for sc in scenes:
        all_frames += render_scene(
            sc["image"], sc.get("caption"), sc["duration"],
            highlight_words=sc.get("highlight"),
            zoom_from=sc.get("zoom_from", 1.0), zoom_to=sc.get("zoom_to", 1.07),
            is_full_bleed=sc.get("is_full_bleed", False),
        )
    all_frames += render_closing()

    silent_path = os.path.join(tmp_dir, "_silent_temp.mp4")
    writer = cv2.VideoWriter(silent_path, cv2.VideoWriter_fourcc(*"mp4v"), FPS, (W, H))
    for f in all_frames:
        writer.write(f)
    writer.release()

    from moviepy import VideoFileClip, AudioFileClip, afx

    video = VideoFileClip(silent_path)
    audio = AudioFileClip(music_path).subclipped(0, video.duration)
    audio = audio.with_effects([afx.AudioFadeOut(1.0)])
    video = video.with_audio(audio)
    video.write_videofile(out_path, codec="libx264", audio_codec="aac", fps=FPS, logger=None)
    video.close()
    os.remove(silent_path)
    return out_path
