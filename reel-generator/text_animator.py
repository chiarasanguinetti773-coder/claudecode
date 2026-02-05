"""
Text Animator Module - Animazioni Testo per Instagram Reels
===========================================================
Gestisce la creazione e animazione di testo con stili multipli.
"""

from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict
from enum import Enum
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont


class AnimationType(Enum):
    """Tipi di animazione testo disponibili."""
    FADE_IN = "fade_in"
    WORD_BY_WORD = "word_by_word"
    TYPEWRITER = "typewriter"
    SLIDE_LEFT = "slide_left"
    SLIDE_RIGHT = "slide_right"
    SLIDE_UP = "slide_up"
    SCALE_POP = "scale_pop"
    BOUNCE = "bounce"


@dataclass
class TextStyle:
    """Stile del testo."""
    size: int = 70
    bold: bool = False
    italic: bool = False
    color: Optional[str] = None
    stroke: bool = False
    stroke_color: Optional[str] = None
    stroke_width: int = 2
    shadow: bool = False
    shadow_color: str = "#000000"
    shadow_offset: Tuple[int, int] = (3, 3)
    tracking: int = 0  # Letter spacing
    line_height: float = 1.2


@dataclass
class TextSegment:
    """Segmento di testo con stile specifico."""
    text: str
    style: TextStyle = field(default_factory=TextStyle)
    animation: AnimationType = AnimationType.FADE_IN
    start_time: float = 0
    duration: float = 1.0


@dataclass
class AnimatedText:
    """Testo animato completo."""
    segments: List[TextSegment]
    position: Tuple[int, int] = (540, 960)  # Center for 1080x1920
    alignment: str = "center"  # left, center, right
    max_width: int = 900


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Converte colore hex in RGB."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def ease_out_cubic(t: float) -> float:
    """Easing out cubic."""
    return 1 - pow(1 - t, 3)


def ease_out_back(t: float, overshoot: float = 1.70158) -> float:
    """Easing con overshoot."""
    t -= 1
    return t * t * ((overshoot + 1) * t + overshoot) + 1


def ease_out_bounce(t: float) -> float:
    """Easing bounce."""
    if t < 1 / 2.75:
        return 7.5625 * t * t
    elif t < 2 / 2.75:
        t -= 1.5 / 2.75
        return 7.5625 * t * t + 0.75
    elif t < 2.5 / 2.75:
        t -= 2.25 / 2.75
        return 7.5625 * t * t + 0.9375
    else:
        t -= 2.625 / 2.75
        return 7.5625 * t * t + 0.984375


