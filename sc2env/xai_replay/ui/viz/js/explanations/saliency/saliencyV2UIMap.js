function getSaliencyV2UIMap() {
    var uimap = {};

    uimap.normalizationFactor = undefined;


    uimap.saliencyMapPercentSize = 1.0;
    uimap.outlinesForSaliencyMap = {};
    uimap.currentlyHighlightedSaliencyMapKey = undefined;
	uimap.renderSaliencyMap = function(canvas, ctx, channel, gameboardFlag){
		renderState(canvas, channel.dpEntityList, gameScaleFactor, 0, 0,false);
		this.overlaySaliencyMapOntoGameReplica(ctx, channel, 0, gameboardFlag);
	}	
  
    /*
    Must take into account current filename, current decision point, and saliencyMapId
    */
   
    uimap.getDPSpecificSaliencyMapKey = function(saliencyMapId) {
    var result = 'DP-' + showingDecisionNumber + "-" + saliencyMapId;
    return result;
    }

	uimap.overlaySaliencyMapOntoGameReplica = function(ctx, channel, gameboardFlag ) {
        for (var x= 0; x < Number(channel.width); x++){
            for (var y = 0; y < Number(channel.height); y++){
                var index = Number(channel.height) * Number(x) + Number(y);
                var cellValue = channel.cells[index];
                var normVal = lookupNormalizationValue(channel.normalizationKey);
                //console.log( "normalization Factor: " + normVal );
                //console.log( channel.name );
                //console.log( "Cell Value: " + Number( cellValue ) );
                ctx.fillStyle = getOverlayOpacityBySaliencyRGBAString(Number(cellValue) / Number(normVal), gameboardFlag, cellValue);
                //console.log( "ctx.fillStyle: " + ctx.fillStyle );
                ctx.fillRect(x*gameScaleFactor, y*gameScaleFactor, gameScaleFactor, gameScaleFactor);
                ctx.fill();
            }
        }
    }
    

    /**************************************************************************************
     * Author:      Andrew Anderson
     * Purpose:     Creating an object for a quick lookup of the cells for each saliency
     *              map.
     * Date Made:   8/17/2018
     * Date Mod:    8/17/2018
     **************************************************************************************/
    uimap.cellsForSaliencyMapId = {};
    uimap.gameboardOverlayLookupMap = {};

    uimap.buildOverlayCanvas = function(channel){
        var canvas = document.createElement("canvas");
        canvas.setAttribute("id", channel.gameboardOverlayId);
        canvas.height = gameboard_canvas.height;
        canvas.width = gameboard_canvas.width;
        var ctx = canvas.getContext("2d");
        var gameboardOffset = $("#scaii-gameboard").offset( );
        var gameboardTop = gameboardOffset.top;
        var gameboardLeft = gameboardOffset.left;
        var styleString = "position:absolute; left:" + gameboardLeft + "px; top:" + gameboardTop + "px;background-color:transparent;border-style:solid"
        canvas.setAttribute("style", styleString);
        ctx.globalAlpha = 0.7;
        this.overlaySaliencyMapOntoGameReplica(ctx, channel, 0, 1);
        return canvas;
    }

    uimap.buildOutlineDiv = function(channel, explCanvas){
        var w = explCanvas.width;
        var h = explCanvas.height;
        var outlineWidth = 6;
        var divW = w - 2 * outlineWidth;
        var divH = h - 2 * outlineWidth;
        var outlineDiv = document.createElement("div");
        outlineDiv.setAttribute("id", channel.outlineDivId);
        // take the outline into account for positioning
        var fudgeFactorToCompensateForNotSureWhat = 4;
        var relativeTopValue = - Number(h) - fudgeFactorToCompensateForNotSureWhat;
        outlineDiv.setAttribute("style","border-color:white;border-style:solid;border-width:6px;z-index:" + zIndexMap["saliencyHoverValue"] + "; position:relative; left:0px; top:" + relativeTopValue + "px;background-color:transparent;width:"+ divW + "px;height:"+ divH + "px;");
        return outlineDiv;
    }

    uimap.buildSaliencyCanvas = function(channel){
        var ch = channel;
		var saliencyCanvas = document.createElement("canvas");
        saliencyCanvas.setAttribute("class", "explanation-canvas");
        //the line below is how we're storing the cells. For naming, we wrap the saliencyMapId into the current DP
        this.cellsForSaliencyMapId[ ch.saliencyMapId ] = ch.cells;
        saliencyCanvas.setAttribute("id", ch.saliencyMapId);
        saliencyCanvas.onclick = function(e) {
            processSaliencyMapClick(e, ch);
        }
        var explCtx = saliencyCanvas.getContext("2d");
        explCtx.globalAlpha = 1.0;
		// canvas size should be same a gameboardHeight
		saliencyCanvas.width  = gameboard_canvas.width * ch.scaleFactor;
		saliencyCanvas.height = gameboard_canvas.height * ch.scaleFactor;
        this.renderSaliencyMap(saliencyCanvas, explCtx, ch, 0);
        return saliencyCanvas;
    }

    uimap.addEventsToSaliencyCanvas = function(ch){
        ch.saliencyCanvas.addEventListener('mouseenter', function(evt) {
			ch.valueSpan.setAttribute("style", 'visibility:hidden;');
			var logLine = templateMap["startMouseOverSaliencyMap"];
			logLine = logLine.replace("<REGION>", "saliencyMap");
			logLine = logLine.replace("<SLNCY_NAME>", ch.name);
			targetHoverHandler(evt, logLine);
        });
        
		ch.saliencyCanvas.addEventListener('mouseleave', function(evt) {
            ch.valueSpan.setAttribute("style", 'visibility:hidden;');
			var logLine = templateMap["endMouseOverSaliencyMap"];
			logLine = logLine.replace("<REGION>", "saliencyMap");
			logLine = logLine.replace("<SLNCY_NAME>", ch.name);
			targetHoverHandler(evt, logLine);
        });

        if (!userStudyMode){
            ch.saliencyCanvas.addEventListener('mousemove', function(evt) {
                displayCellValue(evt, ch.height, lookupNormalizationValue(ch.normalizationKey), ch.cells, ch.saliencyCanvas, ch.valueSpan);
              }, false);
        }
    }

    uimap.buildTitledMapDiv = function(channel){
        var titledMapDiv = document.createElement("div");
        titledMapDiv.setAttribute("id", channel.titledMapDivId);
        return titledMapDiv;
    }

    uimap.buildTitleDivOld = function(channel){
        var ch = channel;
        var titleDiv   = document.createElement("div");
        titleDiv.setAttribute("id", ch.titleId);
        titleDiv.innerHTML = ch.name;
        titleDiv.setAttribute("style", "font-family:Fira Sans;font-size:16px;padding-left:6px;padding-right:6px;padding-top:6px;padding-bottom:2px;text-align:center;height:30px;");
        return titleDiv;
    }

    uimap.buildTitleDiv = function(channel){
        var ch = channel;
        var titleDiv   = document.createElement("div");
        titleDiv.setAttribute("id", ch.titleId);
        var name = ch.name;
        titleDiv.innerHTML = "Attention paid to: " + name.bold( );
        titleDiv.setAttribute("style", "font-family:Fira Sans;font-size:16px;padding-left:6px;padding-right:6px;padding-top:6px;padding-bottom:2px;text-align:center;height:40px;");
        return titleDiv;
    }
        
    // mapHostDiv (so we can attach outline to it)
    uimap.buildMapHostDiv = function(channel, saliencyCanvas) {
        var ch = channel;
        var mapHostDiv = document.createElement("div");
		mapHostDiv.setAttribute("id", ch.mapHostDivId);
		mapHostDiv.setAttribute("style", "width:" + saliencyCanvas.width + "px;height:" + saliencyCanvas.height + "px;background-color:#123456;");
		return mapHostDiv;
    }

    uimap.createValueSpan = function(channel) {
        var ch = channel;
        var valueSpan = document.createElement("span");
		valueSpan.setAttribute("class","value-div");
        valueSpan.setAttribute("style", 'visibility:hidden;font-family:Arial;');
        return valueSpan;
    }

    uimap.buildExplChannel = function(channel) {
        var ch = channel;
       
        ch.saliencyCanvas = this.buildSaliencyCanvas(ch);
        ch.valueSpan    = this.createValueSpan(ch);
        this.addEventsToSaliencyCanvas(ch);
        ch.overlayCanvas  = this.buildOverlayCanvas(ch);
        ch.outlineDiv     = this.buildOutlineDiv(ch, ch.saliencyCanvas);
        ch.titledMapDiv   = this.buildTitledMapDiv(ch);
        ch.titleDiv       = this.buildTitleDiv(ch);
        ch.mapHostDiv     = this.buildMapHostDiv(ch, ch.saliencyCanvas);
        ch.outlineDiv.onclick = function( ) {
            // remove outline from mapHost
            ch.mapHostDiv.removeChild( ch.outlineDiv );
            ch.outlineActive = false;
            console.log("CLICK_TO_REMOVE: " + ch.outlineDiv.getAttribute("id") +" from " + ch.mapHostDiv.getAttribute("id"));

            // remove overlay from gameboard
            var overlayCanvasId = ch.overlayCanvas.getAttribute("id");
            $("#" +  overlayCanvasId).detach( );
            ch.overlayActive = false;
            console.log("CLICK_TO_REMOVE: " + overlayCanvasId);
        }
        ch.titledMapDiv.appendChild(ch.titleDiv);
		ch.titledMapDiv.appendChild(ch.mapHostDiv);
        ch.mapHostDiv.appendChild(ch.saliencyCanvas);
        ch.mapHostDiv.appendChild(ch.valueSpan);
    }

    uimap.reviseStyleOverlayCanvasAtDisplayTime = function(channel, gridX){
        var gameboardOffset = $("#scaii-gameboard").offset( );
        var gameboardTop = gameboardOffset.top;
        var gameboardLeft = gameboardOffset.left;
        var zIndex = Number(zIndexMap["saliencyHoverValue"]) + Number(gridX);
        var styleString = "z-index:" + zIndex + "; position:absolute; left:" + gameboardLeft + "px; top:" + gameboardTop + "px;background-color:transparent;border-style:solid"
        //console.log(styleString);
        channel.overlayCanvas.setAttribute("style",styleString);
    }

    uimap.styleTitledMapDivAtDisplayTime = function(channel, gridX, gridY){
        var titledMapDivHeight = Number(channel.saliencyCanvas.height) + Number(30);
        var gridPositionInfo = getGridPositionStyle(gridX, gridY);
        var constantStyle = "display:flex;flex-direction:column;border:1px solid #0063a6;";
        var widthStyle = "width:" + channel.saliencyCanvas.width +"px;";
        var heightStyle = "height: " + titledMapDivHeight+"px;";
        var styleString = constantStyle + widthStyle + heightStyle + gridPositionInfo;
		channel.titledMapDiv.setAttribute("style", styleString);
    }

	uimap.renderExplChannel = function(gridX, gridY, channel) {
        var ch = channel;

        this.styleTitledMapDivAtDisplayTime(ch, gridX, gridY);
        this.reviseStyleOverlayCanvasAtDisplayTime(ch, gridX);

		$("#saliency-maps").append(ch.titledMapDiv);
	}

    uimap.mapHostDivIds = {};

    uimap.showOutlineOnSelectedSaliencyMap = function(channel) {
        channel.valueSpan.innerHTML = "";
        console.log("SHOW_OUTLINE: " + channel.outlineDiv.getAttribute("id") + " onto " + channel.mapHostDiv.getAttribute("id"));
        channel.mapHostDiv.appendChild( channel.outlineDiv );
        channel.outlineActive = true;
    }

    uimap.overlaySelectedSaliencyMapOnGameboard = function(channel) {
        console.log("OVERLAY:  " + channel.overlayCanvas.getAttribute("id"));
        $("#scaii-gameboard").append( channel.overlayCanvas );
        channel.overlayActive = true;
	}

    return uimap;
}

    /*
    Must take into account current filename, current decision point, and saliencyMapId
    */
