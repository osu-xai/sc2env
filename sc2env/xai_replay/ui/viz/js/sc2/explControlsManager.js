//
// Her'es the design for the 2019 fall study, "study mode"  ("dev mode" has no control of access to explanations):
//
// user plays the replay, autopauses at entry in pauseAndPredictDPs, but play button enabled
// play from there and stop at entry in pauseAndExplainDPs, play button is disabled
// if this is the first time arriving at the peDP, then unlock controls are shown.
//  if the user jumps backward to a previous DP before unlocking, and then plays forward, autopause will happen
// and unlock controls displayed.
//  once user unlocks, if they hop back before showing the explanation and then play forward, autopause will
// happen at the peDP, but no unlock controls are shown.  Instead, the show explanation button willcontain the dp
// number of the associated (previous) ppDP.
// note thatany time an autopause occurs at a peDP, the play button is disabled, preventing user from moving 
// forward from peDP until they show the explanation.  Dismissing the explanation tree re-enables the play button.
//
// If user hops back to previous dp that is prior to an "already-explained" peDP, then the "show explanation" button 
// is enabled and has the number of that DP.  So, the only time the button will have the prior DP number in it is 
// during the "controlled explanation".
//
// If a user tries to hop forward past the highest "already explained"  peDP, they are blocked with a message that explains why
// If user has not reached the first peDP and tries to hop forward, they are blocked with the message that explains why
//
// ANother way to think of it is with zones

// zoneNoPeDPYetExplained - this covers the first DPs prior to the first peDP if that peDP hasnot yet been explained
// zoneBeforeHighestExplainedPeDP 
// zoneAtUnexplainedPeDP
// zoneAfterHighestExplainedPeDP
//
//  zoneNoPeDPYetExplained - can't hop forward, no access to explanations
//  zoneBeforeHighestExplainedPeDP - can hop anywhere in here, show explanation button enabled and aimed at the actual DP
//  zoneAtUnexplainedPeDP  - has to be unlocked, show explanation button is aimed at prior DP
//  zoneAfterHighestExplainedPeDP - can only play through this, can't hop around


