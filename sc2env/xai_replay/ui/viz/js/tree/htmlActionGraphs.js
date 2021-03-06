


var indexNexusHealthTop =    { "agent":63, "enemy":65 };
var indexNexusHealthBottom = { "agent":64, "enemy":66 };  

function getFriendlyActionHtml(data, unitValuesDict, biggestUnitCount){
    var unitPlusGapWidth = unitRowsWidth / biggestUnitCount;
    var unitWidth = unitPlusGapWidth - unitGapWidth;
    if (unitWidth < unitGapWidth) {
        unitWidth = unitGapWidth;
    }
    var result =  '<div class="flex-column" style="height:100%;width:100%;">' + 
            getSpacer(         100,pHeightActionFriendlyTopSpacer) + 
            getKeyPlusUnitRow( 100,pHeightActionFriendlyKeyPlusUnits,"agent","TOP",unitValuesDict, unitWidth, data["state"][indexNexusHealthTop["agent"]]) + 
            getLaneBorder(     100,pHeightActionFriendlyLaneBorder) +
            getKeyPlusUnitRow( 100,pHeightActionFriendlyKeyPlusUnits,"agent","BOT",unitValuesDict, unitWidth, data["state"][indexNexusHealthBottom["agent"]]) + 
            getSpacer(         100,pHeightActionFriendlySpacerAbovePylonRow) + 
            getActionPylonsRow(100,pHeightActionFriendlyPylons,"agent",unitValuesDict) + 
            getBestQValue(     100,pHeightActionFriendlyQValue,data) + 
            getChart(          100,pHeightActionFriendlyWinChance,data) +
        '</div>';
    return result;
}

function getEnemyActionHtml(data, unitValuesDict, biggestUnitCount){
    var unitPlusGapWidth = unitRowsWidth / biggestUnitCount;
    var unitWidth = unitPlusGapWidth - unitGapWidth;
    if (unitWidth < unitGapWidth) {
        unitWidth = unitGapWidth;
    }
    var result =  '<div class="flex-column" style="height:100%;width:100%;">' + 
            getKeyPlusUnitRow( 100,pHeightActionEnemyKeyPlusUnits,"enemy","TOP",unitValuesDict, unitWidth, data["state"][indexNexusHealthTop["enemy"]]) + 
            getLaneBorder(     100,pHeightActionEnemyLaneBorder) +
            getKeyPlusUnitRow( 100,pHeightActionEnemyKeyPlusUnits,"enemy","BOT",unitValuesDict, unitWidth, data["state"][indexNexusHealthBottom["enemy"]]) + 
            getSpacer(         100,pHeightActionEnemySpacerAbovePylonRow) + 
            getActionPylonsRow(100,pHeightActionEnemyPylons,"enemy",unitValuesDict) + 
            //getBestQValue(     100,pHeightActionEnemyQValue,data) + 
        '</div>';
    return result;
}

function getLaneBorder(pWidth, pHeight){
    return '<div style="background-color:' + laneBorderColor + ';width:' + pWidth + '%;height:' + pHeight + '%;"></div>';
}

function getKeyPlusUnitRow(pWidth, pHeight, player, lane, unitValuesDict, unitWidth, nexusHealth){
    var result = undefined;
    if (player == "agent"){
        result = '<div class="flex-row" style="width:' + pWidth + '%;height:' + pHeight + '%;background-color: ivory;">' +
            // getNexusHealthColumn(pWidthActionKey,           100,nexusHealth, getPlayerColor("agent")) + 
            getShapeKeysColumn((pWidthActionKey/100)*actionNodeWidth,           (pHeightActionFriendlyKeyPlusUnits/100)*friendlyActionNodeHeight, getPlayerColor("agent")) + 
            getVerticalSeparator(pWidthActionKeyCountSpacer,100) + 
            getUnitsRows(        pWidthActionUnitRows,      100,player, lane, unitValuesDict, unitWidth) + '</div>';
    }
    else{
        result = '<div class="flex-row" style="width:' + pWidth + '%;height:' + pHeight + '%;background-color: ivory;padding-top;">' + 
            getUnitsRows(        pWidthActionUnitRows,      100,player, lane, unitValuesDict, unitWidth) + 
            getVerticalSeparator(pWidthActionKeyCountSpacer,100) + 
            getShapeKeysColumn((pWidthActionKey/100)*actionNodeWidth,           (pHeightActionEnemyKeyPlusUnits/100)*enemyActionNodeHeight - 50, getPlayerColor("enemy")) + '</div>';

            // getNexusHealthColumn(pWidthActionKey,           100,nexusHealth, getPlayerColor("enemy")) + '</div>';
    }
    return result;
}

