
var indexNexusHealthTop =    { "agent":63, "enemy":65 };
var indexNexusHealthBottom = { "agent":64, "enemy":66 };  

var playerGraphWidth = 800;
var playerGraphHeight = 800;
var unitGapWidth = 10;
var maxPylons = 3;

var unitCountsCanvasWidth = 1600;
var unitCountsCanvasHeight = 800;
var nexusHealthDivWidth = 70;
var nexusHealthMargin = 10;
var nexusHealthBorderWidth = 10;
var verticalSeparatorWidth = 10;
var nexusHealthBarWidth = nexusHealthDivWidth - (2 * (nexusHealthBorderWidth + nexusHealthMargin));
var unitRowsWidth = playerGraphWidth - nexusHealthDivWidth - verticalSeparatorWidth;
var maxRenderableUnitCount = Math.floor(unitRowsWidth / (unitGapWidth * 2));

var laneBorderColor = "#404040";

var pylonLeftAndRightSpacerPercent = 10;
var pylonSetPercent                = 35;
var pylonTwixtSpacerPercent        = 10;

function getFriendlyGraphString(data, unitValuesDict, biggestUnitCount){
    var unitPlusGapWidth = unitRowsWidth / biggestUnitCount;
    var unitWidth = unitPlusGapWidth - unitGapWidth;
    if (unitWidth < unitGapWidth) {
        unitWidth = unitGapWidth;
    }
    var result =  '<div class="flex-column" style="height:' + playerGraphHeight + 'px;width:' + playerGraphWidth + 'px;">' + 
        getTransparentTopSpacer() + 
        getHpPlusUnitRow(41,"agent","TOP",unitValuesDict, unitWidth, data["state"][indexNexusHealthTop["agent"]]) + 
        getLaneBorder(2) +
        getHpPlusUnitRow(41,"agent","BOT",unitValuesDict, unitWidth, data["state"][indexNexusHealthBottom["agent"]]) + 
        getSpacerPlusPylonsRow(16,"agent",unitValuesDict) + 
        '</div>';
    return result;
}


function getEnemyGraphString(data, unitValuesDict, biggestUnitCount){
    var unitPlusGapWidth = unitRowsWidth / biggestUnitCount;
    var unitWidth = unitPlusGapWidth - unitGapWidth;
    if (unitWidth < unitGapWidth) {
        unitWidth = unitGapWidth;
    }
    var result =  '<div class="flex-column" style="height:' + playerGraphHeight + 'px;width:' + playerGraphWidth + 'px;">' + 
        getTransparentTopSpacer() + 
        getHpPlusUnitRow(41,"enemy","TOP",unitValuesDict, unitWidth, data["state"][indexNexusHealthTop["enemy"]]) + 
        getLaneBorder(2) +
        getHpPlusUnitRow(41,"enemy","BOT",unitValuesDict, unitWidth, data["state"][indexNexusHealthBottom["enemy"]]) + 
        getSpacerPlusPylonsRow(16,"enemy",unitValuesDict) + 
        '</div>';
    return result;
}

function getTransparentTopSpacer() {
    return '<div style="height:80px;width:100%"></div>';
}
function getLaneBorder(heightPercent){
    return '<div style="background-color:' + laneBorderColor + ';width:100%;height:' + heightPercent + '%;"></div>';
}
function getHpPlusUnitRow(percentHeight, player, lane, unitValuesDict, unitWidth, nexusHealth){
    var result = undefined;
    
    var paddingTopPercent = 1;
    percentHeight = percentHeight - paddingTopPercent;
    if (player == "agent"){
        result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color:ivory;padding-top:' + paddingTopPercent + '%;">' + getNexusHealth(nexusHealth) + getVerticalSeparator() + getUnitsRows(player, lane, unitValuesDict, unitWidth) + '</div>';
    }
    else{
        result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color:ivory;padding-top:' + paddingTopPercent + '%;">' + getUnitsRows(player, lane, unitValuesDict, unitWidth) + getVerticalSeparator() + getNexusHealth(nexusHealth) + '</div>';
    }
    return result;
}

