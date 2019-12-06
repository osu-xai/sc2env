var unitLocationMarkerIds = [];
//var selectedToolTipIds = {};
var entityAllDataToolTipIds = [];
var hoveredAllDataToolTipIds = {};
var unitLogStrings = {};

function createToolTips(unitInfo) {
    createUnitLocationMarks(unitInfo);
    createAllDataToolTip(unitInfo);
    gameboard_canvas.onmouseleave = function(evt) {
		hideAllTooltips(evt);
	};
}

function hideAllTooltips(evt) {
    for (var sId in hoveredAllDataToolTipIds) {
        if (hoveredAllDataToolTipIds[sId] != "hide") {
            var shapeId = sId;
            shapeId.replace("metadata_all","");
        }
        hoveredAllDataToolTipIds[sId] = "hide";
        $("#" + sId).addClass('tooltip-invisible');
    }
}
  
function cleanToolTips(){
    if (unitLocationMarkerIds != undefined) {
        for (var i in unitLocationMarkerIds){
            var id = unitLocationMarkerIds[i];
            $("#"+id).remove();
        }
        unitLocationMarkerIds = [];
    }
    if (entityAllDataToolTipIds != undefined){
        for (var i in entityAllDataToolTipIds){
            var id = entityAllDataToolTipIds[i];
            $("#"+id).remove();
        }
        entityAllDataToolTipIds = [];
    }
    hoveredAllDataToolTipIds = {};
  }
  
function createUnitLocationMarks(unitInfo) {
    var unit = unitInfo;    
    var hpDiv = document.createElement("div");
    // var setToShow = selectedToolTipIds[si.shapeId];
    // if (setToShow == undefined || setToShow == "hide"){
    //   hpDiv.setAttribute("class","tooltip-invisible");
    // }
    
    var id = "metadata_unitLocations" + unit["tag"];
    hpDiv.setAttribute("id",id);
        // position it relative to where origin of bounding box of gameboard is
    var y = translateUnitYToCanvasY(unitInfo.y); 
    var x = translateUnitXToCanvasX(unitInfo.x);
    var hpWidgetWidth = 8;
    var hpWidgetHeight = 8;
    hpDiv.setAttribute("style", 'background-color:white;position:absolute;z-index:' + zIndexMap["inFrontOfTooltipCanvas"] + ';left:' + x + 'px;top:' + y + 'px;color:' + getTooltipColorRGBAForUnit(unit) + ';height:' + hpWidgetHeight + 'px;width:' + hpWidgetWidth + 'px');
    $("#scaii-gameboard").append(hpDiv);

    var hpRemainingDivWidth = hpWidgetWidth * unit.percentHPRemaining;
    var hpLostDivWidth = hpWidgetWidth - hpRemainingDivWidth;
    unitLocationMarkerIds.push(id);
}

function getUnitIdFromTag(tag){
    var result = 'metadata_all'+tag;
    return result;
}
function createAllDataToolTip(unitInfo) { 
    var unit = unitInfo;
    var unitId = getUnitIdFromTag(unit.tag);
    var valuesDiv = document.createElement("div");
    var setToShow = hoveredAllDataToolTipIds[unitId];
    if (setToShow == undefined || setToShow == "hide"){
      valuesDiv.setAttribute("class","tooltip-invisible");
    }
    //console.log("allData tooltip id:" + id);
    hoveredAllDataToolTipIds[unitId] = "hide";
    valuesDiv.setAttribute("id",unitId);
     // position it relative to where origin of bounding box of gameboard is
    var y = translateUnitYToCanvasY(unit.y) + 20; 
    var x = translateUnitXToCanvasX(unit.x) + -125;
    valuesDiv.setAttribute("style", 'position:absolute;padding:4px;background-color:black;z-index:' + zIndexMap["tooltip"] + ';left:' + x + 'px;top:' + y + 'px;color:white;	display: flex;flex-direction: column;font-family:Arial');
    $("#scaii-gameboard").append(valuesDiv);
    entityAllDataToolTipIds.push(unitId);
  
    var tooltipInfo = {};
 
    tooltipInfo["Health Max"] = unit.health_max;
    tooltipInfo["Health"] = unit.health;
    tooltipInfo["Shield Max"] = unit.shield_max;
    tooltipInfo["Shield"] = unit.shield;
    tooltipInfo["Unit Type"] = unit.unit_type; //SC2_TODO_TT make unit_type name pretty in tooltip
    tooltipInfo["Friend?"] = getIsFriendlyFaction(unit.alliance,unit.shield);
    renderTooltipInfo(tooltipInfo, valuesDiv);
    unitLogStrings[unitId] = getShapeLogString(tooltipInfo);
}

