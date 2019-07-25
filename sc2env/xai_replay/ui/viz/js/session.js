var testingMode = false;
var replayChoiceConfig;
var selectedExplanationStep = undefined;
var sessionIndexManager = undefined;
var activeStudyQuestionManager = undefined;
//SC2_DEFERRED var stateMonitor = undefined;
//SC2_DEFERRED var userActionMonitor = undefined;
var treatmentID = undefined;
var previousFrameUnitCounts = {}
var currentFrameUnitCounts = {}
var currentFriendlyMineralHealth = 0
// Since studyMode is controlled at front end, backend is unaware which mode and will always send 
// questions if it finds them.  So, we need to check userStudyMode here.
function handleStudyQuestions(studyQuestions){ //SC2_OK
    if (!userStudyMode) {
        return;
    }
    var questions = studyQuestions.getStudyQuestionsList();
    var userId = studyQuestions.getUserId();
    treatmentID = studyQuestions.getTreatmentId();
    currentExplManager.setUserStudyMode(true);
    currentExplManager.setUserStudyTreatment("T" + treatmentID);
    //var answerFilename = studyQuestions.getAnswerFilename();
    var answerFilename = "answers_" + userId + "_" + treatmentID + ".txt";
    if (questions.length == 0) {
        return;
    }
    if (tabManager.currentTabHasQuestionManager()){
        activeStudyQuestionManager = tabManager.getStudyQuestionManagerForCurrentTab();
    }
    else {
        activeStudyQuestionManager = getStudyQuestionManager(questions, userId, treatmentID);
        tabManager.setStudyQuestionManagerForCurrentTab(activeStudyQuestionManager);
    }

    //SC2_DEFERRED if (userActionMonitor == undefined) {  userActionMonitor = getUserActionMonitor(); }
    //SC2_DEFERRED if (stateMonitor == undefined)      {  stateMonitor =      getStateMonitor();      }
	
	console.log(treatmentID);
    console.log(answerFilename);
    //SC2_DEFERRED stateMonitor.currentReplayFileName = chosenFile;
    //SC2_DEFERRED stateMonitor.logFileName = answerFilename;
    // make div to hold the winning action name
    var winningActionLabel = document.createElement("div");
	winningActionLabel.setAttribute("style", "margin-top:8px;margin-left:30px;font-family:Arial;font-weight:bold;font-size:14px;");
	winningActionLabel.setAttribute("id", "winning-action-label");
    winningActionLabel.innerHTML = "";
    $("#reward-values-panel").append(winningActionLabel);
    // re-render this sowe can change names to ??? if need to for waitForPredictionClick questions
    renderDecisionPointLegend();
}

function promoteTutorialFileIfPresent(replayNames) {//SC2_OK
    var setAside = undefined;
    var result = [];
    for (var i in replayNames) {
        var name = replayNames[i];
        if (name.startsWith("tutorial")) {
            setAside = name;
        }
        else {
            result.push(name);
        }
    }
    if (setAside != undefined) {
        result.unshift(setAside);
    }
    return result;
}

var userStudyMode = false;
var rewardDivMap = {};
// accept the list of replay filenames
function handleReplayChoiceConfig(config){//SC2_OK
    $("#connectButton").remove();
    var replayNames = config.getReplayFilenamesList();
     // studyQuestionMode not yet set to check, just always check - unlikely to be a problem
    // make tutorial file the default
    replayNames = promoteTutorialFileIfPresent(replayNames);
	for (var i in replayNames) {
        var name = replayNames[i];
		$("#replay-file-selector").append($('<option>', {
			value: i,
			text: name
		}));
    }
    userStudyMode = config.getUserStudyMode();
    if (userStudyMode) {
        removeFileSelectorEtc();
        tabManager = getTabManager();
        tabManager.openFirstTab();
    }
    else {
        loadSelectedReplayFile();
    }
}

function isTutorial() {//SC2_OK
    return chosenFile.startsWith("tutorial");
}
var chosenFile;

