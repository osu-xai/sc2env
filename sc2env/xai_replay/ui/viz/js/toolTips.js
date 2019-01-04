var entityHPToolTipIds = [];
//var selectedToolTipIds = {};
var entityAllDataToolTipIds = [];
var hoveredAllDataToolTipIds = {};


function createToolTips(shapeInfo) {
    createHPToolTip(shapeInfo);
    createAllDataToolTip(shapeInfo);
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
    if (entityHPToolTipIds != undefined) {
        for (var i in entityHPToolTipIds){
            var id = entityHPToolTipIds[i];
            $("#"+id).remove();
        }
        entityHPToolTipIds = [];
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
  
function createHPToolTip(shapeInfo) {
    var si = shapeInfo;
    if (undefined != si.percentHPRemaining) {
        var canvas_bounds = gameboard_canvas.getBoundingClientRect();
        var hpDiv = document.createElement("div");
        // var setToShow = selectedToolTipIds[si.shapeId];
        // if (setToShow == undefined || setToShow == "hide"){
        //   hpDiv.setAttribute("class","tooltip-invisible");
        // }
        
        var id = "metadata_hp" + si.shapeId;
        hpDiv.setAttribute("id",id);
         // position it relative to where origin of bounding box of gameboard is
        var y = si.tooltipY + canvas_bounds.top;
        var x = si.tooltipX + canvas_bounds.left;
        var hpWidgetWidth = 20;
        var hpWidgetHeight = 3;
        hpDiv.setAttribute("class", "flex-row");
        hpDiv.setAttribute("style", 'background-color:black;position:absolute;left:' + x + 'px;top:' + y + 'px;color:' + si.colorRGBA + ';height:' + hpWidgetHeight + 'px;width:' + hpWidgetWidth + 'px');
        $("#scaii-gameboard").append(hpDiv);
    
        hpDiv.onclick = function(e) {
            highlightShapeForIdForClickCollectionFeedback(si.shapeId);
            var targetName = "hitpoints-" + getQuadrantName() + "-" + shapeLogStrings[si.shapeId];
            targetClickHandler(e, "clickHitPoints:" + targetName);
        };

        var hpRemainingDivWidth = hpWidgetWidth * si.percentHPRemaining;
        var hpLostDivWidth = hpWidgetWidth - hpRemainingDivWidth;
    
        var remainingHpDiv = document.createElement("div");
        remainingHpDiv.setAttribute("style", 'background-color:white;height:' + hpWidgetHeight + 'px;width:' + hpRemainingDivWidth + 'px');
        hpDiv.append(remainingHpDiv);
    
        entityHPToolTipIds.push(id);
      }
}

function createAllDataToolTip(shapeInfo) {
    var si = shapeInfo;
    var canvas_bounds = gameboard_canvas.getBoundingClientRect();
    var valuesDiv = document.createElement("div");
    var setToShow = hoveredAllDataToolTipIds[si.shapeId];
    if (setToShow == undefined || setToShow == "hide"){
      valuesDiv.setAttribute("class","tooltip-invisible");
    }
    var id = "metadata_all" + si.shapeId;
    //console.log("allData tooltip id:" + id);
    hoveredAllDataToolTipIds[id] = "hide";
    valuesDiv.setAttribute("id",id);
     // position it relative to where origin of bounding box of gameboard is
    var y = si.y + canvas_bounds.top + 20;
    var x = si.x + canvas_bounds.left + -125;
    valuesDiv.setAttribute("style", 'position:absolute;padding:4px;background-color:black;z-index:' + zIndexMap["tooltip"] + ';left:' + x + 'px;top:' + y + 'px;color:white;	display: flex;flex-direction: column;font-family:Arial');
    $("#scaii-gameboard").append(valuesDiv);
    entityAllDataToolTipIds.push(id);
  
    var tooltipInfo = {};
    gatherMapInfo(tooltipInfo, si.entity.stringmetadataMap, false)
    gatherMapInfo(tooltipInfo, si.entity.boolstringmetadataMap, valuesDiv, false);
    gatherMapInfo(tooltipInfo, si.entity.floatstringmetadataMap, valuesDiv, true);
    gatherMapInfo(tooltipInfo, si.entity.intmetadataMap, valuesDiv, false);
    gatherMapInfo(tooltipInfo, si.entity.boolmetadataMap, valuesDiv,false);
    gatherMapInfo(tooltipInfo, si.entity.floatmetadataMap, valuesDiv, true);
    renderTooltipInfo(tooltipInfo, valuesDiv);
    shapeLogStrings[si.shapeId] = getShapeLogString(tooltipInfo);
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

function gatherMapInfo(ttInfo, map, limitToTwoDecimals) {
    var entryList = map.getEntryList();
    for (var i in entryList ){
        var entry = entryList[i];
        var key = entry[0];
        var val = entry[1];
        // not sure why true/false were being handled as numbers given the limitToTwoDecimals should have caught it
        if (val != "true"  && val != "false") {
            if (limitToTwoDecimals) {
                val = (Number(val)).toFixed(2);
            }
        }
        ttInfo[key] = val;
    }
}

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
    var hpLabel = getLabelForInfo(collectHitpointsForConciseMessage(ttInfo, nonDebugKeys));
    div.append(hpLabel);

    // fabricate damageDealt
    var unitType = ttInfo["Unit Type"];
    unitType = renameEntityInfoForIUI(unitType);
    var damageDealtlabel = getLabelForInfo(getDamageDealtStringForUnit(unitType));
    div.append(damageDealtlabel);

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

function getLabelForInfo(s){
    var label = document.createElement("div");
    label.innerHTML = s;
    return label;
}
function getDamageDealtStringForUnit(unitType){
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
    if (isFriend == "true"){
        return "Name: Friendly " + unitType;
    }
    else {
        return "Name: Enemy " + unitType;
    }
}

function collectHitpointsForConciseMessage(ttInfo,nonDebugKeys){
    var hp = ttInfo["Hitpoints"];
    var maxHp = ttInfo["Max Hp"];
    var index = nonDebugKeys.indexOf("Hitpoints");
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }
    index = nonDebugKeys.indexOf("Max Hp");
    if (index > -1) {
        nonDebugKeys.splice(index, 1);
    }
    var hpFloored = Math.floor(Number(hp));
    var maxHpFloored = Math.floor(Number(maxHp));
    var hpString = "Health Points: " + hpFloored + " of " + maxHpFloored;
    return hpString;
}
function renameEntityInfoForIUI(s) {
    if (s == "Small Tower"){
        return "Small Fort";
    }
    else if (s == "Big Tower"){
        return "Big Fort";
    }
    if (s == "Small City"){
        return "Town";
    }
    else if (s == "Big City"){
        return "City";
    }
    else if (s == "Ship"){
        return "Tank";
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