function getVerticalSeparator(){
    return '<div style="height:100%;width:' + verticalSeparatorWidth + 'px;background-color:' + laneBorderColor + '"></div>';
}
function getUnitsRows(player, lane, unitValuesDict, unitWidth){
    var paddingLeft = 6;
    var unitRowsWidthSansPaddingLeft = unitRowsWidth - paddingLeft;
    var result = '<div class="flex-column" style="width:' + unitRowsWidthSansPaddingLeft + 'px;padding-left:' + paddingLeft + 'px">' + 
                getUnitsRow(33,player, lane, "Marines",   unitValuesDict, "darkGrey",   unitWidth, "margin-bottom") + 
                getUnitsRow(33,player, lane, "Banelings", unitValuesDict, "darkOrange", unitWidth, "margin-bottom") + 
                getUnitsRow(33,player, lane, "Immortals", unitValuesDict, "blue",       unitWidth, "margin-bottom") + 
           '</div>';
    return result;
}

function getUnitsRow(percentHeight,player, lane, UnitType, unitValuesDict, color, unitWidth, marginBottom){
    var stateKey = lane + " " + UnitType + " State";
    var actionKey = lane+ " " + UnitType + " Action";
    var stateCount = unitValuesDict[stateKey];
    var actionCount = unitValuesDict[actionKey];
    var curUnitCount = stateCount - actionCount;
    if (curUnitCount + actionCount > maxRenderableUnitCount){
        curUnitCount = maxRenderableUnitCount - actionCount;
    }
    var unitMargin = undefined;
    var result = undefined;
    if (player == "agent"){
        unitMargin = "margin-right:"+ unitGapWidth + "px;"
        result = '<div class="flex-row" style="height:' + percentHeight + '%;width:100%;' + marginBottom + ':3%">' + 
              getStateUnitRects(curUnitCount, color, unitWidth, unitMargin) + 
              getActionUnitRects(actionCount, color, unitWidth, unitMargin) + 
              '</div>'
        return result;
    }
    else {
        unitMargin = "margin-left:"+ unitGapWidth + "px;"
        result = '<div class="flex-row" style="height:' + percentHeight + '%;width:100%;' + marginBottom + ':3%;justify-content: flex-end;">' + 
            getActionUnitRects(actionCount, color, unitWidth, unitMargin) + 
            getStateUnitRects(curUnitCount, color, unitWidth, unitMargin) + 
        '</div>'
        return result;
    }
}

function getActionUnitRects(unitCount, color, unitWidth, unitMargin){
    var unitDivString = "";
    for(var i = 0; i < unitCount; i++){
        unitDivString += '<div style="width:' + unitWidth + 'px;border:8px solid black;background-color:' + color + ';' + unitMargin + '"></div>'
    }
    return unitDivString;
}
  
function getStateUnitRects(unitCount, color, unitWidth, unitMargin){
    var unitStateDivString = "";
    for(var i = 0; i < unitCount; i++){
        unitStateDivString += '<div style="width:' + unitWidth + 'px;background-color:' + color + ';' + unitMargin + '"></div>'
    }
    return unitStateDivString;
}


function getSpacerPlusPylonsRow(percentHeight, player, unitValuesDict){
    var stateCount = unitValuesDict["Pylons State"] - unitValuesDict["Pylons Action"];
    var actionCount = unitValuesDict["Pylons Action"];
    var placeHolderCount = maxPylons - (stateCount + actionCount);
    var margin = 25;
    var pylonWidth = (unitRowsWidth - (margin * maxPylons)) / maxPylons ;
    var result = undefined;
    if (player == "agent"){
        result = '<div class="flex-row" style="height:' + percentHeight + '%;margin-top:15px;">' + 
            getSpacerForUnderNexusHealth() + 
            getStatePylons(stateCount, pylonWidth, margin) + 
            getActionPylons(actionCount, pylonWidth, margin) + 
            getPlaceHolderPylons(placeHolderCount, pylonWidth, margin) + 
            '</div>';
    }
    else {
        result = '<div class="flex-row" style="height:' + percentHeight + '%;margin-top:15px;">' + 
            getPlaceHolderPylons(placeHolderCount, pylonWidth, margin) + 
            getActionPylons(actionCount, pylonWidth, margin) + 
            getStatePylons(stateCount, pylonWidth, margin) + 
            getSpacerForUnderNexusHealth() + 
            '</div>';
    }
    return result;
}

function getSpacerForUnderNexusHealth(){
    var width = nexusHealthDivWidth;
    var result = '<div style="width:' + width + 'px;"></div>';
    return result;
}