function loadSelectedReplayFile() {//SC2_OK
    var filename = $( "#replay-file-selector option:selected" ).text();
    loadReplayFile(filename);
}

function loadReplayFile(filename) {//SC2_OK
    $("#cue-arrow-div").remove();
    //SC2_DEFERRED
    // if (userActionMonitor != undefined) {
    //     userActionMonitor.clickListener = undefined;
    // }
    //SC2_DEFERRED_END
    clearStudyQuestionMode();
	controlsManager.startLoadReplayFile();
	chosenFile = filename;
	//console.log("    file selected: " + chosenFile);
	
    clearUIElementsForNewFile();
	drawExplanationTimeline();
	clearGameBoard();
    cleanExplanationUI();
    currentExplManager = getExplanationsV2Manager();
    currentExplManager.setFilename(filename);
    currentExplManager.setUserStudyMode(false);

    var args = [chosenFile];
	var userCommand = new proto.UserCommand;
	userCommand.setCommandType(proto.UserCommand.UserCommandType.SELECT_FILE);
    userCommand.setArgsList(args);
    var scaiiPkt = new proto.ScaiiPacket;
    scaiiPkt.setUserCommand(userCommand);
    sendScaiiPacket(scaiiPkt);
    console.log("sent file choice scaiiPacket");
}

function clearUIElementsForNewFile(){//SC2_OK
    $("#action-list").empty();
    $("#why-button").remove();
    $("#explanation-control-panel").empty();

    $("#cumulative-rewards").empty();
    rewardsDivMap = {};
}
//
//
function handleSC2ReplaySessionConfig(rsc) {//SC2_TEST
    console.log("handleSC2ReplaySessionConfig");
	var timelineWidth = expl_ctrl_canvas.width - 2*timelineMargin;
    //SC2_TODO_NAV_TEST - ensure UI ignores clicks during fiule load
    activeSC2DataManager = getSC2DataManager(rsc);
    sessionIndexManager = getSessionIndexManager(activeSC2DataManager.getStepCount(), activeSC2DataManager.getExplanationStepsList(), timelineWidth);
    sessionIndexManager.setReplaySequencerIndex(0);
    activeSC2UIManager = getSC2UIManager(activeSC2DataManager, chosenFile, sessionIndexManager);
    malformedMessage = activeSC2DataManager.getMalformedMessage();
	if (malformedMessage != undefined) {
		alert(malformedMessage);
    }
    currentExplManager.stepsWithExplanations = activeSC2DataManager.getExplanationStepsList();
    controlsManager.doneLoadReplayFile(); //SC2_TODO_NAV_TEST
    if (userStudyMode){
        if (!hasShownWelcomeScreen){
            // can't be tab hop, must be first screen shown
            clearLoadingScreen();
            //SC2_DEFERRED var logLine = stateMonitor.getWaitForResearcherStart()
            //SC2_DEFERRED stateMonitor.setUserAction(logLine);	
            showUserIdScreen();
        }
        else {
            tabManager.jumpToDesiredStepIfTabChangeInProgress();
            activeStudyQuestionManager.accessManager.express();
            clearLoadingScreen();
        }
    }
}



function checkForEndOfGame(){
    if (sessionIndexManager.isAtEndOfGame()) {
		controlsManager.reachedEndOfGame();
	}
}

function userStudyAdjustmentsForFrameChange(){
    if (userStudyMode) {
        var qm = activeStudyQuestionManager;
        qm.configureForCurrentStep();
        if (tabManager.hasShownUserId()){
        }
        if (qm.accessManager.isAtEndOfRange(sessionIndexManager.getCurrentIndex())){
            if (qm.allQuestionsAtDecisionPointAnswered) {
                qm.allQuestionsAtDecisionPointAnswered = false;
                // we're ready to move forward to next Decision Point
                if (qm.hasMoreQuestions()){
                    //will ask for later DPs
                    qm.poseNextQuestion();
                }
                controlsManager.expressResumeButton();
                //chooseNextQuestionAfterStep(sessionIndexManager.getCurrentIndex());
            }
            else {
                pauseGame();
		        controlsManager.disablePauseResume();
            }
        }
        currentExplManager.setWhyButtonAccessibility();
    }
}
var totalsString = "total score";

