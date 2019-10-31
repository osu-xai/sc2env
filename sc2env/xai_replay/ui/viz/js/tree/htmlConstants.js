// generic nodes
var nodeBackgroundColor = "#A0A0A0";

// principa variation
var principalVariationBackgroundColor = "#606060";

var genericNodeHeight = 1200;
var genericNodeWidth = 1800;
var genericNodeBorderWidth = "10px";
var genericNodeBorderColor = "black";
var principalVariationEdgeWidth = 90;

// generic edges
var genericEdgeLineColor = nodeBackgroundColor;
var genericEdgeWidth = principalVariationEdgeWidth;

// how much of the node should be taken up vertically and horizontally
var portionOfNodeToUseVertically = {};
portionOfNodeToUseVertically["state"]          = 0.91;
portionOfNodeToUseVertically["friendlyAction"] = 0.96;
portionOfNodeToUseVertically["enemyAction"]    = 0.8;

var portionOfNodeToUseHorizontally = 0.92;

// state nodes
var stateNodeHeight = 1500;
var stateNodeWidth = 2000;
var playerTitleRowColor = "#DDDDDD";

// action nodes
var actionNodeWidth = 1700;

var friendlyActionNodeHeight = 2000;
var enemyActionNodeHeight = 1300;

var actionNodeBorderWidth = "50px";
var halfOfBothBorders = 25 + 25;
var actionNodeWidthPlusBorder = actionNodeWidth + 50;

var pHeightActionFriendlyTopSpacer           = 10;
var pHeightActionFriendlyKeyPlusUnits        = 22;// * 2
var pHeightActionFriendlyLaneBorder          = 1;
var pHeightActionFriendlySpacerAbovePylonRow = 2;
var pHeightActionFriendlyPylons              = 7;
var pHeightActionFriendlyQValue              = 11;
var pHeightActionFriendlyWinChance           = 25;

var pHeightActionEnemyKeyPlusUnits        = 35;// * 2
var pHeightActionEnemyLaneBorder          = 1;
var pHeightActionEnemySpacerAbovePylonRow = 2;
var pHeightActionEnemyPylons              = 8;
//var pHeightActionEnemyQValue              = 19;
            
var pWidthActionKey            = 7; 
var pWidthActionKeyCountSpacer = 1;  
var pWidthActionUnitRows       = 92; 



var unitRowsWidth = actionNodeWidth * portionOfNodeToUseHorizontally * (pWidthActionUnitRows / 100) ;



// user interactions
var userAddedNodeColor = "SlateBlue";
var selectedNodeColor = "PaleVioletRed";
var highlightedNodeColor = "navy";


// building counts
var laneBorderColor = "#404040";
var unitGapWidth = 20;
var fixedUnitWidth = 60;
var maxRenderableUnitCount = Math.floor(unitRowsWidth / (unitGapWidth  + fixedUnitWidth));


var marineColor = "#DDDDDD";
var banelingColor = "#AAAAAA";
var immortalColor = "#666666";


//state node units on field counts
var pHeightStateTitlesRow     = 12;
var pHeightStateArmyStringRow = 72;
var pHeightStateSpacerAbovePylonRow = 2
var pHeightStatePylonsRow     = 7; 
var pHeightStateQValRow       = 9;

var pWidthStateNexus      = 6; 
var pWidthStateUnitCounts = 88; 

// state node - nexus health
var pHeightStateNexusHealth  = 49; //*2
var pHeightStateNexusDivider = 2;
var nexusHealthBorderPercent = 8;
// state node pylons
var pWidthStatePylonSpacerLeft   = 6;
var pWidthStatePylonsFriendly    = 34;  
var pWidthStatePylonSpacerMiddle = 20; 
var pWidthStatePylonsEnemy       = 34;
var pWidthStatePylonSpacerRight  = 6;


var armyStrengthWidth = stateNodeWidth * portionOfNodeToUseHorizontally * (pWidthStateUnitCounts/100);
var armyStrengthHeight = stateNodeHeight * portionOfNodeToUseVertically["state"] * (pHeightStateArmyStringRow/100);

// pylons
var maxPylons = 3;
// pylons in action nodes

var pWidthActionPylonSpacer = 8; // *2
var pWidthActionPylonTrio = 80;
                
var pylonPaddingSide = 50;
var pylonPaddingVertical = 20;
// pylons in state nodes

// predicted win
var pWidthChartContent = 80;
var pWidthChartMargin  = 8; //*2

var chartHeight = friendlyActionNodeHeight * portionOfNodeToUseVertically["friendlyAction"] * (pHeightActionFriendlyWinChance / 100);
var chartWidth = actionNodeWidth * portionOfNodeToUseHorizontally * (pWidthChartContent/100);
var quadtrantDividerThickness = 20;
// Q value
var bestQValueColorPV = "white";
var bestQValueColor = "white";
var qPaddingTop = 25;
var qPaddingBottom = 40;
