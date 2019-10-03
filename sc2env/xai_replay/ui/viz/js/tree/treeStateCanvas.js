
function renderUnitsOnField(stateVector){
    var v = stateVector;
    var w = unitCountsCanvasWidth;
    var h = unitCountsCanvasHeight;
    return renderMidLine(w,h) +
    renderVerticalLine(1,w,h) +
    renderVerticalLine(2,w,h) +
    renderVerticalLine(3,w,h) +
    renderUnitCounts(v,"agent", "top", 0, 15,16,17) +
    renderUnitCounts(v,"agent", "top", 1, 18,19,20) +
    renderUnitCounts(v,"agent", "top", 2, 21,22,23) +
    renderUnitCounts(v,"agent", "top", 3, 24,25,26) +
    
    renderUnitCounts(v,"agent", "bottom", 0, 27,28,29) +
    renderUnitCounts(v,"agent", "bottom", 1, 30,31,32) +
    renderUnitCounts(v,"agent", "bottom", 2, 33,34,35) +
    renderUnitCounts(v,"agent", "bottom", 3, 36,37,38) +
    
    renderUnitCounts(v,"enemy", "top", 0, 39,40,41) +
    renderUnitCounts(v,"enemy", "top", 1, 42,43,44) +
    renderUnitCounts(v,"enemy", "top", 2, 45,46,47) +
    renderUnitCounts(v,"enemy", "top", 3, 48,49,50) +
    
    renderUnitCounts(v,"enemy", "bottom", 0, 51,52,53) +
    renderUnitCounts(v,"enemy", "bottom", 1, 54,55,56) +
    renderUnitCounts(v,"enemy", "bottom", 2, 57,58,59) +
    renderUnitCounts(v,"enemy", "bottom", 3, 60,61,62);
}

function renderVerticalLine(index, w,h){
    var x = index * w/4;
    return '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + h + '" stroke="black" stroke-width="1"/>';
}

function renderMidLine(w,h){ 
    return '<line x1="0" x2="' + w + '" y1="' + h/2 + '" y2="' + h/2 + '" stroke="black" stroke-width="1"/>';
}
// player 1 units top lane grid 1,				[15:17] (marine, bane, immortal)
// player 1 units top lane grid 2,				[18:20] (marine, bane, immortal)
// player 1 units top lane grid 3,				[21:23] (marine, bane, immortal)
// player 1 units top lane grid 4,				[24:26] (marine, bane, immortal)
// player 1 units bottom lane grid 1,			[27:29] (marine, bane, immortal)
// player 1 units bottom lane grid 2,			[30:32] (marine, bane, immortal)
// player 1 units bottom lane grid 3,			[33:35] (marine, bane, immortal)
// player 1 units bottom lane grid 4,			[36:38] (marine, bane, immortal)
// player 2 units top lane grid 1,				[39:41] (marine, bane, immortal)
// player 2 units top lane grid 2,				[42:44] (marine, bane, immortal)
// player 2 units top lane grid 3,				[45:47] (marine, bane, immortal)
// player 2 units top lane grid 4,				[48:50] (marine, bane, immortal)
// player 2 units bottom lane grid 1,			[51:53] (marine, bane, immortal)
// player 2 units bottom lane grid 2,			[54:56] (marine, bane, immortal)
// player 2 units bottom lane grid 3,			[57:59] (marine, bane, immortal)
// player 2 units bottom lane grid 4,			[60:62] (marine, bane, immortal)

function renderUnitCounts(stateVector, player, lane, gridIndex, marineIndex, banelingIndex, immortalIndex){
    return renderMarineCount(player, lane, gridIndex, stateVector[marineIndex]) +
    renderBanelingCount(player, lane, gridIndex, stateVector[banelingIndex]) +
    renderImmortalCount(player, lane, gridIndex, stateVector[immortalIndex]);
}

function renderMarineCount(player, lane, gridIndex, count){
    var xOrigin = getXOrigin(gridIndex, player);
    var yOrigin = getYOrigin(lane, "marine");
    var playerColor = getPlayerColor(player);
    return drawCircleAtOrigin(xOrigin, yOrigin, playerColor);
}

function renderBanelingCount(player, lane, gridIndex, count){
    var xOrigin = getXOrigin(gridIndex, player);
    var yOrigin = getYOrigin(lane, "baneling");
    var playerColor = getPlayerColor(player);
    return drawCircleAtOrigin(xOrigin, yOrigin, playerColor);
}

function renderImmortalCount(player, lane, gridIndex, count){
    var xOrigin = getXOrigin(gridIndex,player);
    var yOrigin = getYOrigin(lane, "immortal");
    var playerColor = getPlayerColor(player);
    return drawCircleAtOrigin(xOrigin, yOrigin, playerColor, count);
}

function drawCircleAtOrigin(x,y,color, count){
    var randomValue = Math.floor(Math.random() * 8); 
    var randomSign = Math.floor(Math.random() * 2);
    if (randomSign == 0){
        randomValue = 0 - randomValue;
    }
    x = x + randomValue;
    var radius = getRadiusForCount(count);
    return '<circle cx="' + x + '" cy="' + y + '" r="10" stroke="' + color + '" fill="' + color + '" stroke-width="4"/>'
}

function getRadiusForCount(count){
    if (count <= 3){
        return 3;
    }
    if (count <= 30){
        return count;
    }
    var transformedValue = 30 + (count - 30)/2;
    if (transformedValue > 50){
        return 50;
    } else {
        return transformedValue;
    }
}
function getPlayerColor(player){
    if (player == "agent"){
        return "blue";
    }
    return "red";
}

