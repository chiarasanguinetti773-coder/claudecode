"""
Graphics 3D Module - Oggetti 3D Stilizzati per Instagram Reels
==============================================================
Crea oggetti grafici 3D minimal e stilizzati per supportare
visivamente i contenuti educativi.
"""

from enum import Enum
from typing import Tuple, Optional
import math
from PIL import Image, ImageDraw, ImageFilter
import numpy as np


class ObjectType(Enum):
    """Tipi di oggetti 3D disponibili."""
    SPEAKERS = "speakers"
    CUPS = "cups"
    TIMER = "timer"
    ICONS = "icons"
    ARROWS = "arrows"
    CHECKMARKS = "checkmarks"


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """Converte colore hex in RGB."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def lighten_color(rgb: Tuple[int, int, int], factor: float = 0.3) -> Tuple[int, int, int]:
    """Schiarisce un colore."""
    return tuple(min(255, int(c + (255 - c) * factor)) for c in rgb)


def darken_color(rgb: Tuple[int, int, int], factor: float = 0.3) -> Tuple[int, int, int]:
    """Scurisce un colore."""
    return tuple(max(0, int(c * (1 - factor))) for c in rgb)


def create_gradient(draw: ImageDraw.Draw, bbox: Tuple[int, int, int, int],
                   color1: Tuple[int, int, int], color2: Tuple[int, int, int],
                   direction: str = "vertical"):
    """Crea un gradient in un'area."""
    x1, y1, x2, y2 = bbox

    if direction == "vertical":
        for y in range(y1, y2):
            ratio = (y - y1) / (y2 - y1) if y2 != y1 else 0
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(x1, y), (x2, y)], fill=(r, g, b))
    else:
        for x in range(x1, x2):
            ratio = (x - x1) / (x2 - x1) if x2 != x1 else 0
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            draw.line([(x, y1), (x, y2)], fill=(r, g, b))


def add_soft_shadow(img: Image.Image, offset: Tuple[int, int] = (10, 10),
                   blur_radius: int = 15, opacity: int = 100) -> Image.Image:
    """Aggiunge un'ombra morbida all'immagine."""
    # Create shadow
    shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))

    # Get alpha channel as shadow base
    if img.mode == 'RGBA':
        alpha = img.split()[3]
        shadow_base = Image.new('RGBA', img.size, (0, 0, 0, opacity))
        shadow_base.putalpha(alpha)

        # Blur shadow
        shadow_base = shadow_base.filter(ImageFilter.GaussianBlur(blur_radius))

        # Create result with shadow offset
        result = Image.new('RGBA', (img.width + abs(offset[0]) * 2,
                                     img.height + abs(offset[1]) * 2), (0, 0, 0, 0))

        # Paste shadow
        shadow_pos = (offset[0] + abs(offset[0]), offset[1] + abs(offset[1]))
        result.paste(shadow_base, shadow_pos, shadow_base)

        # Paste original
        orig_pos = (abs(offset[0]), abs(offset[1]))
        result.paste(img, orig_pos, img)

        return result

    return img