function prependDPNumber(val) {
    var result = getDecisionPointPrefix() + "-" + val;
    return result;
}

function getDecisionPointPrefix() {
    var currentStep = sessionIndexManager.getCurrentIndex();
    var dp = sessionIndexManager.getDPThatStartsEpochForStep(currentStep);
    //console.log("dp: " + dp);
    return dp;
}

function getDecisionPointPrefixForActiveQuestions() {
    console.log("currentDP from squim: " + activeStudyQuestionManager.squim.getCurrentDecisionPointNumber());
    return 'DP-' + activeStudyQuestionManager.squim.getCurrentDecisionPointNumber();
}

function displayCellValue(evt, height, normalizationFactor, cells, explCanvas, valueSpan){
    var mousePos = getMousePos(explCanvas, evt);
    var xForValueLookup = Math.floor(mousePos.x / gameScaleFactor);
    var yForValueLookup = Math.floor(mousePos.y/gameScaleFactor);
    var index = height * xForValueLookup + yForValueLookup;
    var cellValue = cells[index];
    var normValue = Number(cellValue)/Number(normalizationFactor);
    //var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y + ' val: ' + normValue.toFixed(2);
    var top = (mousePos.y + 10 - (40 * gameScaleFactor)) + 'px'; // shift it to canvas above
    var left = (mousePos.x + 10) + 'px';
    valueSpan.setAttribute("style", 'z-index:' + zIndexMap["saliencyHoverValue"] + '; position:relative; left:' + left + '; top: ' + top + '; color:#D73F09;font-family:Arial;'); // OSU orange
    valueSpan.innerHTML = normValue.toFixed(2);
    //console.log(message);
}