function getVerticalSeparator(pWidth, pHeight){
    return '<div style="height:' + pHeight + '%;width:' + pWidth + '%;background-color:' + laneBorderColor + '"></div>';
}
function getUnitsRows(pWidth, pHeight, player, lane, unitValuesDict, unitWidth){
    var paddingLeft = 6;
    var playerColor = getPlayerColor(player);
    var result = '<div class="flex-column" style="box-sizing: border-box;width:' + pWidth + '%;height:' + pHeight + '%;padding-left:' + paddingLeft + 'px">' + 
                getUnitsRow(100,33.33,player, lane, "Marines",   unitValuesDict, playerColor,   unitWidth) + 
                getUnitsRow(100,33.33,player, lane, "Banelings", unitValuesDict, playerColor, unitWidth) + 
                getUnitsRow(100,33.33,player, lane, "Immortals", unitValuesDict, playerColor, unitWidth) + 
           '</div>';
    return result;
}

function getUnitsRow(pWidth, pHeight,player, lane, UnitType, unitValuesDict, color, unitWidth){
    // if owned + new <= width , straight layout
    // else
    //      if new > half avail space
    //          use right half for new + ...(#)
    //          use left half for owned + ...(#)
    //      else 
    //          paint new on right
    //          use remaining space to show owned ... (#)
    var stateKey = lane + " " + UnitType + " State";
    var actionKey = lane+ " " + UnitType + " Action";
    var actionCount = unitValuesDict[actionKey];
    var stateCount = unitValuesDict[stateKey] - actionCount;// Nick's fix
    var curUnitCount = stateCount - actionCount;
    if (maxRenderableUnitCount >= stateCount){
        return getSimpleUnitsRow(pWidth, pHeight,player, color, stateCount, actionCount);
    }
    else {
        // need to use summary view
        return getSummaryUnitsRow(pWidth, pHeight,player, color, stateCount, actionCount)
    }
}

