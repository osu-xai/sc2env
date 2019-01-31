var testingMode = false;
var replayChoiceConfig;
var selectedExplanationStep = undefined;
var sessionIndexManager = undefined;
var activeStudyQuestionManager = undefined;
//SC2_DEFERRED var stateMonitor = undefined;
//SC2_DEFERRED var userActionMonitor = undefined;
var relativeReplayDir = "./replays";
var treatmentID = undefined;

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
	var args = [chosenFile];
	var userCommand = new proto.scaii.common.UserCommand;
	userCommand.setCommandType(proto.scaii.common.UserCommand.UserCommandType.SELECT_FILE);
	userCommand.setArgsList(args);
    stageUserCommand(userCommand);
    clearUIElementsForNewFile();
	drawExplanationTimeline();
	clearGameBoard();
    cleanExplanationUI();
    currentExplManager = getExplanationsV2Manager();
    currentExplManager.setFilename(filename);
    currentExplManager.setUserStudyMode(false);
}

function clearUIElementsForNewFile(){//SC2_OK
    $("#action-list").empty();
    $("#why-button").remove();
    $("#explanation-control-panel").empty();

    $("#cumulative-rewards").empty();
    rewardsDivMap = {};
}
//
// SC2_TODO - this info will be sent in the json blob so it will become extractReplaySessionConfig(json_string)
//
function handleSC2ReplaySessionConfig(rsc) {//SC2_TEST
    //SC2_TODO - do we need to block user input (i removed setting that flag from this function)
    activeSC2DataManager = getSC2DataManager(rsc);
    activeSC2VideoManager = getSC2VideoManager(getVideoFilepath(chosenFile));
    activeSC2UIManager = getSC2UIManager(activeSC2DataManager, activeSC2VideoManager);
    malformedMessage = activeSC2DataManager.getMalformedMessage();
	if (malformedMessage != undefined) {
		alert(malformedMessage);
    }
	var timelineWidth = expl_ctrl_canvas.width - 2*timelineMargin;
	sessionIndexManager = getSessionIndexManager(activeSC2DataManager.getStepCount(), activeSC2DataManager.getExplanationStepsList(), timelineWidth);
    sessionIndexManager.setReplaySequencerIndex(0);
    currentExplManager.stepsWithExplanations = activeSC2DataManager.getExplanationStepsList();
    controlsManager.doneLoadReplayFile(); //SC2_TODO - verify this is the right place for this
}


function handleSC2Data(frameInfo){//SC2_TEST
    expressCumulativeRewards(frameInfo);
    var qm = activeStudyQuestionManager;
//	if (!jumpInProgress) {// SC2_TODO - is this correct?
        sessionIndexManager.incrementReplaySequencerIndex();
        if (userStudyMode) {
            // will ask for first DP
            qm.configureForCurrentStep();
//        }
    }
    if (userStudyMode) {
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
    
	if (sessionIndexManager.isAtEndOfGame()) {
		controlsManager.reachedEndOfGame();
	}
}

var totalsString = "total score";
//
// SC2_TODO rework to handle java object for the reward info,
// adding up reward info as we go forward and subtracting as we go backward
//
function expressCumulativeRewards(frameInfo) { //SC2_TEST
    entryList = activeSC2DataManager.getCumulativeRewards(frameInfo);
	var total = 0;
	//compute totals
	for (var i in entryList ){
    	var entry = entryList[i];
		var val = entry[1];
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
  	for (var i in entryList ){
    	var entry = entryList[i];
    	var key = entry[0];
		var val = entry[1];
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

function getVideoFilepath(chosenFile){
    return relativeReplayDir + "/" + chosenFile + ".mp4";
}
function getRewardValueId(val) {//SC2_OK
	var legalIdVal = convertNameToLegalId(val);
	return 'reward'+legalIdVal;
}

function addCumRewardPair(index, key, val){//SC2_OK
	var rewardKeyDiv = document.createElement("DIV");
	rewardKeyDiv.setAttribute("class", "r" + index +"c0");
	if (key == totalsString){
		rewardKeyDiv.setAttribute("style", "height:15px;font-family:Arial;font-size:14px;font-weight:bold;");
	}
	else {
		rewardKeyDiv.setAttribute("style", "height:15px;font-family:Arial;font-size:14px;");
	}
	
	rewardKeyDiv.innerHTML = key;
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
		rewardValDiv.setAttribute("style", "margin-left: 20px;height:15px;font-family:Arial;font-size:14px;font-weight:bold");
	}
	else {
		rewardValDiv.setAttribute("style", "margin-left: 20px;height:15px;font-family:Arial;font-size:14px;");
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
// SC2_TODO fewer packets arrive.   New protocol will bew as follows:
//

//  INITIAL ORDER OF ARRIVAL OF PACKETS
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. SC2ReplaySessionConfig
//  3. StudyQuestions (optional)


//
// SC2_TODO remove deadcode, tweak for adjusted code
//
function handleScaiiPacket(sPacket) {
	var result = undefined;
	if (sPacket.hasReplayChoiceConfig()) {
		var config = sPacket.getReplayChoiceConfig();
		replayChoiceConfig = config;
		handleReplayChoiceConfig(config);
	}
	else if (sPacket.hasSC2ReplaySessionConfig()) {
		//console.log("-----got replaySessionConfig");
		var config = sPacket.getSC2ReplaySessionConfig();
		replaySessionConfig = config;
		handleSC2ReplaySessionConfig(config,undefined);
	}
	else if (sPacket.hasExplDetails()) {
		//console.log('has expl details');
		var explDetails = sPacket.getExplDetails();
        handleExplanationDetails(explDetails);
	}
    else if(sPacket.hasStudyQuestions()) {
        handleStudyQuestions(sPacket.getStudyQuestions());
    }
	else if (sPacket.hasErr()) {
		console.log("-----got errorPkt");
		console.log(sPacket.getErr().getDescription())
	}
    else if (sPacket.hasUserCommand()) {//SC2_TODO - there will be no SELCT_FILE_COMPLETE form the backend
                                        // so we need to figure out where to put the below userStudyMode clde
		var userCommand = sPacket.getUserCommand();
		var commandType = userCommand.getCommandType();
		if (commandType == proto.scaii.common.UserCommand.UserCommandType.SELECT_FILE_COMPLETE){

			//
			//  SC2_TODO  we need the following code blocks somewhere else
			//
            controlsManager.doneLoadReplayFile();
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