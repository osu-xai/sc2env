

function getFriendlyGraphString(data, unitValuesDict, biggestUnitCount){
  return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto auto; height: 800; width: 800;">' +
            '<style>' + 
              '#' + data.id + '_nexus_graph_container ' + '{' +
                'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:start;' +
                'background-color: ivory; height:700px;width:100px; margin-top:140%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_nexus_graph_container">' +
              drawNexusHealth(data["state"][63]) +
              '<div style="background-color:black;"></div>' +
              drawNexusHealth(data["state"][64]) +
            '</div>' +
            '<style>' + 
              '#' + data.id + '_unit_graph_container ' + '{' +
                'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
                'background-color: ivory; height:700px;width:700px; margin-top:20%;' +
              '}' +
            '</style>' +
            '<div id="' + data.id + '_unit_graph_container">' +
              drawStateUnitDiv(unitValuesDict["TOP Marines State"]-unitValuesDict["TOP Marines Action"], "darkGrey") + drawActionUnitDiv(unitValuesDict["TOP Marines Action"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["TOP Marines State"], biggestUnitCount) +
              drawStateUnitDiv(unitValuesDict["TOP Banelings State"]-unitValuesDict["TOP Banelings Action"], "darkOrange") + drawActionUnitDiv(unitValuesDict["TOP Banelings Action"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["TOP Banelings State"], biggestUnitCount) +
              drawStateUnitDiv(unitValuesDict["TOP Immortals State"]-unitValuesDict["TOP Immortals Action"], "blue") + drawActionUnitDiv(unitValuesDict["TOP Immortals Action"], 'blue') + drawPlaceHolderDivs(unitValuesDict["TOP Immortals State"], biggestUnitCount) +
              '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
              drawStateUnitDiv(unitValuesDict["BOT Marines State"]-unitValuesDict["BOT Marines Action"], "darkGrey") + drawActionUnitDiv(unitValuesDict["BOT Marines Action"], 'darkGrey') + drawPlaceHolderDivs(unitValuesDict["BOT Marines State"], biggestUnitCount) +
              drawStateUnitDiv(unitValuesDict["BOT Banelings State"]-unitValuesDict["BOT Banelings Action"], "darkOrange") + drawActionUnitDiv(unitValuesDict["BOT Banelings Action"], 'darkOrange') + drawPlaceHolderDivs(unitValuesDict["BOT Banelings State"], biggestUnitCount) +
              drawStateUnitDiv(unitValuesDict["BOT Immortals State"]-unitValuesDict["BOT Immortals Action"], "blue") + drawActionUnitDiv(unitValuesDict["BOT Immortals Action"], 'blue') + drawPlaceHolderDivs(unitValuesDict["BOT Immortals State"], biggestUnitCount) +
            '</div>' +
            '<div></div>' +
            '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto; height: 70px;">' + 
              drawPylons(unitValuesDict["Pylons State"]) + drawPylonPlaceHolderDivs(unitValuesDict["Pylons State"]) + 
            '</div>' +
          '</div>';
}



function getEnemyGraphString(data, unitValuesDict, biggestUnitCount){
  return  '<div style="display: grid; grid-gap: 10px; grid-template-columns: auto auto; grid-template-rows: auto 70px; height: 800; width: 800;" >' +
            '<style>' + 
            '#' + data.id + '_unit_graph_container ' + '{' +
              'display: grid; grid-column-gap:8px; grid-row-gap: 20px; grid-template-rows: 94.5px 94.5px 94.5px 12px 94.5px 94.5px 94.5px; grid-template-columns:' + getColumnStylingString(biggestUnitCount) + ';' +
              'background-color: ivory; height:700px;width:700px;' +
            '}' +
          '</style>' +
          '<div id="' + data.id + '_unit_graph_container">' +
            drawPlaceHolderDivs(unitValuesDict["TOP Marines State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["TOP Marines Action"], 'darkGrey') + drawStateUnitDiv(unitValuesDict["TOP Marines State"]-unitValuesDict["TOP Marines Action"], "darkGrey") +
            drawPlaceHolderDivs(unitValuesDict["TOP Banelings State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["TOP Banelings Action"], "darkOrange") + drawStateUnitDiv(unitValuesDict["TOP Banelings State"]-unitValuesDict["TOP Banelings Action"], "darkOrange") +
            drawPlaceHolderDivs(unitValuesDict["TOP Immortals State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["TOP Immortals Action"], "blue") + drawStateUnitDiv(unitValuesDict["TOP Immortals State"]-unitValuesDict["TOP Immortals Action"], "blue") +
            '<div style="background-color:black; grid-column-end: span ' + biggestUnitCount + ';"></div>' +
            drawPlaceHolderDivs(unitValuesDict["BOT Marines State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["BOT Marines Action"], 'darkGrey') + drawStateUnitDiv(unitValuesDict["BOT Marines State"]-unitValuesDict["BOT Marines Action"], "darkGrey") +
            drawPlaceHolderDivs(unitValuesDict["BOT Banelings State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["BOT Banelings Action"], 'darkOrange') + drawStateUnitDiv(unitValuesDict["BOT Banelings State"]-unitValuesDict["BOT Banelings Action"], "darkOrange") + 
            drawPlaceHolderDivs(unitValuesDict["BOT Immortals State"], biggestUnitCount) + drawActionUnitDiv(unitValuesDict["BOT Immortals Action"], 'blue') + drawStateUnitDiv(unitValuesDict["BOT Immortals State"]-unitValuesDict["BOT Immortals Action"], "blue") +
          '</div>' +
          '<style>' + 
            '#' + data.id + '_nexus_graph_container ' + '{' +
              'display: grid; grid-template-rows: auto 12px auto; grid-template-columns: auto; justify-content:end;' +
              'background-color: ivory; height:700px;width:100px;' +
            '}' +
          '</style>' +
          '<div id="' + data.id + '_nexus_graph_container">' +
            drawNexusHealth(data["state"][65]) +
            '<div style="background-color:black;grid-row-end:span 1;"></div>' +
            drawNexusHealth(data["state"][66]) +
          '</div>' +
          '<div style="display: grid; grid-gap: 30px; grid-template-columns: auto auto auto;">' + 
            drawPylonPlaceHolderDivs(unitValuesDict["Pylons State"]) + drawPylons(unitValuesDict["Pylons State"]) + 
          '</div>' +
          '<div></div>' +
        '</div>';
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
      return '<div class="flex-column" style="margin:50px;" onload="onloadTest">' + getPlayerTitlesRow() + getGameStateRow(data) + getPylonsRow(unitValuesDict["Pylons State"], unitValuesDict["Enemy"]["Pylons State"]) + '</div><script>alert(' + data.id + ');</script>';
    }
}
var unitCountsCanvasWidth = 1600;
var unitCountsCanvasHeight = 800;
var nexusHealthWidth = 70;

var pylonLeftAndRightSpacerPercent = 10;
var pylonSetPercent                = 35;
var pylonTwixtSpacerPercent        = 10;
function getGameStateRow(data){
    return '<div class="flex-row" >' + getNexusStates(data,63,64) + getUnitCountsCanvas(data) + getNexusStates(data,65,66) + '</div>';
}

// function waitingForCanvasToBeAddedToDOM(canvasId, state){
//     var canvas = document.getElementById(canvasId);
//     if (canvas != undefined){
//         clearInterval(canvasScanners[canvasId]);
//         renderUnitsOnField(canvasId, state);
//     }
// }
// var canvasScanners = {};

function getUnitCountsCanvas(data){
    var canvasId = getArmyStrengthCanvasId(data.id);
    //canvasScanners[canvasId] = setInterval(waitingForCanvasToBeAddedToDOM(canvasId, data.state), 300);
    return '<canvas id="' + canvasId + '" style="background-color:white;height:' + unitCountsCanvasHeight + 'px;width:' + unitCountsCanvasWidth + 'px;"></canvas>';
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
    drawPylonPlaceHolderDivs(pylonState) + drawPylons(pylonState) + 
          '</div>';
}

function getPlayerTitlesRow() {
    return '<div class="flex-row" width=100%>' + getPlayerTitle("FRIENDLY") + getPlayerTitle("ENEMY") + '</div>';
}

function getPlayerTitle(name){
    return '<div style="color:ivory;font-size:120px;font-weight:bold;width:50%;text-align:center">' + name + '</div>';
}
  
function getNexusHealth(nexusHealth){
    var nexusHealthPercent = (nexusHealth/2000) * 100;
    return '<div class=flex-column" style="border:16px solid white;height:50%; width:' + nexusHealthWidth + 'px;" >' + getNexusHealthBarPart(100 - nexusHealthPercent, 'black') + getNexusHealthBarPart(nexusHealthPercent, 'green') + '</div>';
}

function getNexusHealthBarPart(percentHeight, color){
    return '<div style="height:' + percentHeight + '%;width:100%;background-color:' + color + '";></div>'
}

function drawNexusHealth(nexusHealth){
  var nexusHealthPercent = (1-(nexusHealth/2000)) * 100;
  return '<div style="bottom:0%;background-color:green;margin:10px;width:50px;"><div style="background-color:ivory;margin:2.5px;position:relative;width:45px;height:' + nexusHealthPercent + '%;"></div></div>';
}

function drawPylons(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for (var i = 0; i < pylonCount; i++){
      //pylonString += '<div style="position:absolute;text-align:center;background-color:yellow;height:25px;margin:15px;"></div>';
      pylonString += '<div style="text-align:center;background-color:yellow;height:35px;margin:15px;"></div>';
    }
  return pylonString;
}

function drawPylonPlaceHolderDivs(pylonCount){
  var pylonString = "";
  var maxPylons = 3;
  for(var i = 0; i < (maxPylons-pylonCount); i++){
      pylonString += '<div style="border: 4px solid yellow;background-color:rgba(255,255,0,.30);height:35px;margin:15px;"></div>'
  }
  return pylonString;
}
  

function drawActionUnitDiv(unitCount, color){
  var unitDivString = "";
  for(var i = 0; i < unitCount; i++){
      unitDivString += '<div style="text-align:center;border:15px solid black;background-color:' + color + ';"></div>'
  }
  return unitDivString;
}

function drawStateUnitDiv(unitCount, color){
  var unitStateDivString = "";
  for(var i = 0; i < unitCount; i++){
      unitStateDivString += '<div style="text-align:center;background-color:' + color + ';"></div>'
  }
  return unitStateDivString;
}

function drawPlaceHolderDivs(unitCount, colCount){
  var placeholder = "";
  for(var i = 0; i < (colCount-unitCount); i++){
      placeholder += '<div style="background-color:rgba(0,0,0,0);"></div>'
  }
  return placeholder
}
  
function getColumnStylingString(biggestUnitCount){
  var columsString = "";
  for (var i = 0; i < biggestUnitCount; i++){
      columsString += " auto";
  }
  return columsString
}

//var bestQValueColorPV = "rgba(255,140,26,1)";
//var bestQValueColor = "Turquoise";

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
 }
 
function setToModelBasedTreatment(){
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
}

function isTreatmentModelBased(){
    return (sc2Treatment == "ModelBased");
}