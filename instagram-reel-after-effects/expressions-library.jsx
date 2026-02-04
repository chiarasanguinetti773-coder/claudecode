/**
 * After Effects Expressions Library
 * Per animazioni Instagram Reel stile social media
 *
 * COME USARE:
 * 1. Seleziona la proprietà (es. Scala, Posizione)
 * 2. Alt+Click (Option+Click su Mac) sul cronometro
 * 3. Incolla l'expression desiderata
 */

// ============================================
// ANIMAZIONI TESTO
// ============================================

// TYPEWRITER - Effetto macchina da scrivere
// Applica a: Testo Sorgente
var speed = 2; // caratteri per frame (aumenta per più veloce)
var txt = value.text;
var numChars = Math.floor(time * speed * thisComp.frameRate);
txt.substr(0, Math.min(numChars, txt.length));

// TYPEWRITER CON DELAY - Inizia dopo X secondi
// Applica a: Testo Sorgente
var delay = 1; // secondi prima di iniziare
var speed = 3; // caratteri per frame
var txt = value.text;
var t = Math.max(0, time - delay);
var numChars = Math.floor(t * speed * thisComp.frameRate);
txt.substr(0, Math.min(numChars, txt.length));

// WORD BY WORD - Appare parola per parola
// Applica a: Testo Sorgente
var wordsPerSec = 2;
var txt = value.text;
var words = txt.split(" ");
var numWords = Math.floor(time * wordsPerSec);
words.slice(0, numWords).join(" ");


// ============================================
// ANIMAZIONI SCALA
// ============================================

// POP/BOUNCE IN - Scala con overshoot elastico
// Applica a: Scala
var startTime = 0.5; // quando inizia
var duration = 0.4; // durata animazione
var overshoot = 15; // quanto supera il 100%
var bounces = 3;
var decay = 5;

var t = Math.max(0, time - startTime);
if (t < duration) {
    var progress = t / duration;
    var elastic = Math.pow(2, -decay * progress) * Math.cos(bounces * Math.PI * progress);
    var scale = 100 + overshoot * (1 - progress) * elastic;
    [scale, scale];
} else {
    [100, 100];
}

// PULSAZIONE SOTTILE - Per CTA e elementi importanti
// Applica a: Scala
var freq = 2; // pulsazioni al secondo
var amp = 5; // ampiezza (%)
var base = value;
[base[0] + Math.sin(time * freq * Math.PI * 2) * amp,
 base[1] + Math.sin(time * freq * Math.PI * 2) * amp];

// BATTITO CARDIACO - Per icone cuore/like
// Applica a: Scala
var bpm = 80; // battiti per minuto
var amp = 15; // ampiezza pulsazione
var freq = bpm / 60;
var beat = Math.abs(Math.sin(time * freq * Math.PI));
var pulse = Math.pow(beat, 4) * amp;
value + [pulse, pulse];

// RESPIRO LENTO - Animazione ambient sottile
// Applica a: Scala
var freq = 0.5;
var amp = 3;
var breath = Math.sin(time * freq * Math.PI * 2) * amp;
value + [breath, breath];


// ============================================
// ANIMAZIONI POSIZIONE
// ============================================

// BOUNCE ORIZZONTALE - Per frecce indicatrici
// Applica a: Posizione
var freq = 3; // oscillazioni al secondo
var amp = 15; // ampiezza in pixel
value + [Math.sin(time * freq * Math.PI * 2) * amp, 0];

// BOUNCE VERTICALE - Per indicatori scroll
// Applica a: Posizione
var freq = 2;
var amp = 20;
value + [0, Math.abs(Math.sin(time * freq * Math.PI * 2)) * amp];

// FLOATING/GALLEGGIAMENTO - Movimento organico
// Applica a: Posizione
var freqX = 0.7;
var freqY = 0.5;
var ampX = 10;
var ampY = 15;
value + [Math.sin(time * freqX * Math.PI * 2) * ampX,
         Math.sin(time * freqY * Math.PI * 2) * ampY];

// SHAKE/TREMOLIO - Per enfasi o errori
// Applica a: Posizione
var freq = 20;
var amp = 5;
var decay = 3;
var t = time - inPoint;
var shake = Math.sin(t * freq * Math.PI * 2) * amp * Math.exp(-decay * t);
value + [shake, shake * 0.5];

// WIGGLE CONTROLLATO - Movimento casuale
// Applica a: Posizione
wiggle(2, 10); // (frequenza, ampiezza)

