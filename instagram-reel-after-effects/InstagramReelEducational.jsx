/**
 * Instagram Reel Educational Generator - After Effects
 * =====================================================
 * Genera video educativi completi in stile Instagram Reels
 * con testi animati, grafiche 3D stilizzate e transizioni moderne.
 *
 * ISTRUZIONI:
 * 1. Apri After Effects
 * 2. File > Script > Esegui file script...
 * 3. Seleziona questo file
 * 4. Il video viene generato automaticamente!
 *
 * Versione: 1.0
 * Compatibile: After Effects CC 2019+
 */

#target aftereffects

(function() {

    // ============================================
    // CONFIGURAZIONE PRINCIPALE
    // ============================================

    var CONFIG = {
        // Video
        width: 1080,
        height: 1920,
        fps: 30,
        duration: 45,

        // Colori (RGB 0-1)
        colors: {
            background: [0.96, 0.95, 0.94],      // #F5F3EF beige
            backgroundDark: [0.93, 0.91, 0.89],  // #EDE8E3 gradient
            accent: [0.545, 0.435, 0.851],       // #8B6FD9 viola
            accentLight: [0.831, 0.647, 0.91],   // #D4A5E8 viola chiaro
            textPrimary: [0.24, 0.12, 0.36],     // #3D1F5C viola scuro
            textSecondary: [0.353, 0.271, 0.439] // #5A4570
        },

        // Font
        fonts: {
            bold: "Arial-BoldMT",
            italic: "Georgia-Italic",
            regular: "Arial"
        },

        // Dimensioni testo
        textSizes: {
            hookTitle: 85,
            pointNumber: 90,
            pointTitle: 55,
            pointLine: 60,
            ctaQuestion: 70,
            ctaAction: 55
        }
    };

    // ============================================
    // SCRIPT DEL VIDEO
    // ============================================

    var SCRIPT = {
        hook: {
            text: "Smetti di fare questi errori nei tuoi Reel",
            startTime: 0,
            duration: 3
        },
        points: [
            {
                number: "Primo:",
                title: "iniziare con 'ciao ragazzi'",
                lines: [
                    "Non ti conoscono ancora",
                    "Hai 2 secondi per attirare l'attenzione",
                    "Non sprecarla per fare i saluti"
                ],
                objectType: "speakers",
                startTime: 3,
                duration: 10
            },
            {
                number: "Secondo:",
                title: "parlare lentamente",
                lines: [
                    "Se parli lentamente la gente scrollerà",
                    "Vai dritto al punto e usa un ritmo veloce"
                ],
                objectType: "timer",
                startTime: 13,
                duration: 10
            },
            {
                number: "Terzo:",
                title: "non avere un CTA finale",
                lines: [
                    "Se non chiedi nulla, non otterrai nulla",
                    "Salva, commenta, seguimi",
                    "Digli cosa devono fare"
                ],
                objectType: "cups",
                startTime: 23,
                duration: 10
            }
        ],
        cta: {
            lines: [
                {text: "E tu quanti di questi errori stavi facendo?", style: "question"},
                {text: "Vuoi avere degli hook e dei CTA già pronti?", style: "question"},
                {text: "Scrivi REEL nei commenti", style: "action"}
            ],
            startTime: 33,
            duration: 12
        }
    };

    // ============================================
    // FUNZIONI UTILITY
    // ============================================

    function rgbToArray(r, g, b) {
        return [r, g, b];
    }

    function addKeyframe(prop, time, value) {
        var idx = prop.addKey(time);
        prop.setValueAtKey(idx, value);
        return idx;
    }

    function applyEasyEase(prop, keyIndex) {
        var easeIn = new KeyframeEase(0, 80);
        var easeOut = new KeyframeEase(0, 80);

        try {
            if (prop.propertyValueType === PropertyValueType.TwoD ||
                prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                prop.setTemporalEaseAtKey(keyIndex, [easeIn, easeIn], [easeOut, easeOut]);
            } else if (prop.propertyValueType === PropertyValueType.ThreeD ||
                       prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                prop.setTemporalEaseAtKey(keyIndex, [easeIn, easeIn, easeIn], [easeOut, easeOut, easeOut]);
            } else {
                prop.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
            }
        } catch(e) {}
    }

    function applyEasyEaseToAll(prop) {
        for (var i = 1; i <= prop.numKeys; i++) {
            applyEasyEase(prop, i);
        }
    }

    // ============================================
    // ANIMAZIONI
    // ============================================

    function createFadeIn(layer, startTime, duration) {
        var opacity = layer.transform.opacity;
        var k1 = addKeyframe(opacity, startTime, 0);
        var k2 = addKeyframe(opacity, startTime + duration, 100);
        applyEasyEase(opacity, k1);
        applyEasyEase(opacity, k2);
    }

    function createFadeOut(layer, startTime, duration) {
        var opacity = layer.transform.opacity;
        var k1 = addKeyframe(opacity, startTime, 100);
        var k2 = addKeyframe(opacity, startTime + duration, 0);
        applyEasyEase(opacity, k1);
        applyEasyEase(opacity, k2);
    }

    function createPopIn(layer, startTime, duration) {
        var scale = layer.transform.scale;
        var opacity = layer.transform.opacity;

        // Scale: 0 -> 115 -> 100 (overshoot)
        var k1 = addKeyframe(scale, startTime, [0, 0]);
        var k2 = addKeyframe(scale, startTime + duration * 0.6, [115, 115]);
        var k3 = addKeyframe(scale, startTime + duration, [100, 100]);

        applyEasyEase(scale, k1);
        applyEasyEase(scale, k2);
        applyEasyEase(scale, k3);

        // Opacity
        var o1 = addKeyframe(opacity, startTime, 0);
        var o2 = addKeyframe(opacity, startTime + duration * 0.3, 100);
        applyEasyEase(opacity, o1);
        applyEasyEase(opacity, o2);
    }

    function createSlideIn(layer, startTime, duration, direction) {
        var position = layer.transform.position;
        var opacity = layer.transform.opacity;
        var endPos = position.value;
        var offset = 300;

        var startPos;
        if (direction === "left") {
            startPos = [endPos[0] - offset, endPos[1]];
        } else if (direction === "right") {
            startPos = [endPos[0] + offset, endPos[1]];
        } else if (direction === "up") {
            startPos = [endPos[0], endPos[1] + offset];
        } else {
            startPos = [endPos[0], endPos[1] - offset];
        }

        var k1 = addKeyframe(position, startTime, startPos);
        var k2 = addKeyframe(position, startTime + duration, endPos);
        applyEasyEase(position, k1);
        applyEasyEase(position, k2);

        var o1 = addKeyframe(opacity, startTime, 0);
        var o2 = addKeyframe(opacity, startTime + duration * 0.5, 100);
        applyEasyEase(opacity, o1);
        applyEasyEase(opacity, o2);
    }

    function createWordByWordExpression(totalDuration, holdTime) {
        return 'var speed = ' + (1 / totalDuration * 2) + ';\n' +
               'var txt = value.text;\n' +
               'var words = txt.split(" ");\n' +
               'var numWords = Math.min(Math.floor(time * speed * words.length), words.length);\n' +
               'words.slice(0, numWords).join(" ");';
    }

    // ============================================
    // CREAZIONE OGGETTI GRAFICI
    // ============================================

    function createSpeakerGraphic(comp, startTime, duration, yPos) {
        var group = comp.layers.addShape();
        group.name = "Grafica_Megafoni";

        var contents = group.property("ADBE Root Vectors Group");

        // Crea 3 megafoni
        for (var i = 0; i < 3; i++) {
            var megaGroup = contents.addProperty("ADBE Vector Group");
            megaGroup.name = "Megafono_" + (i + 1);
            var megaContents = megaGroup.property("ADBE Vectors Group");

            // Corpo del megafono (trapezio)
            var body = megaContents.addProperty("ADBE Vector Shape - Group");
            var bodyShape = new Shape();
            bodyShape.vertices = [
                [-60, -20],
                [40, -50],
                [40, 50],
                [-60, 20]
            ];
            bodyShape.closed = true;
            body.property("ADBE Vector Shape").setValue(bodyShape);

            // Riempimento
            var fill = megaContents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(CONFIG.colors.accent);

            // Manico
            var handle = megaContents.addProperty("ADBE Vector Shape - Rect");
            handle.property("ADBE Vector Rect Size").setValue([25, 50]);
            handle.property("ADBE Vector Rect Position").setValue([-75, 0]);

            var handleFill = megaContents.addProperty("ADBE Vector Graphic - Fill");
            handleFill.property("ADBE Vector Fill Color").setValue(CONFIG.colors.textPrimary);

            // Posiziona il gruppo
            megaGroup.property("ADBE Vector Transform Group").property("Position").setValue([
                (i - 1) * 150,
                0
            ]);
        }

        // Posizione generale
        group.transform.position.setValue([CONFIG.width / 2, yPos]);
        group.transform.scale.setValue([80, 80]);

        // Animazione
        createPopIn(group, startTime, 0.4);

        // Onde sonore animate (expression)
        try {
            group.transform.scale.expression =
                'var base = [80, 80];\n' +
                'var amp = 5;\n' +
                'var freq = 3;\n' +
                'var pulse = Math.sin(time * freq * Math.PI * 2) * amp;\n' +
                'base + [pulse, pulse];';
        } catch(e) {}

        // Fade out
        createFadeOut(group, startTime + duration - 0.5, 0.5);

        return group;
    }

    function createTimerGraphic(comp, startTime, duration, yPos) {
        var group = comp.layers.addShape();
        group.name = "Grafica_Timer";

        var contents = group.property("ADBE Root Vectors Group");
        var timerGroup = contents.addProperty("ADBE Vector Group");
        var timerContents = timerGroup.property("ADBE Vectors Group");

        // Cerchio esterno
        var outerCircle = timerContents.addProperty("ADBE Vector Shape - Ellipse");
        outerCircle.property("ADBE Vector Ellipse Size").setValue([200, 200]);

        var outerStroke = timerContents.addProperty("ADBE Vector Graphic - Stroke");
        outerStroke.property("ADBE Vector Stroke Color").setValue(CONFIG.colors.accent);
        outerStroke.property("ADBE Vector Stroke Width").setValue(15);

        // Cerchio interno (sfondo)
        var innerCircle = timerContents.addProperty("ADBE Vector Shape - Ellipse");
        innerCircle.property("ADBE Vector Ellipse Size").setValue([170, 170]);

        var innerFill = timerContents.addProperty("ADBE Vector Graphic - Fill");
        innerFill.property("ADBE Vector Fill Color").setValue([0.98, 0.97, 0.96]);

        // Lancetta
        var hand = timerContents.addProperty("ADBE Vector Shape - Group");
        var handShape = new Shape();
        handShape.vertices = [
            [0, 0],
            [0, -70]
        ];
        handShape.closed = false;
        hand.property("ADBE Vector Shape").setValue(handShape);

        var handStroke = timerContents.addProperty("ADBE Vector Graphic - Stroke");
        handStroke.property("ADBE Vector Stroke Color").setValue(CONFIG.colors.accent);
        handStroke.property("ADBE Vector Stroke Width").setValue(8);
        handStroke.property("ADBE Vector Stroke Line Cap").setValue(2);

        // Centro
        var center = timerContents.addProperty("ADBE Vector Shape - Ellipse");
        center.property("ADBE Vector Ellipse Size").setValue([20, 20]);

        var centerFill = timerContents.addProperty("ADBE Vector Graphic - Fill");
        centerFill.property("ADBE Vector Fill Color").setValue(CONFIG.colors.accent);

        // Posizione
        group.transform.position.setValue([CONFIG.width / 2, yPos]);

        // Animazione
        createPopIn(group, startTime, 0.4);

        // Rotazione lancetta
        try {
            group.transform.rotation.expression =
                'time * 180;'; // Gira veloce
        } catch(e) {}

        createFadeOut(group, startTime + duration - 0.5, 0.5);

        return group;
    }

    function createCupsGraphic(comp, startTime, duration, yPos) {
        var group = comp.layers.addShape();
        group.name = "Grafica_Bicchieri";

        var contents = group.property("ADBE Root Vectors Group");

        // Crea 3 bicchieri
        for (var i = 0; i < 3; i++) {
            var cupGroup = contents.addProperty("ADBE Vector Group");
            cupGroup.name = "Bicchiere_" + (i + 1);
            var cupContents = cupGroup.property("ADBE Vectors Group");

            // Corpo bicchiere (trapezio)
            var body = cupContents.addProperty("ADBE Vector Shape - Group");
            var bodyShape = new Shape();
            bodyShape.vertices = [
                [-50, -60],
                [50, -60],
                [35, 60],
                [-35, 60]
            ];
            bodyShape.closed = true;
            body.property("ADBE Vector Shape").setValue(bodyShape);

            // Gradient simulato con colore solido
            var fill = cupContents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(CONFIG.colors.accent);

            // Bordo superiore (ellisse)
            var rim = cupContents.addProperty("ADBE Vector Shape - Ellipse");
            rim.property("ADBE Vector Ellipse Size").setValue([100, 20]);
            rim.property("ADBE Vector Ellipse Position").setValue([0, -60]);

            var rimFill = cupContents.addProperty("ADBE Vector Graphic - Fill");
            rimFill.property("ADBE Vector Fill Color").setValue(CONFIG.colors.accentLight);

            // Posiziona
            cupGroup.property("ADBE Vector Transform Group").property("Position").setValue([
                (i - 1) * 140,
                0
            ]);
        }

        group.transform.position.setValue([CONFIG.width / 2, yPos]);
        group.transform.scale.setValue([90, 90]);

        createPopIn(group, startTime, 0.4);

        // Animazione shuffle
        try {
            group.transform.position.expression =
                'var base = value;\n' +
                'var amp = 10;\n' +
                'var freq = 2;\n' +
                'base + [Math.sin(time * freq * Math.PI * 2) * amp, 0];';
        } catch(e) {}

        createFadeOut(group, startTime + duration - 0.5, 0.5);

        return group;
    }

    // ============================================
    // CREAZIONE TESTO
    // ============================================

    function createTextLayer(comp, text, fontSize, fontName, color, position, name) {
        var textLayer = comp.layers.addText(text);
        textLayer.name = name || "Testo";

        var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
        var textDoc = textProp.value;

        textDoc.resetCharStyle();
        textDoc.fontSize = fontSize;
        textDoc.fillColor = color;
        textDoc.font = fontName;
        textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;

        textProp.setValue(textDoc);

        textLayer.transform.position.setValue(position);

        return textLayer;
    }

    function createHookSection(comp) {
        var hook = SCRIPT.hook;

        // Testo hook
        var hookLayer = createTextLayer(
            comp,
            hook.text,
            CONFIG.textSizes.hookTitle,
            CONFIG.fonts.bold,
            CONFIG.colors.textPrimary,
            [CONFIG.width / 2, CONFIG.height / 2],
            "Hook_Testo"
        );

        // Animazione word by word + pop
        createPopIn(hookLayer, hook.startTime + 0.2, 0.4);

        // Aggiungi ombra
        try {
            var shadow = hookLayer.Effects.addProperty("ADBE Drop Shadow");
            shadow.property(1).setValue([0, 0, 0, 1]);
            shadow.property(2).setValue(100);
            shadow.property(3).setValue(135);
            shadow.property(4).setValue(8);
            shadow.property(5).setValue(15);
        } catch(e) {}

        // Fade out alla fine
        createFadeOut(hookLayer, hook.startTime + hook.duration - 0.5, 0.5);

        return hookLayer;
    }

    function createPointSection(comp, pointData, index) {
        var layers = [];
        var baseY = 350;
        var lineSpacing = 120;

        // Numero punto (es. "Primo:")
        var numberLayer = createTextLayer(
            comp,
            pointData.number,
            CONFIG.textSizes.pointNumber,
            CONFIG.fonts.bold,
            CONFIG.colors.accent,
            [CONFIG.width / 2, baseY],
            "Punto" + (index + 1) + "_Numero"
        );

        createSlideIn(numberLayer, pointData.startTime, 0.3, "left");
        createFadeOut(numberLayer, pointData.startTime + 2.5, 0.3);
        layers.push(numberLayer);

        // Titolo punto (corsivo)
        var titleLayer = createTextLayer(
            comp,
            pointData.title,
            CONFIG.textSizes.pointTitle,
            CONFIG.fonts.italic,
            CONFIG.colors.textPrimary,
            [CONFIG.width / 2, baseY + 90],
            "Punto" + (index + 1) + "_Titolo"
        );

        createSlideIn(titleLayer, pointData.startTime + 0.2, 0.3, "right");
        createFadeOut(titleLayer, pointData.startTime + 2.5, 0.3);
        layers.push(titleLayer);

        // Grafica 3D
        var graphicY = CONFIG.height * 0.55;
        var graphic;

        if (pointData.objectType === "speakers") {
            graphic = createSpeakerGraphic(comp, pointData.startTime + 0.5, 2.5, graphicY);
        } else if (pointData.objectType === "timer") {
            graphic = createTimerGraphic(comp, pointData.startTime + 0.5, 2.5, graphicY);
        } else {
            graphic = createCupsGraphic(comp, pointData.startTime + 0.5, 2.5, graphicY);
        }
        layers.push(graphic);

        // Linee di contenuto
        var lineStartTime = pointData.startTime + 3;
        var lineDuration = (pointData.duration - 3.5) / pointData.lines.length;

        for (var i = 0; i < pointData.lines.length; i++) {
            var lineY = CONFIG.height / 2 - ((pointData.lines.length - 1) * lineSpacing / 2) + (i * lineSpacing);

            var lineLayer = createTextLayer(
                comp,
                pointData.lines[i],
                CONFIG.textSizes.pointLine,
                CONFIG.fonts.bold,
                CONFIG.colors.textPrimary,
                [CONFIG.width / 2, lineY],
                "Punto" + (index + 1) + "_Linea" + (i + 1)
            );

            var lineStart = lineStartTime + (i * lineDuration);

            // Animazione pop per ogni linea
            createPopIn(lineLayer, lineStart, 0.25);

            // Fade out
            if (i < pointData.lines.length - 1) {
                createFadeOut(lineLayer, lineStart + lineDuration - 0.2, 0.2);
            } else {
                createFadeOut(lineLayer, pointData.startTime + pointData.duration - 0.4, 0.4);
            }

            // Aggiungi ombra leggera
            try {
                var lineShadow = lineLayer.Effects.addProperty("ADBE Drop Shadow");
                lineShadow.property(2).setValue(60);
                lineShadow.property(4).setValue(5);
                lineShadow.property(5).setValue(10);
            } catch(e) {}

            layers.push(lineLayer);
        }

        return layers;
    }

    function createCTASection(comp) {
        var cta = SCRIPT.cta;
        var layers = [];
        var lineDuration = cta.duration / cta.lines.length;

        for (var i = 0; i < cta.lines.length; i++) {
            var lineData = cta.lines[i];
            var isQuestion = lineData.style === "question";

            var fontSize = isQuestion ? CONFIG.textSizes.ctaQuestion : CONFIG.textSizes.ctaAction;
            var fontName = isQuestion ? CONFIG.fonts.bold : CONFIG.fonts.italic;
            var color = isQuestion ? CONFIG.colors.accent : CONFIG.colors.textPrimary;

            var lineLayer = createTextLayer(
                comp,
                lineData.text,
                fontSize,
                fontName,
                color,
                [CONFIG.width / 2, CONFIG.height / 2],
                "CTA_Linea" + (i + 1)
            );

            var lineStart = cta.startTime + (i * lineDuration);

            createPopIn(lineLayer, lineStart, 0.3);

            if (i < cta.lines.length - 1) {
                createFadeOut(lineLayer, lineStart + lineDuration - 0.3, 0.3);
            }

            // Pulsazione per l'ultimo CTA
            if (i === cta.lines.length - 1) {
                try {
                    lineLayer.transform.scale.expression =
                        'var base = [100, 100];\n' +
                        'var amp = 5;\n' +
                        'var freq = 2;\n' +
                        'var pulse = Math.sin(time * freq * Math.PI * 2) * amp;\n' +
                        'base + [pulse, pulse];';
                } catch(e) {}
            }

            layers.push(lineLayer);
        }

        return layers;
    }

    // ============================================
    // CREAZIONE SFONDO
    // ============================================

    function createBackground(comp) {
        // Sfondo solido beige
        var bg = comp.layers.addSolid(
            CONFIG.colors.background,
            "Sfondo",
            CONFIG.width,
            CONFIG.height,
            1,
            CONFIG.duration
        );

        // Gradient overlay (shape layer)
        var gradientLayer = comp.layers.addShape();
        gradientLayer.name = "Gradient_Overlay";

        var contents = gradientLayer.property("ADBE Root Vectors Group");
        var rectGroup = contents.addProperty("ADBE Vector Group");
        var rectContents = rectGroup.property("ADBE Vectors Group");

        var rect = rectContents.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([CONFIG.width, CONFIG.height]);

        // Gradiente
        var gradFill = rectContents.addProperty("ADBE Vector Graphic - G-Fill");
        gradFill.property("ADBE Vector Grad Type").setValue(2); // Radial
        gradFill.property("ADBE Vector Grad Start Pt").setValue([0, -CONFIG.height/2]);
        gradFill.property("ADBE Vector Grad End Pt").setValue([0, CONFIG.height/2]);

        // Colori gradiente
        var gradColors = gradFill.property("ADBE Vector Grad Colors");

        gradientLayer.transform.position.setValue([CONFIG.width / 2, CONFIG.height / 2]);
        gradientLayer.transform.opacity.setValue(30);

        bg.moveToEnd();
        gradientLayer.moveAfter(bg);

        return bg;
    }

    // ============================================
    // FUNZIONE PRINCIPALE
    // ============================================

    function createInstagramReelEducational() {
        app.beginUndoGroup("Crea Instagram Reel Educativo");

        try {
            // Crea composizione
            var comp = app.project.items.addComp(
                "Instagram_Reel_Educational",
                CONFIG.width,
                CONFIG.height,
                1,
                CONFIG.duration,
                CONFIG.fps
            );

            // 1. Sfondo
            createBackground(comp);

            // 2. Hook
            createHookSection(comp);

            // 3. Punti
            for (var i = 0; i < SCRIPT.points.length; i++) {
                createPointSection(comp, SCRIPT.points[i], i);
            }

            // 4. CTA
            createCTASection(comp);

            // 5. Adjustment layer per color grading
            var adjLayer = comp.layers.addSolid(
                [1, 1, 1],
                "Color_Grading",
                CONFIG.width,
                CONFIG.height,
                1,
                CONFIG.duration
            );
            adjLayer.adjustmentLayer = true;
            adjLayer.moveToBeginning();

            // Curves per contrasto leggero
            try {
                adjLayer.Effects.addProperty("ADBE CurvesCustom");
            } catch(e) {}

            // Apri composizione
            comp.openInViewer();

            // Messaggio finale
            alert(
                "VIDEO EDUCATIVO CREATO!\n\n" +
                "Composizione: " + comp.name + "\n" +
                "Durata: " + CONFIG.duration + " secondi\n" +
                "Dimensioni: " + CONFIG.width + "x" + CONFIG.height + "\n\n" +
                "CONTENUTO:\n" +
                "- Hook iniziale\n" +
                "- 3 punti con grafiche animate\n" +
                "- CTA finale\n\n" +
                "PROSSIMI PASSI:\n" +
                "1. Premi SPAZIO per preview\n" +
                "2. Modifica i testi se necessario\n" +
                "3. Esporta: Composizione > Aggiungi a Media Encoder\n" +
                "4. Formato: H.264, 1080x1920"
            );

            return comp;

        } catch(e) {
            alert("ERRORE:\n" + e.toString() + "\n\nLinea: " + e.line);
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================
    // ESECUZIONE
    // ============================================

    createInstagramReelEducational();

})();
