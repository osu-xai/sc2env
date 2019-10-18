function getQuadWinBars(chartData){
    var specs = [];
    // pattern generation must know about bar values because patternHeight 
    // needs to change to maintain constant value of product patternHeight*barHeight
    specs.push(["destroy", "top",    "enemy",    chartData[0]["value"]]);
    specs.push(["destroy", "bottom", "enemy",    chartData[1]["value"]]);
    specs.push(["destroy", "top",    "agent", chartData[4]["value"]]);
    specs.push(["destroy", "bottom", "agent", chartData[5]["value"]]);
    specs.push(["lowest",  "top",    "enemy",    chartData[2]["value"]]);
    specs.push(["lowest",  "bottom", "enemy",    chartData[3]["value"]]);
    specs.push(["lowest",  "top",    "agent", chartData[6]["value"]]);
    specs.push(["lowest",  "bottom", "agent", chartData[7]["value"]]);
    
    // leave for testing
    // specs.push(["destroy", "top",    "enemy",    0.20]);
    // specs.push(["destroy", "bottom", "enemy",    0.4]);
    // specs.push(["destroy", "top",    "agent", 0.25]);
    // specs.push(["destroy", "bottom", "agent", 0.3]);
    // specs.push(["lowest",  "top",    "enemy",    0.80]);
    // specs.push(["lowest",  "bottom", "enemy",    0.6]);
    // specs.push(["lowest",  "top",    "agent", 0.75]);
    // specs.push(["lowest",  "bottom", "agent", 0.7]);


    var winBars = getPatternDefForSpecs(specs) + 
    renderWinBarPair(2,"top",   "enemy",     chartData[0]["value"],chartData[2]["value"]) +
    renderWinBarPair(3,"bottom","enemy",     chartData[1]["value"],chartData[3]["value"]) +
    renderWinBarPair(0,"top",   "agent",  chartData[4]["value"],chartData[6]["value"]) +
    renderWinBarPair(1,"bottom","agent",  chartData[5]["value"],chartData[7]["value"]);

    // leave for testing
    // renderWinBarPair(2,"top",   "enemy",     0.20,0.8) +
    // renderWinBarPair(3,"bottom","enemy",     0.4,0.6) +
    // renderWinBarPair(0,"top",   "agent",  0.25,0.75) +
    // renderWinBarPair(1,"bottom","agent",  0.3,0.7);
    return winBars;
}

function getXAxis(){
    var x1 = 0;
    var x2 = chartWidth;
    var maxBarHeight = chartHeight - (chartHeight/3);
    var remainderChartHeight = chartHeight - maxBarHeight;
    var y = chartHeight - (remainderChartHeight/ 2);
    var result = '<line x1="' + x1 + '" y1="' + y + '" x2="' + x2 + '" y2="' + y + '" style="stroke:black;stroke-width:10" />';
    return result;
}

// bar pairings
// [0] = // destroy, top,    right
// [2] = // lowest,  top,    right

// [1] = // destroy, bottom, right
// [3] = // lowest,  bottom, right

// [4] = // destroy, top,    left
// [6] = // lowest,  top,    left

// [5] = // destroy, bottom, left
// [7] = // lowest,  bottom, left 

function renderWinBarPair(barPairIndex,lane,player,destroyValue,lowestValue){
    //4 bars evenly spaced, which means 7 slots
    var firstBarXOrigin  = 0;
    var barWidth = chartWidth / 7;  
    var xOrigin =  firstBarXOrigin + barPairIndex * barWidth * 2;
    var maxBarHeight = chartHeight - (chartHeight/3);
    var remainderChartHeight = chartHeight - maxBarHeight;
    var xAxisAtY = chartHeight - (remainderChartHeight/ 2);
    var yOriginDestroy = xAxisAtY - maxBarHeight * destroyValue;
    var yOriginLowest = yOriginDestroy - maxBarHeight * lowestValue;
    var result = getDestroyVLineBar(lane, player, xOrigin, yOriginDestroy, destroyValue * maxBarHeight, barWidth) + 
                 getLowestSquaresBar(lane, player, xOrigin, yOriginLowest, lowestValue * maxBarHeight, barWidth)
    return result;
}

// function getDestroyBarTest(lane, player, xOrigin, yOrigin, barHeight, width){
//     var colorKey = "destroy-" + player;
//     var result =  '<rect fill="' + colorForPlayerWinType[colorKey] + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="' + getPlayerColor(player) + '" stroke-width="3"/>'
//     return result;
// }

// function getDestroyBar(lane, player, xOrigin, yOrigin, barHeight, width){
//     var patternId = lane + '-destroy-' + player;
//     var result =  '<rect fill="url(#' + patternId + ') #fff" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="black" stroke-width="8"/>'
//     return result;
// }

//<rect style="fill: url(#v-stripe-xai-agent1) #8080F0;" x="0" y="0" width="300" height="200" stroke="#8080F0" stroke-width="1" />

