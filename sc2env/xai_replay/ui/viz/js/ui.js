// gameboard
var gameboardWidth;
var gameboardHeight;

//canvases
var gameboard_canvas = document.createElement("canvas");
var gameboard_ctx = gameboard_canvas.getContext("2d");

var zIndexMap = {};
zIndexMap["explControl"] = 2;
zIndexMap["saliencyHoverValue"] = 5;
zIndexMap["clickBlockerRectangle"] = 10;
zIndexMap["whyButton"] = 11;
zIndexMap["arrow"] = 20;
zIndexMap["tooltip"] = 30;
zIndexMap["allTheWayToFront"] = 40;
//var game_background_color = "#123456";
//var game_background_color = "#000000";
//var game_background_color = "#f0f0f0";
var game_background_color = "#808080";

var timeline_canvas = document.createElement("canvas");
var timeline_ctx = timeline_canvas.getContext("2d");

// navigation 
var pauseResumeButton = document.createElement("BUTTON");
var rewindButton = document.createElement("BUTTON");
rewindButton.disabled = true;
rewindButton.setAttribute("id", "rewindButton");
pauseResumeButton.disabled = true;
pauseResumeButton.setAttribute("id", "pauseResumeButton");
//var speedSlider = document.createElement("input");

// explanation controls
var expl_ctrl_canvas = document.createElement("canvas");
expl_ctrl_canvas.setAttribute("style", "z-index:" + zIndexMap["explControl"]);
expl_ctrl_canvas.setAttribute("id", "expl-control-canvas");
var expl_ctrl_ctx = expl_ctrl_canvas.getContext("2d");
expl_ctrl_ctx.imageSmoothingEnabled = false;
var actionNameLabel = document.createElement("LABEL");
var explanationControlYPosition = 36;

// controlsManager encapsulates:
// - enabling/disabling controls
// - blocking/unblocking user input
// - changing graphics on buttons
var controlsManager = configureControlsManager(pauseResumeButton, rewindButton);

//scaling
var gamePixelDimension = 40;
var gameScaleFactor = 6;
var spacingFactor = 1;
var sizingFactor = 1;

// entities, shapes
var entitiesList = undefined;
//var shapePositionMapForContext = {};
var shapePositionMap = {};
var shape_outline_color = '#202020';
//var shape_outline_width = 2;
var shape_outline_width = 0;
var use_shape_color_for_outline = false;

var mostRecentClickHadCtrlKeyDepressed;



function getTrueGameWidth() {
	return gamePixelDimension * gameScaleFactor;
}

function getTrueGameHeight() {
	return gamePixelDimension * gameScaleFactor;
}

function configureGameboardCanvas(){
	gameboard_canvas.width = getTrueGameWidth();
    gameboard_canvas.height = getTrueGameHeight();
    gameboard_canvas.setAttribute("id","gameboard");
	$("#scaii-gameboard").css("width", gameboard_canvas.width);
	$("#scaii-gameboard").css("height", gameboard_canvas.height);
	$("#scaii-gameboard").css("background-color", game_background_color);
	$("#scaii-gameboard").css("border-style", "solid");
	$("#scaii-gameboard").append(gameboard_canvas);
	//addZoomControlToGameboardCanvas(gameboard_canvas);
}

function configureNavigationButtons(){
	configureRewindButton();
	configurePauseResumeButton();
}

function configureRewindButton(){
	rewindButton.setAttribute("class", "playbackButton");
	rewindButton.setAttribute("id", "rewindButton");
	rewindButton.innerHTML = '<img src="imgs/rewind.png", height="14px" width="14px"/>';
	rewindButton.onclick = tryRewind;
	// Removing due to bugs found in study
	//$("#rewind-control").append(rewindButton);
	$("#rewindButton").css("padding-top","4px");
	$("#rewindButton").css("margin-left","150px");
	$("#rewindButton").css("opacity", "0.6");
	rewindButton.disabled = true;
}

function configurePauseResumeButton(){
	pauseResumeButton.setAttribute("class", "playbackButton");
	pauseResumeButton.setAttribute("id", "pauseResumeButton");
	pauseResumeButton.innerHTML = '<img src="imgs/play.png", height="16px" width="14px"/>';
	$("#pause-play-control").append(pauseResumeButton);
	$("#pauseResumeButton").css("padding-top","2px");
	$("#pauseResumeButton").css("padding-bottom","0px");
	$("#pauseResumeButton").css("margin-left","158px");
	pauseResumeButton.onclick = tryPause;
	$("#pauseResumeButton").css("opacity", "0.6");
	pauseResumeButton.disabled = true;
}

function configureQuestionArea() {
	clearWhyQuestions();
	//clearWhatQuestions();
}

function clearWhyQuestions() {
	$("#why-label").html(" ");
	$("#what-button").html(" ");
}