function incrementUnitCount(dict, key){
    dict[key] = dict[key] + 1
}

function getUnitLane(basicUnitYPos){
    var lane = "bottom"
    if (basicUnitYPos > 32){
        lane = "top"
    }
    return lane
}

function getKey(alliance, unitType, basicUnitYPos){
    var key = allianceNameForValue[alliance] + "." + unitNamesForType[unitType] + "." + getUnitLane(basicUnitYPos)
    return key
}
function updateUnitCounts(basicUnit){
    var key = getKey(basicUnit.alliance, basicUnit.unit_type, basicUnit.y)
    incrementUnitCount(currentFrameUnitCounts, key)
    if(key == "friendly.marineBuilding.top"){
        console.log("found marine!")
    }
}

function setMineralHealth(recorderUnit){
    var mineralHealthSheildValue = 4
    if (recorderUnit.shield == mineralHealthSheildValue){
        currentFriendlyMineralHealth = recorderUnit.health - 1
     }
}

function updatePylonCounts(pylonUnit){
    var key = allianceNameForValue[pylonUnit.alliance] + "." + unitNamesForType[pylonUnit.unit_type]
    currentFrameUnitCounts = fillUnitValueDictionary(currentFrameUnitCounts, key)
}

function initUnitCounts(unitCountsDict){
    unitCountsDict["friendly.marineBuilding.top"] = 0
    unitCountsDict["friendly.banelingBuilding.top"] = 0
    unitCountsDict["friendly.immortalBuilding.top"] = 0

    unitCountsDict["friendly.marineBuilding.bottom"] = 0
    unitCountsDict["friendly.banelingBuilding.bottom"] = 0
    unitCountsDict["friendly.immortalBuilding.bottom"] = 0

    unitCountsDict["enemy.marineBuilding.top"] = 0
    unitCountsDict["enemy.banelingBuilding.top"] = 0
    unitCountsDict["enemy.immortalBuilding.top"] = 0

    unitCountsDict["enemy.marineBuilding.bottom"] = 0
    unitCountsDict["enemy.banelingBuilding.bottom"] = 0
    unitCountsDict["enemy.immortalBuilding.bottom"] = 0

    unitCountsDict["friendly.Pylon"] = 0
    unitCountsDict["enemy.Pylon"] = 0

}

function copyFrameUnitCountsDict(){
    previousFrameUnitCounts["friendly.marineBuilding.top"] = currentFrameUnitCounts["friendly.marineBuilding.top"]
    previousFrameUnitCounts["friendly.banelingBuilding.top"] = currentFrameUnitCounts["friendly.banelingBuilding.top"]
    previousFrameUnitCounts["friendly.immortalBuilding.top"] = currentFrameUnitCounts["friendly.immortalBuilding.top"]

    previousFrameUnitCounts["friendly.marineBuilding.bottom"] = currentFrameUnitCounts["friendly.marineBuilding.bottom"]
    previousFrameUnitCounts["friendly.banelingBuilding.bottom"] = currentFrameUnitCounts["friendly.banelingBuilding.bottom"]
    previousFrameUnitCounts["friendly.immortalBuilding.bottom"] = currentFrameUnitCounts["friendly.immortalBuilding.bottom"]

    previousFrameUnitCounts["enemy.marineBuilding.top"] = currentFrameUnitCounts["enemy.marineBuilding.top"]
    previousFrameUnitCounts["enemy.banelingBuilding.top"] = currentFrameUnitCounts["enemy.banelingBuilding.top"]
    previousFrameUnitCounts["enemy.immortalBuilding.top"] = currentFrameUnitCounts["enemy.immortalBuilding.top"]

    previousFrameUnitCounts["enemy.marineBuilding.bottom"] = currentFrameUnitCounts["enemy.marineBuilding.bottom"]
    previousFrameUnitCounts["enemy.banelingBuilding.bottom"] = currentFrameUnitCounts["enemy.banelingBuilding.bottom"]
    previousFrameUnitCounts["enemy.immortalBuilding.bottom"] = currentFrameUnitCounts["enemy.immortalBuilding.bottom"]

    previousFrameUnitCounts["friendly.Pylon"] = currentFrameUnitCounts["friendly.Pylon"]
    previousFrameUnitCounts["enemy.Pylon"] = currentFrameUnitCounts["enemy.Pylon"]
}

