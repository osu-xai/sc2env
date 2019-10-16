

function getStateString(data, unitValuesDict) {
    //return '<div style="display:grid;grid-gap:50px;grid-template-columns:auto auto;">' + '<div style="color:ivory;font-size:120px;font-weight:bold;position:absolute;top:0%;left:8%;">FRIENDLY</div>' + getFriendlyGraphString(data, unitValuesDict, biggestUnitCount) + '<div style="color:ivory;font-size:120px;font-weight:bold;position:absolute;top:0%;left:60%;">ENEMY</div>' + getEnemyGraphString(data, unitValuesDict["Enemy"], biggestUnitCount) + '</div>';
    //return '<div class="flex-column" style="margin:50px;" onload="finishInit("' + data.id + '")">' + getPlayerTitlesRow() + getGameStateRow(data) + getPylonsRow(unitValuesDict["Pylons State"], unitValuesDict["Enemy"]["Pylons State"]) + '</div>'
    return '<div class="flex-column" style="padding:20px;" onload="onloadTest">' + getPlayerTitlesRow() + getGameStateRow(data) + getPylonsRow(unitValuesDict["Pylons State"], unitValuesDict["Enemy"]["Pylons State"]) + '</div>';
}

function getGameStateRow(data){
    return '<div class="flex-row" >' + getNexusStates(data,63,64,"agent") + getUnitCountsSvg(data) + getNexusStates(data,65,66,"enemy") + '</div>';
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
    return '<div style="background-color:white"><svg height="' + armyStrengthHeight + '" width="' + armyStrengthWidth + '" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + renderUnitsOnField(state) + '</svg></div>';
 
}

function getNexusStates(data, topIndex, bottomIndex, player){
    return '<div class="flex-column" id="' + data.id + '_nexus_graph_container" style="height:' + armyStrengthHeight + ';">' +
            getNexusHealth(data["state"][topIndex], getPlayerColor(player)) +
            '<div style="width:100%;background-color:black;height:10px"></div>' + 
            getNexusHealth(data["state"][bottomIndex],getPlayerColor(player)) +
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
    return '<div class="flex-row" style="width=100%;padding:10px;">' + getPlayerTitle("FRIENDLY", getPlayerColor("agent")) + getPlayerTitle("ENEMY", getPlayerColor("enemy")) + '</div>';
}

function getPlayerTitle(name, color){
    return '<div style="padding:10px;background-color:white;color:' + color + ';font-size:120px;font-weight:bold;width:50%;text-align:center">' + name + '</div>';
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
  