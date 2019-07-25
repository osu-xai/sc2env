function runVideoManagerTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("videoPlayback");
    var vm;
    { 
        fc.setCase("dps ten apart, skip 1");
        vm = getVideoPlaybackManager();
        var frames = getBlankFrames(30);
        frames[0]["frame_info_type"] = "decision_point";
        frames[9]["frame_info_type"] = "decision_point";
        frames[19]["frame_info_type"] = "decision_point";
        frames[29]["frame_info_type"] = "decision_point";
        
        vm.setFrames(frames, 1);
        
        fc.assert(vm.getCurrentFrameNumber(), 0, "start");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 2, "ifSkip 2");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9a");

        fc.assert(vm.moveToNextFrame(), true, "skip 1");
        fc.assert(vm.getCurrentFrameNumber(), 2, "2");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 4, "ifSkip 4");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9b");

        fc.assert(vm.moveToNextFrame(), true, "skip 3");
        fc.assert(vm.getCurrentFrameNumber(), 4, "4");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 6, "ifSkip 6");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9c");

        fc.assert(vm.moveToNextFrame(), true, "skip 5");
        fc.assert(vm.moveToNextFrame(), true, "skip 7");
        fc.assert(vm.getCurrentFrameNumber(), 8, "8");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 10, "ifSkip 10");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9d");

        fc.assert(vm.moveToNextFrame(), true, "skip nothing");
        fc.assert(vm.getCurrentFrameNumber(), 9, "9");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 11, "ifSkip 11");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19a");

        fc.assert(vm.moveToNextFrame(), true, "skip 10");
        fc.assert(vm.getCurrentFrameNumber(), 11, "11");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 13, "ifSkip 13");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19b");

        fc.assert(vm.moveToNextFrame(), true, "skip 12");
        fc.assert(vm.getCurrentFrameNumber(), 13, "13");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 15, "ifSkip 15");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19c");

        fc.assert(vm.moveToNextFrame(), true, "skip 14");
        fc.assert(vm.getCurrentFrameNumber(), 15, "15");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 17, "ifSkip 17");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19d");

        fc.assert(vm.moveToNextFrame(), true, "skip 16");
        fc.assert(vm.moveToNextFrame(), true, "skip 18");
        fc.assert(vm.getCurrentFrameNumber(), 19, "19");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 21, "ifSkip 21");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29a");

        fc.assert(vm.moveToNextFrame(), true, "skip 20");
        fc.assert(vm.getCurrentFrameNumber(), 21, "21");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 23, "ifSkip 23");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29b");

        fc.assert(vm.moveToNextFrame(), true, "skip 22");
        fc.assert(vm.getCurrentFrameNumber(), 23, "23");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 25, "ifSkip 25");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29c");

        fc.assert(vm.moveToNextFrame(), true, "skip 24");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 27, "ifSkip 27");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29d");

        fc.assert(vm.moveToNextFrame(), true, "skip 26");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 29, "ifSkip 29");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29e");

        fc.assert(vm.moveToNextFrame(), true, "skip 28");
        fc.assert(vm.getCurrentFrameNumber(), 29, "29");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), -1, "ifSkip from 29");
        fc.assert(vm.getIndexOfNextDecisionPoint(),-1,"no later DP");

        fc.assert(vm.moveToNextFrame(), false, "at end");

        //

        fc.setCase("dps ten apart, skip 2");
        vm = getVideoPlaybackManager();
        var frames = getBlankFrames(30);
        frames[0]["frame_info_type"] = "decision_point";
        frames[9]["frame_info_type"] = "decision_point";
        frames[19]["frame_info_type"] = "decision_point";
        frames[29]["frame_info_type"] = "decision_point";
        
        vm.setFrames(frames, 2);
        
        fc.assert(vm.getCurrentFrameNumber(), 0, "start");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 3, "ifSkip 3");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9a");

        fc.assert(vm.moveToNextFrame(), true, "skip 1,2");
        fc.assert(vm.getCurrentFrameNumber(), 3, "3");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 6, "ifSkip 6");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9b");

        fc.assert(vm.moveToNextFrame(), true, "skip 4,5");
        fc.assert(vm.getCurrentFrameNumber(), 6, "6");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 9, "ifSkip 9");
        fc.assert(vm.getIndexOfNextDecisionPoint(),9,"nextDP 9c");

        fc.assert(vm.moveToNextFrame(), true, "skip 7,8");
        fc.assert(vm.getCurrentFrameNumber(), 9, "9");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 12, "ifSkip 12");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19a");


        fc.assert(vm.moveToNextFrame(), true, "skip 10,11");
        fc.assert(vm.getCurrentFrameNumber(), 12, "12");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 15, "ifSkip 15");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19b");

        fc.assert(vm.moveToNextFrame(), true, "skip 13,14");
        fc.assert(vm.getCurrentFrameNumber(), 15, "15");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 18, "ifSkip 18");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19c");

        fc.assert(vm.moveToNextFrame(), true, "skip 16,17");
        fc.assert(vm.getCurrentFrameNumber(), 18, "18");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 21, "ifSkip 21");
        fc.assert(vm.getIndexOfNextDecisionPoint(),19,"nextDP 19d");

        fc.assert(vm.moveToNextFrame(), true, "skip nothing");
        fc.assert(vm.getCurrentFrameNumber(), 19, "19");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 22, "ifSkip 22");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29a");


        fc.assert(vm.moveToNextFrame(), true, "skip 20,21");
        fc.assert(vm.getCurrentFrameNumber(), 22, "22");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 25, "ifSkip 25");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29b");

        fc.assert(vm.moveToNextFrame(), true, "skip 23,24");
        fc.assert(vm.getCurrentFrameNumber(), 25, "25");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), 28, "ifSkip 28");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29c");

        fc.assert(vm.moveToNextFrame(), true, "skip 26,27");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), -1, "nowhere to skip to");
        fc.assert(vm.getIndexOfNextDecisionPoint(),29,"nextDP 29d");

        fc.assert(vm.moveToNextFrame(), true, "skip 28");
        fc.assert(vm.getCurrentFrameNumber(), 29, "29");
        fc.assert(vm.getIndexOfNextFrameIfSkip(), -1, "skip can't");
        fc.assert(vm.getIndexOfNextDecisionPoint(),-1,"no future DP");

        fc.assert(vm.moveToNextFrame(), false, "at end");


    }
}

function getBlankFrames(count){
    var frames = [];
    for (var i = 0; i < count; i++){
        frames.push(getBlankFrame(i));
    }
    return frames;
}

function getBlankFrame(frameNumber) {
    var frame = {}
    frame["frame_info_type"] = "clock_tick";
    frame["frame_number"] = frameNumber;
    return frame;
}