function getExplControlsManager(){
    m = {};
    m.mode = "study";
    m.explanationAccessManager = explanationAccessManagerStudy;
    m.treeChoiceManager = treeChoiceManagerStudy;
    m.autoPauseManager = autoPauseManagerStudy;
    m.userStudyDPToDisplay = undefined;
    m.parkedAtDP = undefined;

    m.isUserStudyMode = function(){
        return (this.mode == "study");
    }

    m.getDPToDisplay = function() {
        return this.treeChoiceManager.dpToRender;
    }
    m.pauseAtDP = function(dp){
        this.explanationAccessManager.pauseAtDP(dp);
        this.treeChoiceManager.pauseAtDP(dp);
        this.parkedAtDP = dp;
        this.refresh();
    }

    m.hopToDP = function(dp){
        this.explanationAccessManager.hopToDP(dp);
        this.treeChoiceManager.hopToDP(dp);
        this.parkedAtDP = dp;
        this.refresh();
    }

    m.userPaused = function(){
        var currentStep = sessionIndexManager.getCurrentIndex();
        var dpStep = sessionIndexManager.getStepThatStartsEpochForStep(currentStep);
        var prevDP = dpsByFrame[dpStep];
        if (dpStep == currentStep){
            this.pauseAtDP(prevDP);
        }
        else {
            this.pauseAfterDP(prevDP);
        }
    }

    m.pauseAfterDP = function(dp){
        this.explanationAccessManager.pauseAfterDP(dp);
        this.treeChoiceManager.pauseAfterDP(dp);
        this.parkedAtDP = undefined;
        this.refresh();
    }

    m.hopToAfterDP = function(dp){
        this.explanationAccessManager.hopToAfterDP(dp);
        this.treeChoiceManager.hopToAfterDP(dp);
        this.refresh();
    }

    m.someExplanationShown = function(dp){
        this.treeChoiceManager.someExplanationShown(dp);
        this.refresh();
    }

    // m.forwardedFromExplanation = function(){
    //     this.explanationAccessManager.forwardedFromExplanation();
    //     this.treeChoiceManager.forwardedFromExplanation();
    //     this.refresh();
    // }
    m.processJumpToDPStep = function(step){
        var targetDP = dpsByFrame[step];
        this.hopToDP(targetDP);
    }

    m.processJumpToNonDPStep = function(step){
        var dpStep = sessionIndexManager.getStepThatStartsEpochForStep(step);
        var prevDP = dpsByFrame[dpStep];
        this.hopToAfterDP(prevDP);
    }

    m.isForwardGestureBlocked = function(frame){
        return this.treeChoiceManager.isForwardGestureBlocked(frame);
    }
    m.refresh = function(){
        var dpToRender = this.treeChoiceManager.dpToRender;
        if (dpToRender == "NA" || dpToRender == undefined){
            $('#button-show-explanations').html("Show Explanation");
        }
        else {
            $('#button-show-explanations').html("Show Explanation for DP" + dpToRender);
        }

        if (this.explanationAccessManager.showUnlockControls){
            showUnlockControls();
        }
        else {
            hideUnlockControls();
        }
        if (this.explanationAccessManager.showExplButtonEnabled){
            enableShowExplanationsButton();
        }
        else {
            disableShowExplanationsButton();
        }
    }

    m.renderDevControls = function(){
        $('#model-free-radio').css('display', "inline")
        $('#model-free-radio-label').css('display', "inline")
        $('#model-based-radio').css('display', "inline")
        $('#model-based-radio-label').css('display', "inline")
        
    }
    
    m.hideDevControls = function(){
        $('#model-free-radio').css('display', "none")
        $('#model-free-radio-label').css('display', "none")
        $('#model-based-radio').css('display', "none")
        $('#model-based-radio-label').css('display', "none")
    }

    m.setModeToUserStudy = function(){
        this.mode = "study";
        this.hideDevControls();
        //this.hideExplanationControls();
        if (!year2TutorialMode) {
            enableForwardTimelineBlock = true;
        }
        this.explanationAccessManager = explanationAccessManagerStudy;
        this.treeChoiceManager = treeChoiceManagerStudy;
        this.autoPauseManager = autoPauseManagerStudy;
        this.refresh();
    }

    m.setModeToDev = function(){
        this.mode = "dev";
        this.renderDevControls();
        //this.showExplanationControls();
        enableForwardTimelineBlock = false;
        this.explanationAccessManager = explanationAccessManagerDev;
        this.treeChoiceManager = treeChoiceManagerDev;
        this.autoPauseManager = autoPauseManagerDev;
        this.refresh();
    }

    m.isExplanationsVisible = function() {
        return !($('#explanation-tree-window').css('display') == 'none');
    }


    m.showExplanationsWindow = function(){
        $('#explanation-tree-window').css('display', "block");
        this.treeChoiceManager.someExplanationShown();
    }
    
    m.hideExplanations = function() {
        $('#explanation-tree-window').css('display', "none");
    }

    m.styleControls = function(){
        $("#explanation-control-panel").css("height", "60px")
        $("#explanation-control-panel").css("position", "absolute");
        $("#explanation-control-panel").css("top", "45%");
        $("#explanation-control-panel").css("left", "0%");
        $("#explanation-control-panel").css("right", "0%");
        $("#explanation-control-panel").css("background", "rgba(0,0,0,0)")
        $("#explanation-control-panel").css("z-index", zIndexMap["allTheWayToFront"]);

        $('#button-show-explanations').css('float', "left")
        $('#button-show-explanations').css('text-align', "center")
        $('#button-show-explanations').css('font-size', "20px")
        $('#button-show-explanations').css('font-family', "Arial")
        $('#button-show-explanations').css('width', "300px")
        $('#button-show-explanations').css('height', "30px")
        
        this.decorateRadioButton($('#model-free-radio'))
        this.decorateRadioButton($('#model-based-radio'))
        

        //$('#explanation-tree-window').css('width', "95%")
        $('#explanation-tree-window').css('width', "100%")
        //$('#explanation-tree-window').css('height', "88%")
        $('#explanation-tree-window').css('height', "100%")
        //$('#explanation-tree-window').css('margin-left', "2%")
        $('#explanation-tree-window').css('margin-left', "0%")

        $('#explanation-tree-window').css('position', "absolute")
        $('#explanation-tree-window').css('background-color', "whitesmoke")
        //$('#explanation-tree-window').css('border-radius', "10px")
        $('#explanation-tree-window').css('z-index', zIndexMap["modalPopUp"])
        //$('#explanation-tree-window').css('border', "3px solid black")
    }

    m.correctUnlockKeyEntered = function(dp){
        this.explanationAccessManager.unlocked(dp);
        this.refresh();
    }

    m.decorateRadioButton = function(r){
        r.css('text-align', "center")
        r.css('font-size', "15px")
        r.css('font-family', "Arial")
        r.css('height', "30px")
    }

    m.noteResume = function() {
        this.explanationAccessManager.resume();
        this.treeChoiceManager.resume();
        this.refresh();
    }

    m.affirmAutoPause = function(frameNumber){
        var priorDPStep = sessionIndexManager.getStepThatStartsEpochForStep(frameNumber);
        var priorDP = dpsByFrame[priorDPStep];
        var highestDPCompleted = this.treeChoiceManager.highestDPCompleted;
        return this.autoPauseManager.affirmAutoPause(priorDP, highestDPCompleted);
    }

    return m;
}

