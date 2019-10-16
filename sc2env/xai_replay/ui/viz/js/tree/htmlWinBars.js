function getWinBars(chartData){
    var winBars = getPatternDef() + renderWinBar(0, chartData[0]["value"]) +
    renderWinBar(1, chartData[1]["value"]) +
    renderWinBar(2, chartData[2]["value"]) +
    renderWinBar(3, chartData[3]["value"]) +
    renderWinBar(4, chartData[4]["value"]) +
    renderWinBar(5, chartData[5]["value"]) +
    renderWinBar(6, chartData[6]["value"]) +
    renderWinBar(7, chartData[7]["value"]);
    return winBars;
}


var winTypeSign = {};
winTypeSign[0] = 1;
winTypeSign[1] = 1;
winTypeSign[2] = 1;
winTypeSign[3] = 1;
winTypeSign[4] = -1;
winTypeSign[5] = -1;
winTypeSign[6] = -1;
winTypeSign[7] = -1;


/* imageOrigin[0] = [chartWidth * 3/4,chartHeight * 0];// destroy, top,    right
imageOrigin[1] = [chartWidth * 3/4,chartHeight * 1/2];// destroy, bottom, right
imageOrigin[2] = [chartWidth * 2/4,chartHeight * 0];// lowest,  top,    right
imageOrigin[3] = [chartWidth * 2/4,chartHeight * 1/2];// lowest,  bottom, right
imageOrigin[4] = [chartWidth * 0/4,chartHeight * 0];// destroy, top,    left
imageOrigin[5] = [chartWidth * 0/4,chartHeight * 1/2];// destroy, bottom, left
imageOrigin[6] = [chartWidth * 1/4,chartHeight * 0];// lowest,  top,    left
imageOrigin[7] = [chartWidth * 1/4,chartHeight * 1/2];// lowest,  bottom, left */
var winBarYOrigin = {};
var quadrantBarSep = 10;
winBarYOrigin[0] = chartHeight * (1/12) - quadrantBarSep;
winBarYOrigin[1] = chartHeight * (7/12) - quadrantBarSep;
winBarYOrigin[2] = chartHeight * (3/12) + quadrantBarSep;
winBarYOrigin[3] = chartHeight * (9/12) + quadrantBarSep;
winBarYOrigin[4] = chartHeight * (1/12) - quadrantBarSep;
winBarYOrigin[5] = chartHeight * (7/12) - quadrantBarSep;
winBarYOrigin[6] = chartHeight * (3/12) + quadrantBarSep;
winBarYOrigin[7] = chartHeight * (9/12) + quadrantBarSep;

function getBarForDestructionLevel(index, width, height, xOrigin, yOrigin){
    var enemyColor = getPlayerColor("enemy");
    var agentColor = getPlayerColor("agent");
    if (index == 0 || index == 1 ){
        // destroy bar enemy
        
        var result = '<rect style="fill:' + enemyColor + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="' + enemyColor + '" stroke-width="1" />';
        return result; 
    }
    if (index == 4 || index == 5){
        // destroy bar agent
        var result = '<rect style="fill:' + agentColor + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="' + agentColor + '" stroke-width="1" />';
        return result; 
    }
    else if (index == 2 || index == 3) {
        // damage bar enemy
        var result = '<rect style="' + getPartialFillPattern("h-stripe-xai-enemy") + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="' + getPlayerColor("enemy") + '" stroke-width="1" />';
        return result;
    }
    else {
        // damage bar agent
        var result = '<rect style="' + getPartialFillPattern("h-stripe-xai-agent") + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="' + getPlayerColor("agent") + '" stroke-width="1" />';
        return result;
    }
}


function renderWinBar( index, value){
    var width = (chartWidth / 2 ) * value;
    var height = chartHeight / 6;
    var xOrigin = chartWidth / 2;
    var yOrigin = winBarYOrigin[index];
    if (winTypeSign[index] == -1){
        xOrigin = xOrigin - width;
    }
    var result = getBarForDestructionLevel(index, width, height, xOrigin, yOrigin);
    console.log(result);
    return result;
}
function getPartialFillPattern(patternName){
    return 'fill: url(#' + patternName + ') #fff;'
}
//

function getPatternDef(){
    return '<defs>' +
                '<pattern id="h-stripe-xai-agent" width="1.0" height=".3333" patternContentUnits="objectBoundingBox">' + 
                    '<rect x="0" y="0" width="1.0" height=".16666" fill="' + getPlayerColor("agent") + '"/>' +
                '</pattern>' + 
                '<pattern id="h-stripe-xai-enemy" width="1.0" height=".3333" patternContentUnits="objectBoundingBox">' + 
                    '<rect x="0" y="0" width="1.0" height=".16666" fill="' + getPlayerColor("enemy") + '"/>' +
                '</pattern>' +
            '</defs>';
                
}