function getStatePylons(pylonCount, pylonWidth, margin){
    var pylonString = "";
    for (var i = 0; i < pylonCount; i++){
        //pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
        pylonString += '<div style="text-align:center;border: 8px solid yellow;background-color:yellow;height:35px;margin:' + margin + 'px;width:' + pylonWidth + 'px"></div>';
      }
    return pylonString;
}
  
  
function getActionPylons(pylonCount, pylonWidth, margin){
    var pylonString = "";
    for (var i = 0; i < pylonCount; i++){
        //pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
        pylonString += '<div style="text-align:center;border: 8px solid black;background-color:yellow;height:35px;margin:' + margin + 'px;width:' + pylonWidth + 'px"></div>';
      }
    return pylonString;
  }
  
  function getPlaceHolderPylons(placeHolderCount, pylonWidth, margin){
    var pylonString = "";
    for(var i = 0; i < placeHolderCount; i++){
        pylonString += '<div style="border: 8px solid yellow;background-color:rgba(255,255,0,.30);height:35px;margin:' + margin + 'px;width:' + pylonWidth + 'px"></div>'
    }
    return pylonString;
  }
    
  
function getNexusHealth(nexusHealth){
    var nexusHealthPercent = (nexusHealth/2000) * 100;
    return '<div class="flex-column" style="margin:' + nexusHealthMargin + 'px;border:' + nexusHealthBorderWidth + 'px solid green;height:85%; width:' + nexusHealthBarWidth + 'px;" >' + getNexusHealthBarPart(100 - nexusHealthPercent, 'white') + getNexusHealthBarPart(nexusHealthPercent, 'green') + '</div>';
}

function getNexusHealthBarPart(percentHeight, color){
    return '<div style="height:' + percentHeight + '%;width:100%;background-color:' + color + '";></div>'
}



function getNodeGlyphs(data, biggestUnitCount){
  var unitValuesDict = parseActionString(data);
  if (isFriendlyActionNode(data)){
      return getFriendlyGraphString(data, unitValuesDict, biggestUnitCount);
  }
  else if (isEnemyActionNode(data)){
      return getEnemyGraphString(data, unitValuesDict, biggestUnitCount);
  }
  else{
      //return '<div style="display:grid;grid-gap:50px;grid-template-columns:auto auto;">' + '<div style="color:ivory;font-size:120px;font-weight:bold;position:absolute;top:0%;left:8%;">FRIENDLY</div>' + getFriendlyGraphString(data, unitValuesDict, biggestUnitCount) + '<div style="color:ivory;font-size:120px;font-weight:bold;position:absolute;top:0%;left:60%;">ENEMY</div>' + getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCount) + '</div>';
      //return '<div class="flex-column" style="margin:50px;" onload="finishInit("' + data.id + '")">' + getPlayerTitlesRow() + getGameStateRow(data) + getPylonsRow(unitValuesDict["Pylons State"], unitValuesDict["Enemy"]["Pylons State"]) + '</div>'
      return '<div class="flex-column" style="margin:50px;" onload="onloadTest">' + getPlayerTitlesRow() + getGameStateRow(data) + getPylonsRow(unitValuesDict["Pylons State"], unitValuesDict["Enemy"]["Pylons State"]) + '</div>';
    }
}
function getGameStateRow(data){
    return '<div class="flex-row" >' + getNexusStates(data,63,64) + getUnitCountsSvg(data) + getNexusStates(data,65,66) + '</div>';
}

{/* <svg width="200" height="250" version="1.1" xmlns="http://www.w3.org/2000/svg">

<rect x="10" y="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>
<rect x="60" y="10" rx="10" ry="10" width="30" height="30" stroke="black" fill="transparent" stroke-width="5"/>

<circle cx="25" cy="75" r="20" stroke="red" fill="transparent" stroke-width="5"/>
<ellipse cx="75" cy="75" rx="20" ry="5" stroke="red" fill="transparent" stroke-width="5"/>

<line x1="10" x2="50" y1="110" y2="150" stroke="orange" stroke-width="5"/>
<polyline points="60 110 65 120 70 115 75 130 80 125 85 140 90 135 95 150 100 145"
    stroke="orange" fill="transparent" stroke-width="5"/>

<polygon points="50 160 55 180 70 180 60 190 65 205 50 195 35 205 40 190 30 180 45 180"
    stroke="green" fill="transparent" stroke-width="5"/>

<path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>
</svg> */}
function getUnitCountsSvg(data){
    var state = data.state;
    return '<div style="background-color:white"><svg height="' + unitCountsCanvasHeight + '" width="' + unitCountsCanvasWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + renderUnitsOnField(state) + '</svg></div>';
 
}

