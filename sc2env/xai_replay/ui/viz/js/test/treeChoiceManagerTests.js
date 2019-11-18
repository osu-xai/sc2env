function runTreeChoiceManagerTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("treeChoiceForwardTests");
    {
        fc.setCase("straight forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"c");
        tcm.showedExplanation(7);
        tcm.forwardedFromExplanation();
        tcm.pauseAtDP(8);      fc.assert(tcm.dpToRender,7,"d");
        tcm.showedExplanation(8);
        tcm.forwardedFromExplanation();

        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","e");
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","f");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"g");
        tcm.showedExplanation(12);
        tcm.forwardedFromExplanation();

        tcm.pauseAtDP(16);     fc.assert(tcm.dpToRender,"NA","h");
        tcm.pauseAtDP(17);     fc.assert(tcm.dpToRender,"NA","i");
        tcm.pauseAtDP(18);     fc.assert(tcm.dpToRender,17,"j");
        tcm.showedExplanation(18);
        tcm.forwardedFromExplanation();

        tcm.pauseAtDP(19);     fc.assert(tcm.dpToRender,"NA","k");
        tcm.pauseAtDP(20);     fc.assert(tcm.dpToRender,"NA","l");
        tcm.pauseAtDP(21);     fc.assert(tcm.dpToRender,20,"m");
        tcm.showedExplanation(21);
        tcm.forwardedFromExplanation();

        tcm.pauseAtDP(22);     fc.assert(tcm.dpToRender,"NA","n");
        tcm.pauseAtDP(26);     fc.assert(tcm.dpToRender,"NA","o");
        tcm.pauseAtDP(27);     fc.assert(tcm.dpToRender,26,"p");
        tcm.showedExplanation(27);
        tcm.forwardedFromExplanation();

        tcm.pauseAtDP(28);     fc.assert(tcm.dpToRender,"NA","q");
        tcm.pauseAtDP(36);     fc.assert(tcm.dpToRender,"NA","r");
        tcm.pauseAtDP(37);     fc.assert(tcm.dpToRender,36,"s");
        tcm.showedExplanation(37);
        tcm.forwardedFromExplanation();

    }
    {
        // ok to show any tree prior to latest controlled tree showing
        fc.setCase("hop back, forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","c");            // hop back before get past controleed show - nothing changes
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","d");
        // first pause and explain
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"e");

        tcm.showedExplanation(7);
        // hop back and verify nothing changed (need to move PAST the controlled showing)
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","f");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","g");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","h");

        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"i");
        tcm.forwardedFromExplanation();

        // hop back and verify we can access those prior to 7, since already moved past 7
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,5,"j");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,6,"k");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"l");
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,7,"m");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"n");

        tcm.pauseAtDP(8);      fc.assert(tcm.dpToRender,7,"o");
        tcm.showedExplanation(8);
        tcm.forwardedFromExplanation();
    
        // move to next one
        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","p");
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","q");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"r");
        
        tcm.hopToDP(4);         fc.assert(tcm.dpToRender,4,"s");
        tcm.pauseAtDP(3);       fc.assert(tcm.dpToRender,3,"t");
        tcm.pauseAtDP(9);       fc.assert(tcm.dpToRender,"NA","u");
        tcm.pauseAtDP(12);      fc.assert(tcm.dpToRender,11,"v");
        tcm.showedExplanation(12);
        tcm.forwardedFromExplanation();
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,9,"w");
        tcm.pauseAtDP(11);      fc.assert(tcm.dpToRender,11,"x");
    }
    {
        fc.setCase("hop back, hop forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","c"); // hop back before get past controlled show - nothing changes
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","d");
        // first pause and explain
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"e");

        tcm.showedExplanation(7);
        // hop back and verify nothing changed (need to move PAST the controlled showing)
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","f");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","g");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","h");

        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"i");
        tcm.forwardedFromExplanation();

        // hop back and verify we can access those prior to 7, since already moved past 7
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,5,"j");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"k");
        tcm.hopToDP(7);         fc.assert(tcm.dpToRender,7,"l");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"m");

        tcm.hopToDP(8);         fc.assert(tcm.dpToRender,7,"n");
        tcm.showedExplanation(8);
        tcm.forwardedFromExplanation();
    
        // move to next one
        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","o");
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","p");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"q");
        
        tcm.hopToDP(4);         fc.assert(tcm.dpToRender,4,"r");
        tcm.pauseAtDP(3);       fc.assert(tcm.dpToRender,3,"s");
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,"NA","t");
        tcm.hopToDP(12);       fc.assert(tcm.dpToRender,11,"u");
        tcm.showedExplanation(12);
        tcm.forwardedFromExplanation();
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,9,"v");
        tcm.hopToDP(11);        fc.assert(tcm.dpToRender,11,"w");
    
    }
}