function getSummaryUnitsRow(pWidth, pHeight,player, color, stateCount, actionCount){
    var halfMaxUnitCount = Math.floor(maxRenderableUnitCount / 2);
    var maxUnitsToShowInEachHalf = halfMaxUnitCount - 5;
    var ownedXOffsets = [];
    var newXOffsets = [];
    var indexOfNewTotal = undefined;
    var indexOfNewDots = undefined;
    var indexOfOwnedDots = undefined;
    var indexOfOwnedTotal = undefined;
    if (player == "agent"){
        var startingOwnedIndex = 0;
        var endingDisplayedOwnedIndex = Math.min(stateCount, maxUnitsToShowInEachHalf);
        indexOfOwnedDots = endingDisplayedOwnedIndex;
        indexOfOwnedTotal = indexOfOwnedDots + 3;
        for (var i = startingOwnedIndex; i < endingDisplayedOwnedIndex; i ++){
            ownedXOffsets.push(i);
        }
        var startingNewIndex = halfMaxUnitCount;
        var endingDisplayedNewIndex = Math.min(startingNewIndex + actionCount, startingNewIndex + maxUnitsToShowInEachHalf)
        indexOfNewDots = endingDisplayedNewIndex;
        indexOfNewTotal = indexOfNewDots + 3;
        for (var i = startingNewIndex; i < endingDisplayedNewIndex; i++){
            newXOffsets.push(i);
        }
    }
    else {
        var max = maxRenderableUnitCount;
        var startingOwnedIndex = maxRenderableUnitCount;
        var endingDisplayedOwnedIndex = Math.max(max - stateCount, max - maxUnitsToShowInEachHalf);
        indexOfOwnedDots = endingDisplayedOwnedIndex  - 1;
        indexOfOwnedTotal = indexOfOwnedDots - 2;
        for (var i = startingOwnedIndex; i > endingDisplayedOwnedIndex; i--){
            ownedXOffsets.push(i);
        }
        var startingNewIndex = halfMaxUnitCount;
        var endingDisplayedNewIndex = Math.max(startingNewIndex - actionCount, startingNewIndex - maxUnitsToShowInEachHalf);
        indexOfNewDots = endingDisplayedNewIndex - 1;
        indexOfNewTotal = indexOfNewDots - 2;
        for (var i = startingNewIndex; i > endingDisplayedNewIndex; i--){
            newXOffsets.push(i);
        }
    }
    result = '<div style="box-sizing: border-box;height:' + pHeight + '%;width:' + pWidth + '%;padding-top:1%">' + 
        '<svg style="width:100%;height:100%;" fill="white"version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        
        getSvgUnits(ownedXOffsets, newXOffsets, color) + 
        getDots(indexOfOwnedDots, indexOfOwnedTotal, stateCount, maxUnitsToShowInEachHalf, player) + 
        getDots(indexOfNewDots, indexOfNewTotal, actionCount, maxUnitsToShowInEachHalf, player) +
        '</svg>' +
    '</div>'
    return result;
}

function getDots(indexOfDots, indexOfTotal, count, maxUnitsToShowInEachHalf, player){
    if (count <= maxUnitsToShowInEachHalf){
        return '';
    }
    
    var interDotDistance = 60;
    var unitPlusGapWidth  = fixedUnitWidth + unitGapWidth
    var x1 = indexOfDots * unitPlusGapWidth + (interDotDistance / 2);
    if (player == "enemy"){
        x1 = x1 - interDotDistance;
    }
    var x2 = x1 + interDotDistance;
    var x3 = x2 + interDotDistance;
    var xTotal = indexOfTotal * unitPlusGapWidth;
    var y = 60;
    var radius = 14;
    var textY = 90;   // 280, 340, 400   textis 
    var fontSize = 80;
    var result = '<circle cx="' + x1 + '" cy="' + y + '" r="' + radius + '" fill="black"/>' +
                 '<circle cx="' + x2 + '" cy="' + y + '" r="' + radius + '" fill="black"/>' +
                 '<circle cx="' + x3 + '" cy="' + y + '" r="' + radius + '" fill="black"/>' +
                 '<text x="' + xTotal + '" y="' + textY + '" font-size="' + fontSize + '" font-weight="bold" style="fill:black;" >' + count + '</text>';
    return result;
}
function getSimpleUnitsRow(pWidth, pHeight, player, color, stateCount, actionCount){
    var ownedXOffsets = [];
    var newXOffsets = [];
    if (player == "agent"){
        for (var i = 0; i < stateCount; i ++){
            ownedXOffsets.push(i);
        }
        for (var i = stateCount; i < stateCount + actionCount; i++){
            newXOffsets.push(i);
        }
    }
    else {
        var max = maxRenderableUnitCount
        for (var i = max; i > max - stateCount; i--){
            ownedXOffsets.push(i);
        }
        for (var i = max - stateCount; i > max - stateCount - actionCount; i--){
            newXOffsets.push(i);
        }
    }
    result = '<div style="box-sizing: border-box;height:' + pHeight + '%;width:' + pWidth + '%;padding-top:1%">' + 
        '<svg style="width:100%;height:100%;" fill="white"version="1.1" xmlns="http://www.w3.org/2000/svg">' +
        
        getSvgUnits(ownedXOffsets, newXOffsets, color) + 
        '</svg>' +
    '</div>'
    return result;
}

