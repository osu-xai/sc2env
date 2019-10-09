// Cw = 24, Ch = 24
// corigin is center of map.  Sincemap is 40x40, CoriginX = 20, CoriginY = 20
// XedgeToCamera = 20 - 12, YedgeToCamera = 20 - 12

// 64w by 128h game units is new dims


var videoScaleFactor = .365;
var uncroppedPercentage = 0.875
var videoHeightExtensionForCrop = 1.1

var aspectRatio = 1.5
var pillarBoxLeft = undefined;

var cameraWidth = 114;
var cameraHeight = 56;
var cameraOriginX = 64;
var cameraOriginY = 32;
var xEdgeToCamera = cameraOriginX - cameraWidth/2;
var yEdgeToCamera = cameraOriginY - cameraHeight/2;
// 1520 x 1280 is dimensions of video frame, try half that
//var sc2GameRenderWidth = 760;
//var sc2GameRenderHeight = 640;
// try quarter that
var roughlyHalfWidthOfUnitAsPercentageOfCanvas = 0.03; 
// var sc2GameOrigPixelWidth          = 1600;
// var sc2GameOrigPixelHeight         = 1600;
var sc2GameOrigPixelViewableWidth  = 2048 * aspectRatio;
var sc2GameOrigPixelViewableHeight = 2048;
var roughlyHalfWidthOfUnitAsPercentageOfCanvas = 0.05;

//var sc2GameOrigPixelOffscreenToLeftX   = (sc2GameOrigPixelWidth - sc2GameOrigPixelViewableWidth)/2; //40
//var sc2GameOrigPixelOffscreenToBottomY = (sc2GameOrigPixelHeight - sc2GameOrigPixelViewableHeight)/2;//160

var sc2GameOrigPixelViewableWidth_Scaled  = sc2GameOrigPixelViewableWidth * videoScaleFactor;
var sc2GameOrigPixelViewableHeight_Scaled = sc2GameOrigPixelViewableHeight * videoScaleFactor;
var roughlyHalfWidthOfUnitInGameUnits = cameraWidth * roughlyHalfWidthOfUnitAsPercentageOfCanvas;
var sc2GameRenderWidth  = sc2GameOrigPixelViewableWidth_Scaled;
var sc2GameRenderHeight = sc2GameOrigPixelViewableHeight_Scaled;
var saliencyScaleFactorX = Math.round(sc2GameRenderWidth / 40.0);
var saliencyScaleFactorY = Math.round(sc2GameRenderHeight / 40.0);
//alert("" + saliencyScaleFactorX + "  " + saliencyScaleFactorY);
var gameContainerWidth = sc2GameRenderWidth + 520;

//=================================================================================
// Click comutation support V2

//Rey's geometry
// Cw = 24, Ch = 24
// corigin is center of map.  Sincemap is 40x40, CoriginX = 20, CoriginY = 20
// XedgeToCamera = 20 - 12, YedgeToCamera = 20 - 12


//==================================================================================

var playInterval = 400;
var framesPerSecond = 25;
var recorderCaptureInterval = 8;
var videoPlaybackRate = 4 / recorderCaptureInterval;
var relativeReplayDir = "./replays";
var activeSC2UIManager = undefined;

function getSC2UIManager(sc2DataManager, filenameRoot) {
    uim = {};
    uim.dataManager = sc2DataManager;
    uim.videoFilepath = getVideoFilepath(filenameRoot);
    uim.jumped = false;
    uim.forwarded = false;

    createVideoElement(uim.videoFilepath);
    toggleOnUIElements();   

    uim.renderTooltipsForCurrentStep = function() {
        clearGameBoard();
        var unitInfos = this.dataManager.getUnitInfos(sessionIndexManager.getCurrentIndex());
        for (i in unitInfos){
            var unitInfo = unitInfos[i];
            // createToolTips(unitInfo); 
        }
    }

    uim.renderStateForCurrentStep = function() {
        alert("sc2UIManager.renderCurrentState not yet implemented - how treat this for study mode?")
    }
    uim.jumpToFrame = function(frameNumber){//SC2_TEST
        this.pause();
        var currentTime = frameNumber / framesPerSecond;
        this.jumped = true;
        video.currentTime = currentTime + (trimBy / framesPerSecond);
        // event will fire that will trigger expressFrameInfo
        
        //sessionIndexManager.setReplaySequencerIndex(frameNumber);
        //this.renderStateForCurrentStep();
        //performFinalAdjustmentsForFrameChange(this.dataManager.getFrameInfo(frameNumber));
    }

    
    uim.expressFrameInfo = function(frameNumber) {
        console.log("expressingFrameInfo");
        frameNumber = this.dataManager.validateStep(frameNumber);
        sessionIndexManager.setReplaySequencerIndex(frameNumber);

        if (sessionIndexManager.isAtDecisionPoint()){
            var dpString = sessionIndexManager.getDPThatStartsEpochForStep(frameNumber);
            var dp = dpString.replace("DP","");
            if (isInterestingDP(Number(dp))){
                enableExplanationControls();
            }
        }
        expressCumulativeRewards(this.dataManager.getFrameInfo(frameNumber));
        frame = this.dataManager.getFrameInfo(frameNumber);
        renderUnitValues(frame);
        if(!checkIfFrameIsInteresting(frameNumber) && forwardDPCheck){
            this.forwarded = true;
            forwardDPToFrame(nextDPOfInterest);
        }
        userStudyAdjustmentsForFrameChange();
        getDecisionPointFrames(this.dataManager.frameInfos, frameNumber)

        if (this.jumped){
            this.renderTooltipsForCurrentStep();
            this.jumped = false;

        }
        if (this.forwarded){
            pauseGame();
            this.forwarded = false;
        }

        checkForEndOfGame()
        controlsManager.clearWaitCursor();
    }
    uim.play = function(){
        disableExplanationControls();
        video.play()
    }
    uim.pause = function() {
        video.pause();
        this.renderTooltipsForCurrentStep();
    }
    uim.jumpToFrame(0);
    return uim;
}