// “unit_type”: 48 == Marine
// “unit_type”: 52 == Thor
// “unit_type”: 83 == Immoral
// “alliance” :1 == agent unit
// “alliance” :4 && “shield”: 1 == friendly unit  (Because pysc2 can not read the player id correctly, so I put the 1 shield to distinguish the friendly unit and enemy units.)
// “alliance” :4 == enemy
//
// SC2 relative faction:
//    0: background
//    1: self
//    2: ally
//    3: neutral
//    4: enemy
function getIsFriendlyFaction(alliance, shield){
    var result = "NA"
    if (alliance == 1){
        result = true;
    }
    else if (alliance == 2){
        result = true;
    }
    else if (alliance == 4 && shield == 1) {
        result = true;
    }
    else if (alliance == 4){
        result == false;
    }
    return result;
}
function getShapeLogString(tooltipInfo) {
    var result = "";
    var friend = tooltipInfo["Friend?"];
    if (friend == "true"){
        result = result + "friendly-";
    }
    else {
        result = result + "enemy-";
    }
    result = result + renameEntityInfoForIUI(tooltipInfo["Unit Type"]);
    return result;
}

// function gatherMapInfo(ttInfo, map, limitToTwoDecimals) {
//     var entryList = map.getEntryList();
//     for (var i in entryList ){
//         var entry = entryList[i];
//         var key = entry[0];
//         var val = entry[1];
//         // not sure why true/false were being handled as numbers given the limitToTwoDecimals should have caught it
//         if (val != "true"  && val != "false") {
//             if (limitToTwoDecimals) {
//                 val = (Number(val)).toFixed(2);
//             }
//         }
//         ttInfo[key] = val;
//     }
// }

function renderTooltipInfo(ttInfo, div) {
    var debugKeys = [];
    var nonDebugKeys = [];
    var keys = Object.keys(ttInfo);
    for (var i in keys) {
        var key = keys[i];
        if (key.startsWith('debug_')) {
            debugKeys.push(key);
        }
        else {
            nonDebugKeys.push(key);
        }
    }
    debugKeys.sort();
    nonDebugKeys.sort();
    // pull out friend/vs enemy and unit type to show first
    var friendLabel = getLabelForInfo(collectUnitInfoForConciseMessage(ttInfo, nonDebugKeys));
    div.append(friendLabel);

    // pull out hp values and print first
    var hpLabel = getLabelForInfo(collectValueOfMaxForConciseMessage(ttInfo, nonDebugKeys, "Health", "Health Max", "Health Points: "));
    div.append(hpLabel);

    // pull out hp values and print first
    // commenting this out for demo scenario because shield values are always 0, except for as a flag for enemy units turned friendly
    var shieldLabel = getLabelForInfo(collectValueOfMaxForConciseMessage(ttInfo, nonDebugKeys, "Shield", "Shield Max", "Shield: "));
//    div.append(shieldLabel);

    // fabricate damageDealt
    // var unitType = ttInfo["Unit Type"];
    // unitType = renameEntityInfoForIUI(unitType);
    // var damageDealtlabel = getLabelForInfo(getDamageDealtStringForUnit(unitType));
    // div.append(damageDealtlabel);

    for (var i in nonDebugKeys) {
        var key = nonDebugKeys[i];
        var val = ttInfo[key];
        div.append(createMetadataTooltipEntry(key, val));
    }
    for (var i in debugKeys) {
        var key = debugKeys[i];
        var val = ttInfo[key];
        div.append(createMetadataTooltipEntry(key, val));
    }
}
var xaiStudyId = "year2November";
if (xaiStudyId == "year1FourQuadrant"){
    tooltipInfo["Health Max"] = unit.health_max;
    tooltipInfo["Health"] = unit.health;
    tooltipInfo["Unit Type"] = unit.unit_type; //SC2_TODO_TT make unit_type name pretty in tooltip
    tooltipInfo["Friend?"] = getIsFriendlyFaction(unit.alliance);
}


