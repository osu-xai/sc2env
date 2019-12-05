
//
// SC2_TODO - do we need these?  If not, can ditch google lib.  If so, why did missing ones not cause problems
//
// goog.require('proto.ExplanationPoint');
// goog.require('proto.MultiMessage');
// goog.require('proto.ScaiiPacket');

/**
* Copyright (c) 2017-present, Oregon State University, Inc.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grantx
* of patent rights can be found in the PATENTS file in the same directory.
*/

var main = function () {
    //runTests();
	initUI();
    var replayFilenames = loadReplaynames();
    handleReplayFilenames(replayFilenames);
}


function loadReplaynames(){
    //var replayDir = path.join(__dirname, 'replays')
    var replayDir = './replays'
    
    fs.readdir(replayDir, function(err, items) {
        console.log(items);
     
        for (var i=0; i<items.length; i++) {
            console.log(items[i]);
        }
    });
}


main();
