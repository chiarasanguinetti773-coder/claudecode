
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

    function safeAddEffect(layer, matchName) {
        try {
            return layer.Effects.addProperty(matchName);
        } catch(e) {
            return null;
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
        try {
            // Usa layer.transform che funziona sempre
            var scale = layer.transform.scale;
            var opacity = layer.transform.opacity;

            addKeyframe(scale, startTime, [0, 0]);
            addKeyframe(scale, startTime + 0.15, [115, 115]);
            addKeyframe(scale, startTime + 0.25, [100, 100]);

            addKeyframe(opacity, startTime, 0);
            addKeyframe(opacity, startTime + 0.1, 100);
        } catch(e) {}
    }

    function createSlideInAnimation(layer, startTime, fromX, fromY) {
        try {
            var position = layer.transform.position;
            var opacity = layer.transform.opacity;

            var endPos = position.value;
            var startPos = [endPos[0] + fromX, endPos[1] + fromY];

            addKeyframe(position, startTime, startPos);
            addKeyframe(position, startTime + 0.3, endPos);

            addKeyframe(opacity, startTime, 0);
            addKeyframe(opacity, startTime + 0.15, 100);
        } catch(e) {}
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

            // Scala sfondo - usa layer.transform.scale
            bgLayer.transform.scale.setValue([CONFIG.bgScale, CONFIG.bgScale]);

            // Sfocatura Gaussiana
            var blur = safeAddEffect(bgLayer, "ADBE Gaussian Blur 2");
            if (blur) {
                try { blur.property(1).setValue(CONFIG.blurAmount); } catch(e) {}
                try { blur.property(2).setValue(true); } catch(e) {}
            }

            // Tonalità/Saturazione
            var hueSat = safeAddEffect(bgLayer, "ADBE HUE SATURATION");
            if (hueSat) {
                try { hueSat.property(4).setValue(-20); } catch(e) {}
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

            mainLayer.transform.scale.setValue([optScale, optScale]);

            // ========================================
            // 3. HEADLINE
            // ========================================

            var headlineLayer = comp.layers.addText("IL TUO TITOLO");
            headlineLayer.name = "Testo_Headline";

            // Stile testo
            var headlineTextProp = headlineLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var headlineDoc = headlineTextProp.value;
            headlineDoc.resetCharStyle();
            headlineDoc.fontSize = 90;
            headlineDoc.fillColor = [1, 1, 1];
            headlineDoc.strokeColor = [0, 0, 0];
            headlineDoc.strokeWidth = 2;
            headlineDoc.font = "Arial-BoldMT";
            headlineDoc.tracking = 50;
            headlineDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            headlineTextProp.setValue(headlineDoc);

            // Posizione
            headlineLayer.transform.position.setValue([CONFIG.compWidth / 2, 380]);

            // Ombra esterna
            var headlineShadow = safeAddEffect(headlineLayer, "ADBE Drop Shadow");
            if (headlineShadow) {
                try {
                    headlineShadow.property(1).setValue([0, 0, 0, 1]);
                    headlineShadow.property(2).setValue(180);
                    headlineShadow.property(3).setValue(135);
                    headlineShadow.property(4).setValue(10);
                    headlineShadow.property(5).setValue(25);
                } catch(e) {}
            }

            // Animazione
            createPopInAnimation(headlineLayer, 0.5);

            // ========================================
            // 4. SOTTOTITOLO
            // ========================================

            var subLayer = comp.layers.addText("Sottotitolo accattivante");
            subLayer.name = "Testo_Sottotitolo";

            var subTextProp = subLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var subDoc = subTextProp.value;
            subDoc.resetCharStyle();
            subDoc.fontSize = 56;
            subDoc.fillColor = [0.2, 0.8, 1];
            subDoc.font = "Arial-BoldMT";
            subDoc.tracking = 25;
            subDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            subTextProp.setValue(subDoc);

            subLayer.transform.position.setValue([CONFIG.compWidth / 2, 480]);

            // Animazione slide da sinistra
            createSlideInAnimation(subLayer, 0.8, -300, 0);

            // ========================================
            // 5. CALL TO ACTION
            // ========================================

            var ctaLayer = comp.layers.addText("SCOPRI DI PIU");
            ctaLayer.name = "Testo_CTA";

            var ctaTextProp = ctaLayer.property("ADBE Text Properties").property("ADBE Text Document");
            var ctaDoc = ctaTextProp.value;
            ctaDoc.resetCharStyle();
            ctaDoc.fontSize = 48;
            ctaDoc.fillColor = [1, 0.8, 0.2];
            ctaDoc.font = "Arial-BoldMT";
            ctaDoc.tracking = 100;
            ctaDoc.justification = ParagraphJustification.CENTER_JUSTIFY;
            ctaTextProp.setValue(ctaDoc);

            ctaLayer.transform.position.setValue([CONFIG.compWidth / 2, CONFIG.compHeight - 220]);

            // Animazione slide dal basso
            createSlideInAnimation(ctaLayer, 1.2, 0, 200);

            // Pulsazione
            try {
                ctaLayer.transform.scale.expression =
                    'var freq = 2;\n' +
                    'var amp = 5;\n' +
                    '[value[0] + Math.sin(time * freq * Math.PI * 2) * amp, ' +
                    'value[1] + Math.sin(time * freq * Math.PI * 2) * amp];';
            } catch(e) {}

            // ========================================
            // 6. BOX SFONDO TESTO
            // ========================================

            var boxLayer = comp.layers.addShape();
            boxLayer.name = "Box_Sfondo";

            var contents = boxLayer.property("ADBE Root Vectors Group");
            var boxGroup = contents.addProperty("ADBE Vector Group");
            var boxContents = boxGroup.property("ADBE Vectors Group");

            // Rettangolo
            var rect = boxContents.addProperty("ADBE Vector Shape - Rect");
            rect.property("ADBE Vector Rect Size").setValue([850, 130]);
            rect.property("ADBE Vector Rect Roundness").setValue(25);

            // Riempimento
            var fill = boxContents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue([1, 0.2, 0.4]);
            fill.property("ADBE Vector Fill Opacity").setValue(85);

            // Posizione box
            boxLayer.transform.position.setValue([CONFIG.compWidth / 2, 380]);

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
            arrowShape.vertices = [[-30, 0], [30, 0]];
            arrowShape.closed = false;
            arrowPath.property("ADBE Vector Shape").setValue(arrowShape);

            // Punta
            var arrowTip = arrowGroupContents.addProperty("ADBE Vector Shape - Group");
            var tipShape = new Shape();
            tipShape.vertices = [[10, -20], [30, 0], [10, 20]];
            tipShape.closed = false;
            arrowTip.property("ADBE Vector Shape").setValue(tipShape);

            // Stroke
            var arrowStroke = arrowGroupContents.addProperty("ADBE Vector Graphic - Stroke");
            arrowStroke.property("ADBE Vector Stroke Color").setValue([1, 0.8, 0.2]);
            arrowStroke.property("ADBE Vector Stroke Width").setValue(10);
            arrowStroke.property("ADBE Vector Stroke Line Cap").setValue(2);

            // Posizione freccia
            arrowLayer.transform.position.setValue([CONFIG.compWidth - 120, CONFIG.compHeight - 220]);
            arrowLayer.transform.rotation.setValue(90);
            arrowLayer.transform.scale.setValue([120, 120]);

            // Animazione bounce
            try {
                arrowLayer.transform.position.expression =
                    'var freq = 3;\n' +
                    'var amp = 15;\n' +
                    'value + [0, Math.sin(time * freq * Math.PI * 2) * amp];';
            } catch(e) {}

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

            // Triangolo
            var triangle = heartGroupContents.addProperty("ADBE Vector Shape - Group");
            var triShape = new Shape();
            triShape.vertices = [[-35, 5], [0, 45], [35, 5]];
            triShape.closed = true;
            triangle.property("ADBE Vector Shape").setValue(triShape);

            // Merge
            heartGroupContents.addProperty("ADBE Vector Filter - Merge");

            // Fill cuore
            var heartFill = heartGroupContents.addProperty("ADBE Vector Graphic - Fill");
            heartFill.property("ADBE Vector Fill Color").setValue([1, 0.2, 0.3]);

            // Posizione cuore
            heartLayer.transform.position.setValue([120, 520]);
            heartLayer.transform.scale.setValue([80, 80]);

            // Battito
            try {
                heartLayer.transform.scale.expression =
                    'var bpm = 75;\n' +
                    'var amp = 12;\n' +
                    'var freq = bpm / 60;\n' +
                    'var beat = Math.pow(Math.abs(Math.sin(time * freq * Math.PI)), 4);\n' +
                    'value + [beat * amp, beat * amp];';
            } catch(e) {}

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

            // Curves
            safeAddEffect(adjLayer, "ADBE CurvesCustom");

            // ========================================
            // FINE - APRI LA COMPOSIZIONE
            // ========================================

            comp.openInViewer();

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
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================
    // MAIN
    // ============================================

    function main() {

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
                "   File > Importa > File... (Cmd+I)\n\n" +
                "2. Nel pannello Progetto, clicca sul video\n" +
                "   per selezionarlo\n\n" +
                "3. Esegui di nuovo lo script:\n" +
                "   File > Script > Esegui file script..."
            );
        }
    }

    main();

})();