function getLabelForInfo(s){
    var label = document.createElement("div");
    label.innerHTML = s;
    return label;
}
function getDamageDealtStringForUnit(unitType){ // SC2_TODO_TT - map damage dealt strings for SC2
    var result = "Attack Damage per step: ";
    if (unitType == "Tank"){
        return result + "Low";
    }
    else if (unitType == "City"){
        return result + "None (0)";
    }
    else if (unitType == "Town"){
        return result + "None (0)";
    }
    else if (unitType == "Big Fort"){
        return result + "High";
    }
    else if (unitType == "Small Fort"){
        return result + "Low";
    }
    else {
        return result + "unknown";
    }
}

// “unit_type”: 48 == Marine
// “unit_type”: 52 == Thor
// “unit_type”: 83 == Immoral
// “alliance” :1 == agent unit
// “alliance” :4 && “shield”: 1 == friendly unit  (Because pysc2 can not read the player id correctly, so I put the 1 shield to distinguish the friendly unit and enemy units.)
// “alliance” :4 == enemy
//
function collectUnitInfoForConciseMessage(ttInfo, nonDebugKeys) {
    var isFriend = ttInfo["Friend?"];
    index = nonDebugKeys.indexOf("Friend?");
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }
    index = nonDebugKeys.indexOf("Enemy?");
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }

    var unitType = ttInfo["Unit Type"];
    unitType = renameEntityInfoForIUI(unitType);
    index = nonDebugKeys.indexOf("Unit Type");
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }

    var friendLabel = document.createElement("div");
    if (isFriend == true){
        return "Name: Friendly " + unitType;
    }
    else {
        return "Name: Enemy " + unitType;
    }
}

function collectValueOfMaxForConciseMessage(ttInfo,nonDebugKeys, valueKey, maxKey, prompt){
    var hp = ttInfo[valueKey];
    var maxHp = ttInfo[maxKey];
    var index = nonDebugKeys.indexOf(valueKey);
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }
    index = nonDebugKeys.indexOf(maxKey);
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }
    var hpFloored = Math.floor(Number(hp));
    var maxHpFloored = Math.floor(Number(maxHp));
    var hpString =  prompt + hpFloored + " of " + maxHpFloored;
    return hpString;
}

// “unit_type”: 48 == Marine
// “unit_type”: 52 == Thor
// “unit_type”: 83 == Immoral
// “alliance” :1 == agent unit
// “alliance” :4 && “shield”: 1 == friendly unit  (Because pysc2 can not read the player id correctly, so I put the 1 shield to distinguish the friendly unit and enemy units.)
// “alliance” :4 == enemy
//
function renameEntityInfoForIUI(s) { //SC2_TODO_TT - rename unit types for SC2
    if (s == "48"){
        return "Marine";
    }
    else if (s == "9"){
        return "Baneling";
    }
    if (s == "83"){
        return "Immortal";
    }
    else {
        return s;
    }
}
function createMetadataTooltipEntry(key, val) {
    var label = document.createElement("div");
    label.innerHTML = key + ':' + val;
    return label;
}