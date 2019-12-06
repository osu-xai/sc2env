function runTreeChoiceManagerTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("treeChoiceForwardTests");
    {
        fc.setCase("straight forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAfterDP(5);   fc.assert(tcm.dpToRender,"NA","a1");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"c");
        tcm.someExplanationShown(7);
        tcm.resume();
        tcm.pauseAfterDP(7);   fc.assert(tcm.dpToRender,7,"c1");

        tcm.pauseAtDP(8);      fc.assert(tcm.dpToRender,7,"d");
        tcm.someExplanationShown(8);
        tcm.resume();
        tcm.pauseAfterDP(8);   fc.assert(tcm.dpToRender,8,"d1");


        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","e");
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","f");
        tcm.pauseAfterDP(11);  fc.assert(tcm.dpToRender,"NA","f1");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"g");
        tcm.someExplanationShown(12);
        tcm.resume();

        tcm.pauseAtDP(16);     fc.assert(tcm.dpToRender,"NA","h");
        tcm.pauseAtDP(17);     fc.assert(tcm.dpToRender,"NA","i");
        tcm.pauseAtDP(18);     fc.assert(tcm.dpToRender,17,"j");
        tcm.someExplanationShown(18);
        tcm.resume();

        tcm.pauseAtDP(19);     fc.assert(tcm.dpToRender,"NA","k");
        tcm.pauseAtDP(20);     fc.assert(tcm.dpToRender,"NA","l");
        tcm.pauseAtDP(21);     fc.assert(tcm.dpToRender,20,"m");
        tcm.someExplanationShown(21);
        tcm.resume();

        tcm.pauseAtDP(22);     fc.assert(tcm.dpToRender,"NA","n");
        tcm.pauseAtDP(26);     fc.assert(tcm.dpToRender,"NA","o");
        tcm.pauseAtDP(27);     fc.assert(tcm.dpToRender,26,"p");
        tcm.someExplanationShown(27);
        tcm.resume();

        tcm.pauseAtDP(28);     fc.assert(tcm.dpToRender,"NA","q");
        tcm.pauseAtDP(36);     fc.assert(tcm.dpToRender,"NA","r");
        tcm.pauseAtDP(37);     fc.assert(tcm.dpToRender,36,"s");
        tcm.someExplanationShown(37);
        tcm.resume();

    }
    {
        // ok to show any tree prior to latest controlled tree showing
        fc.setCase("hop back, forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.hopToDP(5);        fc.assert(tcm.dpToRender,"NA","c");            // hop back before get past controleed show - nothing changes
        tcm.hopToAfterDP(5);   fc.assert(tcm.dpToRender,"NA","c1");  
        tcm.pauseAfterDP(5);   fc.assert(tcm.dpToRender,"NA","c2");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","d");
        tcm.hopToAfterDP(5);   fc.assert(tcm.dpToRender,"NA","d1"); 
        tcm.hopToAfterDP(20);  fc.assert(tcm.dpToRender,"NA","d2"); 
        tcm.hopToAfterDP(5);   fc.assert(tcm.dpToRender,"NA","d3"); 
        // first pause and explain
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"e");

        tcm.someExplanationShown(7);
        // hop back and verify nothing changed (need to move PAST the controlled showing)
        tcm.hopToDP(5);        fc.assert(tcm.dpToRender,"NA","f");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","g");
        tcm.hopToDP(6);        fc.assert(tcm.dpToRender,"NA","h");
        tcm.pauseAfterDP(6);   fc.assert(tcm.dpToRender,"NA","h1");
        tcm.hopToAfterDP(6);   fc.assert(tcm.dpToRender,"NA","h2"); 

        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"i");
        tcm.resume();
        tcm.pauseAfterDP(7);   fc.assert(tcm.dpToRender,7,"i1");


        // hop back and verify we can access those prior to 7, since already moved past 7
        tcm.hopToDP(5);        fc.assert(tcm.dpToRender,5,"j");
        tcm.pauseAfterDP(5);   fc.assert(tcm.dpToRender,5,"j1");
        tcm.hopToAfterDP(5);   fc.assert(tcm.dpToRender,5,"j2"); 
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,6,"k");
        tcm.hopToDP(6);        fc.assert(tcm.dpToRender,6,"l");
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,7,"m");
        tcm.hopToDP(6);        fc.assert(tcm.dpToRender,6,"n");
        tcm.pauseAfterDP(6);   fc.assert(tcm.dpToRender,6,"n1");

        tcm.pauseAtDP(8);      fc.assert(tcm.dpToRender,7,"o");
        tcm.someExplanationShown(8);
        tcm.resume();
        tcm.pauseAfterDP(8);   fc.assert(tcm.dpToRender,8,"o1");
    
        // move to next one
        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","p");
        tcm.hopToAfterDP(10);   fc.assert(tcm.dpToRender,"NA","p2"); 
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","q");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"r");
        tcm.hopToAfterDP(12);   fc.assert(tcm.dpToRender,"NA","r2"); 

        tcm.hopToDP(4);         fc.assert(tcm.dpToRender,4,"s");
        tcm.pauseAtDP(3);       fc.assert(tcm.dpToRender,3,"t");
        tcm.pauseAtDP(9);       fc.assert(tcm.dpToRender,"NA","u");
        tcm.pauseAtDP(12);      fc.assert(tcm.dpToRender,11,"v");
        tcm.someExplanationShown(12);
        tcm.resume();
        tcm.hopToAfterDP(12);   fc.assert(tcm.dpToRender,"12","v2"); 
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,9,"w");
        tcm.pauseAtDP(11);      fc.assert(tcm.dpToRender,11,"x");
        tcm.pauseAfterDP(11);   fc.assert(tcm.dpToRender,11,"x1");

    }
    {
        fc.setCase("hop back, hop forward");
        var tcm = getTreeChoiceManagerStudy([7,8,12,18,21,27,37]);
        tcm.pauseAtDP(5);      fc.assert(tcm.dpToRender,"NA","a");
        tcm.pauseAtDP(6);      fc.assert(tcm.dpToRender,"NA","b");
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","c"); // hop back before get past controlled show - nothing changes
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","d");
        tcm.pauseAfterDP(6);   fc.assert(tcm.dpToRender,"NA","d1");

        // first pause and explain
        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"e");

        tcm.someExplanationShown(7);
        // hop back and verify nothing changed (need to move PAST the controlled showing)
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,"NA","f");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","g");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,"NA","h");
        tcm.pauseAfterDP(6);    fc.assert(tcm.dpToRender,"NA","h1");

        tcm.pauseAtDP(7);      fc.assert(tcm.dpToRender,6,"i");
        tcm.resume();
        tcm.pauseAfterDP(7);   fc.assert(tcm.dpToRender,7,"i1");

        // hop back and verify we can access those prior to 7, since already moved past 7
        tcm.hopToDP(5);         fc.assert(tcm.dpToRender,5,"j");
        tcm.pauseAfterDP(5);    fc.assert(tcm.dpToRender,5,"j1");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"k");
        tcm.pauseAfterDP(6);   fc.assert(tcm.dpToRender,6,"k1");
        tcm.hopToAfterDP(6);   fc.assert(tcm.dpToRender,6,"k2"); 
        tcm.hopToAfterDP(7);   fc.assert(tcm.dpToRender,7,"k3"); 
        tcm.hopToAfterDP(8);   fc.assert(tcm.dpToRender,"NA","k4"); 
        tcm.hopToDP(7);         fc.assert(tcm.dpToRender,7,"l");
        tcm.hopToDP(6);         fc.assert(tcm.dpToRender,6,"m");

        tcm.hopToDP(8);         fc.assert(tcm.dpToRender,7,"n");
        tcm.someExplanationShown(8);
        tcm.resume();
        tcm.pauseAfterDP(8);   fc.assert(tcm.dpToRender,8,"n1");

        // move to next one
        tcm.pauseAtDP(9);      fc.assert(tcm.dpToRender,"NA","o");
        tcm.pauseAtDP(11);     fc.assert(tcm.dpToRender,"NA","p");
        tcm.pauseAtDP(12);     fc.assert(tcm.dpToRender,11,"q");
        
        tcm.hopToDP(4);         fc.assert(tcm.dpToRender,4,"r");
        tcm.pauseAtDP(3);       fc.assert(tcm.dpToRender,3,"s");
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,"NA","t");
        tcm.hopToDP(12);       fc.assert(tcm.dpToRender,11,"u");
        tcm.someExplanationShown(12);
        tcm.resume();
        tcm.hopToDP(9);         fc.assert(tcm.dpToRender,9,"v");
        tcm.hopToDP(11);        fc.assert(tcm.dpToRender,11,"w");
    
    }
}