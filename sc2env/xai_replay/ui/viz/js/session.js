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

function handleReplayFilenames(replayNames){//SC2_OK
    var play = document.getElementById("pauseResumeButton");
    if (play == undefined){
        configureNavigationButtons();
    }
    console.log('replayNames in handleReplayFilenames: ' + replayNames);
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
    userStudyMode = false;
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

    async function loadReplay(filename) {
        var jsonFile = filename + '.json';
        let promise = new Promise(function(resolve, reject) {
            fs.readFile('./replays/' + jsonFile, (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
      
        let jsonData = await promise; // wait until the promise resolves (*)
        console.log("promise await done! - have jsonData")
        ingestReplayJsonData(jsonData);
    }
      
    loadReplay(filename);

    // var args = [chosenFile];
	// var userCommand = new proto.UserCommand;
	// userCommand.setCommandType(proto.UserCommand.UserCommandType.SELECT_FILE);
    // userCommand.setArgsList(args);
    // var scaiiPkt = new proto.ScaiiPacket;
    // scaiiPkt.setUserCommand(userCommand);
    // sendScaiiPacket(scaiiPkt);
    // console.log("sent file choice scaiiPacket");
}

function clearUIElementsForNewFile(){//SC2_OK
    $("#action-list").empty();
    $("#why-button").remove();
    $("#explanation-control-panel").empty();

    $("#cumulative-rewards").empty();
    rewardsDivMap = {};
}
//
function ingestReplayJsonData(jsonData){
    getSC2DataManagerFromJson
    console.log("handleSC2ReplaySessionConfig");
	var timelineWidth = expl_ctrl_canvas.width - 2*timelineMargin;
    //SC2_TODO_NAV_TEST - ensure UI ignores clicks during fiule load
    activeSC2DataManager = getSC2DataManagerFromJson(jsonData);
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
    loadConfigFile();
}

function loadConfigFile(){
    async function loadConfig() {
        let promise = new Promise(function(resolve, reject) {
            fs.readFile('./config.json', (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
      
        let jsonData = await promise; // wait until the promise resolves (*)
        var config = JSON.parse(jsonData);
        if (config["treatment"] == "modelBased"){
            $('#model-based-radio').click();
            setToModelBasedTreatment();
        }
        else {
            $('#model-free-radio').click();
            setToModelFreeTreatment();
        }
        if (config["tutorial"] == "yes"){
            enableForwardTimelineBlock = false;
            year2TutorialMode = true;
            $('#dev-mode-check').css("display", "inline");
            $('#dev-mode-check-label').css("display", "inline");
        }
        else {
            // not tutorial mode, but we don't want timeline block enabled iw we are in dev mode
            if (explControlsManager.isUserStudyMode()){
                enableForwardTimelineBlock = true;
            }
            year2TutorialMode = false;
            hideFileChoiceListBox();
        }
    }
    loadConfig();
}
var year2TutorialMode = false;
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

function isFrameFarEnoughPastDP(frameInfo){
    var frameNumber = frameInfo.frame_number;
    var farEnoughPastDP = 10;
    for (var i in allDecisionPointFrames){
        var dpFrame = allDecisionPointFrames[i];
        var nextDpFrame = allDecisionPointFrames[Number(i)+ 1];
        var windowStart = dpFrame  + farEnoughPastDP;
        if (nextDpFrame == undefined){
            var windowEnd = windowStart  + 75;
        }
        else {
            var windowEnd = nextDpFrame;
        }
        if (frameNumber >= windowStart && frameNumber <= windowEnd){
            //console.log("frame " + frameNumber + " is between "+ windowStart + " and " + windowEnd);
            return true;
        }
    }
    return false;
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

//  INITIAL ORDER OF ARRIVAL OF PACKETS Y2 system pre-electron
//
//  1. ReplayChoiceConfig   (list of filenames)
//  2. SC2ReplaySessionConfig
//  3. StudyQuestions (optional)

function epochIsChanging() {
	if (currentExplManager != undefined) {
		currentExplManager.removeOverlaysAndOutlines();
	}
}

