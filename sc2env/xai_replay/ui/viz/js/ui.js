// gameboard
var gameboardWidth;
var gameboardHeight;

//canvases
var gameboard_canvas = document.createElement("canvas");
var gameboard_ctx = gameboard_canvas.getContext("2d");

var zIndexMap = {};
zIndexMap["explControl"] = 2;
zIndexMap["inFrontOfTooltipCanvas"] = 3;
zIndexMap["inFrontOfVideo"] = 4;
zIndexMap["saliencyHoverValue"] = 5;
zIndexMap["clickBlockerRectangle"] = 10;
zIndexMap["whyButton"] = 11;
zIndexMap["arrow"] = 20;
zIndexMap["tooltip"] = 30;
zIndexMap["aboveToolTip"] = 40;
zIndexMap["allTheWayToFront"] = 80;
zIndexMap["modalPopUp"] = 90

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
expl_ctrl_canvas.setAttribute("style", "z-index:" + (zIndexMap["allTheWayToFront"]+1));
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
var gameScaleFactor = 1;
var spacingFactor = 1;
var sizingFactor = 1;

var use_shape_color_for_outline = false;

var mostRecentClickHadCtrlKeyDepressed;


function configureGameboardCanvas(){ //gameboard canvas will be used to draw things in front of video
	gameboard_canvas.width = sc2GameRenderWidth;
    gameboard_canvas.height = sc2GameRenderHeight;
	gameboard_canvas.setAttribute("id","gameboard");
	screen_height = $(window).height()
	$("#scaii-gameboard").css("width", "100%");
	$("#scaii-gameboard").css("height", screen_height * uncroppedPercentage); //cropping video in ui
	$("#scaii-gameboard").css("background-color", game_background_color);
	$("#scaii-gameboard").css("border-style", "solid");
	$("#scaii-gameboard").css("position", "relative");
	$("#scaii-gameboard").css("overflow", "hidden");
	$("#scaii-gameboard").append()
	gameboard_canvas.setAttribute("style", "position:absolute;z-index:" + zIndexMap["inFrontOfVideo"] + ";margin:auto;font-family:Arial;padding:0px;width:100%;" + "height:" + (gameboard_canvas.height - (gameboard_canvas.height*.2)) + "px;");
	var scaiiGameboard = document.getElementById("scaii-gameboard");
	if (gameboard_canvas.parentNode != scaiiGameboard){
		$("#scaii-gameboard").append(gameboard_canvas);
	}
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
    //pauseResumeButton.innerHTML = '<img src="imgs/play.png", height="16px" width="14px"/>';
    
	pauseResumeButton.innerHTML = '<img src="imgs/play.png", height="24px" width="20px"/>';
	$("#pause-play-control").append(pauseResumeButton);
	$("#pauseResumeButton").css("padding-top","3px");
	$("#pauseResumeButton").css("padding-bottom","3px");
	$("#pauseResumeButton").css("margin-left","15px");
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
	// var video = document.getElementById("video");
	// var video_width = video.offsetWidth
	expl_ctrl_ctx.clearRect(0,0, $(window).width(), expl_ctrl_canvas.height);
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
	
	expl_ctrl_canvas.width = $(window).width();
	ctx.beginPath();
	ctx.moveTo(timelineMargin,explanationControlYPosition);
	ctx.lineWidth = timelineHeight;
	ctx.strokeStyle = 'white';
	ctx.lineTo(expl_ctrl_canvas.width - timelineMargin,explanationControlYPosition);
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
	
	// configureGameboardCanvas here, so the blank gameboard appears before start button pressed.
	// we call it again in sc2ui.js so the unit position math comes out right when creating tooltips
	configureGameboardCanvas();// do this here, 
	sizeNonGeneratedElements();
	controlsManager.setControlsNotReady();
	controlsManager.registerJQueryHandleForWaitCursor($("#tabbed-interface"));
	//configureNavigationButtons();
	configureQuestionArea();
	setUpMetadataToolTipEventHandlers();
    drawExplanationTimeline(); 
}

function highlightShapeInRange(x,y) {//SC2_TEST
    var unitId = activeSC2DataManager.getClosestUnitIdInRange(x, y);
	if (unitId != undefined){
        highlightUnitForClickCollectionFeedback(unitId); //SC2_TODO_STUDY move highlightShapeForIdForClickCollectionFeedback to highlightUnitForClickCollectionFeedback
    }
}

