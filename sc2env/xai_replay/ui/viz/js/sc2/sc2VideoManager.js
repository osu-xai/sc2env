function getVideoPlaybackManager(){
    vm = {};
    vm.frames = [];
    vm.skipCount = -1;
    vm.currentFrame = 0;
    vm.setFrames = function (frames, skipCount) {
        this.frames = frames;
        this.skipCount = skipCount;
    }
    vm.getCurrentFrameNumber = function(){
        return this.currentFrame;
    }
    vm.getIndexOfNextDecisionPoint = function(){
        if (this.currentFrame == this.frames.length - 1){
            return -1; // at end
        }
        for (var i = this.currentFrame + 1; i < this.frames.length; i++){
            if (this.frames[i]["frame_info_type"] == "decision_point"){
                return i;
            }
        }
        return -1;
    }
    vm.getIndexOfNextFrameIfSkip = function(){
        var skipTargetFrame = this.currentFrame + this.skipCount + 1;
        if (skipTargetFrame > this.frames.length - 1){
            return -1; // at or past endend
        }
        return skipTargetFrame;
    }
    vm.moveToNextFrame = function(){
        if (this.currentFrame == this.frames.length -1){
            return false;
        }
        else {
            var skipTargetFrame = this.getIndexOfNextFrameIfSkip();
            var nextDPFrame = this.getIndexOfNextDecisionPoint();
            if ((skipTargetFrame == -1) && (nextDPFrame == -1)){
                return false;
            }
            else if ((skipTargetFrame == -1) && (nextDPFrame != -1)){
                this.currentFrame = nextDPFrame;
                return true;
            }
            else if ((skipTargetFrame != -1) && (nextDPFrame == -1)){
                this.currentFrame = skipTargetFrame;
                return true;            
            }
            else {
                // both != -1
                if (nextDPFrame <= skipTargetFrame){
                    this.currentFrame = nextDPFrame;
                    return true;
                }
                else {
                    this.currentFrame = skipTargetFrame;
                    return true;
                }
            }
        }
    }
    return vm;
}