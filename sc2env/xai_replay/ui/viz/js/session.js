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
    $("#connect-button").remove();
    var play = document.getElementById("pauseResumeButton");
    if (play == undefined){
        configureNavigationButtons();
    }
    
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
    if(explControlsManager.isUserStudyMode()){
        showUserIdScreen();
    }
    else if (userStudyMode){
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
    setTreatmentFromFile();
    setTutorialModeFromFile();
}


function setTreatmentFromFile(){
    $.ajax({
        url:'http://localhost:8000/treatmentControl/modelFree.txt',
        type:'HEAD',
        error: function()
        {
            $('#model-based-radio').click();
            setToModelBasedTreatment();
        },
        success: function()
        {
            $('#model-free-radio').click();
            setToModelFreeTreatment();
        }
    });
}
var year2TutorialMode = false;
function setTutorialModeFromFile(){
    $.ajax({
        url:'http://localhost:8000/treatmentControl/tutorialYes.txt',
        type:'HEAD',
        error: function()
        {
            // not tutorial mode, but we don't want timeline block enabled iw we are in dev mode
            if (explControlsManager.isUserStudyMode()){
                enableForwardTimelineBlock = true;
            }
            year2TutorialMode = false;
            hideFileChoiceListBox();
        },
        success: function()
        {
            enableForwardTimelineBlock = false;
            year2TutorialMode = true;
        }
    });
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

function getUnitLane(basicUnitYPos){
    var lane = "bottom"
    if (basicUnitYPos > 32){
        lane = "top"
    }
    return lane
}

function getMineralHealth(frameInfo){
    var recorderUnitId = 45
    for (var i in frameInfo.units){
        var unit = frameInfo.units[i]
        if (unit.unit_type == recorderUnitId){
            var recorderUnit = unit
            var mineralHealthSheildValue = 4
            if (recorderUnit.shield == mineralHealthSheildValue){
                currentFriendlyMineralHealth = recorderUnit.health - 1
             }
        }
    }
    return currentFriendlyMineralHealth
}

function getNexusUnits(frameInfo){
    var nexusUnit = 59;
    var nexusUnits = []
    for (var unitIndex in frameInfo.units){
        var unit = frameInfo.units[unitIndex]
        if (unit["unit_type"] == nexusUnit){
            nexusUnits.push(unit)
        }
    }
    return nexusUnits
}

function getNexusHealthForUnit(alliance, lane, nexusUnits){
    for (var unitIndex in nexusUnits){
        var unit = nexusUnits[unitIndex];
        curLane = getUnitLane(unit.y);
        curAlliance = unit.alliance;
        if (alliance == curAlliance && curLane == lane){
            return unit.health;
        }
    }
    return 0;
}

function getWave(frameInfo){
    var units = frameInfo["units"]
    for (unitIndex in units){
        var unit = units[unitIndex]
        if (unit["unit_type"] == 45){
            if (unit["shield"] == 42){
                var waveNumber = unit["health"]
                return waveNumber;
            }
        }
    }
}

var htmlTextForKey = {};
htmlTextForKey["friendly.marineBuilding.top"] = "Marines: ";
htmlTextForKey["friendly.banelingBuilding.top"] = "Banelings: ";
htmlTextForKey["friendly.immortalBuilding.top"] = "Immortals: ";
htmlTextForKey["friendly.marineBuilding.bottom"] = "Marines: ";
htmlTextForKey["friendly.banelingBuilding.bottom"] = "Banelings: ";
htmlTextForKey["friendly.immortalBuilding.bottom"] = "Immortals: ";
htmlTextForKey["enemy.marineBuilding.top"] = "Marines: ";
htmlTextForKey["enemy.banelingBuilding.top"] = "Banelings: ";
htmlTextForKey["enemy.immortalBuilding.top"] = "Immortals: ";
htmlTextForKey["enemy.marineBuilding.bottom"] = "Marines: ";
htmlTextForKey["enemy.banelingBuilding.bottom"] = "Banelings: ";
htmlTextForKey["enemy.immortalBuilding.bottom"] = "Immortals: ";
htmlTextForKey["friendly.Pylon"] = "Pylons: ";
htmlTextForKey["enemy.Pylon"] = "Pylons: ";


var htmlAllianceTextForKey = {};
htmlAllianceTextForKey["friendly.marineBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.banelingBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.immortalBuilding.top"] = "Friendly ";
htmlAllianceTextForKey["friendly.marineBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["friendly.banelingBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["friendly.immortalBuilding.bottom"] = "Friendly ";
htmlAllianceTextForKey["enemy.marineBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.banelingBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.immortalBuilding.top"] = "Enemy ";
htmlAllianceTextForKey["enemy.marineBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["enemy.banelingBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["enemy.immortalBuilding.bottom"] = "Enemy ";
htmlAllianceTextForKey["friendly.Pylon"] = "Friendly ";
htmlAllianceTextForKey["enemy.Pylon"] = "Enemy ";

function isFrameFarEnoughPastDP(frameInfo){
    var frameNumber = frameInfo.frame_number;
    var farEnoughPastDP = 10;
    for (var i in decisionPointsFullCopy){
        var dpFrame = decisionPointsFullCopy[i];
        var nextDpFrame = decisionPointsFullCopy[Number(i)+ 1];
        var windowStart = dpFrame  + farEnoughPastDP;
        if (nextDpFrame == undefined){
            var windowEnd = windowStart  + 75;
        }
        else {
            var windowEnd = nextDpFrame;
        }
        if (frameNumber >= windowStart && frameNumber <= windowEnd){
            console.log("frame " + frameNumber + " is between "+ windowStart + " and " + windowEnd);
            return true;
        }
    }
    return false;
}

function renderUnitValues(frameInfo){
    if (isFrameFarEnoughPastDP(frameInfo)){
        var unit = frameInfo
        for (unitCount in unitInfoKeys){
            if(unit[unitInfoKeys[unitCount] + "_delta_triggered"] == 1){
                if (htmlAllianceTextForKey[ unitInfoKeys[unitCount] ] == "Friendly "){
                    document.getElementById(unitInfoKeys[unitCount] + "_delta").innerHTML = "+" + (unit[unitInfoKeys[unitCount] + "_delta"])
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML =  (unit[unitInfoKeys[unitCount] + "_count"] - unit[unitInfoKeys[unitCount] + "_delta"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
                else{
                    if(frameInfo['wave_triggered'] == 1){
                        document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                        document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                        document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                    }
                }
            }
            else{
                if (htmlAllianceTextForKey[ unitInfoKeys[unitCount] ] == "Friendly "){
                    document.getElementById(unitInfoKeys[unitCount] + "_delta").innerHTML = "" //NA
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
                else{
                    document.getElementById(unitInfoKeys[unitCount] + "_name").innerHTML = htmlTextForKey[unitInfoKeys[unitCount]]
                    document.getElementById(unitInfoKeys[unitCount] + "_count").innerHTML = (unit[unitInfoKeys[unitCount] + "_count"])
                    document.getElementById("p1_mineral").innerHTML = "Minerals: " + getMineralHealth(frameInfo)
                }
            } 
        }
    
        var nexusUnits = getNexusUnits(frameInfo);
        document.getElementById("friendly.nexusHealth.top").innerHTML = "Nexus Health: " + getNexusHealthForUnit(1,"top",nexusUnits);
        document.getElementById("friendly.nexusHealth.bottom").innerHTML = "Nexus Health: " + getNexusHealthForUnit(1,"bottom",nexusUnits);
        document.getElementById("enemy.nexusHealth.top").innerHTML = "Nexus Health: " + getNexusHealthForUnit(4,"top",nexusUnits);
        document.getElementById("enemy.nexusHealth.bottom").innerHTML = "Nexus Health: " + getNexusHealthForUnit(4,"bottom",nexusUnits);
    
    }
    
    changePlayBackSpeedForInitialUninterestingDps(frameInfo.frame_number);
    for (var i = 0; i < laterDPFrames.length; i++){
        if (frameInfo.frame_number > laterDPFrames[i]){
            if (explControlsManager.isUserStudyMode()){
                pauseAtInterestingDp(laterDPFrames[i]);
            }
            addVisitedDPToForwardProgress(laterDPFrames[i+1]);
            laterDPFrames.splice(i,1);
            return;
        }
    }
}

function addVisitedDPToForwardProgress(dpFrame){
    var beenThere = false;
    for (var dpIndex = 0; dpIndex < forwardProgressDPs.length; dpIndex++){
        if (dpFrame == forwardProgressDPs[dpIndex]){
            beenThere = true;
        }
    }
    if (!beenThere){
        forwardProgressDPs.push(dpFrame);
    }
}

function changePlayBackSpeedForInitialUninterestingDps(frameNumber){
    if (frameNumber < pauseAndPredictDPsByFrame[0]){
        video.playbackRate = 1; //twice the speed of videoPlaybackRate
    }
    else{
        video.playbackRate = videoPlaybackRate; // 0.5
    }
}

function pauseAtInterestingDp(currDecisionPoint){
    for (var dpIndex = 0; dpIndex < pauseAndExplainDPsByFrame.length; dpIndex++){
        if (currDecisionPoint == pauseAndExplainDPsByFrame[dpIndex]){
            pauseGame();
            var prevDPNum = Number(pauseAndExplainDPs[dpIndex]) - 1;
            explControlsManager.setExplanationFocusToDP(prevDPNum);
            explControlsManager.showExplanationControls();
            forgetFirstPairOfPredictAndExplainDps();
        }
        else if (currDecisionPoint == pauseAndPredictDPsByFrame[dpIndex]){
            pauseGame();
        }
        else {
            //don't pause
        }
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

