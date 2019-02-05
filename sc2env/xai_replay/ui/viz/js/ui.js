// gameboard
var gameboardWidth;
var gameboardHeight;

//canvases
var gameboard_canvas = document.createElement("canvas");
var gameboard_ctx = gameboard_canvas.getContext("2d");

var zIndexMap = {};
zIndexMap["explControl"] = 2;
zIndexMap["inFrontOfVideo"] = 3;
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
var gameScaleFactor = 6;
var spacingFactor = 1;
var sizingFactor = 1;

var use_shape_color_for_outline = false;

var mostRecentClickHadCtrlKeyDepressed;


function configureGameboardCanvas(){ //gameboard canvas will be used to draw things in front of video
	gameboard_canvas.width = sc2GameWidth;
    gameboard_canvas.height = sc2GameHeight;
    gameboard_canvas.setAttribute("id","gameboard");
	$("#scaii-gameboard").css("width", gameboard_canvas.width);
	$("#scaii-gameboard").css("height", gameboard_canvas.height);
	$("#scaii-gameboard").css("background-color", game_background_color);
	$("#scaii-gameboard").css("border-style", "solid");
	var video = document.createElement("video");
	$("#scaii-gameboard").append()
	gameboard_canvas.setAttribute("style", "position:absolute;left:0px;top:0px;z-index:" + zIndexMap["inFrontOfVideo"] + ";margin:auto;font-family:Arial;padding:0px;width:" + gameboard_canvas.width + "px;height:" + gameboard_canvas.height + ";");
	$("#scaii-gameboard").append(gameboard_canvas);
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

function initUI() { //SC2_TEST
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

function highlightShapeInRange(x,y) {//SC2_TEST
    var unitId = activeSC2DataManager.getClosestUnitInRange(x, y);
	if (unitId != undefined){
        highlightUnitForClickCollectionFeedback(unitId); //SC2_TODO_STUDY move highlightShapeForIdForClickCollectionFeedback to highlightUnitForClickCollectionFeedback
    }
}

function setUpMetadataToolTipEventHandlers() {//SC2_TEST
	// for hiding/showing tooltips
	gameboard_canvas.addEventListener('click', function(evt) {
		console.log("clicked!");
		var x = evt.offsetX;
		var y = evt.offsetY;
		var unitId = activeSC2DataManager.getClosestUnitInRange(x, y);
		if (unitId != undefined){
			highlightUnitForClickCollectionFeedback(unitId);
			//SC2_DEFERRED 
			// var logLine = templateMap["gameboard"];
			// logLine = logLine.replace("<CLCK_GAME_ENTITY>", unitLogStrings[unitId]);
			// logLine = logLine.replace("<CLCK_QUADRANT>", getSC2QuadrantName(x,y));
            // logLine = logLine.replace("<GAME_COORD_X>", x);
			// logLine = logLine.replace("<GAME_COORD_Y>", y);
			// targetClickHandler(evt, logLine);
			//SC2_DEFERRED_END
			// $("#metadata_hp" + shapeId).toggleClass('tooltip-invisible');
			// if (selectedToolTipIds[shapeId] == "show") {
			// 	selectedToolTipIds[shapeId] = "hide";
			// }
			// else {
			// 	selectedToolTipIds[shapeId] = "show";
			// }
		} else {
			//SC2_DEFERRED var logBackground = templateMap["gameboardBackground"];
			//SC2_DEFERRED logBackground = logBackground.replace("<CLCK_QUADRANT>", getSC2QuadrantName(x,y));
			//SC2_DEFERRED specifiedTargetClickHandler("gameboardBackground", logBackground);
		}
	});
	  
	gameboard_canvas.addEventListener('mousemove', function(evt) {
		var x = evt.offsetX;
		var y = evt.offsetY;
		var unitId = activeSC2DataManager.getClosestUnitInRange(x, y);
		if (unitId == undefined) {
			// we're not inside an object, so hide all the "all_metadata" tooltips
			//SC2_TODO_TThideAllTooltips(evt);
			//SC2_DEFERRED var logLine = templateMap["hideEntityTooltips"];
			//SC2_DEFERRED logLine = logLine.replace("<HIDE_TOOL>", "all")
            //SC2_DEFERRED targetHoverHandler(evt, logLine);
		}
		else {
            var tooltipId = "metadata_all" + unitId; // SC2_TODO_TT make sure tooltipId is consistent everywhere
            //we're inside one, keep it visible
            //SC2_TODO_TTif (hoveredAllDataToolTipIds[tooltipId] != "show") {
				//SC2_DEFERRED var logLine = templateMap["showEntityTooltip"];
				//SC2_DEFERRED logLine = logLine.replace("<ENTITY_INFO>", unitLogStrings[unitId]);
				//SC2_DEFERRED logLine = logLine.replace("<TIP_QUADRANT>", getSC2QuadrantName(x,y));
				//SC2_DEFERRED targetHoverHandler(evt, logLine);
            //SC2_TODO_TT}
            //SC2_TODO_TThideAllTooltips(evt);
            //SC2_TODO_TT$("#" + tooltipId).removeClass('tooltip-invisible');
			//SC2_TODO_TThoveredAllDataToolTipIds[tooltipId] = "show";
		}
  	});
}
function sizeNonGeneratedElements() { //SC2_TODO_GEOM - still have scaii-acronym?

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

function clearGameBoard() { //SC2_TEST (if anything is actually drawn there - health bars?)
	//SC2_TODO_TTcleanToolTips();
	gameboard_ctx.clearRect(0, 0, gameboard_canvas.width, gameboard_canvas.height);
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
		var userCommand = new proto.UserCommand;
		userCommand.setCommandType(proto.UserCommand.UserCommandType.SET_SPEED);
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
				//SC2_DEFERRED var logLine = templateMap["decisionPointList"];
				//SC2_DEFERRED logLine = logLine.replace("<TARGET>", "decisionPointList")
				//SC2_DEFERRED logLine = logLine.replace("<J_DP_NUM>", matchingStep);
                //SC2_DEFERRED specifiedTargetClickHandler("decisionPointList", logLine);
			}
        }
	}
});
