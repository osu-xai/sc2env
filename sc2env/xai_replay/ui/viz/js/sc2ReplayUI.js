
//
// SC2_TODO - do we need these?  If not, can ditch google lib.  If so, why did missing ones not cause problems
//
// goog.require('proto.ExplanationPoint');
// goog.require('proto.MultiMessage');
// goog.require('proto.ScaiiPacket');
const fs = require('fs');
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
    
    loadReplaynames();
    
}

function extractReplayRootNames(items){
    var result = [];
    for (var i in items){
        var item = items[i];
        if (item.endsWith('.json')){
            var root = item.replace('.json','');
            result.push(root);
        }
    }
    return result;
}
    
function loadReplaynames(){
    //var replayDir = path.join(__dirname, 'replays')
    var replayDir = './replays'
    var items;
    async function loadFilenames() {

        let promise = new Promise(function(resolve, reject) {

            fs.readdir(replayDir, function(err, items) {
                console.log(items);
                if (err != undefined){
                    reject(err);
                }
                else {
                    var replayNames = extractReplayRootNames(items);
                    resolve(replayNames);
                }
            });
            
        });
      
        let result = await promise; // wait until the promise resolves (*)
        console.log("promise await done!")
        handleReplayFilenames(result);
    }
      
    loadFilenames();
}

main();
