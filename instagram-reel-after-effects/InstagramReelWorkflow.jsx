/**
 * Instagram Reel Workflow - After Effects ExtendScript
 * =====================================================
 * Versione 2.0 - Compatibile con After Effects italiano
 *
 * ISTRUZIONI:
 * 1. Importa il tuo video in After Effects
 * 2. Seleziona il footage video nel pannello Progetto
 * 3. Esegui: File > Script > Esegui file script...
 * 4. Seleziona questo file .jsx
 */

#target aftereffects

(function() {

    // ============================================
    // CONFIGURAZIONE
    // ============================================
    var CONFIG = {
        compWidth: 1080,
        compHeight: 1920,
        frameRate: 30,
        duration: 15,
        blurAmount: 50,
        bgScale: 120
    };

    // ============================================
    // FUNZIONI HELPER
    // ============================================

    function getTransformProperty(layer, propName) {
        // Accesso alle proprietà Transform usando indici (funziona in tutte le lingue)
        var transform = layer.property(1); // ADBE Transform Group è sempre index 1

        switch(propName) {
            case "anchorPoint": return transform.property(1);
            case "position": return transform.property(2);
            case "scale": return transform.property(6);
            case "rotation": return transform.property(10);
            case "opacity": return transform.property(11);
            default: return null;
        }
    }

    function safeAddEffect(layer, matchName) {
        try {
            return layer.property("ADBE Effect Parade").addProperty(matchName);
        } catch(e) {
            return null;
        }
    }

    function safeSetEffectValue(effect, propIndex, value) {
        try {
            if (effect) {
                effect.property(propIndex).setValue(value);
            }
        } catch(e) {
            // Ignora errori
        }
    }

    function addKeyframe(prop, time, value) {
        try {
            var idx = prop.addKey(time);
            prop.setValueAtKey(idx, value);

            // Applica Easy Ease
            var easeIn = new KeyframeEase(0, 80);
            var easeOut = new KeyframeEase(0, 80);

            if (prop.propertyValueType === PropertyValueType.TwoD ||
                prop.propertyValueType === PropertyValueType.TwoD_SPATIAL) {
                prop.setTemporalEaseAtKey(idx, [easeIn, easeIn], [easeOut, easeOut]);
            } else {
                prop.setTemporalEaseAtKey(idx, [easeIn], [easeOut]);
            }

            return idx;
        } catch(e) {
            return -1;
        }
    }

    function createPopInAnimation(layer, startTime) {
        var scale = getTransformProperty(layer, "scale");
        var opacity = getTransformProperty(layer, "opacity");

        if (scale) {
            addKeyframe(scale, startTime, [0, 0]);
            addKeyframe(scale, startTime + 0.15, [115, 115]);
            addKeyframe(scale, startTime + 0.25, [100, 100]);
        }

        if (opacity) {
            addKeyframe(opacity, startTime, 0);
            addKeyframe(opacity, startTime + 0.1, 100);
        }
    }

    function createSlideInAnimation(layer, startTime, fromX, fromY) {
        var position = getTransformProperty(layer, "position");
        var opacity = getTransformProperty(layer, "opacity");

        if (position) {
            var endPos = position.value;
            var startPos = [endPos[0] + fromX, endPos[1] + fromY];

            addKeyframe(position, startTime, startPos);
            addKeyframe(position, startTime + 0.3, endPos);
        }

        if (opacity) {
            addKeyframe(opacity, startTime, 0);
            addKeyframe(opacity, startTime + 0.15, 100);
        }
    }

    // ============================================
    // FUNZIONE PRINCIPALE
    // ============================================

    function createInstagramReel(footage) {

        app.beginUndoGroup("Crea Instagram Reel");

        var comp = null;

        try {

            // ========================================
            // CREA COMPOSIZIONE
            // ========================================

            comp = app.project.items.addComp(
                "Instagram_Reel_9x16",
                CONFIG.compWidth,
                CONFIG.compHeight,
                1,
                CONFIG.duration,
                CONFIG.frameRate
            );

            // ========================================
            // 1. SFONDO SFOCATO
            // ========================================

            var bgLayer = comp.layers.add(footage);
            bgLayer.name = "BG_Sfocato";

            // Scala sfondo
            var bgScale = getTransformProperty(bgLayer, "scale");
            if (bgScale) bgScale.setValue([CONFIG.bgScale, CONFIG.bgScale]);

            // Sfocatura Gaussiana (ADBE Gaussian Blur 2)
            var blur = safeAddEffect(bgLayer, "ADBE Gaussian Blur 2");
            if (blur) {
                safeSetEffectValue(blur, 1, CONFIG.blurAmount); // Blurriness
                safeSetEffectValue(blur, 2, true); // Repeat Edge Pixels
            }

            // Tonalità/Saturazione per desaturare leggermente
            var hueSat = safeAddEffect(bgLayer, "ADBE HUE SATURATION");
            if (hueSat) {
                safeSetEffectValue(hueSat, 4, -20); // Master Saturation
            }

            // ========================================
            // 2. VIDEO PRINCIPALE
            // ========================================

            var mainLayer = comp.layers.add(footage);
            mainLayer.name = "Video_Principale";
            mainLayer.moveToBeginning();

            // Calcola scala per adattare
            var scaleX = (CONFIG.compWidth / footage.width) * 100;
            var scaleY = (CONFIG.compHeight / footage.height) * 100;
            var optScale = Math.max(scaleX, scaleY);

            var mainScale = getTransformProperty(mainLayer, "scale");
            if (mainScale) mainScale.setValue([optScale, optScale]);

            // ========================================
            // 3. HEADLINE
            // ========================================

            var headlineLayer = comp.layers.addText("IL TUO TITOLO");
            headlineLayer.name = "Testo_Headline";

            // Stile testo
            var headlineDoc = headlineLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
            headlineDoc.resetCharStyle();
            headlineDoc.fontSize = 90;
            headlineDoc.fillColor = [1, 1, 1];
            headlineDoc.strokeColor = [0, 0, 0];
            headlineDoc.strokeWidth = 2;
            headlineDoc.font = "Arial-BoldMT";
            headlineDoc.tracking = 50;
            headlineDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            headlineLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(headlineDoc);

            // Posizione
            var headlinePos = getTransformProperty(headlineLayer, "position");
            if (headlinePos) headlinePos.setValue([CONFIG.compWidth / 2, 380]);

            // Ombra esterna
            var headlineShadow = safeAddEffect(headlineLayer, "ADBE Drop Shadow");
            if (headlineShadow) {
                safeSetEffectValue(headlineShadow, 1, [0, 0, 0, 1]); // Color
                safeSetEffectValue(headlineShadow, 2, 180); // Opacity
                safeSetEffectValue(headlineShadow, 3, 135); // Direction
                safeSetEffectValue(headlineShadow, 4, 10); // Distance
                safeSetEffectValue(headlineShadow, 5, 25); // Softness
            }

            // Animazione
            createPopInAnimation(headlineLayer, 0.5);

            // ========================================
            // 4. SOTTOTITOLO
            // ========================================

            var subLayer = comp.layers.addText("Sottotitolo accattivante");
            subLayer.name = "Testo_Sottotitolo";

            var subDoc = subLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
            subDoc.resetCharStyle();
            subDoc.fontSize = 56;
            subDoc.fillColor = [0.2, 0.8, 1]; // Ciano
            subDoc.font = "Arial-BoldMT";
            subDoc.tracking = 25;
            subDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            subLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(subDoc);

            var subPos = getTransformProperty(subLayer, "position");
            if (subPos) subPos.setValue([CONFIG.compWidth / 2, 480]);

            // Animazione slide da sinistra
            createSlideInAnimation(subLayer, 0.8, -300, 0);

            // ========================================
            // 5. CALL TO ACTION
            // ========================================

            var ctaLayer = comp.layers.addText("SCOPRI DI PIU");
            ctaLayer.name = "Testo_CTA";

            var ctaDoc = ctaLayer.property("ADBE Text Properties").property("ADBE Text Document").value;
            ctaDoc.resetCharStyle();
            ctaDoc.fontSize = 48;
            ctaDoc.fillColor = [1, 0.8, 0.2]; // Giallo
            ctaDoc.font = "Arial-BoldMT";
            ctaDoc.tracking = 100;
            ctaDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            ctaLayer.property("ADBE Text Properties").property("ADBE Text Document").setValue(ctaDoc);

            var ctaPos = getTransformProperty(ctaLayer, "position");
            if (ctaPos) ctaPos.setValue([CONFIG.compWidth / 2, CONFIG.compHeight - 220]);

            // Animazione slide dal basso
            createSlideInAnimation(ctaLayer, 1.2, 0, 200);

            // Pulsazione
            var ctaScale = getTransformProperty(ctaLayer, "scale");
            if (ctaScale) {
                ctaScale.expression =
                    'var freq = 2;\n' +
                    'var amp = 5;\n' +
                    '[value[0] + Math.sin(time * freq * Math.PI * 2) * amp, ' +
                    'value[1] + Math.sin(time * freq * Math.PI * 2) * amp];';
            }

            // ========================================
            // 6. BOX SFONDO TESTO
            // ========================================

            var boxLayer = comp.layers.addShape();
            boxLayer.name = "Box_Sfondo";

            // Gruppo
            var contents = boxLayer.property("ADBE Root Vectors Group");
            var boxGroup = contents.addProperty("ADBE Vector Group");
            var boxContents = boxGroup.property("ADBE Vectors Group");

            // Rettangolo
            var rect = boxContents.addProperty("ADBE Vector Shape - Rect");
            rect.property("ADBE Vector Rect Size").setValue([850, 130]);
            rect.property("ADBE Vector Rect Roundness").setValue(25);

            // Riempimento
            var fill = boxContents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue([1, 0.2, 0.4]); // Rosa
            fill.property("ADBE Vector Fill Opacity").setValue(85);

            // Posizione box
            var boxPos = getTransformProperty(boxLayer, "position");
            if (boxPos) boxPos.setValue([CONFIG.compWidth / 2, 380]);

            // Sposta dietro headline
            boxLayer.moveAfter(headlineLayer);

            // Animazione
            createPopInAnimation(boxLayer, 0.4);

            // ========================================
            // 7. FRECCIA ANIMATA
            // ========================================

            var arrowLayer = comp.layers.addShape();
            arrowLayer.name = "Freccia";

            var arrowContents = arrowLayer.property("ADBE Root Vectors Group");
            var arrowGroup = arrowContents.addProperty("ADBE Vector Group");
            var arrowGroupContents = arrowGroup.property("ADBE Vectors Group");

            // Linea freccia
            var arrowPath = arrowGroupContents.addProperty("ADBE Vector Shape - Group");
            var arrowShape = new Shape();
            arrowShape.vertices = [
                [-30, 0],
                [30, 0]
            ];
            arrowShape.closed = false;
            arrowPath.property("ADBE Vector Shape").setValue(arrowShape);

            // Punta 1
            var arrowTip1 = arrowGroupContents.addProperty("ADBE Vector Shape - Group");
            var tipShape1 = new Shape();
            tipShape1.vertices = [
                [10, -20],
                [30, 0],
                [10, 20]
            ];
            tipShape1.closed = false;
            arrowTip1.property("ADBE Vector Shape").setValue(tipShape1);

            // Stroke
            var arrowStroke = arrowGroupContents.addProperty("ADBE Vector Graphic - Stroke");
            arrowStroke.property("ADBE Vector Stroke Color").setValue([1, 0.8, 0.2]); // Giallo
            arrowStroke.property("ADBE Vector Stroke Width").setValue(10);
            arrowStroke.property("ADBE Vector Stroke Line Cap").setValue(2); // Round

            // Posizione freccia (lato destro, punta verso il basso)
            var arrowPos = getTransformProperty(arrowLayer, "position");
            if (arrowPos) arrowPos.setValue([CONFIG.compWidth - 120, CONFIG.compHeight - 220]);

            var arrowRot = getTransformProperty(arrowLayer, "rotation");
            if (arrowRot) arrowRot.setValue(90);

            var arrowScale = getTransformProperty(arrowLayer, "scale");
            if (arrowScale) arrowScale.setValue([120, 120]);

            // Animazione bounce
            if (arrowPos) {
                arrowPos.expression =
                    'var freq = 3;\n' +
                    'var amp = 15;\n' +
                    'value + [0, Math.sin(time * freq * Math.PI * 2) * amp];';
            }

            createPopInAnimation(arrowLayer, 1.4);

            // ========================================
            // 8. ICONA CUORE
            // ========================================

            var heartLayer = comp.layers.addShape();
            heartLayer.name = "Cuore";

            var heartContents = heartLayer.property("ADBE Root Vectors Group");
            var heartGroup = heartContents.addProperty("ADBE Vector Group");
            var heartGroupContents = heartGroup.property("ADBE Vectors Group");

            // Ellisse 1
            var ellipse1 = heartGroupContents.addProperty("ADBE Vector Shape - Ellipse");
            ellipse1.property("ADBE Vector Ellipse Size").setValue([45, 45]);
            ellipse1.property("ADBE Vector Ellipse Position").setValue([-15, -8]);

            // Ellisse 2
            var ellipse2 = heartGroupContents.addProperty("ADBE Vector Shape - Ellipse");
            ellipse2.property("ADBE Vector Ellipse Size").setValue([45, 45]);
            ellipse2.property("ADBE Vector Ellipse Position").setValue([15, -8]);

            // Triangolo (punta cuore)
            var triangle = heartGroupContents.addProperty("ADBE Vector Shape - Group");
            var triShape = new Shape();
            triShape.vertices = [
                [-35, 5],
                [0, 45],
                [35, 5]
            ];
            triShape.closed = true;
            triangle.property("ADBE Vector Shape").setValue(triShape);

            // Merge
            heartGroupContents.addProperty("ADBE Vector Filter - Merge");

            // Fill cuore
            var heartFill = heartGroupContents.addProperty("ADBE Vector Graphic - Fill");
            heartFill.property("ADBE Vector Fill Color").setValue([1, 0.2, 0.3]); // Rosso

            // Posizione cuore
            var heartPos = getTransformProperty(heartLayer, "position");
            if (heartPos) heartPos.setValue([120, 520]);

            var heartScale = getTransformProperty(heartLayer, "scale");
            if (heartScale) {
                heartScale.setValue([80, 80]);
                // Battito
                heartScale.expression =
                    'var bpm = 75;\n' +
                    'var amp = 12;\n' +
                    'var freq = bpm / 60;\n' +
                    'var beat = Math.pow(Math.abs(Math.sin(time * freq * Math.PI)), 4);\n' +
                    'value + [beat * amp, beat * amp];';
            }

            createPopInAnimation(heartLayer, 1.6);

            // ========================================
            // 9. ADJUSTMENT LAYER
            // ========================================

            var adjLayer = comp.layers.addSolid(
                [1, 1, 1],
                "Correzione_Colore",
                CONFIG.compWidth,
                CONFIG.compHeight,
                1,
                CONFIG.duration
            );
            adjLayer.adjustmentLayer = true;
            adjLayer.moveToBeginning();

            // Curves per contrasto leggero
            safeAddEffect(adjLayer, "ADBE CurvesCustom");

            // ========================================
            // FINE
            // ========================================

            alert(
                "COMPOSIZIONE CREATA!\n\n" +
                "Nome: " + comp.name + "\n" +
                "Dimensioni: " + CONFIG.compWidth + "x" + CONFIG.compHeight + "\n" +
                "Durata: " + CONFIG.duration + " secondi\n" +
                "FPS: " + CONFIG.frameRate + "\n\n" +
                "Layer creati:\n" +
                "- Video principale\n" +
                "- Sfondo sfocato\n" +
                "- Testi animati\n" +
                "- Box, freccia, cuore\n" +
                "- Adjustment layer\n\n" +
                "Modifica i testi con doppio-click!"
            );

            return comp;

        } catch(e) {
            alert("ERRORE:\n" + e.toString() + "\n\nLinea: " + e.line);
            if (comp) {
                // Mantieni la composizione anche se ci sono errori
            }
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================
    // MAIN
    // ============================================

    function main() {

        // Verifica versione AE
        var version = parseFloat(app.version);
        if (version < 16.0) {
            alert("Questo script richiede After Effects CC 2019 o superiore.");
            return;
        }

        var footage = null;

        // Prima prova: selezione nel pannello Progetto
        if (app.project.selection.length > 0) {
            var sel = app.project.selection[0];
            if (sel instanceof FootageItem && sel.hasVideo) {
                footage = sel;
            }
        }

        // Seconda prova: layer selezionato nella comp attiva
        if (!footage && app.project.activeItem instanceof CompItem) {
            var activeComp = app.project.activeItem;
            if (activeComp.selectedLayers.length > 0) {
                var layer = activeComp.selectedLayers[0];
                if (layer.source instanceof FootageItem && layer.source.hasVideo) {
                    footage = layer.source;
                }
            }
        }

        if (footage) {
            createInstagramReel(footage);
        } else {
            alert(
                "NESSUN VIDEO SELEZIONATO\n\n" +
                "Come usare questo script:\n\n" +
                "1. Importa un video:\n" +
                "   File > Importa > File... (Ctrl+I / Cmd+I)\n\n" +
                "2. Nel pannello Progetto, clicca sul video\n" +
                "   per selezionarlo\n\n" +
                "3. Esegui di nuovo lo script:\n" +
                "   File > Script > Esegui file script..."
            );
        }
    }

    main();

})();
