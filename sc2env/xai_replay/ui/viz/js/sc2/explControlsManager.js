function getExplControlsManager(){
    m = {};
    m.mode = "study";
    enableForwardTimelineBlock = true;

    m.isUserStudyMode = function(){
        return (this.mode == "study");
    }
    m.showExplanationControls = function(){
        enableShowExplanationButton();
        if(this.isUserStudyMode()) {
            disableShowExplanationsButton();
            showUnlockControls();
        }
        else {
            enableShowExplanationsButton();
        }
    }
    //enableForwardTimelineBlock
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
        this.hideExplanationControls();
        if (!year2TutorialMode) {
            enableForwardTimelineBlock = true;
        }
    }
    m.setModeToDev = function(){
        this.mode = "dev";
        this.renderDevControls();
        this.showExplanationControls();
        enableForwardTimelineBlock = false;
    }
    m.isExplanationsVisible = function() {
        return !($('#explanation-tree-window').css('display') == 'none');
    }

    m.showExplanationsWindow = function(){
        $('#explanation-tree-window').css('display', "block")
    }
    m.hideExplanationControls = function(){
        if(this.isUserStudyMode()) {
            hideUnlockControls();
        }
    }

    m.requestHideShowExplanationButton = function(){
        if (this.isUserStudyMode()){
            disableShowExplanationButton();
        }
    }
    
    m.hideExplanations = function() {
        $('#explanation-tree-window').css('display', "none");
        if (this.isUserStudyMode()){
            hideUnlockControls();
        }
    }
    m.styleControls = function(){
        $("#explanation-control-panel").css("height", "60px")
        $("#explanation-control-panel").css("position", "absolute");
        $("#explanation-control-panel").css("top", "45%");
        $("#explanation-control-panel").css("left", "5%");
        $("#explanation-control-panel").css("right", "5%");
        $("#explanation-control-panel").css("background", "rgba(0,0,0,0)")
        $("#explanation-control-panel").css("z-index", zIndexMap["allTheWayToFront"]);

        $('#button-show-explanations').css('float', "left")
        $('#button-show-explanations').css('text-align', "center")
        $('#button-show-explanations').css('font-size', "20px")
        $('#button-show-explanations').css('font-family', "Arial")
        $('#button-show-explanations').css('width', "200px")
        $('#button-show-explanations').css('height', "30px")
        
        this.decorateRadioButton($('#model-free-radio'))
        this.decorateRadioButton($('#model-based-radio'))
        

        $('#explanation-tree-window').css('width', "95%")
        $('#explanation-tree-window').css('height', "88%")
        $('#explanation-tree-window').css('margin-left', "2%")

        $('#explanation-tree-window').css('position', "absolute")
        $('#explanation-tree-window').css('background-color', "whitesmoke")
        $('#explanation-tree-window').css('border-radius', "10px")
        $('#explanation-tree-window').css('z-index', zIndexMap["modalPopUp"])
        $('#explanation-tree-window').css('border', "3px solid black")
    }

    m.correctUnlockKeyEntered = function(){
        if (this.isUserStudyMode()){
            enableShowExplanationsButton();
            hideUnlockControls();
        }
    }
    m.decorateRadioButton = function(r){
        r.css('text-align', "center")
        r.css('font-size', "15px")
        r.css('font-family', "Arial")
        r.css('height', "30px")
    }
    return m;
}


function disableShowExplanationButton(){
    $('#button-show-explanations').attr('disabled', 'disabled');
}

function enableShowExplanationButton(){
    $('#button-show-explanations').removeAttr('disabled');
}

function hideUnlockControls(){
    $('#unlock-key-label').css('display','none');
    $('#unlock-key-text').css('display','none');
}

function showUnlockControls(){
    $('#unlock-key-label').css('display', "block");
    $('#unlock-key-text').css('display', "block");
}

function hideExplanations(){
    explControlsManager.hideExplanations();
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
unlockKeys[8] = "fu";
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
    var dp = dpString.replace("DP","");
    var unlockCode = unlockKeys[dp];
    if (unlockCode == code){
        explControlsManager.correctUnlockKeyEntered();
    }
    else {
        alert("unlock key " + dpString + " does not match expected value, please try again.")
    }
    $('#unlock-key-text').val('');
}


function devModeChanged(){
    if ($("#dev-mode-check").prop('checked')){
        explControlsManager.setModeToDev();
    }
    else {
        explControlsManager.setModeToUserStudy();
    }
}
