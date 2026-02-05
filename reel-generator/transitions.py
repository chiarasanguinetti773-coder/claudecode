"""
Transitions Module - Transizioni Moderne per Instagram Reels
============================================================
Implementa transizioni smooth e moderne tra clip video.
"""

from enum import Enum
from typing import Callable, Tuple
import math
import numpy as np
from moviepy.editor import VideoClip, CompositeVideoClip, concatenate_videoclips
from PIL import Image


class TransitionType(Enum):
    """Tipi di transizioni disponibili."""
    SWIPE_DIAGONAL = "swipe_diagonal"
    SCALE_FADE = "scale_fade"
    LIQUID = "liquid"
    SPLIT_REVEAL = "split_reveal"
    SLIDE_UP = "slide_up"
    SLIDE_LEFT = "slide_left"
    ZOOM_BLUR = "zoom_blur"
    CROSSFADE = "crossfade"


def cubic_bezier(t: float, p1: float = 0.4, p2: float = 0.0,
                 p3: float = 0.2, p4: float = 1.0) -> float:
    """
    Calcola easing con curva cubic-bezier.
    Default: cubic-bezier(0.4, 0.0, 0.2, 1) - Material Design standard
    """
    # Simplified cubic bezier approximation
    t2 = t * t
    t3 = t2 * t

    return (3 * (1 - t) * (1 - t) * t * p2 +
            3 * (1 - t) * t2 * p4 +
            t3)


def ease_out_cubic(t: float) -> float:
    """Easing out cubic."""
    return 1 - pow(1 - t, 3)


def ease_in_out_cubic(t: float) -> float:
    """Easing in-out cubic."""
    if t < 0.5:
        return 4 * t * t * t
    else:
        return 1 - pow(-2 * t + 2, 3) / 2


def ease_out_back(t: float, overshoot: float = 1.70158) -> float:
    """Easing out con leggero overshoot."""
    t -= 1
    return t * t * ((overshoot + 1) * t + overshoot) + 1


class TransitionEffect:
    """Classe base per effetti di transizione."""

    def __init__(self, duration: float = 0.4):
        self.duration = duration

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        """Applica la transizione tra due clip."""
        raise NotImplementedError


class SwipeDiagonalTransition(TransitionEffect):
    """Transizione swipe diagonale."""

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        w, h = clip1.size

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                # Transition phase
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_out_cubic(progress)

                frame1 = clip1.get_frame(clip1.duration - self.duration + progress * self.duration * 0.5)
                frame2 = clip2.get_frame(progress * self.duration * 0.5)

                # Diagonal swipe mask
                result = frame1.copy()
                for y in range(h):
                    for x in range(w):
                        # Diagonal line position
                        diagonal_pos = (x + y) / (w + h)
                        threshold = progress

                        if diagonal_pos < threshold:
                            result[y, x] = frame2[y, x]

                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


class ScaleFadeTransition(TransitionEffect):
    """Transizione scale + fade."""

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        w, h = clip1.size

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_in_out_cubic(progress)

                frame1 = clip1.get_frame(clip1.duration - 0.1)
                frame2 = clip2.get_frame(0)

                # Scale down clip1
                scale1 = 1 - progress * 0.3
                alpha1 = 1 - progress

                # Scale up clip2
                scale2 = 0.8 + progress * 0.2
                alpha2 = progress

                # Simple blend (full scaling would require PIL)
                result = (frame1 * alpha1 + frame2 * alpha2).astype(np.uint8)

                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


class SlideTransition(TransitionEffect):
    """Transizione slide (up, down, left, right)."""

    def __init__(self, duration: float = 0.4, direction: str = "up"):
        super().__init__(duration)
        self.direction = direction

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        w, h = clip1.size

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_out_cubic(progress)

                frame1 = clip1.get_frame(clip1.duration - 0.1)
                frame2 = clip2.get_frame(0)

                result = np.zeros_like(frame1)

                if self.direction == "up":
                    offset = int(h * progress)
                    if offset < h:
                        result[:h-offset] = frame1[offset:]
                    if offset > 0:
                        result[h-offset:] = frame2[:offset]

                elif self.direction == "down":
                    offset = int(h * progress)
                    if offset < h:
                        result[offset:] = frame1[:h-offset]
                    if offset > 0:
                        result[:offset] = frame2[h-offset:]

                elif self.direction == "left":
                    offset = int(w * progress)
                    if offset < w:
                        result[:, :w-offset] = frame1[:, offset:]
                    if offset > 0:
                        result[:, w-offset:] = frame2[:, :offset]

                elif self.direction == "right":
                    offset = int(w * progress)
                    if offset < w:
                        result[:, offset:] = frame1[:, :w-offset]
                    if offset > 0:
                        result[:, :offset] = frame2[:, w-offset:]

                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