function hideUnlockControls(){
    $('#unlock-key-label').css('display','none');
    $('#unlock-key-text').css('display','none');
}

function showUnlockControls(){
    $('#unlock-key-label').css('display', "block");
    $('#unlock-key-text').css('display', "block");
    controlsManager.disablePauseResume();
}

function hideExplanations(){
    explControlsManager.hideExplanations();
    controlsManager.enablePauseResume();
}

function disableShowExplanationsButton(){
    $('#button-show-explanations').prop('disabled', true);
}

function enableShowExplanationsButton(){
    $('#button-show-explanations').prop('disabled', false);
}


var unlockKeys = [];
unlockKeys[0] = "__";
unlockKeys[1] = "ne";
unlockKeys[2] = "ph";
unlockKeys[3] = "ro";
unlockKeys[4] = "is";
unlockKeys[5] = "ag";
unlockKeys[6] = "ra";
unlockKeys[7] = "ce";
unlockKeys[8] = "fi";
unlockKeys[9] = "lg";
unlockKeys[10] = "re";
unlockKeys[11] = "yh";
unlockKeys[12] = "ou";
unlockKeys[13] = "nd";
unlockKeys[14] = "he";
unlockKeys[15] = "bo";
unlockKeys[16] = "un";
unlockKeys[17] = "ds";
unlockKeys[18] = "th";
unlockKeys[19] = "ro";
unlockKeys[20] = "ug";
unlockKeys[21] = "ht";
unlockKeys[22] = "he";
unlockKeys[23] = "ya";
unlockKeys[24] = "rd";
unlockKeys[25] = "lo";
unlockKeys[26] = "ok";
unlockKeys[27] = "in";
unlockKeys[28] = "gl";
unlockKeys[29] = "ik";
unlockKeys[30] = "ea";
unlockKeys[31] = "de";
unlockKeys[32] = "er";
unlockKeys[33] = "wi";
unlockKeys[34] = "th";
unlockKeys[35] = "hi";
unlockKeys[36] = "sf";
unlockKeys[37] = "aw";
unlockKeys[38] = "nc";
unlockKeys[39] = "ol";
unlockKeys[40] = "or";

function checkUnlockKey(){
    var code = $('#unlock-key-text').val();
    if (code.length < 2){
        return;
    }
    var step = sessionIndexManager.getCurrentIndex();
    var dpString = sessionIndexManager.getDPThatStartsEpochForStep(step);
    var dp = dpString.replace("DP","").trim();
    var unlockCode = unlockKeys[dp];
    if (unlockCode == code){
        explControlsManager.correctUnlockKeyEntered(Number(dp));
    }
    else {
        alert("unlock key " + dpString + " does not match expected value, please try again.")
    }
    $('#unlock-key-text').val('');
}


function devModeChanged(){
    if ($("#dev-mode-check").prop('checked')){
        explControlsManager.setModeToDev();
        enableForwardTimelineBlock = false;
    }
    else {
        explControlsManager.setModeToUserStudy();
    }
}

function hideFileChoiceListBox(){
    $('#replay-file-selector').css("display","none");
    $('#friendly-lane-neutral-container').css("width","50%");
    $('#enemy-lane-neutral-container').css("width","50%");
}
