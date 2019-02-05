// 1520 x 1280 is dimensions of video frame, try half that
//var sc2GameWidth = 760;
//var sc2GameHeight = 640;
// try quarter that
var sc2GameWidth = 380;
var sc2GameHeight = 320;
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
            //SC2_TODO_TT createToolTips(unitInfo); //SC2_TODO_TT - ensure don't create every time?
        }
        console.log('renderStateForCurrentStep finished');
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
	video.setAttribute("width", sc2GameWidth + "px");
	video.setAttribute("height",sc2GameHeight + "px");
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
	
	initUI();
	video.load();	
	video.playbackRate = videoPlaybackRate;
	//video.play();
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
    var halfWidth = sc2GameWidth / 2;
    var halfHeight = sc2GameHeight / 2;
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
//SC2_TODO_GEOM reference dimensions specified elsewhere
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