initUnitCounts(currentFrameUnitCounts)
initUnitCounts(previousFrameUnitCounts)
console.log("global init called")

function computeUnitValues(frameInfo){
    var recorderUnit = 45
    var pylonUnit = 60
    var 
    for (dpIndex in video)
    if (haveJumped){
        if (videoDecisionPoints[dpIndex] == frameInfo.frame_number){
            copyFrameUnitCountsDict()
        }
    }
    else{
        if (videoDecisionPoints[dpIndex]+5 <= frameInfo.frame_number && frameInfo.frame_number < videoDecisionPoints[i] + 12){
            copyFrameUnitCountsDict()
        }
    }

    initUnitCounts(currentFrameUnitCounts)
    for (var i in frameInfo.units){
        var unit = frameInfo.units[i]
        if (unit.unit_type == recorderUnit){
            setMineralHealth(unit)
        }
        else if (unit.unit_type == pylonUnit){
            updatePylonCounts(unit)
        }
        else{
            updateUnitCounts(unit)
        }
    }
    renderUnitValues(frameInfo);
}


var allianceNameForValue = {
    1 : "friendly",
    4 : "enemy"
}

var unitNamesForType = {
        21 : "marineBuilding", //'Barracks'
        28 : "banelingBuilding", // 'Starport'
        70 : "immortalBuilding", // 'RoboticsFacility'
        60 : 'Pylon',
        59 : 'Nexus',
        48 : 'Marine',
        9 : 'Baneling',
        83 : 'Immortal'
    }

var videoDecisionPoints = []
function collectDecisionPoints(frameInfos){
    videoDecisionPoints = []
    for (var i in frameInfos){
        if (frameInfos[i].frame_info_type == "decision_point"){
            console.log("DP at " + frameInfos[i].frame_number)
            videoDecisionPoints.push(frameInfos[i].frame_number)
        }
    }
}