function getWhiteRGBAString(saliencyValue) {
    var color = {};
    color['R'] = 255;
    color['G'] = 255;
    color['B'] = 255;
    color['A'] = saliencyValue;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
}
  

var getMaxValueForLayer = function(vals){
	var max = 0.0;
	for (var i in vals) {
		var value = vals[i];
		if (value > max) {
			max = value;
		}
    }
    //console.log("max for layer = " + max);
	return max;
}

function getGridPositionStyle(gridX, gridY) {
	var columnStart = Number(gridX) + 1;
	var columnEnd = Number(gridX) + 2;
	var rowStart = Number(gridY) + 1;
	var rowEnd = Number(gridY) + 2;
	var columnInfo = 'grid-column-start: ' + columnStart + '; grid-column-end: ' + columnEnd;
	var rowInfo = '; grid-row-start: ' + rowStart + '; grid-row-end: ' + rowEnd + ';';
	var result =  columnInfo + rowInfo;
	return result;
}

function getRandomCells(count) {
    var result = [];
    for (var i = 0; i < count; i++){
        result.push(Math.random());
    }
    return result;
}

var getMaxValueForLayers = function(layers) {
    var max = 0.0;
    for (var i in layers) {
        var layer = layers[i];
        var value = getMaxValueForLayer(layer.getCellsList());
		if (value > max) {
			max = value;
		}
    }
	return max;
}