function getDestroyVLineBar(lane, player, xOrigin, yOrigin, barHeight, width){
    var patternId = lane + '-destroy-' + player;
    var result =  '<rect fill="url(#' + patternId + ') #fff" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="black" stroke-width="8"/>'
    return result;
}
//<rect style="fill: url(#squares2) #fff" x="300" y="20" width="200" height="400" stroke="green" stroke-width="3"/>'
// var colorForPlayerWinType = {};
// colorForPlayerWinType["destroy-enemy"]= "orange";
// colorForPlayerWinType["destroy-friendly"]= "blue";
// colorForPlayerWinType["lowest-enemy"]= "cyan";
// colorForPlayerWinType["lowest-friendly"]= "green";
// function getLowestBarTest(lane, player, xOrigin, yOrigin, barHeight, width){
//     var patternId = lane + '-lowest-' + player;
//     var colorKey = "lowest-" + player;
//     var result =  '<rect fill="' + colorForPlayerWinType[colorKey] + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="' + getPlayerColor(player) + '" stroke-width="3"/>'
//     return result;
// }

// function getLowestBar(lane, player, xOrigin, yOrigin, barHeight, width){
//     var patternId = lane + '-lowest-' + player;
//     var result =  '<rect fill="url(#' + patternId + ') #fff" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="black" stroke-width="8"/>'
//     return result;
// }
function getLowestSquaresBar(lane, player, xOrigin, yOrigin, barHeight, width){
    var patternId = lane + '-lowest-' + player;
    var result =  '<rect fill="url(#' + patternId + ') #fff" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + barHeight + '" stroke="black" stroke-width="8"/>'
    return result;
}

//<rect style="fill: url(#squares) #fff" x="10" y="20" width="200" height="200" stroke="green" stroke-width="3"/>

function getPatternDefForSpecs(specs){
    var result = '<defs>';
    for (var i in specs){
        var spec      = specs[i];
        var type      = spec[0];
        var lane      = spec[1];
        var player    = spec[2];
        var barHeight = spec[3];
        if (type == "destroy"){
            result += getDestroyVLinePattern(player, lane, barHeight);
        }
        else {
            result += getLowestSquaresPattern(player, lane, barHeight);
        }
    }
    result += '</defs>';
    return result;
}

var destroyConstant = 20;
var lowestConstant = 40;
// function getDestroyPattern(player, lane, barHeight){
//     // height orig 0.1
//     var maxBarHeight = chartHeight - (chartHeight/3);
//     var patternHeight = destroyConstant / (barHeight * maxBarHeight);
//     var result = '<pattern id="'+ lane + '-lowest-' + player + '" x="0.05" y="0.05" width="0.2" height="' + patternHeight + '" patternUnits="objectBoundingBox">' + 
//     '<rect x="5" y="5" width="10" height="10" fill="' + getPlayerColor(player) + '" stroke="' + getPlayerColor(player) + '"/>' +
// '</pattern>';
//     return result;
// }

// function getLowestPattern(player, lane, barHeight){
//     var maxBarHeight = chartHeight - (chartHeight/3);
//     var patternHeight = lowestConstant / (barHeight * maxBarHeight);
//     var result = '<pattern id="'+ lane + '-destroy-' + player + '" width="1.0" height="' + patternHeight + '" patternContentUnits="objectBoundingBox">' + 
//     '<rect x="0" y="0" width="1.0" height=".1" fill="' + getPlayerColor(player) + '" stroke="' + getPlayerColor(player) + '"/>' +
// '</pattern>';
//     return result;
// }
function getDestroyVLinePattern(player, lane, barHeight){
    var patternWidth = 0.25;
    var patternHeight = 1.0;
    var rectWidth = 0.125;
    var rectHeight = 1.0;
    var result = '<pattern id="'+ lane + '-destroy-' + player + '" width="' + patternWidth + '" height="' + patternHeight+ '" patternContentUnits="objectBoundingBox">' + 
    '<rect x="0" y="0" width="' + rectWidth + '" height="' + rectHeight + '" fill="' + getPlayerColor(player) + '"/>' +
'</pattern>';
    return result;
}

function getLowestSquaresPattern(player, lane, barHeight){
    var patternX = 0.05;
    var patternY = 0.05;
    var patternWidth = 0.25;
    //var patternHeight = 0.2;
    var rectWidth = 20;
    var rectHeight = 20;
    var maxBarHeight = chartHeight - (chartHeight/3);
    var patternHeight = lowestConstant / (barHeight * maxBarHeight);
    var result = '<pattern id="'+ lane + '-lowest-' + player + '" x="' + patternX + '" + y="' + patternY + '" width="' + patternWidth + '" height="' + patternHeight+ '" patternUnits="objectBoundingBox">' + 
    '<rect x="0" y="0" width="' + rectWidth + '" height="' + rectHeight + '" fill="' + getPlayerColor(player) + '"/>' +
'</pattern>';
    return result;
}



// <!-- pattern width is how much of the bounding box width is taken up by one pattern 
// 		pattern height is how much of bounding box height is taken up by one pattern
//         pattern x and y - can't tell
        
//        pattern rect width and height is dimensions of box
//        pattern rect x and y represent the upper left origin of boxf
       
//        rect height increase needs pattern height decrease to take up the same 
       
//        width of rectangle doubles, need tighter pattern which means pattern width halves to keep same size pattern 