class SplitRevealTransition(TransitionEffect):
    """Transizione split reveal (schermo si divide)."""

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        w, h = clip1.size

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_out_back(progress, 1.2)
                progress = min(1.0, progress)

                frame1 = clip1.get_frame(clip1.duration - 0.1)
                frame2 = clip2.get_frame(0)

                result = frame2.copy()

                # Split offset
                split_offset = int((w // 2) * progress)

                # Left part of clip1 moves left
                if split_offset < w // 2:
                    result[:, :w//2 - split_offset] = frame1[:, split_offset:w//2]

                # Right part of clip1 moves right
                if split_offset < w // 2:
                    result[:, w//2 + split_offset:] = frame1[:, w//2:w - split_offset]

                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


class CrossfadeTransition(TransitionEffect):
    """Transizione crossfade semplice."""

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_in_out_cubic(progress)

                frame1 = clip1.get_frame(clip1.duration - self.duration + progress * self.duration)
                frame2 = clip2.get_frame(progress * self.duration * 0.5)

                result = ((1 - progress) * frame1 + progress * frame2).astype(np.uint8)
                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


class LiquidTransition(TransitionEffect):
    """Transizione liquid/morph (effetto fluido)."""

    def apply(self, clip1: VideoClip, clip2: VideoClip) -> VideoClip:
        w, h = clip1.size

        def make_frame(t):
            if t < clip1.duration - self.duration:
                return clip1.get_frame(t)
            elif t > clip1.duration:
                return clip2.get_frame(t - clip1.duration)
            else:
                progress = (t - (clip1.duration - self.duration)) / self.duration
                progress = ease_in_out_cubic(progress)

                frame1 = clip1.get_frame(clip1.duration - 0.1)
                frame2 = clip2.get_frame(0)

                result = np.zeros_like(frame1)

                # Create wave-like mask
                for y in range(h):
                    # Sine wave offset
                    wave = math.sin(y / 50 + progress * math.pi * 4) * 50
                    threshold = int(w * progress + wave)

                    for x in range(w):
                        if x < threshold:
                            result[y, x] = frame2[y, x]
                        else:
                            result[y, x] = frame1[y, x]

                return result

        total_duration = clip1.duration + clip2.duration - self.duration
        return VideoClip(make_frame, duration=total_duration)


def get_transition(transition_type: TransitionType,
                   duration: float = 0.4) -> TransitionEffect:
    """
    Factory function per ottenere un effetto di transizione.

    Args:
        transition_type: Tipo di transizione
        duration: Durata della transizione in secondi

    Returns:
        TransitionEffect: Oggetto transizione
    """
    transitions = {
        TransitionType.SWIPE_DIAGONAL: SwipeDiagonalTransition,
        TransitionType.SCALE_FADE: ScaleFadeTransition,
        TransitionType.LIQUID: LiquidTransition,
        TransitionType.SPLIT_REVEAL: SplitRevealTransition,
        TransitionType.SLIDE_UP: lambda d: SlideTransition(d, "up"),
        TransitionType.SLIDE_LEFT: lambda d: SlideTransition(d, "left"),
        TransitionType.CROSSFADE: CrossfadeTransition,
    }

    transition_class = transitions.get(transition_type, CrossfadeTransition)

    if callable(transition_class) and not isinstance(transition_class, type):
        return transition_class(duration)
    else:
        return transition_class(duration)


def apply_transition(clip1: VideoClip, clip2: VideoClip,
                    transition_type: TransitionType = TransitionType.CROSSFADE,
                    duration: float = 0.4) -> VideoClip:
    """
    Applica una transizione tra due clip video.

    Args:
        clip1: Prima clip
        clip2: Seconda clip
        transition_type: Tipo di transizione
        duration: Durata transizione

    Returns:
        VideoClip: Clip risultante con transizione
    """
    transition = get_transition(transition_type, duration)
    return transition.apply(clip1, clip2)


def apply_transitions_to_clips(clips: list, transition_type: TransitionType,
                               duration: float = 0.4) -> VideoClip:
    """
    Applica transizioni tra una lista di clip.

    Args:
        clips: Lista di VideoClip
        transition_type: Tipo di transizione
        duration: Durata di ogni transizione

    Returns:
        VideoClip: Video finale con tutte le transizioni
    """
    if len(clips) == 0:
        raise ValueError("La lista di clip è vuota")

    if len(clips) == 1:
        return clips[0]

    result = clips[0]
    for i in range(1, len(clips)):
        result = apply_transition(result, clips[i], transition_type, duration)

    return result


# Test
if __name__ == "__main__":
    from moviepy.editor import ColorClip

    # Create test clips
    clip1 = ColorClip(size=(1080, 1920), color=(139, 111, 217), duration=2)
    clip2 = ColorClip(size=(1080, 1920), color=(212, 165, 232), duration=2)

    # Test each transition
    for trans_type in TransitionType:
        print(f"Testing {trans_type.value}...")
        try:
            result = apply_transition(clip1, clip2, trans_type, 0.5)
            print(f"  Duration: {result.duration}s")
        except Exception as e:
            print(f"  Error: {e}")
