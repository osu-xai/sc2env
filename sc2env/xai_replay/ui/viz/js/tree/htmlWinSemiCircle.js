
function getSemiCircles(chartData){
    var semiCircles = renderSemiCircle(0, chartData[0]["value"]) +
    renderSemiCircle(1, chartData[1]["value"]) +
    renderSemiCircle(2, chartData[2]["value"]) +
    renderSemiCircle(3, chartData[3]["value"]) +
    renderSemiCircle(4, chartData[4]["value"]) +
    renderSemiCircle(5, chartData[5]["value"]) +
    renderSemiCircle(6, chartData[6]["value"]) +
    renderSemiCircle(7, chartData[7]["value"]);
    return semiCircles;
}

var destroyColor = "orange";
var lowestHealthColor  = "#ccffcc";
var winTypeColor = {};
winTypeColor[0] = destroyColor;
winTypeColor[1] = destroyColor;
winTypeColor[2] = lowestHealthColor;
winTypeColor[3] = lowestHealthColor;
winTypeColor[4] = destroyColor;
winTypeColor[5] = destroyColor;
winTypeColor[6] = lowestHealthColor;
winTypeColor[7] = lowestHealthColor;

var winTypeLane = {};
winTypeLane[0] = "top";
winTypeLane[1] = "bottom";
winTypeLane[2] = "top";
winTypeLane[3] = "bottom";
winTypeLane[4] = "top";
winTypeLane[5] = "bottom";
winTypeLane[6] = "top";
winTypeLane[7] = "bottom";

var winTypeSide = {};
winTypeSide[0] = "right";
winTypeSide[1] = "right";
winTypeSide[2] = "right";
winTypeSide[3] = "right";
winTypeSide[4] = "left";
winTypeSide[5] = "left";
winTypeSide[6] = "left";
winTypeSide[7] = "left";

var winTypeYPositionInLane = {};
winTypeYPositionInLane[0] = "upper";
winTypeYPositionInLane[1] = "upper";
winTypeYPositionInLane[2] = "lower";
winTypeYPositionInLane[3] = "lower";
winTypeYPositionInLane[4] = "upper";
winTypeYPositionInLane[5] = "upper";
winTypeYPositionInLane[6] = "lower";
winTypeYPositionInLane[7] = "lower";


var originYForLane = {};
originYForLane["top"] = chartHeight / 4;
originYForLane["bottom"] = chartHeight * (3 / 4);

var xOriginChart = chartWidth/2;
var maxRadius = (chartHeight/4) - 10;

var lineToMultipliers = {};
lineToMultipliers["upper_right"] = [0,-1];
lineToMultipliers["lower_right"] = [0,1];
lineToMultipliers["upper_left"] = [-1,0];
lineToMultipliers["lower_left"] = [-1,0];

var destinationPointMultipliers = {};
destinationPointMultipliers["upper_right"] = [1,1];
destinationPointMultipliers["lower_right"] = [1,-1];
destinationPointMultipliers["upper_left"] = [1,-1];
destinationPointMultipliers["lower_left"] = [1,1];

var sweepString = {};
sweepString["upper_right"] = ["0,1"];
sweepString["lower_right"] = ["0,0"];
sweepString["upper_left"] = ["0,1"];
sweepString["lower_left"] = ["0,0"];
// <!--upper right quarter circle-->
//   <path d="M200,200 l0,-150 a150,150 0 0,1 150,150 z"
//         fill="yellow" stroke="blue" stroke-width="5" />
//         <!--lower right  quarter circl-->
//    <path d="M200,200 l0,150 a150,150 0 0,0 150,-150 z"
//         fill="blue" stroke="blue" stroke-width="5" />
//         <!--upper left  quarter circl-->
//     <path d="M200,200 l-150,0 a150,150 0 0,1 150,-150 z"
//         fill="red" stroke="blue" stroke-width="5" />
//         <!--lower left  quarter circle-->
//      <path d="M200,200 l-150,0 a150,150 0 0,0 150,150 z"
//         fill="green" stroke="blue" stroke-width="5" />

function getFill(index){
    return 'fill="' + winTypeColor[index] + '"';
}
function getMoveTo(index){
    var originY = originYForLane[winTypeLane[index]];
    var result = "M" + xOriginChart + ',' + originY;
    return result;
}
function getLineTo(radius, quadrant){
    var ltm = lineToMultipliers[quadrant];
    var result = "l" + ltm[0]*radius + "," + ltm[1]* radius;
    return result;
}
function getDestinationPoint(quadrant, radius){
    var dpm = destinationPointMultipliers[quadrant];
    var x = dpm[0]*radius;
    var y = dpm[1]*radius;
    return x + ',' + y;
}
function getSvgPathInstructionsForSemiCircle(index, value){
    var lanePortion = winTypeYPositionInLane[index];
    var side = winTypeSide[index];
    var quadrant = lanePortion + "_" + side;
    var radius = (value * maxRadius).toFixed(2);
    var result = 'd="' + getMoveTo(index) + ' ' + getLineTo(radius, quadrant) + ' a' + radius + ',' + radius + ' 0 ' + sweepString[quadrant] + ' ' + getDestinationPoint(quadrant, radius) +  ' z"';
    //var result = 'd="' + getMoveTo(index) + ' ' + getLineTo(maxRadius, quadrant) + ' a' + maxRadius + ',' + maxRadius + ' 0 ' + sweepString[quadrant] + ' ' + getDestinationPoint(quadrant, maxRadius) +  ' z"';
    return result;
}
function renderSemiCircle( index, value){
    var result = '<path ' + getSvgPathInstructionsForSemiCircle (index, value) + ' ' + getFill(index) + ' stroke="black" stroke-width="2" />';
    console.log(result);
    return result;
}