function getVideoFilepath(chosenFile){
    return relativeReplayDir + "/" + chosenFile + ".mp4";
}
var video = undefined;

function createVideoElement(path){
    var existingVideo = document.getElementById("video");
    if (existingVideo != undefined){
        // delete the old one, new one coming in...
        existingVideo.remove();
    }
    video = document.createElement("video");
	video.setAttribute("width", "100%");
    video.setAttribute("height", $(window).height() * videoHeightExtensionForCrop);
    video.setAttribute("id","video");
	video.src = path;
    $("#scaii-gameboard").append(video);
    var renderedVideoHeight = video.clientHeight
    var renderedVideoWidth =  video.clientWidth
    var trueRenderedVideoWidth = renderedVideoHeight * aspectRatio;
    pillarBoxLeft = (renderedVideoWidth - trueRenderedVideoWidth) / 2; // the grey thing on the side of the video - nick

	video.addEventListener("timeupdate", function(){
        // frames per second is 25.  Figure out frame number from currentTime
        var frameNumber = Math.round((video.currentTime - (trimBy / framesPerSecond)) * framesPerSecond);
        activeSC2UIManager.expressFrameInfo(frameNumber);
        // video.currentTime = 1/framesPerSecond + video.currentTime
	})
	// have to call configureGameboardCanvas here again so that unit position math is correct when tooltips are made.
    configureGameboardCanvas();

    $("#gameboard").css("left", pillarBoxLeft);
    // setting the gameboard canvas to the viewable hieght so full dimensions are visible
    $("#gameboard").css("height", $(window).height() * uncroppedPercentage);
    $("#gameboard").css("width", trueRenderedVideoWidth);


	video.load();	
    video.playbackRate = videoPlaybackRate;
    video.currentTime = trimBy / framesPerSecond
    toggleOnUIElements();
}

function toggleOnUIElements(){
    $('#unit-value-panels-toggle').css('display', "block")
    $('.unit-value-panels').css('display', "grid")

    //$('#fullscreen-button1-toggle').css('display', "block")
    $('#model-free-radio').css('display', "inline")
    $('#model-free-radio-label').css('display', "inline")
    $('#model-based-radio').css('display', "inline")
    $('#model-based-radio-label').css('display', "inline")
    $('#key-disable-check').css('display', "inline")
    $('#key-disable-check-label').css('display', "inline")
    if(document.getElementById('key-disable-check').checked) {
        $('#fullscreen-button1-toggle').prop('disabled', true);
    } else {
        $('#fullscreen-button1-toggle').prop('disabled', false);
    }
}

function keyDisableCheck(){
    if(document.getElementById('key-disable-check').checked) {
        $('#fullscreen-button1-toggle').prop('disabled', true);
    } else {
        $('#fullscreen-button1-toggle').prop('disabled', false);
    }
}

function getTooltipColorRGBAForUnit(unitInfo){
    return "#ffffff";
}



// function translateUnitXToCanvasXOld(unitX){
//     var percentX = unitX / 40;
//     var origGameX = sc2GameOrigPixelWidth * percentX;
//     var canvasX = origGameX - sc2GameOrigPixelOffscreenToLeftX;
//     var scaledCanvasX = canvasX * videoScaleFactor;
//     return scaledCanvasX;
// }