function setUpMetadataToolTipEventHandlers() {//SC2_TEST
	// for hiding/showing tooltips
	gameboard_canvas.addEventListener('click', function(evt) {
        if (true){
            return; // block for Study2
        }
		console.log("clicked!");
		var x = evt.offsetX;
		var y = evt.offsetY;
		var unitId = activeSC2DataManager.getClosestUnitIdInRange(x, y);
		if (unitId != undefined){
			//SC2_TODO_STUDYhighlightUnitForClickCollectionFeedback(unitId);
			//SC2_TODO_STUDY 
			// var logLine = templateMap["gameboard"];
			// logLine = logLine.replace("<CLCK_GAME_ENTITY>", unitLogStrings[unitId]);
			// logLine = logLine.replace("<CLCK_QUADRANT>", getSC2QuadrantName(x,y));
            // logLine = logLine.replace("<GAME_COORD_X>", x);
			// logLine = logLine.replace("<GAME_COORD_Y>", y);
			// targetClickHandler(evt, logLine);
			//SC2_TODO_STUDY_END
			$("#metadata_unitLocations" + shapeId).toggleClass('tooltip-invisible');
			if (selectedToolTipIds[shapeId] == "show") {
			 	selectedToolTipIds[shapeId] = "hide";
			}
			else {
			selectedToolTipIds[shapeId] = "show";
			}
		} else {
			//SC2_TODO_STUDY var logBackground = templateMap["gameboardBackground"];
			//SC2_TODO_STUDY logBackground = logBackground.replace("<CLCK_QUADRANT>", getSC2QuadrantName(x,y));
			//SC2_TODO_STUDY specifiedTargetClickHandler("gameboardBackground", logBackground);
		}
	});
	// gameboard_canvas.addEventListener('mouseup', function(evt) {
	// 	var x = evt.offsetX;
	// 	var y = evt.offsetY;
	// 	$("#step-value").html( x + " , " + y);
	// });
	gameboard_canvas.addEventListener('mousemove', function(evt) {
        if (true){
            return; // block for study 2
        }
		var x = evt.offsetX;
		var y = evt.offsetY;

		//$("#step-value").html( x + " , " + y);
		var unitId = activeSC2DataManager.getClosestUnitIdInRange(x, y);
		if (unitId == undefined) {
			// we're not inside an object, so hide all the "all_metadata" tooltips
			hideAllTooltips(evt);
			//SC2_DEFERRED var logLine = templateMap["hideEntityTooltips"];
			//SC2_DEFERRED logLine = logLine.replace("<HIDE_TOOL>", "all")
            //SC2_DEFERRED targetHoverHandler(evt, logLine);
		}
		else {
            var tooltipId = "metadata_all" + unitId;
            //we're inside one, keep it visible
            if (hoveredAllDataToolTipIds[tooltipId] != "show") {
				//SC2_DEFERRED var logLine = templateMap["showEntityTooltip"];
				//SC2_DEFERRED logLine = logLine.replace("<ENTITY_INFO>", unitLogStrings[unitId]);
				//SC2_DEFERRED logLine = logLine.replace("<TIP_QUADRANT>", getSC2QuadrantName(x,y));
				//SC2_DEFERRED targetHoverHandler(evt, logLine);
            }
            hideAllTooltips(evt);
            $("#" + tooltipId).removeClass('tooltip-invisible');
			hoveredAllDataToolTipIds[tooltipId] = "show";
		}
  	});
}
function sizeNonGeneratedElements() { 
	var pWidthAcronym = .40;
	var pWidthReplayLabel = .25;
	var pWidthFileSelector = .35;
	var acronymWidth      = gameContainerWidth * pWidthAcronym;
	var replayLabelWidth  = gameContainerWidth * pWidthReplayLabel;
	var fileSelectorWidth = gameContainerWidth * pWidthFileSelector;
	$("#game-titled-container").css("width", "100%");
	// 150
	$("#scaii-acronym").css("padding-left", "20px");
	$("#scaii-acronym").css("width", acronymWidth + "px");
	$("#scaii-acronym").css("padding-right", "20px");

	// 150
	$("#game-replay-label").css("width", replayLabelWidth + "px");
	$("#game-replay-label").css("padding-right", "10px");

	// 300
	$("#replay-file-selector").css("width",  "16%");

	
	$("#scaii-acronym").css("padding-top", "10px");
	$("#scaii-acronym").css("padding-bottom", "10px");
	$("#game-replay-label").css("padding-top", "10px");
    $("#game-replay-label").css("padding-bottom", "10px");
	

	var quadrantLabelWidth = 30;
    $("#left-side-quadrant-labels").css("width", quadrantLabelWidth + "px");
	$("#right-side-quadrant-labels").css("width", quadrantLabelWidth + "px");
    $("#left-side-quadrant-labels").css("height", gameboard_canvas.height + "px");
	$("#right-side-quadrant-labels").css("height", gameboard_canvas.height + "px");

	var rewardsPanelWidth = gameContainerWidth - gameboard_canvas.width - 2 * quadrantLabelWidth;
	$("#reward-values-panel").css("height", 225 + "px");
	$("#reward-values-panel").css("width", 340 + "px");
	$("#reward-values-panel").css("position","absolute");
	$("#reward-values-panel").css("top", "55%");
	$("#reward-values-panel").css("float", "left");
	$("#reward-values-panel").css("display", "none");
	$("#reward-values-panel").css("color", "white");
	$("#reward-values-panel").css("background-color", "Navy");
	$("#reward-values-panel").css("border", "2px solid blue");
	$("#reward-values-panel").css("border-radius", "2px");
	$("#reward-values-panel").css("padding", "5px");


	$('#reward-values-panel-toggle').css('float', "left")
	$('#reward-values-panel-toggle').css('text-align', "center")
	$('#reward-values-panel-toggle').css('font-size', "10px")
	$('#reward-values-panel-toggle').css('width', "70px")
	$('#reward-values-panel-toggle').css('height', "100%")
    
	var toggle_rewards = document.getElementById("reward-values-panel-toggle");
	toggle_rewards.addEventListener('click', function(event){
		if (document.getElementsByTagName('video')){
			if ($('#reward-values-panel').css('display') == 'none'){
				$('#reward-values-panel').css('display', "block")
			}
			else{
				$('#reward-values-panel').css('display', "none")
			}
		}
		else{
			alert("No Units to show. Load the video and try again.")
		}
	});
		

	$("#p1_top").css("z-index", zIndexMap["aboveToolTip"]);
	$("#p1_top").css("color", "white");
	$("#p1_top").css("background-color", "Navy");
	$("#p1_top").css("border", "2px solid blue");
	$("#p1_top").css("border-radius", "2px");
	$("#p1_top").css("padding", "5px");
	$("#p1_top").css("width", "22%");




	$("#p2_top").css("z-index", zIndexMap["aboveToolTip"]);
	$("#p2_top").css("color", "white");
	$("#p2_top").css("background-color", "Navy");
	$("#p2_top").css("border", "2px solid blue");
	$("#p2_top").css("border-radius", "2px");
	$("#p2_top").css("padding", "5px");
	$("#p2_top").css("width", "15%");


	$("#p1_bottom").css("z-index", zIndexMap["aboveToolTip"]);
	$("#p1_bottom").css("color", "white");
	$("#p1_bottom").css("background-color", "Navy");
	$("#p1_bottom").css("border", "2px solid blue");
	$("#p1_bottom").css("border-radius", "2px");
	$("#p1_bottom").css("padding", "5px");
	$("#p1_bottom").css("width", "22%");


	$("#p2_bottom").css("z-index", zIndexMap["aboveToolTip"]);
	$("#p2_bottom").css("color", "white");
	$("#p2_bottom").css("background-color", "Navy");
	$("#p2_bottom").css("border", "2px solid blue");
	$("#p2_bottom").css("border-radius", "2px");
	$("#p2_bottom").css("padding", "5px");
	$("#p2_bottom").css("width", "15%");


	

	$("#p1_top").css("position", "absolute");
	$("#p1_top").css("top", "1%");
	$("#p1_top").css("left", "2%");


	$("#p2_top").css("position", "absolute");
	$("#p2_top").css("top", "1%");
	$("#p2_top").css("left", "83%");


	$("#p1_bottom").css("position", "absolute");
	$("#p1_bottom").css("top", "89%");
	$("#p1_bottom").css("left", "2%");


	$("#p2_bottom").css("position", "absolute");
	$("#p2_bottom").css("top", "89%");
	$("#p2_bottom").css("left", "83%");


	$('.unit-value-panels').css('font-size', "15px")
    $('.unit-value-panels').css('font-family', "Arial")
    
	
	document.getElementById('friendly.nexusHealth.top').style.position = "absolute";
	document.getElementById('friendly.nexusHealth.top').style.top = "12.5%";
	document.getElementById('friendly.nexusHealth.top').style.left = "2%";
	document.getElementById('friendly.nexusHealth.top').style.height = "20px";
	document.getElementById('friendly.nexusHealth.top').style.fontSize = "15px";
	document.getElementById('friendly.nexusHealth.top').style.fontFamily = "Arial";
	document.getElementById('friendly.nexusHealth.top').style.display = "block";
	document.getElementById('friendly.nexusHealth.top').style.zIndex = "50";
	document.getElementById('friendly.nexusHealth.top').style.color = "white";
	document.getElementById('friendly.nexusHealth.top').style.background = "navy";
	document.getElementById('friendly.nexusHealth.top').style.border = "2px solid blue";
	document.getElementById('friendly.nexusHealth.top').style.borderRadius = "2px";
	document.getElementById('friendly.nexusHealth.top').style.padding = "5px";

	document.getElementById('friendly.nexusHealth.bottom').style.position = "absolute";
	document.getElementById('friendly.nexusHealth.bottom').style.top = "83.25%";
	document.getElementById('friendly.nexusHealth.bottom').style.left = "2%";
	document.getElementById('friendly.nexusHealth.bottom').style.height = "20px";
	document.getElementById('friendly.nexusHealth.bottom').style.fontSize = "15px";
	document.getElementById('friendly.nexusHealth.bottom').style.fontFamily = "Arial";
	document.getElementById('friendly.nexusHealth.bottom').style.display = "block";
	document.getElementById('friendly.nexusHealth.bottom').style.zIndex = "50";
	document.getElementById('friendly.nexusHealth.bottom').style.color = "white";
	document.getElementById('friendly.nexusHealth.bottom').style.background = "navy";
	document.getElementById('friendly.nexusHealth.bottom').style.border = "2px solid blue";
	document.getElementById('friendly.nexusHealth.bottom').style.borderRadius = "2px";
	document.getElementById('friendly.nexusHealth.bottom').style.padding = "5px";


	document.getElementById('enemy.nexusHealth.top').style.position = "absolute";
	document.getElementById('enemy.nexusHealth.top').style.top = "12.5%";
	document.getElementById('enemy.nexusHealth.top').style.left = "89%";
	document.getElementById('enemy.nexusHealth.top').style.height = "20px";
	document.getElementById('enemy.nexusHealth.top').style.fontSize = "15px";
	document.getElementById('enemy.nexusHealth.top').style.fontFamily = "Arial";
	document.getElementById('enemy.nexusHealth.top').style.display = "block";
	document.getElementById('enemy.nexusHealth.top').style.zIndex = "50";
	document.getElementById('enemy.nexusHealth.top').style.color = "white";
	document.getElementById('enemy.nexusHealth.top').style.background = "navy";
	document.getElementById('enemy.nexusHealth.top').style.border = "2px solid blue";
	document.getElementById('enemy.nexusHealth.top').style.borderRadius = "2px";
	document.getElementById('enemy.nexusHealth.top').style.padding = "5px";

	document.getElementById('enemy.nexusHealth.bottom').style.position = "absolute";
	document.getElementById('enemy.nexusHealth.bottom').style.top = "83.25%";
	document.getElementById('enemy.nexusHealth.bottom').style.left = "89%";
	document.getElementById('enemy.nexusHealth.bottom').style.height = "20px";
	document.getElementById('enemy.nexusHealth.bottom').style.fontSize = "15px";
	document.getElementById('enemy.nexusHealth.bottom').style.fontFamily = "Arial";
	document.getElementById('enemy.nexusHealth.bottom').style.display = "block";
	document.getElementById('enemy.nexusHealth.bottom').style.zIndex = "50";
	document.getElementById('enemy.nexusHealth.bottom').style.color = "white";
	document.getElementById('enemy.nexusHealth.bottom').style.background = "navy";
	document.getElementById('enemy.nexusHealth.bottom').style.border = "2px solid blue";
	document.getElementById('enemy.nexusHealth.bottom').style.borderRadius = "2px";
	document.getElementById('enemy.nexusHealth.bottom').style.padding = "5px";
	

	var showExplanationTreeButton = document.getElementById("button-show-explanations");
	showExplanationTreeButton.addEventListener('click', function(event){
		if (!explControlsManager.isExplanationsVisible()){
            explControlsManager.showExplanationsWindow();
            if (buildTreeOnDemand){
                var targetDP = explControlsManager.getDPToDisplay();
                var targetFrame = framesByDP[targetDP];
                if (targetFrame != frameOfCurrentTree){
                    var frameInfo = activeSC2DataManager.getFrameInfo(targetFrame);
                    var treeDataDir = "js/tree/json/" + chosenFile;
                    var dpNumber = getWave(frameInfo);
                    console.log("frame " + targetFrame + "  dpNumber " + dpNumber);
                    forgetCyTree();
                    forgetBackingTree();
                    initTree(dpNumber, treeDataDir + "/whole_decision_point_" + dpNumber + ".json",frameInfo.frame_number);
                    frameOfCurrentTree = targetFrame;
                }
            }
		}
	});
	
	var centerPointOfVideo = rewardsPanelWidth + quadrantLabelWidth + sc2GameRenderWidth / 2;
	var stepValueWidth = 100;
	var stepValuePaddingLeft = centerPointOfVideo - stepValueWidth - 40;
	//$("#step-value").css("width", stepValueWidth + "px");
	//$("#step-value").css("margin-left", ($(window).width()/2)-120);
	$("#step-value").css("margin-left", "40%");
	
	
	

	//$("#playback-controls-panel").css("height", "30px");
	$("#playback-controls-panel").css("margin-left", "10px");
	$("#playback-controls-panel").css("margin-top", "10px");
	$("#playback-controls-panel").css("margin-bottom", "10px");
	$("#playback-controls-panel").css("z-index", zIndexMap["allTheWayToFront"]);

    explControlsManager.styleControls();
	

	$("#friendly-title").css("font-size", "18px")
	$("#enemy-title").css("font-size", "18px")

	$("#p1_mineral").css("font-size", "15px")



	$("#p1_pylon").css("font-size", "15px")



	$("#p2_pylon").css("font-size", "15px")


	$("#friendly-lane-neutral-container").css("color", "white");
	$("#friendly-lane-neutral-container").css("background-color", "Navy");
	$("#friendly-lane-neutral-container").css("border", "2px solid blue");
	$("#friendly-lane-neutral-container").css("border-radius", "2px");
	$("#friendly-lane-neutral-container").css("padding", "5px");
	$("#friendly-lane-neutral-container").css("float", "left");
	$("#friendly-lane-neutral-container").css("width", "41%");
	$("#friendly-lane-neutral-container").css("height", "25px");
	$("#friendly-lane-neutral-container").css("font-size", "15px")

	
	$(".lane-neutral-info").css("font-family", "Arial")

	$("#enemy-lane-neutral-container").css("font-size", "15px")
	$("#enemy-lane-neutral-container").css("color", "white");
	$("#enemy-lane-neutral-container").css("background-color", "Navy");
	$("#enemy-lane-neutral-container").css("border", "2px solid blue");
	$("#enemy-lane-neutral-container").css("border-radius", "2px");
	$("#enemy-lane-neutral-container").css("padding", "5px");
	$("#enemy-lane-neutral-container").css("width", "42%");
	$("#enemy-lane-neutral-container").css("height", "25px");



}

function clearGameBoard() { 
	cleanToolTips();
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
            if (isForwardGesture(matchingStep)){
                if (explControlsManager.isForwardGestureBlocked(matchingStep)){
                    return;
                }
            }
			if (matchingStep == sessionIndexManager.getCurrentIndex()) {
				//no need to move - already at step with explanation
			}
			else {
                jumpToDPStep(matchingStep);
				//SC2_DEFERRED var logLine = templateMap["decisionPointList"];
				//SC2_DEFERRED logLine = logLine.replace("<TARGET>", "decisionPointList")
				//SC2_DEFERRED logLine = logLine.replace("<J_DP_NUM>", matchingStep);
                //SC2_DEFERRED specifiedTargetClickHandler("decisionPointList", logLine);
			}
        }
	}
});
