
function renderStoryLinesDefaultView(frameNumber){
    var storyLines = storyLinesForFrame[frameNumber.toString()];
    if (storyLines == undefined){
        alert("asked to render storyLines for frame that hasn't beeningested yet!");
        return;
    }
    storyLines.clearViewData();
    storyLines.applyCommandSequence(['default']);
    storyLineUI.populateStoryLinesDefault(storyLines);
}