//function clearWhatQuestions() {
//	$("#what-label").html(" ");
//	$("#what-questions").html(" ");
//}
var timelineMargin = 40;
var explanationControlCanvasHeight = 70;
var timelineHeight = 16;
function drawExplanationTimeline() {
	expl_ctrl_ctx.clearRect(0,0, expl_ctrl_canvas.width, expl_ctrl_canvas.height);
	// just use width of gameboard for now, may need to be bigger
	
	expl_ctrl_canvas.height = explanationControlCanvasHeight;
	//FIXME: this could be done better
	//EXPLANATION: since why-button is sometimes made before expl_ctrl_canvas updates 
	//			   append before why-button incase this happens, else do the normal thing
	if ($("#why-button").length) {
		$("#why-button").before(expl_ctrl_canvas);
	} else {
		$("#explanation-control-panel").append(expl_ctrl_canvas);
	}
	let ctx = expl_ctrl_ctx;
	var can_width = 600;
	
	expl_ctrl_canvas.width = can_width;
	ctx.beginPath();
	ctx.moveTo(timelineMargin,explanationControlYPosition);
	ctx.lineWidth = timelineHeight;
	ctx.strokeStyle = 'darkgrey';
	ctx.lineTo(can_width - timelineMargin,explanationControlYPosition);
	ctx.stroke();
	ctx.restore();
}

var showCheckboxes = false;

function initUI() {
	//configureSpeedSlider();
	//configureZoomBox
	var scaiiInterface = document.getElementById("scaii-interface");
	scaiiInterface.addEventListener('click', function(evt) {
        mostRecentClickHadCtrlKeyDepressed = evt.ctrlKey;
        if (!userStudyMode){
            if (evt.altKey){
                toggleCheckboxVisibility();
            }
        }
	}, true);
	
	configureGameboardCanvas();
	sizeNonGeneratedElements();
	controlsManager.setControlsNotReady();
	controlsManager.registerJQueryHandleForWaitCursor($("#tabbed-interface"));
	configureNavigationButtons();
	configureQuestionArea();
	setUpMetadataToolTipEventHandlers();
    drawExplanationTimeline(); 
}

function getQuadrantName(x,y){
    var totalWidth = $("#scaii-gameboard").width();
    var totalHeight = $("#scaii-gameboard").height();
    var halfWidth = totalWidth / 2;
    var halfHeight = totalHeight / 2;
    if (x < halfWidth) {
        if (y < halfHeight) {
            return "upperLeftQuadrant";
        }
        else {
            return "lowerLeftQuadrant";
        }
    }
    else {
        if (y < halfHeight) {
            return "upperRightQuadrant";
        }
        else {
            return "lowerRightQuadrant";
        }
    }
}

function highlightShapeInRange(x,y) {
    var ctx = gameboard_canvas.getContext('2d');
    var shapeId = getClosestInRangeShapeId(ctx, x, y);
	if (shapeId != undefined){
        highlightShapeForIdForClickCollectionFeedback(shapeId);
    }
}

function setUpMetadataToolTipEventHandlers() {
	// for hiding/showing tooltips
	gameboard_canvas.addEventListener('click', function(evt) {
		var x = evt.offsetX;
		var y = evt.offsetY;
		var shapeId = getClosestInRangeShapeId(gameboard_ctx, x, y);
		if (shapeId != undefined){
			highlightShapeForIdForClickCollectionFeedback(shapeId);
			var logLine = templateMap["gameboard"];
			logLine = logLine.replace("<CLCK_GAME_ENTITY>", shapeLogStrings[shapeId]);
			logLine = logLine.replace("<CLCK_QUADRANT>", getQuadrantName(x,y));
            logLine = logLine.replace("<GAME_COORD_X>", x);
			logLine = logLine.replace("<GAME_COORD_Y>", y);
            targetClickHandler(evt, logLine);
			// $("#metadata_hp" + shapeId).toggleClass('tooltip-invisible');
			// if (selectedToolTipIds[shapeId] == "show") {
			// 	selectedToolTipIds[shapeId] = "hide";
			// }
			// else {
			// 	selectedToolTipIds[shapeId] = "show";
			// }
		} else {
			var logBackground = templateMap["gameboardBackground"];
			logBackground = logBackground.replace("<CLCK_QUADRANT>", getQuadrantName(x,y));
			specifiedTargetClickHandler("gameboardBackground", logBackground);
		}
	});
	  
	gameboard_canvas.addEventListener('mousemove', function(evt) {
		var x = evt.offsetX;
		var y = evt.offsetY;
		var shapeId = getClosestInRangeShapeId(gameboard_ctx, x, y);
		if (shapeId == undefined) {
			// we're not inside an object, so hide all the "all_metadata" tooltips
			hideAllTooltips(evt);
			var logLine = templateMap["hideEntityTooltips"];
			logLine = logLine.replace("<HIDE_TOOL>", "all")
            targetHoverHandler(evt, logLine);
		}
		else {
            var tooltipId = "metadata_all" + shapeId;
            //we're inside one, keep it visible
            if (hoveredAllDataToolTipIds[tooltipId] != "show") {
				var logLine = templateMap["showEntityTooltip"];
				logLine = logLine.replace("<ENTITY_INFO>", shapeLogStrings[shapeId]);
				logLine = logLine.replace("<TIP_QUADRANT>", getQuadrantName(x,y));
				targetHoverHandler(evt, logLine);
            }
            hideAllTooltips(evt);
            $("#" + tooltipId).removeClass('tooltip-invisible');
			hoveredAllDataToolTipIds[tooltipId] = "show";
		}
  	});
}
function sizeNonGeneratedElements() {

	$("#game-titled-container").css("width", "600px");
	// first row should add to 600...
	// 150
	$("#scaii-acronym").css("padding-left", "20px");
	$("#scaii-acronym").css("width", "110px");
	$("#scaii-acronym").css("padding-right", "20px");

	// 150
	$("#game-replay-label").css("width", "140px");
	$("#game-replay-label").css("padding-right", "10px");

	// 300
	$("#replay-file-selector").css("width", "300px");

	
	$("#scaii-acronym").css("padding-top", "10px");
	$("#scaii-acronym").css("padding-bottom", "10px");
	$("#game-replay-label").css("padding-top", "10px");
    $("#game-replay-label").css("padding-bottom", "10px");
    
    
    $("#reward-values-panel").css("height", gameboard_canvas.height + "px");
    $("#left-side-quadrant-labels").css("height", gameboard_canvas.height + "px");
    $("#right-side-quadrant-labels").css("height", gameboard_canvas.height + "px");
    $("#playback-controls-panel").css("height", "30px");
    $("#explanation-control-panel").css("height", "85px");
}

