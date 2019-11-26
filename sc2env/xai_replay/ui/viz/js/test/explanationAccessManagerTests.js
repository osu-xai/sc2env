function runExplanationAccessManagerTests(failureChecker) {
    var fc = failureChecker;

    fc.setTestName("explanationAccessManagerForwardTests");
    {
        fc.setCase("straight forward");
        var m = getExplanationAccessManagerStudy([7,8,12,18,21,27,37]);
        m.pauseAtDP(5);      fc.assert(m.showUnlockControls,false,"a1");  fc.assert(m.showExplButtonEnabled,false,"a2");
        m.pauseAfterDP(5);   fc.assert(m.showUnlockControls,false,"a1a");  fc.assert(m.showExplButtonEnabled,false,"a2a");
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"b1");  fc.assert(m.showExplButtonEnabled,false,"b2");
        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,true,"c1");  fc.assert(m.showExplButtonEnabled,false,"c2");
        m.unlocked(7);       fc.assert(m.showUnlockControls,false,"c1a"); fc.assert(m.showExplButtonEnabled,true,"c2a");
        m.pauseAfterDP(7);   fc.assert(m.showUnlockControls,false,"c1b");  fc.assert(m.showExplButtonEnabled,false,"c2b");
        m.pauseAtDP(8);      fc.assert(m.showUnlockControls,true,"d1");  fc.assert(m.showExplButtonEnabled,false,"d2");
        m.unlocked(8);       fc.assert(m.showUnlockControls,false,"d1a"); fc.assert(m.showExplButtonEnabled,true,"d2a");
        m.pauseAfterDP(8);   fc.assert(m.showUnlockControls,false,"d1b");  fc.assert(m.showExplButtonEnabled,false,"d2b");

        m.pauseAtDP(9);      fc.assert(m.showUnlockControls,false,"e1");  fc.assert(m.showExplButtonEnabled,false,"e2");
        m.pauseAtDP(11);     fc.assert(m.showUnlockControls,false,"f1");  fc.assert(m.showExplButtonEnabled,false,"f2");
        m.pauseAfterDP(11);  fc.assert(m.showUnlockControls,false,"f1a");  fc.assert(m.showExplButtonEnabled,false,"f2a");
        m.pauseAtDP(12);     fc.assert(m.showUnlockControls,true,"g1");  fc.assert(m.showExplButtonEnabled,false,"g2");
        m.unlocked(12);      fc.assert(m.showUnlockControls,false,"g1a"); fc.assert(m.showExplButtonEnabled,true,"g2a");

        m.pauseAtDP(16);     fc.assert(m.showUnlockControls,false,"h1");  fc.assert(m.showExplButtonEnabled,false,"h2");
        m.pauseAtDP(17);     fc.assert(m.showUnlockControls,false,"i1");  fc.assert(m.showExplButtonEnabled,false,"i2");
        m.pauseAtDP(18);     fc.assert(m.showUnlockControls,true,"j1");  fc.assert(m.showExplButtonEnabled,false,"j2");
        m.unlocked(18);      fc.assert(m.showUnlockControls,false,"j1a"); fc.assert(m.showExplButtonEnabled,true,"j2a");

        m.pauseAtDP(19);     fc.assert(m.showUnlockControls,false,"k1");  fc.assert(m.showExplButtonEnabled,false,"k2");
        m.pauseAtDP(20);     fc.assert(m.showUnlockControls,false,"l1");  fc.assert(m.showExplButtonEnabled,false,"l2");
        m.pauseAtDP(21);     fc.assert(m.showUnlockControls,true,"m1");  fc.assert(m.showExplButtonEnabled,false,"m2");
        m.unlocked(21);      fc.assert(m.showUnlockControls,false,"m1a"); fc.assert(m.showExplButtonEnabled,true,"m2a");

        m.pauseAtDP(22);     fc.assert(m.showUnlockControls,false,"n1");  fc.assert(m.showExplButtonEnabled,false,"n2");
        m.pauseAtDP(26);     fc.assert(m.showUnlockControls,false,"o1");  fc.assert(m.showExplButtonEnabled,false,"o2");
        m.pauseAtDP(27);     fc.assert(m.showUnlockControls,true,"p1");  fc.assert(m.showExplButtonEnabled,false,"p2");
        m.unlocked(27);      fc.assert(m.showUnlockControls,false,"p1a"); fc.assert(m.showExplButtonEnabled,true,"p2a");

        m.pauseAtDP(28);     fc.assert(m.showUnlockControls,false,"q1");  fc.assert(m.showExplButtonEnabled,false,"q2");
        m.pauseAtDP(36);     fc.assert(m.showUnlockControls,false,"r1");  fc.assert(m.showExplButtonEnabled,false,"r2");
        m.pauseAtDP(37);     fc.assert(m.showUnlockControls,true,"s1");  fc.assert(m.showExplButtonEnabled,false,"s2");
        m.unlocked(37);      fc.assert(m.showUnlockControls,false,"s1a"); fc.assert(m.showExplButtonEnabled,true,"s2a");

    }
    {
        // ok to show any tree prior to latest controlled tree showing
        fc.setCase("hop back, forward");
        var m = getExplanationAccessManagerStudy([7,8,12,18,21,27,37]);
        m.pauseAtDP(5);      fc.assert(m.showUnlockControls,false,"a1");  fc.assert(m.showExplButtonEnabled,false,"a2");
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"b1");  fc.assert(m.showExplButtonEnabled,false,"b2");
        // hop back before get past controleed show - nothing changes
        m.hopToDP(5);         fc.assert(m.showUnlockControls,false,"c1");       fc.assert(m.showExplButtonEnabled,false,"c2");       
        m.hopToAfterDP(5);    fc.assert(m.showUnlockControls,false,"c1a");       fc.assert(m.showExplButtonEnabled,false,"c2a");       
        m.pauseAfterDP(5);   fc.assert(m.showUnlockControls,false,"c1b");  fc.assert(m.showExplButtonEnabled,false,"c2b");        
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"d1");  fc.assert(m.showExplButtonEnabled,false,"d2");
        // first pause and explain
        m.hopToAfterDP(5);    fc.assert(m.showUnlockControls,false,"c1c");       fc.assert(m.showExplButtonEnabled,false,"c2c");       
        m.hopToAfterDP(20);    fc.assert(m.showUnlockControls,false,"c1d");       fc.assert(m.showExplButtonEnabled,false,"c2d");       
        m.hopToAfterDP(5);    fc.assert(m.showUnlockControls,false,"c1e");       fc.assert(m.showExplButtonEnabled,false,"c2e");       
        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,true,"e1");  fc.assert(m.showExplButtonEnabled,false,"e2");
        m.unlocked(7);       fc.assert(m.showUnlockControls,false,"e1a"); fc.assert(m.showExplButtonEnabled,true,"e2a");

        // hop back and verify nothing changed (need to move PAST the controlled showing)
        m.hopToDP(5);        fc.assert(m.showUnlockControls,false,"f1");  fc.assert(m.showExplButtonEnabled,true,"f2");
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"g1");  fc.assert(m.showExplButtonEnabled,true,"g2");
        m.hopToDP(6);        fc.assert(m.showUnlockControls,false,"h1");  fc.assert(m.showExplButtonEnabled,true,"h2");
        m.pauseAfterDP(6);   fc.assert(m.showUnlockControls,false,"h1a");  fc.assert(m.showExplButtonEnabled,true,"h2a");
        m.hopToAfterDP(6);   fc.assert(m.showUnlockControls,false,"h1b");  fc.assert(m.showExplButtonEnabled,true,"h2b");       

        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,false,"i1");  fc.assert(m.showExplButtonEnabled,true,"i2");

        // hop back and verify we can access those prior to 7, since already moved past 7
        m.hopToDP(5);         fc.assert(m.showUnlockControls,false,"j1");  fc.assert(m.showExplButtonEnabled,true,"j2");
        m.pauseAfterDP(5);   fc.assert(m.showUnlockControls,false,"j1a");  fc.assert(m.showExplButtonEnabled,true,"j2a");
        m.hopToAfterDP(5);    fc.assert(m.showUnlockControls,false,"j1b"); fc.assert(m.showExplButtonEnabled,true,"j2b");       
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"k1");  fc.assert(m.showExplButtonEnabled,true,"k2");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"l1");  fc.assert(m.showExplButtonEnabled,true,"l2");
        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,false,"m1");  fc.assert(m.showExplButtonEnabled,true,"m2");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"n1");  fc.assert(m.showExplButtonEnabled,true,"n2");
        m.pauseAfterDP(6);   fc.assert(m.showUnlockControls,false,"n1a");  fc.assert(m.showExplButtonEnabled,true,"n2a");

        m.pauseAtDP(8);      fc.assert(m.showUnlockControls,true,"o1");  fc.assert(m.showExplButtonEnabled,false,"o2");
        m.unlocked(8);       fc.assert(m.showUnlockControls,false,"o1a"); fc.assert(m.showExplButtonEnabled,true,"o2a");
        m.pauseAfterDP(8);   fc.assert(m.showUnlockControls,false,"o1b");  fc.assert(m.showExplButtonEnabled,false,"02b");

        // move to next one
        m.pauseAtDP(9);      fc.assert(m.showUnlockControls,false,"p1");  fc.assert(m.showExplButtonEnabled,false,"p2");
        m.hopToAfterDP(10);  fc.assert(m.showUnlockControls,false,"p1a");  fc.assert(m.showExplButtonEnabled,false,"p2a");       
        m.pauseAtDP(11);     fc.assert(m.showUnlockControls,false,"q1");  fc.assert(m.showExplButtonEnabled,false,"q2");
        m.pauseAtDP(12);     fc.assert(m.showUnlockControls,true,"r1");  fc.assert(m.showExplButtonEnabled,false,"r2");
        m.hopToAfterDP(12);   fc.assert(m.showUnlockControls,false,"r1a"); fc.assert(m.showExplButtonEnabled,false,"r2a");       
        
        m.hopToDP(4);         fc.assert(m.showUnlockControls,false,"s1");  fc.assert(m.showExplButtonEnabled,true,"s2");
        m.pauseAtDP(3);       fc.assert(m.showUnlockControls,false,"t1");  fc.assert(m.showExplButtonEnabled,true,"t2");
        m.pauseAtDP(9);       fc.assert(m.showUnlockControls,false,"u1");  fc.assert(m.showExplButtonEnabled,false,"u2");
        m.pauseAtDP(12);      fc.assert(m.showUnlockControls,true,"v1");  fc.assert(m.showExplButtonEnabled,false,"v2");
        m.unlocked(12);       fc.assert(m.showUnlockControls,false,"v1a"); fc.assert(m.showExplButtonEnabled,true,"v2a");
        m.hopToAfterDP(12);   fc.assert(m.showUnlockControls,false,"v1b"); fc.assert(m.showExplButtonEnabled,false,"v2b");       

        m.hopToDP(9);         fc.assert(m.showUnlockControls,false,"w1");  fc.assert(m.showExplButtonEnabled,true,"w2");
        m.pauseAtDP(11);      fc.assert(m.showUnlockControls,false,"x1");  fc.assert(m.showExplButtonEnabled,true,"x2");
        m.pauseAfterDP(11);   fc.assert(m.showUnlockControls,false,"x1a");  fc.assert(m.showExplButtonEnabled,true,"x2a");
    }
    {
        fc.setCase("hop back, hop forward");
        var m = getExplanationAccessManagerStudy([7,8,12,18,21,27,37]);
        m.pauseAtDP(5);      fc.assert(m.showUnlockControls,false,"a1");  fc.assert(m.showExplButtonEnabled,false,"a2");
        m.pauseAtDP(6);      fc.assert(m.showUnlockControls,false,"b1");  fc.assert(m.showExplButtonEnabled,false,"b2");
        // hop back before get past controlled show - nothing changes
        m.hopToDP(5);         fc.assert(m.showUnlockControls,false,"c1");  fc.assert(m.showExplButtonEnabled,false,"c2"); 
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"d1");  fc.assert(m.showExplButtonEnabled,false,"d2");
        m.pauseAfterDP(6);   fc.assert(m.showUnlockControls,false,"d1a");  fc.assert(m.showExplButtonEnabled,false,"d2a");
        
        // first pause and explain
        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,true,"e1");  fc.assert(m.showExplButtonEnabled,false,"e2");
        m.unlocked(7);       fc.assert(m.showUnlockControls,false,"e1a"); fc.assert(m.showExplButtonEnabled,true,"e2a");

        // hop back and verify nothing changed (need to move PAST the controlled showing)
        m.hopToDP(5);         fc.assert(m.showUnlockControls,false,"f1");  fc.assert(m.showExplButtonEnabled,true,"f2");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"g1");  fc.assert(m.showExplButtonEnabled,true,"g2");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"h1");  fc.assert(m.showExplButtonEnabled,true,"h2");
        m.pauseAfterDP(6);   fc.assert(m.showUnlockControls,false,"h1a");  fc.assert(m.showExplButtonEnabled,true,"h2a");

        m.pauseAtDP(7);      fc.assert(m.showUnlockControls,false,"i1");  fc.assert(m.showExplButtonEnabled,true,"i2");
        m.pauseAfterDP(7);   fc.assert(m.showUnlockControls,false,"i1a");  fc.assert(m.showExplButtonEnabled,false,"i2a");

        // hop back and verify we can access those prior to 7, since already moved past 7
        m.hopToDP(5);         fc.assert(m.showUnlockControls,false,"j1");  fc.assert(m.showExplButtonEnabled,true,"j2");
        m.pauseAfterDP(5);   fc.assert(m.showUnlockControls,false,"j1a");  fc.assert(m.showExplButtonEnabled,true,"j2a");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"k1");  fc.assert(m.showExplButtonEnabled,true,"k2");
        m.pauseAfterDP(6);   fc.assert(m.showUnlockControls,false,"k1a");  fc.assert(m.showExplButtonEnabled,true,"k2a");
        m.hopToAfterDP(6);    fc.assert(m.showUnlockControls,false,"k1b"); fc.assert(m.showExplButtonEnabled,true,"k2b");       
        m.hopToAfterDP(7);    fc.assert(m.showUnlockControls,false,"k1c"); fc.assert(m.showExplButtonEnabled,false,"k2c");       
        m.hopToAfterDP(8);    fc.assert(m.showUnlockControls,false,"k1d"); fc.assert(m.showExplButtonEnabled,false,"k2d");       
        m.hopToDP(7);         fc.assert(m.showUnlockControls,false,"l1");  fc.assert(m.showExplButtonEnabled,true,"l2");
        m.hopToDP(6);         fc.assert(m.showUnlockControls,false,"m1");  fc.assert(m.showExplButtonEnabled,true,"m2");

        m.hopToDP(8);         fc.assert(m.showUnlockControls,true,"n1");  fc.assert(m.showExplButtonEnabled,false,"n2");
        m.unlocked(8);       fc.assert(m.showUnlockControls,false,"n1a"); fc.assert(m.showExplButtonEnabled,true,"n2a");
        m.pauseAfterDP(8);   fc.assert(m.showUnlockControls,false,"n1b");  fc.assert(m.showExplButtonEnabled,false,"n2b");

        // move to next one
        m.pauseAtDP(9);      fc.assert(m.showUnlockControls,false,"o1");  fc.assert(m.showExplButtonEnabled,false,"o2");
        m.pauseAtDP(11);     fc.assert(m.showUnlockControls,false,"p1");  fc.assert(m.showExplButtonEnabled,false,"p2");
        m.pauseAtDP(12);     fc.assert(m.showUnlockControls,true,"q1");  fc.assert(m.showExplButtonEnabled,false,"q2");
        
        m.hopToDP(4);         fc.assert(m.showUnlockControls,false,"r1");  fc.assert(m.showExplButtonEnabled,true,"r2");
        m.pauseAtDP(3);       fc.assert(m.showUnlockControls,false,"s1");  fc.assert(m.showExplButtonEnabled,true,"s2");
        m.hopToDP(9);         fc.assert(m.showUnlockControls,false,"t1");  fc.assert(m.showExplButtonEnabled,false,"t2");
        m.hopToDP(12);       fc.assert(m.showUnlockControls,true,"u1");  fc.assert(m.showExplButtonEnabled,false,"u2");
        m.unlocked(12);       fc.assert(m.showUnlockControls,false,"u1a"); fc.assert(m.showExplButtonEnabled,true,"u2a");
        m.hopToDP(9);         fc.assert(m.showUnlockControls,false,"v1");  fc.assert(m.showExplButtonEnabled,true,"v2");
        m.hopToDP(11);        fc.assert(m.showUnlockControls,false,"w1");  fc.assert(m.showExplButtonEnabled,true,"w2");
    }
}