// 1520 x 1280 is dimensions of video frame, try half that
//var sc2GameRenderWidth = 760;
//var sc2GameRenderHeight = 640;
// try quarter that
var roughlyHalfWidthOfUnit         = 0.3 //(assuming 40x40)
var sc2GameUnitDimensionsX         = 40;
var sc2GameUnitDimensionsY         = 40;
var sc2GameOrigPixelWidth          = 1600;
var sc2GameOrigPixelHeight         = 1600;
var sc2GameOrigPixelViewableWidth  = 1520;
var sc2GameOrigPixelViewableHeight = 1280;

var sc2GameOrigPixelOffscreenToLeftX   = (sc2GameOrigPixelWidth - sc2GameOrigPixelViewableWidth)/2; //40
var sc2GameOrigPixelOffscreenToBottomY = (sc2GameOrigPixelHeight - sc2GameOrigPixelViewableHeight)/2;//160

var videoScaleFactor = 0.4;
var sc2GameOrigPixelViewableWidth_Scaled  = sc2GameOrigPixelViewableWidth * videoScaleFactor;
var sc2GameOrigPixelViewableHeight_Scaled = sc2GameOrigPixelViewableHeight * videoScaleFactor;

var sc2GameRenderWidth  = sc2GameOrigPixelViewableWidth_Scaled;
var sc2GameRenderHeight = sc2GameOrigPixelViewableHeight_Scaled;

var gameContainerWidth = sc2GameRenderWidth + 360;

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
var videoPlaybackRate = 1 / recorderCaptureInterval;
var relativeReplayDir = "./replays";
var activeSC2UIManager = undefined;

function getSC2UIManager(sc2DataManager, filenameRoot) {
    uim = {};
    uim.dataManager = sc2DataManager;
    uim.videoFilepath = getVideoFilepath(filenameRoot);
    createVideoElement(uim.videoFilepath);

    uim.renderStateForCurrentStep = function() {
        clearGameBoard();
        var unitInfos = this.dataManager.getUnitInfos(sessionIndexManager.getCurrentIndex());
        for (i in unitInfos){
            var unitInfo = unitInfos[i];
            createToolTips(unitInfo); 
        }
    }

    uim.jumpToFrame = function(frameIndex){//SC2_TEST
        var currentTime = frameIndex / framesPerSecond;
		console.log("frame number " + frameIndex + " currentTime " + currentTime)
        video.currentTime = currentTime;
        this.renderStateForCurrentStep();
        performFinalAdjustmentsForFrameChange(this.dataManager.getFrameInfo(frameIndex));
    }

    uim.play = function(){
        video.play();
    }
    uim.pause = function() {
        video.pause();
        var frameNumber = Math.floor(video.currentTime * framesPerSecond);
        console.log('frameNumber ' + frameNumber + ' currentTime ' + this.currentTime + " FPS " + framesPerSecond);
        sessionIndexManager.setReplaySequencerIndex(frameNumber);
        activeSC2UIManager.jumpToFrame(frameNumber);
    }
    uim.jumpToFrame(0);
    return uim;
}


function getVideoFilepath(chosenFile){
    return relativeReplayDir + "/" + chosenFile + ".mp4";
}
var video = undefined;

function createVideoElement(path){
    video = document.createElement("video");
	//video.setAttribute("width", "760px");
	//video.setAttribute("height", "640");
	video.setAttribute("width", sc2GameRenderWidth + "px");
	video.setAttribute("height",sc2GameRenderHeight + "px");
	video.src = path;
	$("#scaii-gameboard").append(video);
	
	video.addEventListener("timeupdate", function(){
        // frames per second is 25.  Figure out frame number from currentTime
        var frameNumber = Math.floor(video.currentTime * framesPerSecond);
        console.log('frameNumber ' + frameNumber + ' currentTime ' + video.currentTime + " FPS " + framesPerSecond);
        frameNumber = activeSC2DataManager.validateStep(frameNumber);
        sessionIndexManager.setReplaySequencerIndex(frameNumber);
        //activeSC2UIManager.jumpToFrame(frameNumber);
	})
	// have to call configureGameboardCanvas here again so that unit position math is correct when tooltips are made.
	configureGameboardCanvas();
	video.load();	
	video.playbackRate = videoPlaybackRate;
	//video.play();
}

function getTooltipY(unitInfo){
    //return translateUnitYToCanvasY(unitInfo.y) - 20.0;
    return translateUnitYToCanvasY(unitInfo.y) - 2;
}