def create_speaker(size: int, color: str, animation_progress: float = 0) -> Image.Image:
    """Crea un megafono/speaker 3D stilizzato."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_color = hex_to_rgb(color)
    light_color = lighten_color(base_color, 0.4)
    dark_color = darken_color(base_color, 0.3)

    # Speaker body (cone shape)
    margin = size // 10
    cone_width_start = size // 8
    cone_width_end = size // 2.5

    # Main body
    points = [
        (margin, size // 2 - cone_width_start),
        (size - margin * 2, size // 2 - cone_width_end),
        (size - margin * 2, size // 2 + cone_width_end),
        (margin, size // 2 + cone_width_start),
    ]
    draw.polygon(points, fill=base_color)

    # Gradient effect (top lighter)
    for i in range(10):
        ratio = i / 10
        y_offset = int((cone_width_start + (cone_width_end - cone_width_start) * ratio) * 0.3)
        x = int(margin + (size - margin * 3) * ratio)
        width = int(cone_width_start + (cone_width_end - cone_width_start) * ratio)

        color_blend = tuple(int(light_color[j] * (1 - i/20) + base_color[j] * (i/20))
                           for j in range(3))
        draw.ellipse(
            [x - 5, size // 2 - width // 3, x + 5, size // 2 - width // 3 + 10],
            fill=color_blend
        )

    # Handle
    handle_x = margin - 5
    handle_height = cone_width_start * 1.5
    draw.rectangle(
        [handle_x, size // 2 - handle_height // 2,
         handle_x + size // 12, size // 2 + handle_height // 2],
        fill=dark_color
    )

    # Sound waves (animated)
    wave_alpha = int(255 * (0.3 + 0.7 * abs(math.sin(animation_progress * math.pi * 2))))
    wave_color = (*light_color, wave_alpha)

    for i in range(3):
        wave_offset = int(20 + i * 25 + animation_progress * 10)
        wave_size = 20 + i * 15

        # Arc for sound wave
        wave_x = size - margin * 2 + wave_offset
        draw.arc(
            [wave_x - wave_size, size // 2 - wave_size,
             wave_x + wave_size, size // 2 + wave_size],
            start=-60, end=60,
            fill=wave_color[:3], width=3
        )

    return img


def create_cup(size: int, color: str, animation_progress: float = 0) -> Image.Image:
    """Crea un bicchiere/contenitore 3D stilizzato (shell game style)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_color = hex_to_rgb(color)
    light_color = lighten_color(base_color, 0.5)
    dark_color = darken_color(base_color, 0.3)

    # Cup dimensions
    margin = size // 8
    cup_top_width = size - margin * 2
    cup_bottom_width = cup_top_width * 0.6
    cup_height = size * 0.7

    top_y = size // 6
    bottom_y = top_y + cup_height

    # Cup body (trapezoid shape)
    left_top = (size // 2 - cup_top_width // 2, top_y)
    right_top = (size // 2 + cup_top_width // 2, top_y)
    right_bottom = (size // 2 + cup_bottom_width // 2, bottom_y)
    left_bottom = (size // 2 - cup_bottom_width // 2, bottom_y)

    # Draw cup with gradient effect
    for i in range(int(cup_height)):
        ratio = i / cup_height
        y = top_y + i

        width_at_y = cup_top_width - (cup_top_width - cup_bottom_width) * ratio
        x_left = size // 2 - width_at_y // 2
        x_right = size // 2 + width_at_y // 2

        # Gradient from light (left) to dark (right) for 3D effect
        for x in range(int(x_left), int(x_right)):
            x_ratio = (x - x_left) / (x_right - x_left) if x_right != x_left else 0
            # Create curved lighting
            light_factor = math.sin(x_ratio * math.pi)

            r = int(dark_color[0] + (light_color[0] - dark_color[0]) * light_factor)
            g = int(dark_color[1] + (light_color[1] - dark_color[1]) * light_factor)
            b = int(dark_color[2] + (light_color[2] - dark_color[2]) * light_factor)

            draw.point((x, y), fill=(r, g, b, 255))

    # Top rim (ellipse)
    rim_height = 15
    draw.ellipse(
        [size // 2 - cup_top_width // 2, top_y - rim_height // 2,
         size // 2 + cup_top_width // 2, top_y + rim_height // 2],
        fill=light_color, outline=base_color
    )

    # Inner dark ellipse
    inner_width = cup_top_width * 0.85
    draw.ellipse(
        [size // 2 - inner_width // 2, top_y - rim_height // 3,
         size // 2 + inner_width // 2, top_y + rim_height // 3],
        fill=dark_color
    )

    # Bottom ellipse
    draw.ellipse(
        [size // 2 - cup_bottom_width // 2, bottom_y - 8,
         size // 2 + cup_bottom_width // 2, bottom_y + 8],
        fill=dark_color
    )

    return img


def create_timer(size: int, color: str, animation_progress: float = 0) -> Image.Image:
    """Crea un cronometro/timer 3D stilizzato."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_color = hex_to_rgb(color)
    light_color = lighten_color(base_color, 0.4)
    dark_color = darken_color(base_color, 0.4)

    center = size // 2
    radius = size // 2 - size // 10

    # Outer ring with gradient
    for angle in range(360):
        rad = math.radians(angle)
        light_factor = (math.sin(rad) + 1) / 2

        r = int(dark_color[0] + (light_color[0] - dark_color[0]) * light_factor)
        g = int(dark_color[1] + (light_color[1] - dark_color[1]) * light_factor)
        b = int(dark_color[2] + (light_color[2] - dark_color[2]) * light_factor)

        for r_offset in range(-15, 0):
            x = center + int((radius + r_offset) * math.cos(rad))
            y = center + int((radius + r_offset) * math.sin(rad))
            draw.point((x, y), fill=(r, g, b, 255))

    # Inner circle (white/light)
    inner_radius = radius - 20
    draw.ellipse(
        [center - inner_radius, center - inner_radius,
         center + inner_radius, center + inner_radius],
        fill=(250, 248, 245)
    )

    # Clock face marks
    mark_color = dark_color
    for i in range(12):
        angle = math.radians(i * 30 - 90)
        x1 = center + int((inner_radius - 10) * math.cos(angle))
        y1 = center + int((inner_radius - 10) * math.sin(angle))
        x2 = center + int((inner_radius - 25) * math.cos(angle))
        y2 = center + int((inner_radius - 25) * math.sin(angle))

        width = 4 if i % 3 == 0 else 2
        draw.line([(x1, y1), (x2, y2)], fill=mark_color, width=width)

    # Animated hand
    hand_angle = math.radians(animation_progress * 360 - 90)
    hand_length = inner_radius - 35
    hand_x = center + int(hand_length * math.cos(hand_angle))
    hand_y = center + int(hand_length * math.sin(hand_angle))

    draw.line([(center, center), (hand_x, hand_y)], fill=base_color, width=4)

    # Center dot
    draw.ellipse(
        [center - 8, center - 8, center + 8, center + 8],
        fill=base_color
    )

    # Top button
    button_width = 20
    button_height = 25
    draw.rectangle(
        [center - button_width // 2, size // 10 - button_height,
         center + button_width // 2, size // 10],
        fill=dark_color
    )

    return img


def create_social_icons(size: int, color: str, animation_progress: float = 0) -> Image.Image:
    """Crea icone social (cuore, commento, condividi) stilizzate."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_color = hex_to_rgb(color)
    light_color = lighten_color(base_color, 0.3)

    icon_size = size // 4
    spacing = size // 8

    icons_y = size // 2

    # Heart icon (left)
    heart_x = size // 4

    # Bounce animation
    bounce = abs(math.sin(animation_progress * math.pi * 2)) * 10

    # Heart shape
    heart_size = icon_size - int(bounce)
    hx, hy = heart_x, icons_y - int(bounce // 2)

    # Two circles for top of heart
    circle_r = heart_size // 3
    draw.ellipse([hx - heart_size // 2, hy - circle_r,
                  hx, hy + circle_r], fill=base_color)
    draw.ellipse([hx, hy - circle_r,
                  hx + heart_size // 2, hy + circle_r], fill=base_color)

    # Triangle for bottom
    draw.polygon([
        (hx - heart_size // 2, hy),
        (hx + heart_size // 2, hy),
        (hx, hy + heart_size)
    ], fill=base_color)

    # Comment icon (center)
    comment_x = size // 2
    comment_size = icon_size

    draw.rounded_rectangle(
        [comment_x - comment_size // 2, icons_y - comment_size // 3,
         comment_x + comment_size // 2, icons_y + comment_size // 3],
        radius=10, fill=base_color
    )

    # Comment tail
    draw.polygon([
        (comment_x - comment_size // 4, icons_y + comment_size // 3),
        (comment_x - comment_size // 2, icons_y + comment_size // 2 + 10),
        (comment_x, icons_y + comment_size // 3)
    ], fill=base_color)

    # Share/bookmark icon (right)
    share_x = size * 3 // 4
    share_size = icon_size

    # Bookmark shape
    draw.polygon([
        (share_x - share_size // 3, icons_y - share_size // 2),
        (share_x + share_size // 3, icons_y - share_size // 2),
        (share_x + share_size // 3, icons_y + share_size // 2),
        (share_x, icons_y + share_size // 4),
        (share_x - share_size // 3, icons_y + share_size // 2)
    ], fill=light_color, outline=base_color, width=3)

    return img


def create_arrows(size: int, color: str, animation_progress: float = 0) -> Image.Image:
    """Crea frecce di velocità stilizzate."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    base_color = hex_to_rgb(color)
    light_color = lighten_color(base_color, 0.4)

    arrow_height = size // 6
    center_y = size // 2

    # Three arrows with different opacities
    for i in range(3):
        # Animation offset
        offset = int(animation_progress * 50) % 60

        x_start = size // 6 + i * 30 - offset
        x_end = x_start + size // 3
        y = center_y + (i - 1) * (arrow_height + 10)

        alpha = 255 - i * 60

        arrow_color = (*base_color, alpha) if i > 0 else (*base_color, 255)

        # Arrow body
        draw.polygon([
            (x_start, y - arrow_height // 4),
            (x_end - arrow_height, y - arrow_height // 4),
            (x_end - arrow_height, y - arrow_height // 2),
            (x_end, y),
            (x_end - arrow_height, y + arrow_height // 2),
            (x_end - arrow_height, y + arrow_height // 4),
            (x_start, y + arrow_height // 4)
        ], fill=arrow_color[:3])

    return img


def create_3d_object(object_type: ObjectType, size: int = 300,
                     color: str = "#8B6FD9",
                     animation_progress: float = 0,
                     with_shadow: bool = True) -> Image.Image:
    """
    Factory function per creare oggetti 3D stilizzati.

    Args:
        object_type: Tipo di oggetto da creare
        size: Dimensione dell'oggetto in pixel
        color: Colore principale (hex)
        animation_progress: Progresso animazione (0-1)
        with_shadow: Se aggiungere ombra morbida

    Returns:
        Image.Image: Immagine RGBA dell'oggetto
    """
    creators = {
        ObjectType.SPEAKERS: create_speaker,
        ObjectType.CUPS: create_cup,
        ObjectType.TIMER: create_timer,
        ObjectType.ICONS: create_social_icons,
        ObjectType.ARROWS: create_arrows,
    }

    creator = creators.get(object_type, create_cup)
    img = creator(size, color, animation_progress)

    if with_shadow:
        img = add_soft_shadow(img, offset=(8, 12), blur_radius=20, opacity=80)

    return img


def create_multiple_objects(object_type: ObjectType, count: int = 3,
                           size: int = 200, color: str = "#8B6FD9",
                           spacing: int = 50, animation_progress: float = 0) -> Image.Image:
    """
    Crea più oggetti disposti orizzontalmente.

    Args:
        object_type: Tipo di oggetti
        count: Numero di oggetti
        size: Dimensione di ogni oggetto
        color: Colore principale
        spacing: Spazio tra oggetti
        animation_progress: Progresso animazione

    Returns:
        Image.Image: Immagine con tutti gli oggetti
    """
    total_width = count * size + (count - 1) * spacing
    total_height = size + 40  # Extra for shadow

    result = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))

    for i in range(count):
        # Stagger animation
        stagger_progress = (animation_progress + i * 0.2) % 1.0

        obj = create_3d_object(
            object_type, size, color,
            animation_progress=stagger_progress,
            with_shadow=True
        )

        x = i * (size + spacing)
        result.paste(obj, (x, 0), obj)

    return result


# Test
if __name__ == "__main__":
    # Test each object type
    for obj_type in ObjectType:
        img = create_3d_object(obj_type, size=300, animation_progress=0.5)
        img.save(f"test_{obj_type.value}.png")
        print(f"Created: test_{obj_type.value}.png")

    # Test multiple objects
    multi = create_multiple_objects(ObjectType.CUPS, count=3)
    multi.save("test_multiple_cups.png")
    print("Created: test_multiple_cups.png")