class TextRenderer:
    """Renderizza testo animato su immagini."""

    def __init__(self, width: int = 1080, height: int = 1920,
                 default_font: str = "Arial", fallback_fonts: List[str] = None):
        self.width = width
        self.height = height
        self.default_font = default_font
        self.fallback_fonts = fallback_fonts or ["Arial", "Helvetica", "DejaVuSans"]
        self._font_cache: Dict[str, ImageFont.FreeTypeFont] = {}

    def get_font(self, style: TextStyle) -> ImageFont.FreeTypeFont:
        """Ottiene font con caching."""
        font_key = f"{style.size}_{style.bold}_{style.italic}"

        if font_key in self._font_cache:
            return self._font_cache[font_key]

        font_variants = []
        if style.bold and style.italic:
            font_variants = [f"{self.default_font}-BoldItalic",
                           f"{self.default_font}-BoldOblique"]
        elif style.bold:
            font_variants = [f"{self.default_font}-Bold",
                           f"{self.default_font}Bold",
                           "Arial-BoldMT"]
        elif style.italic:
            font_variants = [f"{self.default_font}-Italic",
                           f"{self.default_font}Italic",
                           "Georgia-Italic"]
        else:
            font_variants = [self.default_font]

        font_variants.extend(self.fallback_fonts)

        for font_name in font_variants:
            try:
                font = ImageFont.truetype(font_name, style.size)
                self._font_cache[font_key] = font
                return font
            except (IOError, OSError):
                try:
                    font = ImageFont.truetype(f"{font_name}.ttf", style.size)
                    self._font_cache[font_key] = font
                    return font
                except (IOError, OSError):
                    continue

        # Fallback to default
        return ImageFont.load_default()

    def measure_text(self, text: str, style: TextStyle) -> Tuple[int, int]:
        """Misura dimensioni del testo."""
        font = self.get_font(style)
        img = Image.new('RGB', (1, 1))
        draw = ImageDraw.Draw(img)
        bbox = draw.textbbox((0, 0), text, font=font)
        return bbox[2] - bbox[0], bbox[3] - bbox[1]

    def wrap_text(self, text: str, style: TextStyle, max_width: int) -> List[str]:
        """Divide testo in linee."""
        font = self.get_font(style)
        words = text.split()
        lines = []
        current_line = []

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

    def render_text(self, img: Image.Image, text: str, style: TextStyle,
                   position: Tuple[int, int], alpha: float = 1.0,
                   scale: float = 1.0, offset: Tuple[int, int] = (0, 0)) -> Image.Image:
        """
        Renderizza testo su un'immagine.

        Args:
            img: Immagine di base
            text: Testo da renderizzare
            style: Stile del testo
            position: Posizione (x, y)
            alpha: Opacità (0-1)
            scale: Scala (1.0 = normale)
            offset: Offset aggiuntivo (x, y)

        Returns:
            Image.Image: Immagine con testo
        """
        if alpha <= 0 or not text:
            return img

        draw = ImageDraw.Draw(img)

        # Adjust size for scale
        scaled_style = TextStyle(
            size=int(style.size * scale),
            bold=style.bold,
            italic=style.italic,
            color=style.color,
            stroke=style.stroke,
            stroke_color=style.stroke_color,
            stroke_width=style.stroke_width,
            shadow=style.shadow,
            shadow_color=style.shadow_color,
            shadow_offset=style.shadow_offset
        )

        font = self.get_font(scaled_style)

        # Calculate position with offset
        x = position[0] + offset[0]
        y = position[1] + offset[1]

        # Get text color with alpha
        if style.color:
            base_color = hex_to_rgb(style.color)
        else:
            base_color = (61, 31, 92)  # Default dark purple

        color = (*base_color, int(255 * alpha))

        # Draw shadow first
        if style.shadow and alpha > 0.5:
            shadow_color = hex_to_rgb(style.shadow_color)
            shadow_alpha = int(100 * alpha)
            for dx, dy in [(style.shadow_offset[0], style.shadow_offset[1])]:
                draw.text((x + dx, y + dy), text, font=font,
                         fill=(*shadow_color, shadow_alpha))

        # Draw stroke/outline
        if style.stroke and alpha > 0.5:
            stroke_color = hex_to_rgb(style.stroke_color or "#000000")
            for dx in range(-style.stroke_width, style.stroke_width + 1):
                for dy in range(-style.stroke_width, style.stroke_width + 1):
                    if dx != 0 or dy != 0:
                        draw.text((x + dx, y + dy), text, font=font,
                                 fill=(*stroke_color, int(200 * alpha)))

        # Draw main text
        draw.text((x, y), text, font=font, fill=color[:3])

        return img

    def render_animated_frame(self, background: np.ndarray,
                             animated_text: AnimatedText,
                             current_time: float) -> np.ndarray:
        """
        Renderizza un frame con testo animato.

        Args:
            background: Frame di sfondo (numpy array)
            animated_text: Testo animato
            current_time: Tempo corrente in secondi

        Returns:
            np.ndarray: Frame con testo renderizzato
        """
        img = Image.fromarray(background.copy())

        for segment in animated_text.segments:
            # Check if segment is active
            if current_time < segment.start_time:
                continue

            elapsed = current_time - segment.start_time
            progress = min(1.0, elapsed / segment.duration) if segment.duration > 0 else 1.0

            # Calculate animation parameters
            alpha, scale, offset = self._calculate_animation(
                segment.animation, progress, segment.duration
            )

            # Get text to render
            text = self._get_visible_text(segment.text, segment.animation, progress)

            if text:
                # Wrap text
                lines = self.wrap_text(text, segment.style, animated_text.max_width)

                # Calculate total height
                line_height = int(segment.style.size * segment.style.line_height)
                total_height = len(lines) * line_height

                # Starting position
                x = animated_text.position[0]
                y = animated_text.position[1] - total_height // 2

                # Render each line
                for i, line in enumerate(lines):
                    line_width, _ = self.measure_text(line, segment.style)

                    # Alignment
                    if animated_text.alignment == "center":
                        line_x = x - line_width // 2
                    elif animated_text.alignment == "right":
                        line_x = x - line_width
                    else:
                        line_x = x

                    line_y = y + i * line_height

                    img = self.render_text(
                        img, line, segment.style,
                        (line_x, line_y),
                        alpha=alpha, scale=scale, offset=offset
                    )

        return np.array(img)

    def _calculate_animation(self, animation: AnimationType,
                           progress: float, duration: float) -> Tuple[float, float, Tuple[int, int]]:
        """
        Calcola parametri animazione.

        Returns:
            Tuple[alpha, scale, offset]
        """
        alpha = 1.0
        scale = 1.0
        offset = (0, 0)

        if animation == AnimationType.FADE_IN:
            alpha = ease_out_cubic(progress)

        elif animation == AnimationType.SCALE_POP:
            if progress < 0.5:
                scale = 0.5 + ease_out_back(progress * 2) * 0.6
                alpha = ease_out_cubic(progress * 2)
            else:
                scale = 1.0 + (1 - progress) * 0.1  # Slight settle
                alpha = 1.0

        elif animation == AnimationType.SLIDE_LEFT:
            eased = ease_out_cubic(progress)
            offset = (int(200 * (1 - eased)), 0)
            alpha = eased

        elif animation == AnimationType.SLIDE_RIGHT:
            eased = ease_out_cubic(progress)
            offset = (int(-200 * (1 - eased)), 0)
            alpha = eased

        elif animation == AnimationType.SLIDE_UP:
            eased = ease_out_cubic(progress)
            offset = (0, int(100 * (1 - eased)))
            alpha = eased

        elif animation == AnimationType.BOUNCE:
            alpha = 1.0
            bounce_progress = ease_out_bounce(progress)
            scale = 0.5 + bounce_progress * 0.5
            offset = (0, int(50 * (1 - bounce_progress)))

        return alpha, scale, offset

    def _get_visible_text(self, text: str, animation: AnimationType,
                         progress: float) -> str:
        """Ottiene il testo visibile basato sull'animazione."""
        if animation == AnimationType.WORD_BY_WORD:
            words = text.split()
            visible_count = int(progress * len(words) * 1.2)
            visible_count = min(visible_count, len(words))
            return ' '.join(words[:visible_count])

        elif animation == AnimationType.TYPEWRITER:
            visible_count = int(progress * len(text) * 1.1)
            visible_count = min(visible_count, len(text))
            return text[:visible_count]

        return text


