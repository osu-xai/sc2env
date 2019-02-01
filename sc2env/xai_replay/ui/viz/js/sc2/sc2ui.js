// 1520 x 1280 is dimensions of video frame, try half that
var sc2GameCanvasWidth = 760;
var sc2GameCanvasHeight = 640;
var playInterval = 400;

function getSC2UIManager(sc2DataManager, sc2VideoManager) {
    uim = {};
    uim.dataManager = sc2DataManager;
    uim.videoManager = sc2VideoManager;
    uim.playState = "PAUSED";
    uim.targetStep = undefined;
    uim.play = function(){
        this.playState = "PLAYING";
        this.targetStep = undefined;
        this.playNextFrameAfterDelay();
    }
    uim.playToStep = function(step){
        this.playState = "PLAYING";
        var validatedStep = this.dataManager.validateStep(step);
        this.targetStep = validatedStep;
    }
    uim.pause = function(){
        this.playState = "PAUSED";
    }

    uim.renderStateForCurrentStep = function() {
        clearGameBoard();
        var unitInfos = this.dataManager.getUnitInfos(this.dataManager.getCurrentStep());
        for (unitInfo in unitInfos){
            createToolTips(unitInfo); //SC2_TODO - ensure don't create every time?
        }
        alert('sc2UIManager.renderStep finished?')
    }

    uim.playNextFrameAfterDelay = function(){//SC2_TEST
        window.setTimeout(this.playNextFrame, playInterval);
    }

    uim.playNextFrame = function(){//SC2_TEST
        var frameInfo = activeSC2DataManager.nextFrame()
        handleSC2Data(frameInfo);
        if (this.playState == "PLAYING"){
            if (this.targetStep == undefined){
                this.playNextFrameAfterDelay();
            }
            else{
                
                if (this.dataManager.getCurrentStep() == targetStep){
                    // target step is defined - does match, we must have arrived at target, stop and clear targetStep
                    this.targetStep = undefined;
                }
                else {
                    // target step is defined - doesn't match, keep going
                    this.playNextFrameAfterDelay();
                }
            }
        }
    }

    uim.jumpToFrame = function(frameIndex){//SC2_TEST
        this.playState = "PAUSED";
        activeSC2DataManager.setNextFrameAs(frameIndex);
        this.playNextFrame();
    }

    return uim;
}

function getTooltipY(unitInfo){
    return unitInfo.y - 20.0;
}

function getTooltipX(unitInfo){
    return unitInfo.x - 20.0;
}
function getTooltipColorRGBAForUnit(unitInfo){
    alert('getColorRGBAForUnit unimplemented')
}
function getSC2QuadrantName(x,y){
    var halfWidth = sc2GameCanvasWidth / 2;
    var halfHeight = sc2GameCanvasHeight / 2;
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

// assumes 1520 x 1280 video frame (1600 x 1600 game)
function convertCanvasXToGamePixelX(canvasX, canvasWidth){
    var xPercentAcrossCanvas = (Number(canvasX) / Number(canvasWidth));
    //translate percent to 1520 x 1280 dimension 
    var xPixelOn1520 = 1520 * xPercentAcrossCanvas;
    // add the pixels not in view
    var result = xPixelOn1520 + 40;
    return result;
}

// assumes 1520 x 1280 video frame (1600 x 1600 game)
function convertCanvasYToGamePixelY(canvasY, canvasHeight){
    var yPercentAcrossCanvas = (Number(canvasY) / Number(canvasHeight));
    //translate percent to 1520 x 1280 dimension 
    var yPixelOn1280 = 1280 * yPercentAcrossCanvas;
    // add the pixels not in view
    var result = yPixelOn1280 + 160;
    return result;
}

// assumes 1520 x 1280 video frame (1600 x 1600 game)
function convertGameXToGamePixelX(gameUnitX){
    var gameXPercent = Number(gameUnitX) / 40;
    var gamePixelX = 1600 * gameXPercent;
    return gamePixelX;
}

// assumes 1520 x 1280 video frame (1600 x 1600 game)
function convertGameYToGamePixelY(gameUnitY){
    var gameYPercent = Number(gameUnitY) / 40;
    var gamePixelY = 1600 * gameYPercent;
    return gamePixelY;
}