var framePastDecisionPoint = 0;
function renderUnitValues(frameInfo){
    for (i in videoDecisionPoints){
        if (frameInfo.frame_number >= videoDecisionPoints[i]+4 && frameInfo.frame_number < videoDecisionPoints[i] + 12){
            framePastDecisionPoint = frameInfo.frame_number
            videoDecisionPoints.splice(i,1)
            console.log("frame number in renderer" + frameInfo["frame_number"])
            console.log("computed additive val: " + (currentFrameUnitCounts["friendly.marineBuilding.top"] - previousFrameUnitCounts["friendly.marineBuilding.top"]))
            document.getElementById("p1_top_marine_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.marineBuilding.top"] - previousFrameUnitCounts["friendly.marineBuilding.top"]) + ")"
            document.getElementById("p1_top_baneling_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.banelingBuilding.top"] - previousFrameUnitCounts["friendly.banelingBuilding.top"]) + ")"
            document.getElementById("p1_top_immortal_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.immortalBuilding.top"]- previousFrameUnitCounts["friendly.immortalBuilding.top"]) + ")"
            document.getElementById("p1_bottom_marine_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.marineBuilding.bottom"] - previousFrameUnitCounts["friendly.marineBuilding.bottom"]) + ")"
            document.getElementById("p1_bottom_baneling_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.banelingBuilding.bottom"] - previousFrameUnitCounts["friendly.banelingBuilding.bottom"]) + ")"
            document.getElementById("p1_bottom_immortal_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.immortalBuilding.bottom"] - previousFrameUnitCounts["friendly.immortalBuilding.bottom"]) + ")"
            document.getElementById("p2_top_marine_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.marineBuilding.top"]- previousFrameUnitCounts["enemy.marineBuilding.top"]) + ")"
            document.getElementById("p2_top_baneling_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.banelingBuilding.top"] - previousFrameUnitCounts["enemy.banelingBuilding.top"]) + ")"
            document.getElementById("p2_top_immortal_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.immortalBuilding.top"] - previousFrameUnitCounts["enemy.immortalBuilding.top"]) + ")"
            document.getElementById("p2_bottom_marine_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.marineBuilding.bottom"] - previousFrameUnitCounts["enemy.marineBuilding.bottom"]) + ")"
            document.getElementById("p2_bottom_baneling_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.banelingBuilding.bottom"] - previousFrameUnitCounts["enemy.banelingBuilding.bottom"]) + ")"
            document.getElementById("p2_bottom_immortal_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.immortalBuilding.bottom"] - previousFrameUnitCounts["enemy.immortalBuilding.bottom"]) + ")"
            document.getElementById("p2_pylon_add").innerHTML = "(+" + (currentFrameUnitCounts["friendly.Pylon"] -previousFrameUnitCounts["enemy.Pylon"]) + ")"
            document.getElementById("p1_pylon_add").innerHTML = "(+" + (currentFrameUnitCounts["enemy.Pylon"] - previousFrameUnitCounts["friendly.Pylon"]) + ")"
            return;
        }
    }
    if (frameInfo.frame_number < (framePastDecisionPoint + 40)){
        $('.unit-additive-value').css('display', "inline")
        $('.unit-additive-value').css('color', "green")
        document.getElementById("p1_top_marine").innerHTML = "Marine: " + previousFrameUnitCounts["friendly.marineBuilding.top"]
        document.getElementById("p1_top_baneling").innerHTML = "Baneling: " + previousFrameUnitCounts["friendly.banelingBuilding.top"]
        document.getElementById("p1_top_immortal").innerHTML = "Immortal: " + previousFrameUnitCounts["friendly.immortalBuilding.top"]
        document.getElementById("p1_bottom_marine").innerHTML = "Marine: " + previousFrameUnitCounts["friendly.marineBuilding.bottom"]
        document.getElementById("p1_bottom_baneling").innerHTML = "Baneling: " + previousFrameUnitCounts["friendly.banelingBuilding.bottom"]
        document.getElementById("p1_bottom_immortal").innerHTML = "Immortal: " + previousFrameUnitCounts["friendly.immortalBuilding.bottom"]
        document.getElementById("p2_top_marine").innerHTML = "Marine: " + previousFrameUnitCounts["enemy.marineBuilding.top"]
        document.getElementById("p2_top_baneling").innerHTML = "Baneling: " + previousFrameUnitCounts["enemy.banelingBuilding.top"]
        document.getElementById("p2_top_immortal").innerHTML = "Immortal: " + previousFrameUnitCounts["enemy.immortalBuilding.top"]
        document.getElementById("p2_bottom_marine").innerHTML = "Marine: " + previousFrameUnitCounts["enemy.marineBuilding.bottom"]
        document.getElementById("p2_bottom_baneling").innerHTML = "Baneling: " + previousFrameUnitCounts["enemy.banelingBuilding.bottom"]
        document.getElementById("p2_bottom_immortal").innerHTML = "Immortal: " + previousFrameUnitCounts["enemy.immortalBuilding.bottom"]
        document.getElementById("p1_pylon").innerHTML = "Pylons: " + previousFrameUnitCounts["friendly.Pylon"]
        document.getElementById("p2_pylon").innerHTML = "Pylons: " + previousFrameUnitCounts["enemy.Pylon"]
        document.getElementById("p1_mineral").innerHTML = "Minerals: " + currentFriendlyMineralHealth
        return;        
    }
    else if (frameInfo.frame_number >= (framePastDecisionPoint + 40)){
        $('.unit-additive-value').css('display', "none")
        document.getElementById("p1_top_marine").innerHTML = "Marine: " + currentFrameUnitCounts["friendly.marineBuilding.top"]
        document.getElementById("p1_top_baneling").innerHTML = "Baneling: " + currentFrameUnitCounts["friendly.banelingBuilding.top"]
        document.getElementById("p1_top_immortal").innerHTML = "Immortal: " + currentFrameUnitCounts["friendly.immortalBuilding.top"]
        document.getElementById("p1_bottom_marine").innerHTML = "Marine: " + currentFrameUnitCounts["friendly.marineBuilding.bottom"]
        document.getElementById("p1_bottom_baneling").innerHTML = "Baneling: " + currentFrameUnitCounts["friendly.banelingBuilding.bottom"]
        document.getElementById("p1_bottom_immortal").innerHTML = "Immortal: " + currentFrameUnitCounts["friendly.immortalBuilding.bottom"]
        document.getElementById("p2_top_marine").innerHTML = "Marine: " + currentFrameUnitCounts["enemy.marineBuilding.top"]
        document.getElementById("p2_top_baneling").innerHTML = "Baneling: " + currentFrameUnitCounts["enemy.banelingBuilding.top"]
        document.getElementById("p2_top_immortal").innerHTML = "Immortal: " + currentFrameUnitCounts["enemy.immortalBuilding.top"]
        document.getElementById("p2_bottom_marine").innerHTML = "Marine: " + currentFrameUnitCounts["enemy.marineBuilding.bottom"]
        document.getElementById("p2_bottom_baneling").innerHTML = "Baneling: " + currentFrameUnitCounts["enemy.banelingBuilding.bottom"]
        document.getElementById("p2_bottom_immortal").innerHTML = "Immortal: " + currentFrameUnitCounts["enemy.immortalBuilding.bottom"]
        document.getElementById("p1_pylon").innerHTML = "Pylons: " + currentFrameUnitCounts["friendly.Pylon"]
        document.getElementById("p2_pylon").innerHTML = "Pylons: " + currentFrameUnitCounts["enemy.Pylon"]
        document.getElementById("p1_mineral").innerHTML = "Minerals: " + currentFriendlyMineralHealth
        // copyFrameUnitCountsDict()
        return;
    } 

}