function clearGameBoards() {
    cleanToolTips();
	clearGameBoard(gameboard_ctx, gameboard_canvas, "game");
	clearGameBoard(gameboard_zoom_ctx, gameboard_zoom_canvas, "zoom");
}


function clearGameBoard(ctx, canvas, shapePositionMapKey) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//gameboard_ctx.clearRect(0, 0, gameboard_canvas.width, gameboard_canvas.height);
	//gameboard_zoom_ctx.clearRect(0, 0, gameboard_zoom_canvas.width, gameboard_zoom_canvas.height);
	shapePositionMap = {};
}

var draw_example_shapes = function () {
	clearGameBoard(gameboard_ctx, gameboard_canvas, "game");
	colorRGBA = getBasicColorRGBA();
	drawRect(gameboard_ctx, 100, 100, 80, 80, colorRGBA);
	drawTriangle(gameboard_ctx, 200, 200, 80, 'red');
}

var configureSpeedSlider = function () {
	$("#replay-speed-panel").append(speedSlider);
	speedSlider.setAttribute("type", "range");
	speedSlider.setAttribute("min", "1");
	speedSlider.setAttribute("max", "100");
	speedSlider.setAttribute("value", "90");
	speedSlider.setAttribute("class", "slider");
	speedSlider.setAttribute("id", "speed-slider");
	speedSlider.setAttribute("orient","vertical");
	speedSlider.oninput = function () {
		var speedString = "" + this.value;
		var args = [speedString];
		var userCommand = new proto.scaii.common.UserCommand;
		userCommand.setCommandType(proto.scaii.common.UserCommand.UserCommandType.SET_SPEED);
		userCommand.setArgsList(args);
		stageUserCommand(userCommand);
	}
	//<input type="range" min="1" max="100" value="50" class="slider" id="myRange">
}
var configureLabelContainer = function(id, fontSize, textVal, textAlign) {
	$(id).css("font-family", "Fira Sans");
	$(id).css("font-size", fontSize);
	$(id).css("padding-left", "0px");
	$(id).css("padding-right", "4px");
	$(id).css("padding-top", "2px");
	$(id).css("text-align", textAlign);
	$(id).html(textVal);
}
var subtractPixels = function(a,b){
	var intA = a.replace("px", "");
	var intB = b.replace("px", "");
	return intA - intB;
}


expl_ctrl_canvas.addEventListener('click', function (event) {
	if (!isUserInputBlocked()){
		var matchingStep = getMatchingExplanationStep(expl_ctrl_ctx, event.offsetX, event.offsetY);
		if (matchingStep == undefined){
            processTimelineClick(event);
		}
		else{
			if (matchingStep == sessionIndexManager.getCurrentIndex()) {
				//no need to move - already at step with explanation
			}
			else {
                jumpToStep(matchingStep);
				var logLine = templateMap["decisionPointList"];
				logLine = logLine.replace("<TARGET>", "decisionPointList")
				logLine = logLine.replace("<J_DP_NUM>", matchingStep);
                //specifiedTargetClickHandler("decisionPointList", "jumpToDecisionPoint:" + matchingStep);
                specifiedTargetClickHandler("decisionPointList", logLine);
			}
        }
	}
});