function getTooltipX(unitInfo){
    //return translateUnitXToCanvasX(unitInfo.x) - 20.0;
    return translateUnitXToCanvasX(unitInfo.x) - 2;
}
function getTooltipColorRGBAForUnit(unitInfo){
    return "#ffffff";
}
function getSC2QuadrantName(x,y){
    var halfWidth = sc2GameRenderWidth / 2;
    var halfHeight = sc2GameRenderHeight / 2;
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


function translateUnitXToCanvasXOld(unitX){
    var percentX = unitX / 40;
    var origGameX = sc2GameOrigPixelWidth * percentX;
    var canvasX = origGameX - sc2GameOrigPixelOffscreenToLeftX;
    var scaledCanvasX = canvasX * videoScaleFactor;
    return scaledCanvasX;
}

function translateUnitYToCanvasYOld(unitY){
    var percentY = unitY / 40;
    var origGameY = sc2GameOrigPixelHeight * percentY;
    var canvasY = origGameY - sc2GameOrigPixelOffscreenToBottomY;
    var scaledCanvasY = canvasY * videoScaleFactor;
    return scaledCanvasY;
}

function translateUnitXToCanvasX(unitX){
    var unitXCamera = unitX - xEdgeToCamera;
    var unitXPercentAcrossCanvas = unitXCamera / cameraWidth;
    var canvasX = gameboard_canvas.width * unitXPercentAcrossCanvas;
    console.log(' unitX ' + unitX + 'unitXCamera ' + unitXCamera + ' %acrossCanvas ' + unitXPercentAcrossCanvas + 'canvasX ' + canvasX + ' canvasWidth ' + gameboard_canvas.width);
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

function translateCanvasXCoordToGameUnitXCoordOld(canvasX, canvasWidth){
    //
    //  Translating canvas x coords to game unit x coords
    //  1. mouse hovers at x coord
    //  2. xcoord translated to %canvasX
    var percentCanvasX = (Number(canvasX) / Number(canvasWidth));

    //  3. %canvasX translated to origGamePixelX = sc2GameOrigPixelOffscreenToLeftX + %canvasX*sc2GameOrigPixelViewableWidth)
    var origGamePixelX = (sc2GameOrigPixelOffscreenToLeftX + percentCanvasX * sc2GameOrigPixelViewableWidth) / videoScaleFactor;

    //  4. origGamePixelX translated to %origGameX = origGamePixelX / sc2GameOrigPixelWidth
    var percentGameX = origGamePixelX / sc2GameOrigPixelWidth;

    //  5. %origGameX converted to unitSpaceX = 40 * %origGameX
    var unitSpaceX = 40 * percentGameX;
    return unitSpaceX;
}

// Cw = 24, Ch = 24
// corigin is center of map.  Sincemap is 40x40, CoriginX = 20, CoriginY = 20
// XedgeToCamera = 20 - 12, YedgeToCamera = 20 - 12
var cameraWidth = 24;
var cameraHeight = 24;
var cameraOriginX = 20;
var cameraOriginY = 20;
var xEdgeToCamera = cameraOriginX - cameraWidth/2;
var yEdgeToCamera = cameraOriginY - cameraHeight/2;

function translateCanvasXCoordToGameUnitXCoord(canvasX, canvasWidth){
    //
    //  Translating canvas x coords to game unit x coords
    //  1. mouse hovers at x coord
    //  2. xcoord translated to %canvasX
    var percentCanvasX = (Number(canvasX) / Number(canvasWidth));
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

function translateCanvasYCoordToGameUnitYCoordOld(canvasY, canvasHeight){

    //
    //  Translating canvas y coords to game unit y coords
    //  1. mouse hovers at y coord
    //  2. ycoord translated to %canvasY
    var percentCanvasY = (Number(canvasY) / Number(canvasHeight));

    //  3. %canvasY translated to origGamePixelY = sc2GameOrigPixelOffscreenToBottomY + %canvasY*sc2GameOrigPixelViewableHeight)
    var origGamePixelY = (sc2GameOrigPixelOffscreenToBottomY + (1  - percentCanvasY) * sc2GameOrigPixelViewableHeight) / videoScaleFactor;

    //  4. origGamePixelY translated to %origGameY = origGamePixelY / sc2GameOrigPixelHeight
    var percentGameY = origGamePixelY / sc2GameOrigPixelHeight;

    //  5. %origGameY converted to unitSpaceY = 40 * %origGameY
    var unitSpaceY = 40 * percentGameY;
    return unitSpaceY;
}

var frameNumber = 0;
var frameCount = 92;

function vidStep(){
	frameNumber += 1;
	if (frameNumber > frameCount - 1){
		//stop
	}
	else {
		var currentTime = frameNumber / framesPerSecond;
		console.log("frame number " + frameNumber + " currentTime " + currentTime)
		video.currentTime = currentTime;
		window.setTimeout(vidStep, 500);
		//window.requestAnimationFrame(vidStep);
	}
}