function expressCumulativeRewards(frameInfo) { //SC2_TEST
    rewardsDict = activeSC2DataManager.getCumulativeRewards(frameInfo);
	var total = 0;
    //compute totals
    var keys = Object.keys(rewardsDict);
	for (var i in keys ){
        var key = keys[i];
        var val = rewardsDict[key];
		total = Number(total) + Number(val);
	}
	var valId = getRewardValueId(totalsString);
    var idOfExistingTotalLabel = rewardsDivMap[valId];
	if (idOfExistingTotalLabel == undefined) {
		addCumRewardPair(0, totalsString, total);
	}
	else {
		$("#" + valId).html(total);
	}  
    // add individual values
    if (userStudyMode) {
        return;
    }
  	for (var i in keys ){
        var key = keys[i];
        var val = rewardsDict[key];
		var valId = getRewardValueId(key);
		var idOfExistingValueLabel = rewardsDivMap[valId];
		if (idOfExistingValueLabel == undefined) {
			var indexInt = Number(i+1);
			addCumRewardPair(indexInt, key, val);
		}
		else {
			$("#" + valId).html(val);
		}
  	}
}
function getRewardValueId(val) {//SC2_OK
	var legalIdVal = convertNameToLegalId(val);
	return 'reward'+legalIdVal;
}

