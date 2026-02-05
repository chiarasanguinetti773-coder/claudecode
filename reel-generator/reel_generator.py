#!/usr/bin/env python3
"""
Instagram Reel Generator - Educational Video Creator
====================================================
Genera video educativi in stile Instagram Reels moderno
con testi animati, grafiche 3D stilizzate e transizioni smooth.

Autore: Claude AI
Versione: 1.0
"""

import json
import argparse
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import math

# Video processing
from moviepy.editor import (
    VideoClip, ColorClip, TextClip, CompositeVideoClip,
    concatenate_videoclips, ImageClip
)
from moviepy.video.fx.all import fadein, fadeout, resize
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Local modules
from graphics_3d import create_3d_object, ObjectType
from transitions import apply_transition, TransitionType
from text_animator import create_animated_text, TextStyle


# ============================================
# CONFIGURATION
# ============================================

DEFAULT_CONFIG = {
    "video": {
        "width": 1080,
        "height": 1920,
        "fps": 30,
        "duration": 45
    },
    "colors": {
        "background": "#F5F3EF",
        "accent": "#8B6FD9",
        "accent_light": "#D4A5E8",
        "text_primary": "#3D1F5C",
        "text_secondary": "#5A4570"
    },
    "fonts": {
        "headline": "Inter-Bold",
        "headline_fallback": "Arial-BoldMT",
        "italic": "PlayfairDisplay-Italic",
        "italic_fallback": "Georgia-Italic"
    },
    "timing": {
        "hook_duration": 3.0,
        "point_duration": 10.0,
        "cta_duration": 12.0,
        "transition_duration": 0.4,
        "word_delay": 0.1,
        "phrase_hold": 2.5
    },
    "animation": {
        "text_speed": "medium",  # slow, medium, fast
        "object_style": "cups",   # cups, speakers, icons, timer
        "transition_style": "swipe_diagonal"  # swipe_diagonal, scale_fade, liquid, split
    }
}

