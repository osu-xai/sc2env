

function getStateHtml(data, unitValuesDict) {
    var pylonCountFriendly = unitValuesDict["Pylons State"];
    var pylonCountEnemy = unitValuesDict["Enemy"]["Pylons State"];
    return '<div class="flex-column" style="width:100%;height:100%;" onload="onloadTest">' + 
        getPlayerTitlesRow(100,pHeightStateTitlesRow) + 
        getGameStateRow(   100,pHeightStateArmyStringRow,data) + 
        getSpacer(         100,pHeightStateSpacerAbovePylonRow) + 
        getStatePylonsRow( 100,pHeightStatePylonsRow, pylonCountFriendly, pylonCountEnemy) + 
        getBestQValue(     100,pHeightStateQValRow,      data) + 
        '</div>';
}

function getSpacer(pWidth, pHeight){
    return '<div style="width:' + pWidth + '%;height:' + pHeight + '%"></div>';
}
function getGameStateRow(pWidth, pHeight, data){
    return '<div class="flex-row" style="width:' + pWidth + '%;height:' + pHeight + '%">' + 
            getNexusStates(  pWidthStateNexus,     100,data,63,64,"agent") + 
            getUnitCountsSvg(pWidthStateUnitCounts,100,data) + 
            getNexusStates(  pWidthStateNexus,     100,data,65,66,"enemy") + 
            '</div>';
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
function getUnitCountsSvg(pWidth, pHeight, data){
    var state = data.state;
    return '<div style="width:' + pWidth + '%;height:' + pHeight + '%;background-color:white">' + 
                '<svg style="width:100%;height:100%;" fill="white" version="1.1" xmlns="http://www.w3.org/2000/svg">' + renderUnitsOnField(state) + '</svg>' +
            '</div>';
 
}

function getNexusStates(pWidth, pHeight, data, topIndex, bottomIndex, player){
    return '<div class="flex-column" id="' + data.id + '_nexus_graph_container" style="width:' + pWidth + '%;height:' + pHeight + '%;">' +
                getNexusHealthColumnInsideDiv(100,pHeightStateNexusHealth,data["state"][topIndex], getPlayerColor(player)) +
                getNexusHealthColumnDivider(100,pHeightStateNexusDivider) + 
                getNexusHealthColumnInsideDiv(100,pHeightStateNexusHealth,data["state"][bottomIndex],getPlayerColor(player)) +
            '</div>';
}

function getNexusHealthColumnDivider(pWidth, pHeight){
    return '<div style="width:' + pWidth + '%;background-color:black;height:' + pHeight + '%"></div>';
}
function getStatePylonsRow(pWidth, pHeight, friendlyPylonCount, enemyPylonCount) {
    return '<div class="flex-row" style ="width:' + pWidth + '%;height:' + pHeight + '%;">' + 
        getPylonSpacer(pWidthStatePylonSpacerLeft,  100) + 
        getPylonTrio( pWidthStatePylonsFriendly,   100, "agent", friendlyPylonCount, 0) +  
        getPylonSpacer(pWidthStatePylonSpacerMiddle,100) + 
        getPylonTrio( pWidthStatePylonsEnemy,      100, "enemy", enemyPylonCount, 0) +
        getPylonSpacer(pWidthStatePylonSpacerRight, 100, ) + '</div>';
}

function getPylonSpacer(pWidth, pHeight) {
    return '<div style="width:' + pWidth + '%;height:' + pHeight + '%;"></div>';
}

function getPlayerTitlesRow(pWidth, pHeight) {
    return '<div class="flex-row" style="box-sizing: border-box;width:' + pWidth + '%;height:' + pHeight + '%;padding:10px;background-color:' + playerTitleRowColor + '">' + 
           getPlayerTitle(50,100,"FRIENDLY", getPlayerColor("agent")) + 
           getPlayerTitle(50,100,"ENEMY", getPlayerColor("enemy")) + 
           '</div>';
}

function getPlayerTitle(pWidth, pHeight, name, color){
    return '<div style="background-color:' + playerNameBackgroundColor + ';color:' + color + ';font-size:80px;font-weight:bold;width:' + pWidth + '%;height:' + pHeight + '%;text-align:center">' + name + '</div>';
}
  
