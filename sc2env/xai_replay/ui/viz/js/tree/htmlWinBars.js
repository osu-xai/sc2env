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
winBarYOrigin[0] = chartHeight * (3/12);
winBarYOrigin[1] = chartHeight * (7/12);
winBarYOrigin[2] = chartHeight * (1/12);
winBarYOrigin[3] = chartHeight * (9/12);
winBarYOrigin[4] = chartHeight * (3/12);
winBarYOrigin[5] = chartHeight * (7/12);
winBarYOrigin[6] = chartHeight * (1/12);
winBarYOrigin[7] = chartHeight * (9/12);

function getBarForDestructionLevel(index, width, height, xOrigin, yOrigin){
    if (index == 0 || index == 1 || index == 4 || index == 5){
        // destroy bar
        var result = '<rect style="fill:black" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="black" stroke-width="1" />';
        return result; 
    }
    else {
        // damage bar
        var result = '<rect style="' + getPartialFillPattern() + '" x="' + xOrigin + '" y="' + yOrigin + '" width="' + width + '" height="' + height + '"' + '" stroke="black" stroke-width="1" />';
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
function getPartialFillPattern(){
    return 'fill: url(#h-stripe-xai) #fff;'
}
//

function getPatternDef(){
    return '<defs> <pattern id="h-stripe-xai" width="1.0" height=".2" patternContentUnits="objectBoundingBox">' + 
                         '<rect x="0" y="0" width="1.0" height=".1" fill="black"/>' +
                 '</pattern></defs>';
                
}