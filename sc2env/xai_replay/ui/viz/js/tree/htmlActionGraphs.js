


var indexNexusHealthTop =    { "agent":63, "enemy":65 };
var indexNexusHealthBottom = { "agent":64, "enemy":66 };  

function getFriendlyGraphString(data, unitValuesDict, biggestUnitCount){
    var unitPlusGapWidth = unitRowsWidth / biggestUnitCount;
    var unitWidth = unitPlusGapWidth - unitGapWidth;
    if (unitWidth < unitGapWidth) {
        unitWidth = unitGapWidth;
    }
    var result =  '<div class="flex-column" style="margin:30px;height:' + actionNodeSharedContentHeight + 'px;width:' + actionNodeContentWidth + 'px;">' + 
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
    var result =  '<div class="flex-column" style="margin:30px;height:' + actionNodeSharedContentHeight + 'px;width:' + actionNodeContentWidth + 'px;">' + 
            getTransparentTopSpacer() + 
            getHpPlusUnitRow(43,"enemy","TOP",unitValuesDict, unitWidth, data["state"][indexNexusHealthTop["enemy"]]) + 
            getLaneBorder(2) +
            getHpPlusUnitRow(43,"enemy","BOT",unitValuesDict, unitWidth, data["state"][indexNexusHealthBottom["enemy"]]) + 
            getSpacerPlusPylonsRow(12,"enemy",unitValuesDict) + 
        '</div>';
    return result;
}

function getTransparentTopSpacer() {
    return '<div style="height:40px;width:100%"></div>';
}
function getLaneBorder(heightPercent){
    return '<div style="background-color:' + laneBorderColor + ';width:100%;height:' + heightPercent + '%;"></div>';
}

function getHpPlusUnitRow(percentHeight, player, lane, unitValuesDict, unitWidth, nexusHealth){
    var result = undefined;
    var paddingTopPercent = 1;
    percentHeight = percentHeight - paddingTopPercent;
    if (player == "agent"){
        //result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-image: linear-gradient(to right, #8080F0 , #F0F0F0);padding-top:' + paddingTopPercent + '%;">' + getNexusHealth(nexusHealth) + getVerticalSeparator() + getUnitsRows(player, lane, unitValuesDict, unitWidth) + '</div>';
        //result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color: #8080F0;padding-top:' + paddingTopPercent + '%;">' + getNexusHealth(nexusHealth) + getVerticalSeparator() + getUnitsRows(player, lane, unitValuesDict, unitWidth) + '</div>';
        result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color: ivory;padding-top:' + paddingTopPercent + '%;">' +
          getNexusHealth(nexusHealth, getPlayerColor("agent")) + 
          getVerticalSeparator() + 
          getUnitsRows(player, lane, unitValuesDict, unitWidth) + '</div>';
    }
    else{
        //result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-image: linear-gradient(to left, #F08080 , #F0F0F0);padding-top:' + paddingTopPercent + '%;">' + getUnitsRows(player, lane, unitValuesDict, unitWidth) + getVerticalSeparator() + getNexusHealth(nexusHealth) + '</div>';
        //result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color: #F08080;padding-top:' + paddingTopPercent + '%;">' + getUnitsRows(player, lane, unitValuesDict, unitWidth) + getVerticalSeparator() + getNexusHealth(nexusHealth) + '</div>';
        result = '<div class="flex-row" style="width:100%;height:' + percentHeight + '%;background-color: ivory;padding-top:' + paddingTopPercent + '%;">' + 
            getUnitsRows(player, lane, unitValuesDict, unitWidth) + 
            getVerticalSeparator() + 
            getNexusHealth(nexusHealth, getPlayerColor("enemy")) + '</div>';
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
                getUnitsRow(33,player, lane, "Marines",   unitValuesDict, marineColor,   unitWidth, "margin-bottom") + 
                getUnitsRow(33,player, lane, "Banelings", unitValuesDict, banelingColor, unitWidth, "margin-bottom") + 
                getUnitsRow(33,player, lane, "Immortals", unitValuesDict, immortalColor, unitWidth, "margin-bottom") + 
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
        unitDivString += '<div style="width:' + unitWidth + 'px;border:8px solid orange;background-color:' + color + ';' + unitMargin + '"></div>'
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
    var result = undefined;
    if (player == "agent"){
        result = '<div class="flex-row" style="height:' + percentHeight + '%;margin-top:15px;">' + 
            getSpacerForUnderNexusHealth() + 
            getStatePylons(stateCount) + 
            getActionPylons(actionCount) + 
            getPlaceHolderPylons(placeHolderCount) + 
            '</div>';
    }
    else {
        result = '<div class="flex-row" style="height:' + percentHeight + '%;margin-top:15px;">' + 
            getPlaceHolderPylons(placeHolderCount) + 
            getActionPylons(actionCount) + 
            getStatePylons(stateCount) + 
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

function getStatePylons(pylonCount){
    return getPylonThingString(pylonCount, "yellow", "yello");
}
  
function getActionPylons(pylonCount){
    return getPylonThingString(pylonCount, "yellow", "black");
}
  
function getPlaceHolderPylons(placeHolderCount){
    return getPylonThingString(placeHolderCount, "rgba(255,255,0,.30)", "yellow");
}

function getPylonThingString(count, backgroundColor, borderColor){
    var pylonString = "";
    var margins = 'margin-left:' + pylonMarginSide + 'px;margin-right:' + pylonMarginSide + 'px;margin-top:' + pylonMarginVertical + 'px;margin-bottom:' + pylonMarginVertical + 'px;';
    for (var i = 0; i < count; i++){
        pylonString += '<div style="text-align:center;border: 8px solid ' + borderColor + ';background-color:' + backgroundColor + ';height:35px;' + margins + 'width:' + pylonWidth + 'px"></div>';
    }
    return pylonString;
}
  
function getNexusHealth(nexusHealth, color){
    var nexusHealthPercent = (nexusHealth/2000) * 100;//margin-left:' + nexusHealthMargin + 'px
    return '<div class="flex-column" style="border:' + nexusHealthBorderWidth + 'px solid #80E080;height:100%; width:' + nexusHealthBarWidth + 'px;" >' + getNexusHealthBarPart(100 - nexusHealthPercent, 'white') + getNexusHealthBarPart(nexusHealthPercent, color) + '</div>';
}

function getNexusHealthBarPart(percentHeight, color){
    return '<div style="height:' + percentHeight + '%;width:100%;background-color:' + color + '";></div>'
}