// function translateUnitYToCanvasYOld(unitY){
//     var percentY = unitY / 40;
//     var origGameY = sc2GameOrigPixelHeight * percentY;
//     var canvasY = origGameY - sc2GameOrigPixelOffscreenToBottomY;
//     var scaledCanvasY = canvasY * videoScaleFactor;
//     return scaledCanvasY;
// }

function translateUnitXToCanvasX(unitX){
    var unitXCamera = unitX - xEdgeToCamera;
    var unitXPercentAcrossCanvas = unitXCamera / cameraWidth;
    var canvasX = gameboard_canvas.width * unitXPercentAcrossCanvas;
    
    return canvasX;
}

function translateUnitYToCanvasY(unitY){
    var unitYCamera = cameraHeight - (unitY - yEdgeToCamera);
    var unitYPercentAcrossCanvas = unitYCamera / cameraHeight;
    var canvasY = gameboard_canvas.height * unitYPercentAcrossCanvas;

    return canvasY;
}


//
//  Translating canvas y coords to game unit y coords
//  1. mouse hovers at y coord
//  2. ycoord translated to %canvasY
//  3. %canvasY translated to origGamePixelYHover = sc2GameOrigPixelOffscreenToBottomY + %canvasY*sc2GameOrigPixelViewableHeight)
//  4. origGamePixelYHover translated to %origGameY = origGamePixelYHover / sc2GameOrigPixelHeight
//  5. %origGameY converted to unitYHover = 40 * %origGameY
//

// function translateCanvasXCoordToGameUnitXCoordOld(canvasX, canvasWidth){
//     //
//     //  Translating canvas x coords to game unit x coords
//     //  1. mouse hovers at x coord
//     //  2. xcoord translated to %canvasX
//     var percentCanvasX = (Number(canvasX) / Number(canvasWidth));

//     //  3. %canvasX translated to origGamePixelX = sc2GameOrigPixelOffscreenToLeftX + %canvasX*sc2GameOrigPixelViewableWidth)
//     var origGamePixelX = (sc2GameOrigPixelOffscreenToLeftX + percentCanvasX * sc2GameOrigPixelViewableWidth) / videoScaleFactor;

//     //  4. origGamePixelX translated to %origGameX = origGamePixelX / sc2GameOrigPixelWidth
//     var percentGameX = origGamePixelX / sc2GameOrigPixelWidth;

//     //  5. %origGameX converted to unitSpaceX = 40 * %origGameX
//     var unitSpaceX = 40 * percentGameX;
//     return unitSpaceX;
// }

function translateCanvasXCoordToGameUnitXCoord(canvasX, canvasWidth){
    //
    //  Translating canvas x coords to game unit x coords
    //  1. mouse hovers at x coord
    //  2. xcoord translated to %canvasX
    var percentCanvasX = ((Number(canvasX)) / Number(canvasWidth));
    var unitSpaceX = cameraWidth * percentCanvasX + xEdgeToCamera;
    return unitSpaceX;
}


function translateCanvasYCoordToGameUnitYCoord(canvasY, canvasHeight){
    //
    //  Translating canvas x coords to game unit x coords
    //  1. mouse hovers at x coord
    //  2. xcoord translated to %canvasX

    var percentCanvasY = (canvasHeight - Number(canvasY)) / Number(canvasHeight);
    var unitSpaceY = cameraHeight * percentCanvasY + yEdgeToCamera;
    return unitSpaceY;
}

// function translateCanvasYCoordToGameUnitYCoordOld(canvasY, canvasHeight){

//     //
//     //  Translating canvas y coords to game unit y coords
//     //  1. mouse hovers at y coord
//     //  2. ycoord translated to %canvasY
//     var percentCanvasY = (Number(canvasY) / Number(canvasHeight));

//     //  3. %canvasY translated to origGamePixelY = sc2GameOrigPixelOffscreenToBottomY + %canvasY*sc2GameOrigPixelViewableHeight)
//     var origGamePixelY = (sc2GameOrigPixelOffscreenToBottomY + (1  - percentCanvasY) * sc2GameOrigPixelViewableHeight) / videoScaleFactor;

//     //  4. origGamePixelY translated to %origGameY = origGamePixelY / sc2GameOrigPixelHeight
//     var percentGameY = origGamePixelY / sc2GameOrigPixelHeight;

//     //  5. %origGameY converted to unitSpaceY = 40 * %origGameY
//     var unitSpaceY = 40 * percentGameY;
//     return unitSpaceY;
// }

var frameNumber = 0;
var frameCount = 92;

function vidStep(){
	frameNumber += 1;
	if (frameNumber > frameCount - 1){
		//stop
	}
	else {

        var currentTime = frameNumber / framesPerSecond;
        video.currentTime = currentTime;
        window.setTimeout(vidStep, 500);
        //window.requestAnimationFrame(vidStep);
		
	}
}