function getOverlayOpacityBySaliencyRGBAStringOld(saliencyValue) {
    var reverseSaliency = 1.0 - saliencyValue;
    var color = {};
    color['R'] = 0;
    color['G'] = 0;
    color['B'] = 0;
    color['A'] = reverseSaliency;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
  }


var countsPerBin = {};
function getOverlayOpacityBySaliencyRGBAStringQuantized(saliencyValue, gameboardFlag) {
    var reverseSaliency = 1.0 - saliencyValue;
    var color = {};
    //color['R'] = 0;
    //color['G'] = 0;
    //color['B'] = 0;
    /*******************************************************************
     * Author - Andrew Anderson
     * Purpose - Assigning different 'heat' values based on RGBA string
     * Blue - [0, 0.05]
     * Yellow - (0.05, 0.24]
     * Yellow/Orange - (0.24, 0.43]
     * Orange - (0.43, 0.62]
     * Orange/Red - (0.62, 0.81]
     * Red - (0.81, 1.00]
     ******************************************************************/
    if( saliencyValue <= 0.05 ){
      color['R'] = 59;
      color['G'] = 72;
      color['B'] = 241;
  }
  //Yellow
  else if( saliencyValue > 0.05 && saliencyValue <= 0.24 ) {
      color['R'] = 250;
      color['G'] = 218;
      color['B'] = 94;
  }
  
  //Yellow/Orange
  else if( saliencyValue > 0.24 && saliencyValue <= 0.43 ) {
      color['R'] = 255;
      color['G'] = 174;
      color['B'] = 66;
  }
  
  //Orange
  else if( saliencyValue > 0.43 && saliencyValue <= 0.62 ) {
      color['R'] = 255;
      color['G'] = 102;
      color['B'] = 0;
  }
  
  //Orange/Red
  else if( saliencyValue > 0.62 && saliencyValue <= 0.81 ) {
      color['R'] = 255;
      color['G'] = 69;
      color['B'] = 0;
  }
  
  //Red
  else {
      color['R'] = 255;
      color['G'] = 0;
      color['R'] = 0;
  }
    if( gameboardFlag == 0){
        color['A'] = reverseSaliency;
    }
    else{
        color['A'] = 0.5;
    }
    //color['A'] = 0.5;
    //color['A'] = saliencyValue;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    return result;
  }

  function getOverlayOpacityBySaliencyRGBAStringHeatMap(saliencyValue, gameboardFlag, cellValue) {
    var reverseSaliency = 1.0 - saliencyValue;
    var color = {};
    if( saliencyValue < 0.33 ){
        color[ 'R' ] = ( saliencyValue * 3.0 ) * 255.0;
        color[ 'G' ] = 0;
        color[ 'B' ] = 0;
    }
    else if( saliencyValue < 0.66 ){
        color[ 'R' ] = 255;
        color[ 'G' ] = ( ( saliencyValue - 0.3333333 ) * 3.0 ) * 255.0;
        color[ 'B' ] = 0;
    }
  
    //Red
    else {
        color[ 'R' ] = 255;
        color[ 'G' ] = 255;
        color[ 'B' ] = ( (saliencyValue - 0.666666 ) * 3.0 ) * 255.0;
    }

    if( gameboardFlag == 0){
        color['A'] = 1;
    }
    else{
        color['A'] = 0.5;
    }
    //color['A'] = 0.5;
    //color['A'] = saliencyValue;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    // if( color[ 'B' ] > 255 ){
    //     console.log( "Cell Value: " + cellValue );
    //     console.log( "Saliency Value:" + saliencyValue );
    //     console.log( "Math: " + (saliencyValue - 0.66) * 3.0 );
    //     console.log( "Blue: " + color[ 'B' ] );
    //     console.log( "Red: " + color[ 'R' ] );
    //     console.log( "Green: " + color[ 'G' ] );
    // }
    return result;
  }

  function getOverlayOpacityBySaliencyRGBAStringRainbow(saliencyValue, gameboardFlag) {
    var reverseSaliency = 1.0 - saliencyValue;
    var color = {};
    if( saliencyValue < 0.25 ){
        color[ 'R' ] = 0;
        color[ 'G' ] = ( saliencyValue * 4 ) * 255;
        color[ 'B' ] = 255;
    }
    else if( saliencyValue < 0.5 ){
        color[ 'R' ] = 0;
        color[ 'G' ] = 255;
        color[ 'B' ] = (1 - (saliencyValue - 0.25 ) * 4 ) * 255;
    }
    else if( saliencyValue < 0.75 ){
        color[ 'R' ] = (saliencyValue - 0.5 ) * 4 * 255;
        color[ 'G' ] = 255;
        color[ 'B' ] = 0;
    }
    else {
        color[ 'R' ] = 255;
        color[ 'G' ] = ( 1 - ( saliencyValue - 0.75 ) * 4 ) * 255;
        color[ 'B' ] = 0;
    }

    if( gameboardFlag == 0){
        color['A'] = 0.5;
    }
    else{
        color['A'] = 0.5;
    }
    //color['A'] = 0.5;
    //color['A'] = saliencyValue;
    var result = 'rgba(' + color['R'] + ',' + color['G'] + ',' + color['B'] + ',' + color['A'] + ')';
    if( color[ 'B' ] > 255 ){
        console.log ( "HALP!" );
        console.log ( "Blue: " + color[ 'B' ] );
    }
    return result;
  }