var yOffsetsInQuadrantForPlayer = {};
yOffsetsInQuadrantForPlayer["marine"] = 1;
yOffsetsInQuadrantForPlayer["baneling"] = 2;
yOffsetsInQuadrantForPlayer["immortal"] = 3;

var laneIndex = {};
laneIndex["top"] = 0;
laneIndex["bottom"] = 1;
function getYOrigin(lane, unitType){
    var index = laneIndex[lane];
    var topEdgeOfQuadrant= index * (unitCountsCanvasHeight / 2);
    var unitTypeOffset = getPlayerYCenterInQuadrant(unitType);
    var yCenter = topEdgeOfQuadrant + unitTypeOffset;
    return yCenter;
}

function getXOrigin(gridIndex,player){
    var leftEdgeOfQuadrant= gridIndex * (unitCountsCanvasWidth / 4);
    var unitTypeOffset = getPlayerXCenterInQuadrant(player);
    var xCenter = leftEdgeOfQuadrant + unitTypeOffset;
    return xCenter;
}

function getPlayerXCenterInQuadrant(player){
    var playerIndex = undefined;
    if (player == "agent"){
        playerIndex = 0;
    }
    else {
        playerIndex = 1;
    }
    var halfWidthOfQuadrant = unitCountsCanvasWidth / 8;
    var quarterWidthOfQuadrant = halfWidthOfQuadrant / 2;
    var xCenter = playerIndex * halfWidthOfQuadrant + quarterWidthOfQuadrant;
    return xCenter;
}


function getPlayerYCenterInQuadrant(unitType){
    var unitIndex = yOffsetsInQuadrantForPlayer[unitType];
    var fourthOfHeightOfQuadrant = unitCountsCanvasHeight / 8;
    var yCenter = unitIndex * fourthOfHeightOfQuadrant;
    return yCenter;
}


// function getArmyStrengthCanvasId(nodeId){
//     return "state-canvas-" + nodeId;
// }

// function renderArmyStrengthCanvases(cy){
//     cy.nodes().forEach(function (node){
//         if (node.data("sc2_nodeType") == "stateNode"){
//             var nodeId = node.data("id");
//             var state = node.data("state");
//             console.log("about to search for canvas : " + getArmyStrengthCanvasId(nodeId) )
//             renderUnitsOnField(getArmyStrengthCanvasId(nodeId), state);
//         }
//     });
// }


// ui.renderChartValueLines = function (canvas, chartData, numberOfLines) {
//     chartData.positionValueLines(numberOfLines);
//     var ctx = canvas.getContext("2d");
//     for (var i = 0; i < numberOfLines; i++) {
//         ctx.save();
//         ctx.strokeStyle = "grey";
//         ctx.beginPath();
//         ctx.moveTo(chartData.positiveLineOriginX, chartData.positiveLineOriginY[i]);
//         ctx.lineTo(Number(chartData.positiveLineOriginX) + Number(chartData.positiveLineLength), chartData.positiveLineOriginY[i]);
//         ctx.stroke();
//         ctx.closePath();
//         ctx.beginPath();
//         ctx.moveTo(chartData.positiveLineOriginX, chartData.canvasHeight / 2 - chartData.positiveMarkerYPixelsFromXAxis[i]);
//         ctx.lineTo(Number(chartData.positiveLineOriginX) + Number(chartData.positiveLineLength), chartData.canvasHeight / 2 - chartData.positiveMarkerYPixelsFromXAxis[i]);
//         ctx.stroke()
//         ctx.closePath();
//         ctx.restore();
//     }
// }

// ui.renderActionSeparatorLines = function (canvas, chartData) {
//     chartData.positionActionSeparatorLines();
//     var ctx = canvas.getContext("2d");
//     for (var i = 0; i < chartData.actions.length - 1; i++) {
//         ctx.save();
//         ctx.strokeStyle = "red";
//         ctx.beginPath();
//         ctx.setLineDash([5, 15]);
//         ctx.moveTo(chartData.actionLinesOriginX[i], chartData.actionLinesOriginY);
//         ctx.lineTo(chartData.actionLinesOriginX[i], Number(chartData.actionLinesOriginY) + Number(chartData.actionLinesLength));
//         ctx.stroke();
//         ctx.restore();
//     }
// }

// ui.renderXAxis = function (canvas, chartData) {
//     chartData.positionXAxisLine();
//     var ctx = canvas.getContext("2d");
//     ctx.save();
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(chartData.xAxisOriginX, chartData.xAxisOriginY);
//     ctx.lineTo(Number(chartData.xAxisOriginX) + Number(chartData.xAxisLength), chartData.xAxisOriginY);
//     ctx.closePath();
//     ctx.stroke();
//     ctx.restore();
// }

// ui.renderYAxis = function (canvas, chartData) {
//     chartData.positionYAxisLine();
//     var ctx = canvas.getContext("2d");
//     ctx.save();
//     ctx.strokeStyle = "black";
//     ctx.lineWidth = 1;
//     ctx.beginPath();
//     ctx.moveTo(chartData.yAxisOriginX, chartData.yAxisOriginY);
//     ctx.lineTo(chartData.yAxisOriginX, Number(chartData.yAxisOriginY) + Number(chartData.yAxisLength));
//     ctx.closePath();
//     ctx.stroke();
//     ctx.restore();
// }	