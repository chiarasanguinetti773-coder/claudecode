# Instagram Reel Generator

Generatore automatico di video educativi in stile Instagram Reels moderno.

## Caratteristiche

- **Video verticali 9:16** (1080x1920px) ottimizzati per Instagram/TikTok
- **Testi animati** word-by-word, typewriter, slide, pop
- **Oggetti 3D stilizzati** (megafoni, bicchieri, timer, icone social)
- **Transizioni moderne** (swipe, scale, liquid, split)
- **Palette colori personalizzabili** con gradient
- **Template preconfigurati** per diversi tipi di contenuto

## Installazione

```bash
# Clona il repository
git clone <repo-url>
cd reel-generator

# Installa dipendenze
pip install -r requirements.txt
```

## Utilizzo Rapido

```bash
# Genera video con configurazione default
python reel_generator.py --output mio_reel.mp4

# Usa un template specifico
python reel_generator.py --config configs/educational_3points.json --output reel.mp4

# Usa un preset
python reel_generator.py --preset educational --output reel.mp4
```

## Struttura Progetto

```
reel-generator/
├── reel_generator.py      # Script principale
├── graphics_3d.py         # Modulo oggetti 3D stilizzati
├── transitions.py         # Modulo transizioni video
├── text_animator.py       # Modulo animazioni testo
├── requirements.txt       # Dipendenze Python
├── configs/               # Template di configurazione
│   ├── educational_3points.json
│   ├── before_after.json
│   └── countdown_list.json
└── README.md
```

## Configurazione

### Struttura JSON

```json
{
    "config": {
        "video": {
            "width": 1080,
            "height": 1920,
            "fps": 30,
            "duration": 45
        },
        "colors": {
            "background": "#F5F3EF",
            "accent": "#8B6FD9",
            "text_primary": "#3D1F5C"
        },
        "timing": {
            "hook_duration": 3.0,
            "point_duration": 10.0,
            "transition_duration": 0.4
        },
        "animation": {
            "text_speed": "medium",
            "object_style": "cups",
            "transition_style": "swipe_diagonal"
        }
    },
    "script": {
        "hook": {
            "text": "Il tuo hook qui",
            "duration": 3.0
        },
        "points": [
            {
                "number": "Primo",
                "title": "titolo punto",
                "lines": ["linea 1", "linea 2"],
                "object_type": "speakers"
            }
        ],
        "cta": {
            "lines": ["CTA 1", "CTA 2"]
        }
    }
}
```

### Palette Colori

| Colore | Hex | Uso |
|--------|-----|-----|
| Background | `#F5F3EF` | Sfondo beige/crema |
| Accent | `#8B6FD9` | Viola principale |
| Accent Light | `#D4A5E8` | Viola chiaro |
| Text Primary | `#3D1F5C` | Testo principale |
| Text Secondary | `#5A4570` | Testo secondario |

### Tipi di Oggetti 3D

| Tipo | Uso Consigliato |
|------|-----------------|
| `speakers` | Comunicazione, parlare |
| `cups` | Giochi, scelte, quiz |
| `timer` | Velocità, tempo |
| `icons` | Social, engagement |
| `arrows` | Direzione, movimento |

### Tipi di Transizioni

| Transizione | Descrizione |
|-------------|-------------|
| `swipe_diagonal` | Scorre diagonalmente |
| `scale_fade` | Zoom out + fade |
| `liquid` | Effetto fluido ondulato |
| `split_reveal` | Schermo si divide |
| `slide_up` | Scorre verso l'alto |
| `crossfade` | Dissolvenza incrociata |

### Animazioni Testo

| Animazione | Descrizione |
|------------|-------------|
| `word_by_word` | Appare parola per parola |
| `typewriter` | Effetto macchina da scrivere |
| `fade_in` | Dissolvenza in entrata |
| `slide_left` | Entra da destra |
| `scale_pop` | Pop con overshoot |
| `bounce` | Rimbalzo |

## Template Disponibili

### 1. Educational 3 Points
Video educativo con 3 punti principali. Ideale per tips, errori da evitare, consigli.

```bash
python reel_generator.py --config configs/educational_3points.json
```

### 2. Before/After
Confronto prima/dopo. Ideale per trasformazioni, miglioramenti.

```bash
python reel_generator.py --config configs/before_after.json
```

### 3. Countdown List
Lista numerata (Top 5, 3 cose che...). Ideale per classifiche, liste.

```bash
python reel_generator.py --config configs/countdown_list.json
```

## Personalizzazione

### Creare un Nuovo Template

1. Copia un template esistente:
```bash
cp configs/educational_3points.json configs/mio_template.json
```

2. Modifica il file JSON con i tuoi contenuti

3. Genera il video:
```bash
python reel_generator.py --config configs/mio_template.json --output mio_video.mp4
```

### Modificare Colori

```json
"colors": {
    "background": "#1A1A2E",
    "accent": "#E94560",
    "text_primary": "#FFFFFF"
}
```

### Modificare Timing

```json
"timing": {
    "hook_duration": 2.5,
    "point_duration": 8.0,
    "transition_duration": 0.3
}
```

## API Python

```python
from reel_generator import ReelGenerator

# Configurazione custom
config = {
    "colors": {
        "background": "#F5F3EF",
        "accent": "#8B6FD9"
    }
}

script = {
    "hook": {"text": "Il mio hook"},
    "points": [...],
    "cta": {"lines": [...]}
}

# Genera
generator = ReelGenerator(config=config, script=script)
generator.generate("output.mp4")
```

## Specifiche Output

| Parametro | Valore |
|-----------|--------|
| Risoluzione | 1080x1920 px |
| Aspect Ratio | 9:16 (verticale) |
| Frame Rate | 30 fps |
| Codec | H.264 |
| Bitrate | 8 Mbps |
| Formato | MP4 |

## Requisiti Sistema

- Python 3.8+
- MoviePy 1.0.3+
- Pillow 9.0+
- NumPy 1.21+
- FFmpeg (per encoding video)

## Tips per Video Efficaci

1. **Hook nei primi 2 secondi** - Cattura l'attenzione subito
2. **Ritmo veloce** - 3-4 secondi per concetto
3. **Testo leggibile** - Font grandi, alto contrasto
4. **CTA chiaro** - Dì sempre cosa vuoi che facciano
5. **Consistenza visiva** - Usa la stessa palette colori

## Troubleshooting

### Font non trovato
```
Installa i font nel sistema o usa i fallback (Arial, Georgia)
```

### Video lento da generare
```
Riduci la durata o usa preset "fast" per text_speed
```

### Errori FFmpeg
```
Assicurati che FFmpeg sia installato e nel PATH
```

## Licenza

MIT License

## Contributi

Pull request benvenute! Per modifiche importanti, apri prima una issue.