def create_animated_text(text: str, style: TextStyle = None,
                        animation: AnimationType = AnimationType.WORD_BY_WORD,
                        position: Tuple[int, int] = (540, 960),
                        duration: float = 2.0) -> AnimatedText:
    """
    Helper function per creare testo animato.

    Args:
        text: Testo da animare
        style: Stile del testo
        animation: Tipo di animazione
        position: Posizione centrale
        duration: Durata animazione

    Returns:
        AnimatedText: Oggetto testo animato
    """
    style = style or TextStyle()

    segment = TextSegment(
        text=text,
        style=style,
        animation=animation,
        start_time=0,
        duration=duration
    )

    return AnimatedText(
        segments=[segment],
        position=position,
        alignment="center"
    )


def create_multi_style_text(parts: List[Dict], position: Tuple[int, int] = (540, 960),
                           base_duration: float = 0.5) -> AnimatedText:
    """
    Crea testo con stili multipli (es. mix di bold e italic).

    Args:
        parts: Lista di dict con 'text', 'bold', 'italic', 'color'
        position: Posizione centrale
        base_duration: Durata base per ogni parte

    Returns:
        AnimatedText: Testo con stili multipli
    """
    segments = []
    current_time = 0

    for part in parts:
        style = TextStyle(
            bold=part.get('bold', False),
            italic=part.get('italic', False),
            color=part.get('color'),
            size=part.get('size', 70)
        )

        animation = AnimationType[part.get('animation', 'WORD_BY_WORD').upper()]
        duration = part.get('duration', base_duration)

        segment = TextSegment(
            text=part['text'],
            style=style,
            animation=animation,
            start_time=current_time,
            duration=duration
        )
        segments.append(segment)

        current_time += duration * 0.7  # Overlap animations

    return AnimatedText(
        segments=segments,
        position=position,
        alignment="center"
    )


# Preset styles
STYLES = {
    "headline": TextStyle(size=90, bold=True, stroke=True, stroke_width=2),
    "subheadline": TextStyle(size=65, italic=True),
    "body": TextStyle(size=55),
    "emphasis": TextStyle(size=75, bold=True, color="#8B6FD9"),
    "cta": TextStyle(size=70, bold=True, color="#8B6FD9", stroke=True),
}


# Test
if __name__ == "__main__":
    # Test rendering
    renderer = TextRenderer()

    # Create test image
    bg = np.full((1920, 1080, 3), (245, 243, 239), dtype=np.uint8)

    # Create animated text
    text = create_animated_text(
        "Smetti di fare questi errori nei tuoi Reel",
        style=STYLES["headline"],
        animation=AnimationType.WORD_BY_WORD,
        duration=2.0
    )

    # Render at different progress points
    for progress in [0.25, 0.5, 0.75, 1.0]:
        frame = renderer.render_animated_frame(bg, text, progress * 2.0)
        img = Image.fromarray(frame)
        img.save(f"test_text_{int(progress*100)}.png")
        print(f"Saved: test_text_{int(progress*100)}.png")