function getNexusStates(data, topIndex, bottomIndex){
    return '<div class="flex-column" id="' + data.id + '_nexus_graph_container" style="height:' + unitCountsCanvasHeight + ';">' +
            getNexusHealth(data["state"][topIndex]) +
            getNexusHealth(data["state"][bottomIndex]) +
    '</div>';
}

function getPylonsRow(friendlyPylonState, enemyPylonState) {
    return '<div class="flex-row" style ="width:100%;">' + getSpacerAsWideAsNexusHealth() + getPylonState(friendlyPylonState) +  getSpacerBetweenPylonSets() + getPylonState(enemyPylonState) + getSpacerAsWideAsNexusHealth() + '</div>';
}

function getSpacerBetweenPylonSets() {
    return '<div style="width:' + pylonTwixtSpacerPercent + '%"></div>';
}

function getSpacerAsWideAsNexusHealth() {
    return '<div style="width:' + pylonLeftAndRightSpacerPercent + '%;"></div>';
}
function getPylonState(pylonState){
    return '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto;width:' + pylonSetPercent + '%;">' + 
    drawPylonPlaceHolderDivs(pylonState) + drawStatePylons(pylonState) + 
          '</div>';
}

function getPlayerTitlesRow() {
    return '<div class="flex-row" width=100%>' + getPlayerTitle("FRIENDLY", getPlayerColor("agent")) + getPlayerTitle("ENEMY", getPlayerColor("enemy")) + '</div>';
}

function getPlayerTitle(name, color){
    return '<div style="color:' + color + ';font-size:120px;font-weight:bold;width:50%;text-align:center">' + name + '</div>';
}
  

function drawNexusHealth(nexusHealth){
  var nexusHealthPercent = (1-(nexusHealth/2000)) * 100;
  return '<div style="bottom:0%;background-color:green;margin:10px;width:50px;"><div style="background-color:ivory;margin:2.5px;position:relative;width:45px;height:' + nexusHealthPercent + '%;"></div></div>';
}

function drawStatePylons(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for (var i = 0; i < pylonCount; i++){
      //pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
      pylonString += '<div style="text-align:center;border: 8px solid yellow;background-color:yellow;height:35px;margin:15px;"></div>';
    }
  return pylonString;
}


function drawPylonPlaceHolderDivs(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for(var i = 0; i < (maxPylons-pylonCount); i++){
      pylonString += '<div style="border: 8px solid yellow;background-color:rgba(255,255,0,.30);height:35px;margin:15px;"></div>'
  }
  return pylonString;
}

