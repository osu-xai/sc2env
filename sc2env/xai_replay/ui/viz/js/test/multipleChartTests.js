function multipleChartTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("multiple charts");

    fc.setCase("default");
    var cm;

    cm.setChartData()

    //possible use ranking functions already in place
    fc.assert(cm.tab.rank[0], ["Q1"] , "Tab rank 0");
    fc.assert(cm.tab.rank[1], ["Q2"] , "Tab rank 1");
    fc.assert(cm.tab.rank[2], ["Q3"] , "Tab rank 2");
    fc.assert(cm.tab.rank[3], ["Q4"] , "Tab rank 3");

    fc.assert(cm.tab.length, 4, "How many tabs for msx chart");
    fc.assert(cm.tab[0].name, "", "Tab 0 name");
    fc.assert(cm.tab[1].name, "", "Tab 1 name");
    fc.assert(cm.tab[2].name, "", "Tab 2 name");
    fc.assert(cm.tab[3].name, "", "Tab 3 name");
    
    /*
    Color
        Color for unimportant bars will be grey
        Color for important bars retain their color
    
    Geometry
        Position of action separator will be canvas.width / 2
        Position of many other things will be because there are only two actions
            actionCount = 2
        Position of Action labels entirely dependent on bars because no total bar
            >>>ALSO they are shown above and below so dependent on max pos bar and max neg bar for labels respectively
    
    Rank
        If ranking ranks things by best action to least best action for agent no change needed
            if not then will use the total action values to determine ranking
        Will have to add test to know MSX calculation is done correctly for the bars

    Display
        Will need test to make sure the tab selected is displaying the correct action
            Refer to tab tests (if they exist)
        Will need to have bar be lighter color or not depending on which is being shown/was clicked on
            Possibly added to color test?

    Notes:
        There is no total bar for MSX
        Speech bubble will have to touch both bars for MSX bars unimportant bars will have own dialog and work as the other bars did
        LegendBox color will need to be grey depending on bar

        How exactly will we maintain both charts?
            big if statement
            call different file

    Question:
        Still want to keep the y-axis w/ value lines and markers right?
        Do the saliencies need to be different if we change tabs??
        Can you select grey bars??
        MSX is dependent on the action do you want to have it all dependent on what MSX bars were found for picked decision or no?

    Steps to start:
        *DONE* Find the msx code I used import that
        Make test for MSX that ranks things using dummyChart
            *DONE* Possibly add variables that are same but have msx in front of them
        
            use the added variable for rest of tests like bar.msxColor = "grey" or something like that

            focus on msxGeometryTests

            add file that tests similar to chartStateTest as far as what is being displayed for msxChart
        
            Use this file for temp to write ideas
    */
}