function addCumRewardPair(index, key, val){//SC2_OK
	var rewardKeyDiv = document.createElement("DIV");
	rewardKeyDiv.setAttribute("class", "r" + index +"c0");
	if (key == totalsString){
		rewardKeyDiv.setAttribute("style", "font-family:Arial;font-size:14px;font-weight:bold;padding-bottom:3px;padding-top:10px;background-color:rgba(0,0,0,0);");
	}
	else {
		rewardKeyDiv.setAttribute("style", "font-family:Arial;font-size:14px;padding-bottom:3px;background-color:rgba(0,0,0,0);");
	}
	
	rewardKeyDiv.innerHTML = prettyPrintRewardName[key];
	//SC2_DEFERRED var logLineLabel = templateMap["touchCumRewardLabel"];
	//SC2_DEFERRED logLineLabel = logLineLabel.replace("<CUM_LBL>", key);
    //SC2_DEFERRED rewardKeyDiv.onclick = function(e) {targetClickHandler(e, logLineLabel);};
	$("#cumulative-rewards").append(rewardKeyDiv);

	var rewardValDiv = document.createElement("DIV");
	// give the value div an id constructed with key so can find it later to update
	var id = getRewardValueId(key);
	rewardsDivMap[id] = rewardValDiv;
	rewardValDiv.setAttribute("id", id);
	rewardValDiv.setAttribute("class", "r" + index +"c1");
	if (key == totalsString){
		rewardValDiv.setAttribute("style", "margin-left: 10px;font-family:Arial;font-size:14px;font-weight:bold;padding-bottom:3px;padding-top:10px;background-color:rgba(0,0,0,0);");
	}
	else {
		rewardValDiv.setAttribute("style", "margin-left: 10px;font-family:Arial;font-size:14px;background-color:rgba(0,0,0,0);");
	}
	
	rewardValDiv.innerHTML = val;
	//SC2_DEFERRED var logLineValue = templateMap["touchCumRewardValueFor"];
	//SC2_DEFERRED logLineValue = logLineValue.replace("<CUM_VAL>", key);
    //SC2_DEFERRED rewardValDiv.onclick = function(e) {targetClickHandler(e, logLineValue);};
    $("#cumulative-rewards").append(rewardValDiv);
}
//
//  INITIAL ORDER OF ARRIVAL OF PACKETS FOR YEAR 1 SYSTEM
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. ReplaySessionConfig
//  3. StudyQuestions (optional)
//  4. VizInit
//  5. Viz
//  6. SelectFileComplete
//
//  Game start  (userStudyMode)
//  7. VizInit
//  8. Viz
//  9. Viz
//  10. JumpCompleted
//

//
// SC2 fewer packets arrive.   New protocol will bew as follows:
//

//  INITIAL ORDER OF ARRIVAL OF PACKETS
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. SC2ReplaySessionConfig
//  3. StudyQuestions (optional)

function handleScaiiPacket(sPacket) {
	var result = undefined;
	if (sPacket.hasReplayChoiceConfig()) {
		var config = sPacket.getReplayChoiceConfig();
		replayChoiceConfig = config;
		handleReplayChoiceConfig(config);
	}
	else if (sPacket.hasReplaySessionConfig()) {
		//console.log("-----got replaySessionConfig");
		var config = sPacket.getReplaySessionConfig();
		replaySessionConfig = config;
		handleSC2ReplaySessionConfig(config,undefined);
	}
	else if (sPacket.hasExplDetails()) {
		//console.log('has expl details');
		var explDetails = sPacket.getExplDetails();
        handleSaliencyDetails(explDetails);
	}
    else if(sPacket.hasStudyQuestions()) {
        handleStudyQuestions(sPacket.getStudyQuestions());
    }
	// else if (sPacket.hasErr()) {
	// 	console.log("-----got errorPkt");
	// 	console.log(sPacket.getErr().getDescription())
	// }
    else if (sPacket.hasUserCommand()) {
		var userCommand = sPacket.getUserCommand();
		var commandType = userCommand.getCommandType();
		if (commandType == proto.UserCommand.UserCommandType.SELECT_FILE_COMPLETE){

        
		}
	}
	else {
		console.log(sPacket.toString())
		console.log('unexpected message from system!');
	}
	return result;
}
function epochIsChanging() {
	if (currentExplManager != undefined) {
		currentExplManager.removeOverlaysAndOutlines();
	}
}