function processSaliencyMapClick(e, ch){
    var x = e.offsetX;
    var y = e.offsetY;
    var shapeId = getClosestInRangeShapeId(gameboard_ctx, x, y);
    var logLine = templateMap["clickSaliencyMap"];
    if (shapeId != undefined){
        //targetClickHandler(e, "clickEntity:" + shapeLogStrings[shapeId] + "_" + getQuadrantName(x,y));
        logLine = logLine.replace("<REGION>", "saliencyMap");
        logLine = logLine.replace("<CLCK_SALNCY_MAP>", ch.name);
        logLine = logLine.replace("<SHAPE_LOG>", shapeLogStrings[shapeId]);
        logLine = logLine.replace("<QUADRANT_NAME>", getQuadrantName(x,y));
        targetClickHandler(e, logLine);
        //targetClickHandler(e, "clickSaliencyMap:" + ch.name + "_(" + shapeLogStrings[shapeId] + "_" + getQuadrantName(x,y)+ ")");
    }
   else {
        //targetClickHandler(e, "clickGameQuadrant:" + getQuadrantName(x,y));
        logLine = logLine.replace("<REGION>", "saliencyMap");
        logLine = logLine.replace("<CLCK_SALNCY_MAP>", ch.name);
        logLine = logLine.replace("<SHAPE_LOG>", "NA");
        logLine = logLine.replace("<QUADRANT_NAME>", getQuadrantName(x,y));
        targetClickHandler(e, logLine);
        //targetClickHandler(e, "clickSaliencyMap:" + ch.name + "_(" + getQuadrantName(x,y) + ")");
    }
    if (userStudyMode){
        processOutlineAndOverlayUserStudyMode(ch);
    }
    else {
        processOutlineAndOverlay(ch);
    }
}