function getSvgUnits(ownedXOffsets, newXOffsets, color){
    var result = '';
    for (var index in ownedXOffsets){
        var ownedUnitIndex = ownedXOffsets[index];
        var xOrigin = ownedUnitIndex * (fixedUnitWidth + unitGapWidth);
        result += '<rect style="fill:' + color + '" x="' + xOrigin + '" y="5" width="' + fixedUnitWidth + '" height="85%" stroke="' + color + '" stroke-width="1"/>';
    }
    for (var index in newXOffsets){
        var newUnitIndex = newXOffsets[index];
        var xOrigin = newUnitIndex * (fixedUnitWidth + unitGapWidth);
        result += '<rect style="fill:' + color + '" x="' + xOrigin + '" y="5" width="' + fixedUnitWidth + '" height="85%" stroke="black" stroke-width="10"/>';
    }
    return result;
}

function getUnitsRowOld(pWidth, pHeight,player, lane, UnitType, unitValuesDict, color, unitWidth){
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
        result = '<div class="flex-row" style="box-sizing: border-box;height:' + pHeight + '%;width:' + pWidth + '%;padding-bottom:3%">' + 
              getStateUnitRects(curUnitCount, color, unitWidth, unitMargin) + 
              getActionUnitRects(actionCount, color, unitWidth, unitMargin) + 
              '</div>'
        return result;
    }
    else {
        unitMargin = "margin-left:"+ unitGapWidth + "px;"
        result = '<div class="flex-row" style="box-sizing: border-box;height:' + pHeight + '%;width:100%;padding-bottom:3%;justify-content: flex-end;">' + 
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


function getActionPylonsRow(pWidth, pHeight, player, unitValuesDict){
    var currentCount = unitValuesDict["Pylons State"] - unitValuesDict["Pylons Action"];
    var newCount = unitValuesDict["Pylons Action"];
    var result = undefined;
    if (player == "agent"){
        result = '<div class="flex-row" style="width:' + pWidth + '%;height:' + pHeight + '%;">' + 
                getPylonSpacer(pWidthActionPylonSpacer,100) + 
                getPylonTrio(pWidthActionPylonTrio, 100,player, currentCount, newCount) + 
                getPylonSpacer(pWidthActionPylonSpacer, 100) + 
            '</div>';
    }
    else {
        result = '<div class="flex-row" style="width:' + pWidth + '%;height:' + pHeight + '%;">' + 
                getPylonSpacer(pWidthActionPylonSpacer, 100)+ 
                getPylonTrio(pWidthActionPylonTrio,100, player, currentCount, newCount) + 
                getPylonSpacer(pWidthActionPylonSpacer, 100) +
            '</div>';
    }
    return result;
}

var pylonBorderColor = {}
pylonBorderColor["current"] = "yellow";
pylonBorderColor["new"] = "black";
pylonBorderColor["missing"] = "rgba(255,255,0,0.4)";


var pylonBackgroundColor = {}
pylonBackgroundColor["current"] = "yellow";
pylonBackgroundColor["new"] = "yellow";
pylonBackgroundColor["missing"] = "#B0B0B0";

function getStylingIndicesForPlayer(player, currentCount, newCount){
    var missingCount = maxPylons - currentCount - newCount;
    var indices = [];
    if (player == "agent"){
        // order is current, new, missing
        addIndexForCount(indices, "current", currentCount);
        addIndexForCount(indices, "new",     newCount);
        addIndexForCount(indices, "missing", missingCount);
    }
    else {
        // order is missing, new, current
        addIndexForCount(indices, "missing", missingCount);
        addIndexForCount(indices, "new",     newCount);
        addIndexForCount(indices, "current", currentCount);
    }
    return indices;
}
function addIndexForCount(indices, index, count){
    for (i = 0; i < count; i++){
        indices.push(index);
    }
}
function getPylonTrio(pWidth, pHeight, player, currentCount, newCount){
    var stylingIndices = getStylingIndicesForPlayer(player, currentCount, newCount);
    var paddings = 'padding-left:' + pylonPaddingSide + 'px;padding-right:' + pylonPaddingSide + 'px;padding-top:' + pylonPaddingVertical + 'px;padding-bottom:' + pylonPaddingVertical + 'px;';
    
    var result = '<div style="width:' + pWidth + '%;height:' + pHeight +'%;"> <div class="flex-row" style="width:100%;height:100%;">';
    if (player == "agent"){
        var marginDirection = 'margin-right';
    }
    else {
        var marginDirection = 'margin-left';
    }
    for (i = 0; i < maxPylons; i++){
        var borderColor = pylonBorderColor[stylingIndices[i]];
        var backgroundColor = pylonBackgroundColor[stylingIndices[i]];
        result += '<div style="box-sizing: border-box;background-color:' + borderColor + ';width:25%;' + marginDirection + ':8%;height:100%;' + paddings + '" >' +
                     '<div style="text-align:center;background-color:' + backgroundColor + ';height:100%;width:100%;"></div>' + 
                '</div>';
    }
    result += '</div></div>';
    return result;
}

function getShapeKeysColumn(pWidth, pHeight, color){
    return '<div class="flex-column" style="box-sizing: border-box;padding:' + nexusHealthBorderPercent +'"> \
                <svg width="' + pWidth + '" height="' + pHeight + '"> \
                    <ellipse cx="' + pWidth/2 + '" cy="' + pHeight/6 + '" rx="' + (pWidth*.9)/2 + '" ry="' + pWidth/4 + '" style="fill:' + color + ';stroke:black;stroke-width:3" /> \
                    <rect x="'+ .1*pWidth +'" y="' + 4*pHeight/10 + '" width="' + pWidth*.8 + '" height="' + pWidth/2 + '" style="stroke-width:3;fill:' + color + ';stroke:rgb(0,0,0)" /> \
                    <polygon points="' + pWidth/2 + ',' + .65*pHeight + ' ' + pWidth*.1 +',' + .9*pHeight + ' ' + pWidth*.9 +', ' + .9*pHeight + '" style="fill:' + color + ';stroke:black;stroke-width:3" /> \
                </svg> \
            </div>';
}

function getNexusHealthColumn(pWidth, pHeight, nexusHealth, color){
    var nexusHealthPercent = (nexusHealth/2000) * 100;
    return '<div class="flex-column" style="box-sizing: border-box;padding:' + nexusHealthBorderPercent + ';height:' + pHeight + '%; background-color:' + color + ';width:' + pWidth + '%;" >' + getNexusHealthBarPart(100 - nexusHealthPercent, 'white') + getNexusHealthBarPart(nexusHealthPercent, color) + '</div>';
}


function getNexusHealthColumnInsideDiv(pWidth, pHeight, nexusHealth, color){
    var nexusHealthPercent = (nexusHealth/2000) * 100;
    var result = '<div style="width:' + pWidth + '%;height:' + pHeight + '%;"> ' + 
                    '<div class="flex-column" style="box-sizing: border-box;padding:8px;width:100%;height:100%;background-color:' + color + ';" >' + getNexusHealthBarPart(100 - nexusHealthPercent, 'white') + getNexusHealthBarPart(nexusHealthPercent, color) + '</div>'+
                '</div>';
    return result;
    }
function getNexusHealthBarPart(pHeight, color){
    return '<div style="height:' + pHeight + '%;width:100%;background-color:' + color + '";></div>'
}

