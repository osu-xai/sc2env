
function highlightUnitForClickCollectionFeedback(unit){ 
    if (userStudyMode){
        var info = shapeInfoForHighlighting[shapeId];//SC2_TODO port to unit input
        if (info != undefined) {
            highlightShapeForClickCollectionFeedback(info);
        }
    }
}
function highlightShapeForClickCollectionFeedback(info){//SC2_TODO_STUDY port to unit input
    if (activeStudyQuestionManager.renderer.controlsWaitingForClick.length == 0) {
        return;
    }
    var legalClickTargetRegions = activeStudyQuestionManager.getLegalInstrumentationTargetsForCurrentQuestion();
    if (activeStudyQuestionManager.renderer.isLegalRegionToClickOn("target:gameboard", legalClickTargetRegions)){
        // redraw from scratch in case this is our second click andwe have to delete evidence of prior click
        activeSC2UIManager.renderStateForCurrentStep();
        if (info.type == "rect") { //SC2_TODO_STUDY - how outline to reflect selection
            drawRect(info, "outline");
        }
        else if (info.type == "kite") {
            drawKite(info, "outline");
        }
        else if (info.type == "circle"){
            drawCircle(info, "outline");
        }
        else if (info.type == "octagon"){
            drawOctagon(info, "outline");
        }
        else if (info.type == "triangle"){
            drawTriangle(info, "outline");
        }
    }
}