function processOutlineAndOverlay(channel){
    if (currentExplManager.saliencyVisible){
        var uimap = currentExplManager.saliencyUI.uimap;
        uimap.showOutlineOnSelectedSaliencyMap(channel);
        uimap.overlaySelectedSaliencyMapOnGameboard( channel);
    }
}
function processOutlineAndOverlayUserStudyMode(channel){
    var legalClickTargetRegions = activeStudyQuestionManager.getLegalInstrumentationTargetsForCurrentQuestion();
    if (activeStudyQuestionManager.renderer.isLegalRegionToClickOn("target:saliencyMap", legalClickTargetRegions)){
        if (activeStudyQuestionManager.renderer.controlsWaitingForClick.length == 0) {
            return;
        }
        if (currentExplManager.saliencyVisible){
            var activeQuestionDecisionPoint = activeStudyQuestionManager.squim.getCurrentDecisionPointNumber();
            if (activeQuestionDecisionPoint == showingDecisionNumber){
                var uimap = currentExplManager.saliencyUI.uimap;
                uimap.showOutlineOnSelectedSaliencyMap(channel);
                uimap.overlaySelectedSaliencyMapOnGameboard( channel);
            }
        }
    }
}
function lookupNormalizationValue (key) {
    //console.log("key is: " + key);
    //console.log("the norm value is: " + normValues[key]);
    return normValues[key];
}

  /**************************************************************************************************
   * Authors:       Andrew Anderson & Jon Dodge
   * Purpose:       Many ways to map values onto colours, and we want to make this be extensible.
   * Date Made:     8/23/2018
   * Date Mod:      8/23/2018
   **************************************************************************************************/
  function getOverlayOpacityBySaliencyRGBAString(saliencyValue, gameboardFlag, cellValue) {
    //return getOverlayOpacityBySaliencyRGBAStringQuantized(saliencyValue, gameboardFlag);
    return getOverlayOpacityBySaliencyRGBAStringHeatMap( saliencyValue, gameboardFlag, cellValue );
    //return getOverlayOpacityBySaliencyRGBAStringRainbow( saliencyValue, gameboardFlag );
  }
