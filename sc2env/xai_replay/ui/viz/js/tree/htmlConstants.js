// generic nodes
var nodeBackgroundColor = "#E0E0E0";
var genericNodeHeight = 1200;
var genericNodeWidth = 1800;
var genericNodeBorderWidth = "10px";
var genericNodeBorderColor = "black"

// generic edges
var genericEdgeLineColor = "#ffaaaa";

// state nodes
var stateNodeHeight = 1300;
var stateNodeWidth = 2000;

// action nodes
var friendlyActionNodeHeight = 1800;
var friendlyActionNodeWidth = 1700;

var actionNodeBorderWidth = "50px";
var actionNodeMargin = 50;
var actionNodeContentWidth = friendlyActionNodeWidth - actionNodeMargin;
var actionNodeSharedContentHeight = 800;

var enemyActionNodeWidth = 1700;

// principa variation
var principalVariationBackgroundColor = "#C0C0C0";

// user interactions
var userAddedNodeColor = "SlateBlue";
var selectedNodeColor = "PaleVioletRed";
var highlightedNodeColor = "navy";

// nexus health
var nexusHealthDivWidth = 80;
var nexusHealthMargin = 0;
var nexusHealthBorderWidth = 5;
var nexusHealthBarWidth = nexusHealthDivWidth - (2 * (nexusHealthBorderWidth + nexusHealthMargin));


// building counts
var laneBorderColor = "#404040";
var unitGapWidth = 10;
var verticalSeparatorWidth = 10;
var unitRowsWidth = actionNodeContentWidth - nexusHealthDivWidth - verticalSeparatorWidth;
var maxRenderableUnitCount = Math.floor(unitRowsWidth / (unitGapWidth * 2));

var marineColor = "#DDDDDD";
var banelingColor = "#AAAAAA";
var immortalColor = "#666666";


// units on field counts
var armyStrengthWidthPercent = 80;
var armyStrengthWidth = stateNodeWidth * (armyStrengthWidthPercent/100);
var armyStrengthHeight = 800;

// pylons
var maxPylons = 3;
// pylons in action nodes
var pylonMarginSide = 100;
var pylonMarginVertical = 10;
var pylonWidth = (unitRowsWidth - (pylonMarginSide * maxPylons)) / maxPylons ;
var pylonLeftAndRightSpacerPercent = 10;
// pylons in state nodes
var pylonSetPercent                = 35;
var pylonTwixtSpacerPercent        = 10;


// predicted win
var chartHeight = 500;
var percentWidthForChart = 80;
var percentWidthForChartLateralSpacer = (100 - percentWidthForChart)/2;
var chartWidth = actionNodeContentWidth * (percentWidthForChart / 100);

// Q value
var bestQValueColorPV = "white";
var bestQValueColor = "white";
var qMarginTop = 25;
var qMarginBottom = 40;

// dead code?

