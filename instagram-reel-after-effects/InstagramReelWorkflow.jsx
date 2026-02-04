/**
 * Instagram Reel Workflow - After Effects ExtendScript
 * =====================================================
 * Crea automaticamente un setup per Instagram Reel 9:16
 * con sfondo sfocato, testi animati e grafiche social
 *
 * Autore: Claude AI
 * Versione: 1.0
 * Compatibilità: After Effects CC 2020+
 *
 * ISTRUZIONI:
 * 1. Importa il tuo video in After Effects
 * 2. Seleziona il layer video nel pannello Progetto o Timeline
 * 3. Esegui questo script da File > Script > Esegui file script...
 */

(function() {
    // ============================================
    // CONFIGURAZIONE - PERSONALIZZA QUI
    // ============================================
    var CONFIG = {
        // Dimensioni composizione (Instagram Reel 9:16)
        compWidth: 1080,
        compHeight: 1920,
        frameRate: 30,
        duration: 15, // secondi

        // Sfocatura sfondo
        blurAmount: 50,
        bgScale: 120, // percentuale scala sfondo

        // Colori (RGBA 0-1)
        colors: {
            primary: [1, 0.2, 0.4, 1],      // Rosa/Rosso vibrante
            secondary: [0.2, 0.8, 1, 1],    // Ciano/Azzurro
            accent: [1, 0.8, 0.2, 1],       // Giallo/Oro
            textWhite: [1, 1, 1, 1],
            textDark: [0.1, 0.1, 0.1, 1],
            shadowColor: [0, 0, 0, 0.5]
        },

        // Tipografia
        fonts: {
            headline: "Montserrat-Bold",     // Font grassetto per titoli
            body: "Montserrat-SemiBold",     // Font per testo secondario
            fallback: "Arial-BoldMT"         // Fallback se font non disponibile
        },

        // Dimensioni testo (pixel)
        textSizes: {
            headline: 96,
            subheadline: 64,
            body: 48,
            cta: 42
        },

        // Timing animazioni (secondi)
        timing: {
            textPopIn: 0.25,
            textHold: 2.0,
            graphicFadeIn: 0.3,
            staggerDelay: 0.15,
            easeIn: 0.33,
            easeOut: 0.33
        }
    };

    // ============================================
    // FUNZIONI UTILITY
    // ============================================

    function hexToRGB(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
            1
        ] : [1, 1, 1, 1];
    }

    function addKeyframeWithEase(property, time, value, easeType) {
        var keyIndex = property.addKey(time);
        property.setValueAtKey(keyIndex, value);

        if (easeType === "easeOut") {
            var easeIn = new KeyframeEase(0, 75);
            var easeOut = new KeyframeEase(0, 33);
            property.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
        } else if (easeType === "easeIn") {
            var easeIn = new KeyframeEase(0, 33);
            var easeOut = new KeyframeEase(0, 75);
            property.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
        } else if (easeType === "easeInOut") {
            var easeIn = new KeyframeEase(0, 75);
            var easeOut = new KeyframeEase(0, 75);
            property.setTemporalEaseAtKey(keyIndex, [easeIn], [easeOut]);
        }

        return keyIndex;
    }

    function createPopAnimation(layer, startTime, duration) {
        var scale = layer.property("Transform").property("Scale");
        var opacity = layer.property("Transform").property("Opacity");

        // Scale: 0% -> 110% -> 100% (overshoot)
        addKeyframeWithEase(scale, startTime, [0, 0], "easeOut");
        addKeyframeWithEase(scale, startTime + duration * 0.6, [110, 110], "easeInOut");
        addKeyframeWithEase(scale, startTime + duration, [100, 100], "easeIn");

        // Opacity: 0 -> 100
        addKeyframeWithEase(opacity, startTime, 0, "easeOut");
        addKeyframeWithEase(opacity, startTime + duration * 0.3, 100, "easeIn");
    }

    function createSlideInAnimation(layer, startTime, duration, direction) {
        var position = layer.property("Transform").property("Position");
        var opacity = layer.property("Transform").property("Opacity");
        var originalPos = position.value;
        var offset = 200;

        var startPos;
        switch(direction) {
            case "left":
                startPos = [originalPos[0] - offset, originalPos[1]];
                break;
            case "right":
                startPos = [originalPos[0] + offset, originalPos[1]];
                break;
            case "up":
                startPos = [originalPos[0], originalPos[1] + offset];
                break;
            case "down":
                startPos = [originalPos[0], originalPos[1] - offset];
                break;
            default:
                startPos = [originalPos[0] - offset, originalPos[1]];
        }

        addKeyframeWithEase(position, startTime, startPos, "easeOut");
        addKeyframeWithEase(position, startTime + duration, originalPos, "easeIn");

        addKeyframeWithEase(opacity, startTime, 0, "easeOut");
        addKeyframeWithEase(opacity, startTime + duration * 0.5, 100, "easeIn");
    }

    function createTypewriterExpression() {
        return '// Effetto Typewriter\n' +
               'var speed = 2; // caratteri al frame\n' +
               'var txt = value;\n' +
               'var numChars = Math.floor(time * speed * thisComp.frameRate);\n' +
               'txt.substr(0, Math.min(numChars, txt.length));';
    }

    function createPulseExpression() {
        return '// Pulsazione sottile\n' +
               'var freq = 2;\n' +
               'var amp = 5;\n' +
               'var base = value;\n' +
               '[base[0] + Math.sin(time * freq * Math.PI * 2) * amp, ' +
               'base[1] + Math.sin(time * freq * Math.PI * 2) * amp];';
    }

    function createWiggleExpression(freq, amp) {
        return 'wiggle(' + freq + ', ' + amp + ')';
    }

    // ============================================
    // FUNZIONE PRINCIPALE - CREA COMPOSIZIONE
    // ============================================

    function createInstagramReelComp(sourceFootage) {
        app.beginUndoGroup("Crea Instagram Reel");

        try {
            // Crea nuova composizione
            var comp = app.project.items.addComp(
                "Instagram_Reel_9x16",
                CONFIG.compWidth,
                CONFIG.compHeight,
                1, // pixel aspect ratio
                CONFIG.duration,
                CONFIG.frameRate
            );

            // ========================================
            // 1. SFONDO SFOCATO
            // ========================================

            // Layer sfondo (duplicato sfocato)
            var bgLayer = comp.layers.add(sourceFootage);
            bgLayer.name = "Sfondo_Sfocato";

            // Scala per riempire bordi
            var bgScale = bgLayer.property("Transform").property("Scale");
            bgScale.setValue([CONFIG.bgScale, CONFIG.bgScale]);

            // Aggiungi effetto Sfocatura Gaussiana
            var blur = bgLayer.Effects.addProperty("ADBE Gaussian Blur 2");
            blur.property("Blurriness").setValue(CONFIG.blurAmount);
            blur.property("Repeat Edge Pixels").setValue(true);

            // Aggiungi leggera desaturazione allo sfondo
            var hueSat = bgLayer.Effects.addProperty("ADBE HUE SATURATION");
            hueSat.property("Master Saturation").setValue(-20);

            // Aggiungi vignettatura sottile
            var vignette = bgLayer.Effects.addProperty("ADBE Vignette");
            if (vignette) {
                vignette.property("Amount").setValue(50);
            }

            // ========================================
            // 2. LAYER VIDEO PRINCIPALE (SOGGETTO)
            // ========================================

            var mainLayer = comp.layers.add(sourceFootage);
            mainLayer.name = "Video_Principale";
            mainLayer.moveToBeginning();

            // Centra e scala per adattare alla composizione verticale
            var mainScale = mainLayer.property("Transform").property("Scale");

            // Calcola scala ottimale per contenere il video
            var footageWidth = sourceFootage.width;
            var footageHeight = sourceFootage.height;
            var scaleX = (CONFIG.compWidth / footageWidth) * 100;
            var scaleY = (CONFIG.compHeight / footageHeight) * 100;
            var optimalScale = Math.max(scaleX, scaleY);
            mainScale.setValue([optimalScale, optimalScale]);

            // ========================================
            // 3. LAYER TESTO - HEADLINE PRINCIPALE
            // ========================================

            var headlineLayer = comp.layers.addText("IL TUO TITOLO");
            headlineLayer.name = "Testo_Headline";

            var headlineTextProp = headlineLayer.property("Source Text");
            var headlineTextDoc = headlineTextProp.value;

            headlineTextDoc.resetCharStyle();
            headlineTextDoc.fontSize = CONFIG.textSizes.headline;
            headlineTextDoc.fillColor = CONFIG.colors.textWhite;
            headlineTextDoc.font = CONFIG.fonts.headline;
            headlineTextDoc.tracking = 50;
            headlineTextDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            headlineTextProp.setValue(headlineTextDoc);

            // Posiziona nella parte superiore
            var headlinePos = headlineLayer.property("Transform").property("Position");
            headlinePos.setValue([CONFIG.compWidth / 2, 350]);

            // Aggiungi ombra al testo
            var headlineShadow = headlineLayer.Effects.addProperty("ADBE Drop Shadow");
            headlineShadow.property("Opacity").setValue(150);
            headlineShadow.property("Direction").setValue(135);
            headlineShadow.property("Distance").setValue(8);
            headlineShadow.property("Softness").setValue(20);

            // Animazione POP IN
            createPopAnimation(headlineLayer, 0.5, CONFIG.timing.textPopIn);

            // ========================================
            // 4. LAYER TESTO - SOTTOTITOLO
            // ========================================

            var subLayer = comp.layers.addText("Sottotitolo accattivante");
            subLayer.name = "Testo_Sottotitolo";

            var subTextProp = subLayer.property("Source Text");
            var subTextDoc = subTextProp.value;

            subTextDoc.resetCharStyle();
            subTextDoc.fontSize = CONFIG.textSizes.subheadline;
            subTextDoc.fillColor = CONFIG.colors.secondary;
            subTextDoc.font = CONFIG.fonts.body;
            subTextDoc.tracking = 25;
            subTextDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            subTextProp.setValue(subTextDoc);

            // Posiziona sotto headline
            var subPos = subLayer.property("Transform").property("Position");
            subPos.setValue([CONFIG.compWidth / 2, 450]);

            // Animazione SLIDE IN da sinistra
            createSlideInAnimation(subLayer, 0.8, 0.3, "left");

            // ========================================
            // 5. LAYER TESTO - CALL TO ACTION
            // ========================================

            var ctaLayer = comp.layers.addText("SCOPRI DI PIÙ →");
            ctaLayer.name = "Testo_CTA";

            var ctaTextProp = ctaLayer.property("Source Text");
            var ctaTextDoc = ctaTextProp.value;

            ctaTextDoc.resetCharStyle();
            ctaTextDoc.fontSize = CONFIG.textSizes.cta;
            ctaTextDoc.fillColor = CONFIG.colors.accent;
            ctaTextDoc.font = CONFIG.fonts.body;
            ctaTextDoc.tracking = 100;
            ctaTextProp.setValue(ctaTextDoc);

            // Posiziona nella parte inferiore
            var ctaPos = ctaLayer.property("Transform").property("Position");
            ctaPos.setValue([CONFIG.compWidth / 2, CONFIG.compHeight - 200]);

            // Animazione SLIDE IN dal basso
            createSlideInAnimation(ctaLayer, 1.2, 0.3, "up");

            // Aggiungi pulsazione sottile al CTA
            var ctaScale = ctaLayer.property("Transform").property("Scale");
            ctaScale.expression = createPulseExpression();

            // ========================================
            // 6. SHAPE LAYER - BOX DIETRO TESTO
            // ========================================

            var boxLayer = comp.layers.addShape();
            boxLayer.name = "Box_Sfondo_Testo";

            // Crea rettangolo arrotondato
            var boxGroup = boxLayer.property("Contents").addProperty("ADBE Vector Group");
            var boxRect = boxGroup.property("Contents").addProperty("ADBE Vector Shape - Rect");
            boxRect.property("Size").setValue([800, 120]);
            boxRect.property("Roundness").setValue(20);

            // Riempimento con gradiente simulato (colore solido)
            var boxFill = boxGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            boxFill.property("Color").setValue(CONFIG.colors.primary.slice(0, 3));
            boxFill.property("Opacity").setValue(85);

            // Posiziona dietro headline
            boxLayer.property("Transform").property("Position").setValue([CONFIG.compWidth / 2, 350]);
            boxLayer.moveAfter(headlineLayer);

            // Animazione scala
            createPopAnimation(boxLayer, 0.4, 0.2);

            // ========================================
            // 7. SHAPE LAYER - FRECCIA ANIMATA
            // ========================================

            var arrowLayer = comp.layers.addShape();
            arrowLayer.name = "Freccia_Animata";

            // Crea freccia con path
            var arrowGroup = arrowLayer.property("Contents").addProperty("ADBE Vector Group");
            var arrowPath = arrowGroup.property("Contents").addProperty("ADBE Vector Shape - Group");

            // Path della freccia
            var arrowShape = new Shape();
            arrowShape.vertices = [
                [-40, 0],   // Punto sinistro
                [20, 0],    // Centro linea
                [0, -20],   // Punta su
                [20, 0],    // Centro (ritorno)
                [0, 20]     // Punta giù
            ];
            arrowShape.closed = false;
            arrowPath.property("Path").setValue(arrowShape);

            // Stroke della freccia
            var arrowStroke = arrowGroup.property("Contents").addProperty("ADBE Vector Graphic - Stroke");
            arrowStroke.property("Color").setValue(CONFIG.colors.accent.slice(0, 3));
            arrowStroke.property("Stroke Width").setValue(8);
            arrowStroke.property("Line Cap").setValue(2); // Round cap

            // Posiziona freccia
            arrowLayer.property("Transform").property("Position").setValue([CONFIG.compWidth - 150, CONFIG.compHeight / 2]);
            arrowLayer.property("Transform").property("Rotation").setValue(-90);
            arrowLayer.property("Transform").property("Scale").setValue([150, 150]);

            // Animazione freccia che punta
            var arrowPos = arrowLayer.property("Transform").property("Position");
            arrowPos.expression = '// Movimento freccia bounce\n' +
                'var freq = 3;\n' +
                'var amp = 15;\n' +
                'var decay = 0.5;\n' +
                'value + [Math.sin(time * freq * Math.PI * 2) * amp, 0];';

            createPopAnimation(arrowLayer, 1.5, 0.25);

            // ========================================
            // 8. SHAPE LAYER - ICONA CUORE/LIKE
            // ========================================

            var heartLayer = comp.layers.addShape();
            heartLayer.name = "Icona_Cuore";

            var heartGroup = heartLayer.property("Contents").addProperty("ADBE Vector Group");

            // Crea cuore con due ellissi e un triangolo
            var heartEllipse1 = heartGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
            heartEllipse1.property("Size").setValue([50, 50]);
            heartEllipse1.property("Position").setValue([-15, -10]);

            var heartEllipse2 = heartGroup.property("Contents").addProperty("ADBE Vector Shape - Ellipse");
            heartEllipse2.property("Size").setValue([50, 50]);
            heartEllipse2.property("Position").setValue([15, -10]);

            var heartFill = heartGroup.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            heartFill.property("Color").setValue([1, 0.2, 0.3]); // Rosso cuore

            // Merge paths per unificare
            var heartMerge = heartGroup.property("Contents").addProperty("ADBE Vector Filter - Merge");
            heartMerge.property("Mode").setValue(1); // Add

            // Posiziona e scala
            heartLayer.property("Transform").property("Position").setValue([150, 500]);
            heartLayer.property("Transform").property("Scale").setValue([80, 80]);

            // Animazione battito cuore
            var heartScale = heartLayer.property("Transform").property("Scale");
            heartScale.expression = '// Battito cuore\n' +
                'var bpm = 80;\n' +
                'var amp = 15;\n' +
                'var freq = bpm / 60;\n' +
                'var beat = Math.abs(Math.sin(time * freq * Math.PI));\n' +
                'var pulse = Math.pow(beat, 4) * amp;\n' +
                'value + [pulse, pulse];';

            createPopAnimation(heartLayer, 1.8, 0.2);

            // ========================================
            // 9. ADJUSTMENT LAYER - COLOR GRADING
            // ========================================

            var adjLayer = comp.layers.addSolid(
                [1, 1, 1],
                "Color_Grading",
                CONFIG.compWidth,
                CONFIG.compHeight,
                1,
                CONFIG.duration
            );
            adjLayer.adjustmentLayer = true;
            adjLayer.moveToBeginning();

            // Aggiungi Curves per contrasto
            var curves = adjLayer.Effects.addProperty("ADBE CurvesCustom");

            // Aggiungi leggero bagliore
            var glow = adjLayer.Effects.addProperty("ADBE Glo2");
            if (glow) {
                glow.property("Glow Threshold").setValue(60);
                glow.property("Glow Radius").setValue(30);
                glow.property("Glow Intensity").setValue(0.3);
            }

            // ========================================
            // 10. CREA CARTELLA ORGANIZZAZIONE
            // ========================================

            var folder = app.project.items.addFolder("Instagram_Reel_Assets");
            comp.parentFolder = folder;

            // Messaggio di completamento
            alert(
                "✅ COMPOSIZIONE INSTAGRAM REEL CREATA!\n\n" +
                "Composizione: " + comp.name + "\n" +
                "Dimensioni: " + CONFIG.compWidth + "x" + CONFIG.compHeight + " (9:16)\n" +
                "Durata: " + CONFIG.duration + " secondi\n" +
                "Frame rate: " + CONFIG.frameRate + " fps\n\n" +
                "LAYER CREATI:\n" +
                "• Video principale (soggetto nitido)\n" +
                "• Sfondo sfocato\n" +
                "• Testi animati (headline, sottotitolo, CTA)\n" +
                "• Box sfondo testo\n" +
                "• Freccia animata\n" +
                "• Icona cuore pulsante\n" +
                "• Color grading\n\n" +
                "PROSSIMI PASSI:\n" +
                "1. Modifica i testi doppio-click sui layer\n" +
                "2. Regola i tempi delle animazioni\n" +
                "3. Personalizza i colori negli effetti\n" +
                "4. Esporta con Media Encoder in H.264"
            );

            return comp;

        } catch (e) {
            alert("Errore: " + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================
    // ESECUZIONE SCRIPT
    // ============================================

    function main() {
        // Verifica selezione
        var selectedItem = app.project.activeItem;

        if (!selectedItem) {
            // Prova a prendere l'item selezionato nel pannello progetto
            if (app.project.selection.length > 0) {
                selectedItem = app.project.selection[0];
            }
        }

        // Se siamo in una composizione, prendi il layer selezionato
        if (selectedItem instanceof CompItem) {
            var comp = selectedItem;
            if (comp.selectedLayers.length > 0) {
                var layer = comp.selectedLayers[0];
                if (layer.source && layer.source instanceof FootageItem) {
                    createInstagramReelComp(layer.source);
                    return;
                }
            }
            alert(
                "⚠️ NESSUN LAYER VIDEO SELEZIONATO\n\n" +
                "Per favore:\n" +
                "1. Importa un video nel progetto\n" +
                "2. Seleziona il footage video nel pannello Progetto\n" +
                "   OPPURE\n" +
                "   Seleziona un layer video nella timeline\n" +
                "3. Esegui nuovamente lo script"
            );
            return;
        }

        // Verifica che sia un footage video
        if (selectedItem instanceof FootageItem) {
            createInstagramReelComp(selectedItem);
        } else {
            alert(
                "⚠️ SELEZIONA UN VIDEO\n\n" +
                "Per usare questo script:\n" +
                "1. Importa un video (File > Importa > File...)\n" +
                "2. Seleziona il video nel pannello Progetto\n" +
                "3. Esegui nuovamente lo script\n\n" +
                "Formati supportati: MP4, MOV, AVI, etc."
            );
        }
    }

    // Esegui
    main();

})();