// SLIDE IN CON EASE - Da sinistra
// Applica a: Posizione
var startTime = 0;
var duration = 0.5;
var distance = -300; // pixel da sinistra (negativo = da sinistra)

var t = Math.max(0, (time - startTime) / duration);
t = Math.min(1, t);
// Ease out cubic
var ease = 1 - Math.pow(1 - t, 3);
var offset = distance * (1 - ease);
value + [offset, 0];


// ============================================
// ANIMAZIONI ROTAZIONE
// ============================================

// OSCILLAZIONE PENDOLO
// Applica a: Rotazione
var freq = 1;
var amp = 15; // gradi
value + Math.sin(time * freq * Math.PI * 2) * amp;

// SPIN CONTINUO
// Applica a: Rotazione
var speed = 90; // gradi al secondo
value + time * speed;

// WIGGLE ROTAZIONE
// Applica a: Rotazione
wiggle(1, 5);


// ============================================
// ANIMAZIONI OPACITA'
// ============================================

// FADE IN SEMPLICE
// Applica a: Opacità
var startTime = 0.5;
var duration = 0.3;
var t = Math.max(0, (time - startTime) / duration);
Math.min(1, t) * 100;

// BLINK/LAMPEGGIO
// Applica a: Opacità
var freq = 4; // lampeggi al secondo
(Math.sin(time * freq * Math.PI * 2) + 1) / 2 * 100;

// PULSE OPACITY - Pulsazione opacità
// Applica a: Opacità
var freq = 1.5;
var min = 70;
var max = 100;
var range = (max - min) / 2;
var center = (max + min) / 2;
center + Math.sin(time * freq * Math.PI * 2) * range;


// ============================================
// LOOP E CYCLE
// ============================================

// LOOP KEYFRAMES - Ripete animazione con keyframe
// Applica a: Qualsiasi proprietà animata
loopOut("cycle");

// PING PONG - Avanti e indietro
// Applica a: Qualsiasi proprietà animata
loopOut("pingpong");

// LOOP CON OFFSET - Continua oltre ultimo valore
// Applica a: Qualsiasi proprietà animata
loopOut("offset");


// ============================================
// TRACKING / FOLLOW
// ============================================

// INERTIA - Continua movimento dopo keyframe
// Applica a: Posizione o Scala
var friction = 0.7;
var velocity = 0;
if (numKeys > 0 && time > key(numKeys).time) {
    velocity = velocityAtTime(key(numKeys).time);
    var t = time - key(numKeys).time;
    value + velocity * t * Math.exp(-friction * t);
} else {
    value;
}

// FOLLOW CON RITARDO - Segue altro layer
// Applica a: Posizione
var leader = thisComp.layer("NomeLayer");
var delay = 0.2; // secondi di ritardo
leader.position.valueAtTime(time - delay);


// ============================================
// UTILITY
// ============================================

// TIME REMAP AUTOMATICO - Adatta durata video
// Applica a: Time Remapping
var duration = thisComp.duration;
var sourceDuration = thisLayer.source.duration;
(time / duration) * sourceDuration;

// RANDOM TRA VALORI - Valore casuale stabile
// Applica a: Qualsiasi
seedRandom(index, true);
random(50, 100); // tra 50 e 100

// CLAMP - Limita valore tra min e max
// Applica a: Qualsiasi
clamp(value, 0, 100);

// LINEAR - Rimappa intervallo
// Applica a: Qualsiasi
linear(time, 0, 1, 0, 100); // da 0-1 sec mappa 0-100


// ============================================
// EXPRESSIONS PER COLORI
// ============================================

// CYCLE COLORI - Cicla tra colori
// Applica a: Fill Color o simili
var colors = [
    [1, 0.2, 0.4],    // Rosa
    [0.2, 0.8, 1],    // Ciano
    [1, 0.8, 0.2]     // Giallo
];
var speed = 0.5; // cicli al secondo
var index = Math.floor(time * speed * colors.length) % colors.length;
colors[index];

// COLORE PULSANTE
// Applica a: Fill Color
var color1 = [1, 0.2, 0.4];
var color2 = [1, 0.5, 0.6];
var freq = 1;
var t = (Math.sin(time * freq * Math.PI * 2) + 1) / 2;
[
    color1[0] + (color2[0] - color1[0]) * t,
    color1[1] + (color2[1] - color1[1]) * t,
    color1[2] + (color2[2] - color1[2]) * t
];
