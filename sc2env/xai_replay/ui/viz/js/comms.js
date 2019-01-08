var dealer;
var sessionState = "pending";
var userCommandScaiiPackets = [];
var userInfoScaiiPackets = [];


// calls connect and paints "working" dots.  If connect fails, it calls tryConnect again
function tryConnect(dots, attemptCount) {
	clearGameBoards();
	gameboard_ctx.font = "40px Arial";
	if (dots == '.') {
		dots = '..';
	}
	else if (dots == '..') {
		dots = '...';
	}
	else {
		dots = '.';
	}
	attemptCount = attemptCount + 1;
	//$("#scaii-interface-title").html(systemTitle + " (... connecting " + attemptCount + " " + dots + ")");
	//gameboard_ctx.fillText("connecting  " + attemptCount + " " + dots, 10, 50);
	connect(dots, attemptCount);
}


var connect = function (dots, attemptCount) {
	dealer = new WebSocket('ws://localhost:6112');

	dealer.binaryType = 'arraybuffer';
	dealer.onopen = function (event) {
		//$("#scaii-interface-title").html(systemTitle);
		console.log("WS Opened.");
	};

	dealer.onmessage = function (message) {
		try {
			sessionState = "inProgress";
			var s = message.data;
			var sPacket = proto.scaii.common.ScaiiPacket.deserializeBinary(s);
			var multiMessageToReturn = handleScaiiPacket(sPacket);
			if (multiMessageToReturn == undefined) {
				//always need to send a packet back - far side is waiting
				var mm = new proto.scaii.common.MultiMessage;
				dealer.send(mm.serializeBinary());
			}
			else {
				dealer.send(multiMessageToReturn.serializeBinary());
			}
		}
		catch (err) {
            console.log(err.stack);
			alert(err.message + " " + err.stack);
		}
	};

	dealer.onclose = function (closeEvent) {
		console.log("closefired " + attemptCount);
		if (sessionState == "pending") {
			// the closed connection was likely due to failed connection. try reconnecting
			setTimeout(function () { tryConnect(dots, attemptCount); }, 2000);
		}
	};

	dealer.onerror = function (err) {
        console.log("Error: " + err);
        console.log(err.stack);
		alert(err.message + " " + err.stack);
	};

};