var bestQValueColorPV = "white";
var bestQValueColor = "white";
// bestQvalue is the percolated back up value from the leaf.
function getBestQValue(data){
  // var afterStateQValue = data["after state q_value"];
  var bestStateQValue = data["best q_value"];
  var name = data["name"];
  if(data['root']){
    return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
  }
  // TODO refactor because do same for state and action
  if (name.indexOf("_action") != -1){
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          // others
          return '<div style="color:' + bestQValueColor + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
  else{
      //state
      if (name.indexOf("best") != -1){
          // principle variation
          return '<div style="color:' + bestQValueColorPV + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
      else{
          return '<div style="color:' + bestQValueColor + ';font-size:200px;text-align:center;">' + bestStateQValue.toFixed(5).replace(/^[0]+/, "") + '</div>';
      }
  }
}

function getChart(data){
    if (isFriendlyActionNode(data)){
        var chartData = data.chartData;
        if (chartData == undefined){
            alert("Chart Data undefined for friendly Action Node!");
            return "";
        }
        else {
            return getChartString(chartData);
        }
        
    }
    else {
        return "";
    }
}
function getChartString(chartData){
    // make chart container div with specific dimensions that is a flex-column
    var chartString = '<div class="flex-column" style="background-color:white;height: 400px; width: 800px;padding=30px;">' + getChartContentRow(chartData) + getXAxisRow() + '</div>';
    return chartString;
}
function getChartContentRow(chartData){
    // add flex-row that has  padding-left, then vertical line (y-axis), then spacer, then first four bar divs, then spacer, then next four divs, then padding-right
    var content = '<div class="flex-row" style="height: 80%; padding-left:20px; padding-top:20px; padding-right:20px;">' +
                getYAxis() + 
                getChartSpacer() +
                getBarDiv(chartData, 0) + 
                getBarDiv(chartData, 1) + 
                getBarDiv(chartData, 2) + 
                getBarDiv(chartData, 3) +
                getChartSpacer() +
                getBarDiv(chartData, 4) + 
                getBarDiv(chartData, 5) + 
                getBarDiv(chartData, 6) + 
                getBarDiv(chartData, 7) + 
                getChartSpacer() +
            '</div>';
    return content;
}
function getBarDiv(chartData, index){
    var bar = chartData[index];
    var value = bar["value"];
    var barPercent = value * 100;
    var spacerPercent = (1 - value) * 100;
    var barDiv = '<div class="flex-column" style="width:80px;height:100%;">' + getBarSpacer(spacerPercent) + getBar(barPercent, index) + '</div>'
    //var barDiv = '<div style="width:80px;height:100%;margin-top:' + spacerPercent + '%; background-color:'+ barColors[index] + '"></div>'
    return barDiv;
}

function getBar(percent, index){
    var bar = '<div class=' + barClass[index] + ' style="width:80px;height:' + percent + '%;"></div>';
    return bar;
}

function getBarSpacer(percent){
    var barSpacer = '<div style="width:80px;height:' + percent + '%;"></div>';
    return barSpacer;
}

function getChartSpacer() {
    var spacer = '<div style="width:80px;height:100%;"></div>'
    return spacer;
}
function getXAxisRow() {
    // add horizontal line (x axid)
    var xAxis = '<div style="width:100%;height:1px;background-color:black;"></div>'
    return xAxis;
}

function getYAxis() {
// add horizontal line (x axid)
    var yAxis = '<div style="width:1px;height:100%;background-color:black;"></div>'
    return yAxis;
}
 var barClass = {};
 barClass[0] = "agent-destroys-top";
 barClass[1] = "agent-destroys-bottom";
 barClass[2] = "enemy-lowest-nexus-top";
 barClass[3] = "enemy-lowest-nexus-bottom";
 barClass[4] = "enemy-destroys-top";
 barClass[5] = "enemy-destroys-bottom";
 barClass[6] = "agent-lowest-nexus-top";
 barClass[7] = "agent-lowest-nexus-bottom";


 var sc2Treatment = "ModelBased";

 function setToModelFreeTreatment(){
    controlsManager.setWaitCursor();
    sc2Treatment = "ModelFree";
    forgetCyTree();
    populatePrincipalVariationTrajectory(backingTreeRoot);
    var nodeMenuExist = document.getElementById("node-actions-label");
    if (nodeMenuExist == undefined){
        generateNodeActionMenu("node-menu");
    }
    cy = cytoscape(treeData);
    var rootNodeId = backingTreeRoot["data"]["id"];
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    checkMenuAvailibleActions(cy.getElementById(rootNodeId))
    cy.zoom({
        level: treeZoom
      });
    var panInfo = {};
    panInfo["x"] = treePanX;
    panInfo["y"] = treePanY;
    cy.pan(panInfo);
    controlsManager.clearWaitCursor()
 }
 
function setToModelBasedTreatment(){
    controlsManager.setWaitCursor();
    sc2Treatment = "ModelBased";
    forgetCyTree();
    populatePrincipalVariationTrajectory(backingTreeRoot);
    var nodeMenuExist = document.getElementById("node-actions-label");
    if (nodeMenuExist == undefined){
        generateNodeActionMenu("node-menu");
    }
    cy = cytoscape(treeData);
    var rootNodeId = backingTreeRoot["data"]["id"];
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    addNextBestChild(cy,cy.getElementById(rootNodeId));
    refreshCy();
    checkMenuAvailibleActions(cy.getElementById(rootNodeId))
    controlsManager.clearWaitCursor();
}

function isTreatmentModelBased(){
    return (sc2Treatment == "ModelBased");
}