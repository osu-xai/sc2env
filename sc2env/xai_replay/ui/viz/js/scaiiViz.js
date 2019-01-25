
//
// SC2_TODO - do we need these?  If not, can ditch google lib.  If so, why did missing ones not cause problems
//
goog.require('proto.scaii.common.ExplanationPoint');
goog.require('proto.scaii.common.MultiMessage');
goog.require('proto.scaii.common.ScaiiPacket');

/**
* Copyright (c) 2017-present, Oregon State University, Inc.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree. An additional grant
* of patent rights can be found in the PATENTS file in the same directory.
*/
var main = function () {
    runTests();
	initUI();
	var debug = true;
	if (debug) {
		var connectButton = document.createElement("BUTTON");
		var connectText = document.createTextNode("Start");
		connectButton.setAttribute("class", "connectButton");
		connectButton.setAttribute("id", "connectButton");
		connectButton.appendChild(connectText);
		connectButton.onclick = function () {
			tryConnect('.', 0);
		};
		$("#playback-controls-panel").append(connectButton);
		$("#connectButton").css("font-size", "14px");
		$("#connectButton").css("padding-left", "20px");
		$("#connectButton").css("padding-right", "20px");
		$("#connectButton").css("width", "15%");
	} else {
		tryConnect('.', 0);
	}
}
function debug(position, message){
	//$("#debug" + position).html(message);
}
main();
