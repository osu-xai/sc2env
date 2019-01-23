var sc2GameCanvasWidth = 512;
var sc2GameCanvasHeight = 512;

function getSC2UIManager(sc2DataManager) {
    uim = {};
    uim.dataManager = sc2DataManager;
    
    uim.renderStateForCurrentStep = function() {
        clearGameBoard();
        var unitInfos = this.dataManager.getUnitInfos(this.dataManager.getCurrentStep());
        for (unitInfo in unitInfos){
            createToolTips(unitInfo); //SC2_TODO - ensure don't create every time?
        }
        alert('sc2UIManager.renderStep finished?')
    }
    return uim;
}

function getTooltipY(unitInfo){
    return unitInfo.y - 20.0;
}

function getTooltipX(unitInfo){
    return unitInfo.x - 20.0;
}
function getTooltipColorRGBAForUnit(unitInfo){
    alert('getColorRGBAForUnit unimplemented')
}
function getSC2QuadrantName(x,y){
    var halfWidth = sc2GameCanvasWidth / 2;
    var halfHeight = sc2GameCanvasHeight / 2;
    if (x < halfWidth) {
        if (y < halfHeight) {
            return "upperLeftQuadrant";
        }
        else {
            return "lowerLeftQuadrant";
        }
    }
    else {
        if (y < halfHeight) {
            return "upperRightQuadrant";
        }
        else {
            return "lowerRightQuadrant";
        }
    }
}
