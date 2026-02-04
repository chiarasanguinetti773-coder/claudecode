# Guida Completa: Creare Instagram Reel in After Effects (macOS)

## Indice
1. [Setup Iniziale Composizione](#1-setup-iniziale-composizione)
2. [Sfondo Sfocato](#2-sfondo-sfocato)
3. [Testi Animati](#3-testi-animati)
4. [Grafiche Animate](#4-grafiche-animate)
5. [Palette Colori e Font](#5-palette-colori-e-font)
6. [Timing e Easing](#6-timing-e-easing)
7. [Esportazione](#7-esportazione)

---

## 1. Setup Iniziale Composizione

### Crea Nuova Composizione 9:16

1. **Menu**: `Composizione` > `Nuova composizione...` (⌘N)
2. **Impostazioni**:
   - **Nome**: `Instagram_Reel`
   - **Larghezza**: `1080 px`
   - **Altezza**: `1920 px`
   - **Frequenza fotogrammi**: `30` fps
   - **Durata**: `0:00:15:00` (15 secondi max per Reel)
   - **Sfondo**: Nero

### Importa Video

1. **Menu**: `File` > `Importa` > `File...` (⌘I)
2. Seleziona il tuo video
3. Trascina il video nella timeline

---

## 2. Sfondo Sfocato

### Passo 1: Duplica Layer Video

1. Seleziona il layer video nella timeline
2. **Menu**: `Modifica` > `Duplica` (⌘D)
3. Rinomina il layer inferiore: doppio-click sul nome → `Sfondo_Blur`

### Passo 2: Applica Sfocatura

1. Seleziona il layer `Sfondo_Blur`
2. **Menu**: `Effetto` > `Sfocatura e precisione` > `Sfocatura gaussiana`
3. Nel pannello **Controlli effetti**:
   - **Sfocatura**: `50` px
   - **Ripeti pixel bordo**: ✓ (attiva)

### Passo 3: Scala per Riempire Bordi

1. Con `Sfondo_Blur` selezionato, premi `S` per mostrare Scala
2. Cambia valore a: `120%` (o quanto necessario per coprire i bordi neri)
3. Se necessario, riposiziona: premi `P` e centra

### Passo 4: Desatura Leggermente (Opzionale)

1. **Menu**: `Effetto` > `Correzione colore` > `Tonalità/Saturazione`
2. **Saturazione canale principale**: `-20`

### Passo 5: Aggiungi Vignettatura

1. **Menu**: `Effetto` > `Genera` > `CC Vignette`
2. **Amount**: `50`

---

## 3. Testi Animati

### 3.1 Headline con Animazione Pop

#### Crea Testo

1. Seleziona strumento **Testo orizzontale** (`⌘T`)
2. Clicca nella composizione e scrivi: `IL TUO TITOLO`
3. Nel pannello **Carattere**:
   - **Font**: Montserrat Bold (o Bebas Neue)
   - **Dimensione**: `96 px`
   - **Colore**: Bianco `#FFFFFF`
   - **Tracciamento**: `50`

#### Animazione Pop (Scala con Overshoot)

1. Seleziona il layer testo
2. Premi `S` per Scala
3. Vai al frame `0:00:00:15` (0.5 sec)
4. Clicca sul cronometro ⏱ di Scala → primo keyframe a `0%`
5. Vai al frame `0:00:00:23` (circa 0.75 sec)
6. Imposta Scala a `110%`
7. Vai al frame `0:00:00:27` (circa 0.9 sec)
8. Imposta Scala a `100%`

#### Applica Easy Ease

1. Seleziona tutti i keyframe (clicca sul nome `Scala` per selezionarli tutti)
2. Tasto destro → `Assistente keyframe` > `Easy Ease` (F9)
3. Per overshoot migliore: apri **Editor grafico** (icona grafico nella timeline)
4. Seleziona il keyframe centrale e trascina le maniglie per creare una curva di overshoot

#### Aggiungi Ombra

1. **Menu**: `Effetto` > `Prospettiva` > `Ombra esterna`
2. **Opacità**: `150`
3. **Direzione**: `135°`
4. **Distanza**: `8`
5. **Morbidezza**: `20`

---

### 3.2 Sottotitolo con Slide-In

#### Crea Testo

1. Strumento Testo (`⌘T`)
2. Scrivi: `Sottotitolo accattivante`
3. **Font**: Montserrat SemiBold, `64 px`
4. **Colore**: Ciano `#33CCFF`

#### Animazione Slide da Sinistra

1. Premi `P` per Posizione
2. Posiziona il testo dove vuoi che finisca (centro orizzontale, sotto headline)
3. Vai al frame `0:00:00:24` (0.8 sec) - clicca cronometro posizione
4. Torna al frame `0:00:00:15`
5. Sposta il testo di `200 px` a sinistra (fuori schermo)
6. Aggiungi keyframe Opacità (`T`): 0% all'inizio, 100% alla fine
7. Seleziona keyframe → F9 per Easy Ease

---

### 3.3 Testo con Effetto Typewriter (Opzionale)

#### Metodo Expression

1. Crea layer testo con il messaggio
2. Seleziona la proprietà `Testo sorgente`
3. **Menu**: `Animazione` > `Aggiungi espressione` (⌥= / Option+Shift+Clic sul cronometro)
4. Incolla questa expression:

```javascript
// Effetto Typewriter
var speed = 2; // caratteri per frame
var txt = value.text;
var numChars = Math.floor(time * speed * thisComp.frameRate);
txt.substr(0, Math.min(numChars, txt.length));
```

---

### 3.4 Call-to-Action (CTA) in Basso

#### Crea Testo

1. Scrivi: `SCOPRI DI PIÙ →`
2. **Font**: Montserrat Bold, `42 px`
3. **Colore**: Giallo/Oro `#FFCC33`
4. **Tracciamento**: `100`
5. Posiziona in basso (circa Y: `1720`)

#### Animazione Slide dal Basso + Pulsazione

1. Anima con slide-in dal basso (come sopra, ma asse Y)
2. Per pulsazione, aggiungi expression alla Scala:

```javascript
// Pulsazione sottile
var freq = 2;
var amp = 5;
var base = value;
[base[0] + Math.sin(time * freq * Math.PI * 2) * amp,
 base[1] + Math.sin(time * freq * Math.PI * 2) * amp];
```

---

## 4. Grafiche Animate

### 4.1 Box Sfondo Dietro Testo

#### Crea Shape Layer

1. Seleziona strumento **Rettangolo** (`Q`)
2. Tieni premuto e seleziona **Rettangolo arrotondato**
3. Disegna un rettangolo dietro l'headline
4. Nel pannello **Contenuti** del layer forma:
   - **Dimensione**: `800 x 120 px`
   - **Arrotondamento**: `20 px`

#### Stile

1. Espandi `Contenuti` > `Rettangolo 1` > `Riempimento`
2. **Colore**: Rosa/Rosso `#FF3366`
3. **Opacità**: `85%`

#### Animazione

1. Sposta il layer SOTTO il testo headline (ma sopra lo sfondo)
2. Applica animazione Pop (come per headline) con leggero anticipo (-0.1 sec)

---

### 4.2 Freccia Animata

#### Crea Freccia con Penna

1. Seleziona strumento **Penna** (`G`)
2. Disegna una freccia semplice (linea + punta)
3. Oppure usa: **Menu**: `Livello` > `Nuovo` > `Forma` e aggiungi un path

#### Stile Freccia

1. **Traccia**: `8 px`, Giallo `#FFCC33`
2. **Estremità linea**: Arrotondato
3. **Nessun riempimento**

#### Animazione Bounce

1. Aggiungi expression alla Posizione:

```javascript
// Movimento bounce orizzontale
var freq = 3;
var amp = 15;
value + [Math.sin(time * freq * Math.PI * 2) * amp, 0];
```

---

### 4.3 Icona Cuore Pulsante

#### Crea Cuore con Forme

1. **Livello** > **Nuovo** > **Forma**
2. Aggiungi due ellissi sovrapposte + un triangolo
3. Oppure importa un'icona cuore SVG

#### Animazione Battito

1. Aggiungi expression alla Scala:

```javascript
// Battito cardiaco
var bpm = 80;
var amp = 15;
var freq = bpm / 60;
var beat = Math.abs(Math.sin(time * freq * Math.PI));
var pulse = Math.pow(beat, 4) * amp;
value + [pulse, pulse];
```

#### Posizionamento

- Posiziona nell'angolo in alto a sinistra o vicino a elementi interattivi
- Scala: `80%`

---

## 5. Palette Colori e Font

### Palette Colori Consigliata (Stile Reel Moderno)

| Elemento | Colore | HEX | Uso |
|----------|--------|-----|-----|
| Primario | Rosa/Magenta | `#FF3366` | Box, accenti principali |
| Secondario | Ciano | `#33CCFF` | Sottotitoli, elementi secondari |
| Accento | Giallo/Oro | `#FFCC33` | CTA, frecce, highlight |
| Testo | Bianco | `#FFFFFF` | Headline, testo principale |
| Sfondo overlay | Nero 50% | `#000000` 50% opacità | Box trasparenti |

### Font Consigliati

| Tipo | Font Primario | Alternative | Dimensione Mobile |
|------|---------------|-------------|-------------------|
| **Headline** | Montserrat Bold | Bebas Neue, Oswald, Impact | 72-96 px |
| **Sottotitolo** | Montserrat SemiBold | Poppins, Roboto | 48-64 px |
| **Body** | Montserrat Medium | Open Sans, Lato | 36-48 px |
| **CTA** | Montserrat Bold | Din Condensed | 36-48 px |

### Regole Tipografiche per Mobile

- **Massimo 5-7 parole per schermata**
- **Interlinea**: 120% della dimensione font
- **Contrasto**: Usa ombre o box per leggibilità su video
- **Safe zone**: Mantieni testo a 100px dai bordi

---

## 6. Timing e Easing

### Timeline Consigliata (15 secondi)

```
0.0s - 0.5s   : Video entra / Transizione iniziale
0.5s - 0.8s   : Headline POP IN
0.8s - 1.1s   : Sottotitolo SLIDE IN
1.1s - 1.5s   : Box/Grafiche appaiono
1.5s - 2.0s   : Freccia + Icone animate
2.0s - 12.0s  : Contenuto principale / Sequenza
12.0s - 13.0s : CTA appare
13.0s - 15.0s : Elementi finali + Fade out
```

### Durate Animazione Consigliate

| Animazione | Durata | Frame (30fps) |
|------------|--------|---------------|
| Pop In | 0.25s | 7-8 frame |
| Slide In | 0.3s | 9 frame |
| Fade In | 0.2s | 6 frame |
| Typewriter (per carattere) | 0.05s | 1-2 frame |
| Bounce/Loop | 0.3-0.5s | 9-15 frame |

### Curve di Easing

#### Easy Ease Standard
- Scorciatoia: `F9`
- Uso: Maggior parte delle animazioni

#### Easy Ease In (Per elementi che escono)
- Scorciatoia: `⇧F9` (Shift+F9)
- Uso: Elementi che lasciano lo schermo

#### Easy Ease Out (Per elementi che entrano)
- Scorciatoia: `⌘⇧F9` (Cmd+Shift+F9)
- Uso: Elementi che entrano nello schermo

#### Curva Personalizzata per Overshoot

Nell'Editor Grafico:
1. Seleziona keyframe finale
2. Trascina la maniglia Bezier verso l'alto oltre il valore finale
3. Crea una curva che supera il 100% e poi torna indietro

```
Valori tipici per overshoot:
- Picco: 110-115%
- Ritorno: 100%
- Tempo picco: 60-70% della durata
```

---

## 7. Esportazione

### Impostazioni Export per Instagram Reel

#### Metodo 1: Adobe Media Encoder (Consigliato)

1. **Menu**: `Composizione` > `Aggiungi a coda di Adobe Media Encoder` (⌘⌥M)
2. In Media Encoder:
   - **Formato**: H.264
   - **Predefinito**: Seleziona `Match Source - High bitrate`
   - O crea preset personalizzato:

#### Impostazioni Video Personalizzate

```
Codec: H.264
Risoluzione: 1080 x 1920
Frame rate: 30 fps
Ordine campi: Progressivo
Proporzioni: Quadrati (1.0)
Bitrate: VBR 2 passaggi
Bitrate target: 15-20 Mbps
Bitrate massimo: 25 Mbps
```

#### Impostazioni Audio

```
Codec: AAC
Frequenza campionamento: 48000 Hz
Canali: Stereo
Bitrate: 320 kbps
```

### Metodo 2: Coda di Rendering After Effects

1. **Menu**: `Composizione` > `Aggiungi a coda di rendering` (⌘⌃M)
2. Clicca su `Predefinito rendering`: Qualità ottimale
3. Clicca su `Modulo di output`: QuickTime → H.264

---

## Scorciatoie Utili (macOS)

| Azione | Scorciatoia |
|--------|-------------|
| Nuova composizione | `⌘N` |
| Importa file | `⌘I` |
| Duplica layer | `⌘D` |
| Pre-compose | `⌘⇧C` |
| Mostra tutti i keyframe | `U` |
| Easy Ease | `F9` |
| Aggiungi keyframe | `⌥` + click su cronometro |
| RAM Preview | `0` (tastierino numerico) o `⌃0` |
| Vai a inizio comp | `Home` o `⌘⌥←` |
| Vai a fine comp | `End` o `⌘⌥→` |
| Mostra Posizione | `P` |
| Mostra Scala | `S` |
| Mostra Rotazione | `R` |
| Mostra Opacità | `T` |
| Editor Grafico | Click icona grafico in timeline |

---

## Checklist Finale

- [ ] Composizione 1080x1920 px (9:16)
- [ ] Sfondo video sfocato + scala 120%
- [ ] Soggetto principale nitido sopra
- [ ] Headline con animazione pop
- [ ] Sottotitolo con slide-in
- [ ] CTA in basso con pulsazione
- [ ] Box sfondo dietro testo
- [ ] Freccia/icone animate
- [ ] Easy ease su tutti i keyframe
- [ ] Timing testato con preview
- [ ] Esportato H.264 @ 15-20 Mbps
