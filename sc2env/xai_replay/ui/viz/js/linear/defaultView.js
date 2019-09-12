
function renderStoryLinesDefaultView(frameNumber){
    var storyLines = storyLinesForFrame[frameNumber];
    if (storyLines == undefined){
        return;
    }
    storyLines.clearViewData();
    storyLines.applyCommandSequence(['default']);
    storyLineUI.populateStoryLinesDefault(storyLines);
}


