
function getFadedCircles(chartData){
    var result = '';
    var margin = chartHeight/16;
    var height = chartHeight/2 - (2*margin);
    var width = chartWidth/4 - (2*margin);
    for (var i in chartData){
        var value = chartData[i]["value"];
        var origin = imageOrigin[i];
        var x = origin[0]+ margin;
        var y = origin[1]+ margin;
        var slash = getSlash(i);
        var r = (chartHeight/4) - 30;
        if (value < 0.05) {
            value = 0.05;
        }
        //result += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="stroke:rgba(0,0,0,' + value + ');stroke-width:10" />' + 
        //           '<line x1="0" y1="0" x2="200" y2="200" style="stroke:rgb(255,0,0);stroke-width:2" />';
        result += '<image href="imgs/tree/explosion.png" opacity="' + value + '" x="' + x + '" y="' + y + '" height="' + height + 'px" width="' + width + 'px"/>'
        
    }
    return result;
}

function getSlash(i){
    if (i == 0 || i == 1 || i == 5 || i == 6){
        return getDestroySlash();
    }
    else {
        return getDamageSlash();
    }
}

function getDestroySlash(){
}
function getDamageSlash(){

}
var imageOrigin ={};
imageOrigin[0] = [chartWidth * 3/4,chartHeight * 0];// destroy, top,    right
imageOrigin[1] = [chartWidth * 3/4,chartHeight * 1/2];// destroy, bottom, right
imageOrigin[2] = [chartWidth * 2/4,chartHeight * 0];// lowest,  top,    right
imageOrigin[3] = [chartWidth * 2/4,chartHeight * 1/2];// lowest,  bottom, right
imageOrigin[4] = [chartWidth * 0/4,chartHeight * 0];// destroy, top,    left
imageOrigin[5] = [chartWidth * 0/4,chartHeight * 1/2];// destroy, bottom, left
imageOrigin[6] = [chartWidth * 1/4,chartHeight * 0];// lowest,  top,    left
imageOrigin[7] = [chartWidth * 1/4,chartHeight * 1/2];// lowest,  bottom, left

var circleOrigin = {};
circleOrigin[0] = [chartWidth * 7/8,chartHeight * 1/4];// destroy, top,    right
circleOrigin[1] = [chartWidth * 7/8,chartHeight * 3/4];// destroy, bottom, right
circleOrigin[2] = [chartWidth * 5/8,chartHeight * 1/4];// lowest,  top,    right
circleOrigin[3] = [chartWidth * 5/8,chartHeight * 3/4];// lowest,  bottom, right
circleOrigin[4] = [chartWidth * 1/8,chartHeight * 1/4];// destroy, top,    left
circleOrigin[5] = [chartWidth * 1/8,chartHeight * 3/4];// destroy, bottom, left
circleOrigin[6] = [chartWidth * 3/8,chartHeight * 1/4];// lowest,  top,    left
circleOrigin[7] = [chartWidth * 3/8,chartHeight * 3/4];// lowest,  bottom, left


var strikePattern = {};
strikePattern[0] = [,];
strikePattern[1] = [,];
strikePattern[2] = [,];
strikePattern[3] = [,];
strikePattern[4] = [,];
strikePattern[5] = [,];
strikePattern[6] = [,];
strikePattern[7] = [,];