# Default script content
DEFAULT_SCRIPT = {
    "hook": {
        "text": "Smetti di fare questi errori nei tuoi Reel",
        "duration": 3.0
    },
    "points": [
        {
            "number": "Primo",
            "title": "iniziare con 'ciao ragazzi'",
            "lines": [
                "Non ti conoscono ancora",
                "Hai 2 secondi per attirare l'attenzione",
                "Non sprecarla per fare i saluti"
            ],
            "object_type": "speakers",
            "duration": 10.0
        },
        {
            "number": "Secondo",
            "title": "parlare lentamente",
            "lines": [
                "Se parli lentamente la gente scrollerà",
                "Vai dritto al punto e usa un ritmo veloce"
            ],
            "object_type": "timer",
            "duration": 10.0
        },
        {
            "number": "Terzo",
            "title": "non avere un CTA finale",
            "lines": [
                "Se non chiedi nulla, non otterrai nulla",
                "Salva, commenta, seguimi",
                "Digli cosa devono fare"
            ],
            "object_type": "cups",
            "duration": 10.0
        }
    ],
    "cta": {
        "lines": [
            "E tu quanti di questi errori stavi facendo?",
            "Vuoi avere degli hook e dei CTA già pronti?",
            "Scrivi REEL nei commenti"
        ],
        "duration": 12.0
    }
}


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Converte colore hex in RGB."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def create_background(width: int, height: int, color: str,
                      gradient: bool = False, gradient_color: str = None) -> np.ndarray:
    """Crea sfondo con colore solido o gradient."""
    rgb = hex_to_rgb(color)

    if gradient and gradient_color:
        rgb2 = hex_to_rgb(gradient_color)
        img = Image.new('RGB', (width, height))
        draw = ImageDraw.Draw(img)

        for y in range(height):
            ratio = y / height
            r = int(rgb[0] * (1 - ratio) + rgb2[0] * ratio)
            g = int(rgb[1] * (1 - ratio) + rgb2[1] * ratio)
            b = int(rgb[2] * (1 - ratio) + rgb2[2] * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        return np.array(img)
    else:
        return np.full((height, width, 3), rgb, dtype=np.uint8)


class ReelGenerator:
    """Generatore principale di Instagram Reels educativi."""

    def __init__(self, config: Dict = None, script: Dict = None):
        self.config = {**DEFAULT_CONFIG, **(config or {})}
        self.script = script or DEFAULT_SCRIPT

        self.width = self.config["video"]["width"]
        self.height = self.config["video"]["height"]
        self.fps = self.config["video"]["fps"]

        self.colors = self.config["colors"]
        self.timing = self.config["timing"]

        # Background frame
        self.bg_frame = create_background(
            self.width, self.height,
            self.colors["background"],
            gradient=True,
            gradient_color=self.colors.get("background_gradient", "#EDE8E3")
        )

    def _get_font(self, style: str = "headline", size: int = 80) -> ImageFont.FreeTypeFont:
        """Carica font con fallback."""
        font_config = self.config["fonts"]

        font_names = []
        if style == "headline":
            font_names = [font_config["headline"], font_config["headline_fallback"], "Arial"]
        elif style == "italic":
            font_names = [font_config["italic"], font_config["italic_fallback"], "Georgia"]
        else:
            font_names = ["Arial"]

        for font_name in font_names:
            try:
                # Try system fonts
                return ImageFont.truetype(font_name, size)
            except (IOError, OSError):
                try:
                    # Try with .ttf extension
                    return ImageFont.truetype(f"{font_name}.ttf", size)
                except (IOError, OSError):
                    continue

        # Fallback to default
        return ImageFont.load_default()

    def _create_text_frame(self, text: str, style: TextStyle,
                          position: Tuple[int, int] = None,
                          max_width: int = None) -> np.ndarray:
        """Crea frame con testo renderizzato."""
        img = Image.fromarray(self.bg_frame.copy())
        draw = ImageDraw.Draw(img)

        font_style = "italic" if style.italic else "headline"
        font = self._get_font(font_style, style.size)

        text_color = hex_to_rgb(style.color or self.colors["text_primary"])

        # Word wrap if needed
        max_width = max_width or int(self.width * 0.85)
        lines = self._wrap_text(text, font, max_width)

        # Calculate position
        total_height = len(lines) * (style.size + 10)

        if position is None:
            x = self.width // 2
            y = (self.height - total_height) // 2
        else:
            x, y = position

        # Draw text
        for i, line in enumerate(lines):
            bbox = draw.textbbox((0, 0), line, font=font)
            text_width = bbox[2] - bbox[0]

            line_x = x - text_width // 2
            line_y = y + i * (style.size + 10)

            # Shadow/stroke effect
            if style.stroke:
                stroke_color = hex_to_rgb(self.colors["accent"])
                for dx, dy in [(-2, -2), (-2, 2), (2, -2), (2, 2)]:
                    draw.text((line_x + dx, line_y + dy), line,
                             font=font, fill=stroke_color)

            draw.text((line_x, line_y), line, font=font, fill=text_color)

        return np.array(img)

    def _wrap_text(self, text: str, font: ImageFont.FreeTypeFont,
                   max_width: int) -> List[str]:
        """Divide testo in linee che rientrano nella larghezza massima."""
        words = text.split()
        lines = []
        current_line = []

        # Create temp image for text measurement
        img = Image.new('RGB', (1, 1))
        draw = ImageDraw.Draw(img)

        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            width = bbox[2] - bbox[0]

            if width <= max_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                current_line = [word]

        if current_line:
            lines.append(' '.join(current_line))

        return lines

    def create_hook_clip(self) -> VideoClip:
        """Crea clip per l'hook iniziale."""
        hook = self.script["hook"]
        duration = hook.get("duration", self.timing["hook_duration"])

        text = hook["text"]
        style = TextStyle(
            size=90,
            bold=True,
            color=self.colors["text_primary"],
            stroke=True
        )

        # Animated text entrance
        def make_frame(t):
            # Word by word reveal
            words = text.split()
            visible_words = int((t / duration) * len(words) * 2)
            visible_words = min(visible_words, len(words))

            visible_text = ' '.join(words[:visible_words])

            if visible_text:
                return self._create_text_frame(visible_text, style)
            return self.bg_frame

        return VideoClip(make_frame, duration=duration)

    def create_point_clip(self, point: Dict, index: int) -> VideoClip:
        """Crea clip per un punto educativo."""
        duration = point.get("duration", self.timing["point_duration"])
        number = point["number"]
        title = point["title"]
        lines = point["lines"]
        object_type = point.get("object_type", "cups")

        # Calculate timing for each element
        title_duration = 2.0
        line_duration = (duration - title_duration) / len(lines)

        clips = []
        current_time = 0

        # Title clip: "Primo: iniziare con 'ciao ragazzi'"
        def make_title_frame(t):
            img = Image.fromarray(self.bg_frame.copy())
            draw = ImageDraw.Draw(img)

            # Number (bold)
            font_bold = self._get_font("headline", 85)
            number_color = hex_to_rgb(self.colors["accent"])

            # Title (italic)
            font_italic = self._get_font("italic", 60)
            title_color = hex_to_rgb(self.colors["text_primary"])

            # Draw number
            y_pos = self.height // 3
            bbox = draw.textbbox((0, 0), f"{number}:", font=font_bold)
            number_width = bbox[2] - bbox[0]
            draw.text(
                ((self.width - number_width) // 2, y_pos),
                f"{number}:",
                font=font_bold,
                fill=number_color
            )

            # Draw title below
            y_pos += 100
            title_lines = self._wrap_text(title, font_italic, int(self.width * 0.8))
            for line in title_lines:
                bbox = draw.textbbox((0, 0), line, font=font_italic)
                line_width = bbox[2] - bbox[0]
                draw.text(
                    ((self.width - line_width) // 2, y_pos),
                    line,
                    font=font_italic,
                    fill=title_color
                )
                y_pos += 70

            # Add 3D object
            obj_img = create_3d_object(
                ObjectType[object_type.upper()],
                size=int(self.width * 0.4),
                color=self.colors["accent"],
                animation_progress=t / title_duration
            )

            # Paste object at bottom center
            obj_x = (self.width - obj_img.width) // 2
            obj_y = int(self.height * 0.6)
            img.paste(obj_img, (obj_x, obj_y), obj_img if obj_img.mode == 'RGBA' else None)

            return np.array(img)

        title_clip = VideoClip(make_title_frame, duration=title_duration)
        clips.append(title_clip)

        # Line clips
        for i, line in enumerate(lines):
            def make_line_frame(t, line_text=line, line_idx=i):
                img = Image.fromarray(self.bg_frame.copy())
                draw = ImageDraw.Draw(img)

                font = self._get_font("headline", 70)
                color = hex_to_rgb(self.colors["text_primary"])

                # Animate word by word
                words = line_text.split()
                progress = t / line_duration
                visible_count = int(progress * len(words) * 1.5)
                visible_count = min(visible_count, len(words))

                visible_text = ' '.join(words[:visible_count])

                if visible_text:
                    wrapped = self._wrap_text(visible_text, font, int(self.width * 0.85))
                    y_pos = self.height // 2 - len(wrapped) * 40

                    for wrapped_line in wrapped:
                        bbox = draw.textbbox((0, 0), wrapped_line, font=font)
                        line_width = bbox[2] - bbox[0]

                        # Scale effect for keywords
                        draw.text(
                            ((self.width - line_width) // 2, y_pos),
                            wrapped_line,
                            font=font,
                            fill=color
                        )
                        y_pos += 80

                return np.array(img)

            line_clip = VideoClip(
                lambda t, l=line, idx=i: make_line_frame(t, l, idx),
                duration=line_duration
            )
            clips.append(line_clip)

        return concatenate_videoclips(clips)

    def create_cta_clip(self) -> VideoClip:
        """Crea clip per il CTA finale."""
        cta = self.script["cta"]
        duration = cta.get("duration", self.timing["cta_duration"])
        lines = cta["lines"]

        line_duration = duration / len(lines)

        clips = []

        for i, line in enumerate(lines):
            # Alternate styles
            is_question = "?" in line

            def make_frame(t, text=line, is_q=is_question):
                img = Image.fromarray(self.bg_frame.copy())
                draw = ImageDraw.Draw(img)

                size = 75 if is_q else 65
                font = self._get_font("headline" if is_q else "italic", size)
                color = hex_to_rgb(
                    self.colors["accent"] if is_q else self.colors["text_primary"]
                )

                # Fade in effect
                alpha = min(1.0, t / 0.3)

                wrapped = self._wrap_text(text, font, int(self.width * 0.85))
                y_pos = self.height // 2 - len(wrapped) * (size // 2)

                for wrapped_line in wrapped:
                    bbox = draw.textbbox((0, 0), wrapped_line, font=font)
                    line_width = bbox[2] - bbox[0]
                    draw.text(
                        ((self.width - line_width) // 2, y_pos),
                        wrapped_line,
                        font=font,
                        fill=color
                    )
                    y_pos += size + 15

                return np.array(img)

            clip = VideoClip(lambda t, l=line, q=("?" in line): make_frame(t, l, q),
                           duration=line_duration)
            clips.append(clip)

        return concatenate_videoclips(clips)

    def generate(self, output_path: str = "output.mp4") -> str:
        """Genera il video completo."""
        print("Generazione video Instagram Reel...")

        clips = []

        # 1. Hook
        print("  Creazione hook...")
        hook_clip = self.create_hook_clip()
        clips.append(hook_clip)

        # 2. Points
        for i, point in enumerate(self.script["points"]):
            print(f"  Creazione punto {i + 1}...")
            point_clip = self.create_point_clip(point, i)
            clips.append(point_clip)

        # 3. CTA
        print("  Creazione CTA...")
        cta_clip = self.create_cta_clip()
        clips.append(cta_clip)

        # Apply transitions between clips
        print("  Applicazione transizioni...")
        final_clips = []
        transition_type = TransitionType[
            self.config["animation"]["transition_style"].upper()
        ]

        for i, clip in enumerate(clips):
            if i > 0:
                # Add transition
                clip = apply_transition(
                    clips[i-1], clip,
                    transition_type,
                    duration=self.timing["transition_duration"]
                )
            final_clips.append(clip)

        # Concatenate all clips
        print("  Composizione finale...")
        final_video = concatenate_videoclips(clips)

        # Export
        print(f"  Esportazione in {output_path}...")
        final_video.write_videofile(
            output_path,
            fps=self.fps,
            codec='libx264',
            audio=False,
            preset='medium',
            bitrate='8000k'
        )

        print(f"Video generato: {output_path}")
        return output_path


def load_config(config_path: str) -> Dict:
    """Carica configurazione da file JSON."""
    with open(config_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description='Genera video Instagram Reel educativi'
    )
    parser.add_argument(
        '--config', '-c',
        type=str,
        help='Path al file di configurazione JSON'
    )
    parser.add_argument(
        '--output', '-o',
        type=str,
        default='reel_output.mp4',
        help='Path del video di output'
    )
    parser.add_argument(
        '--preset', '-p',
        type=str,
        choices=['educational', 'before_after', 'countdown', 'qa'],
        default='educational',
        help='Preset da utilizzare'
    )

    args = parser.parse_args()

    # Load config
    config = None
    script = None

    if args.config:
        data = load_config(args.config)
        config = data.get('config', None)
        script = data.get('script', None)

    # Generate
    generator = ReelGenerator(config=config, script=script)
    generator.generate(args.output)


if __name__ == "__main__":
    main()
