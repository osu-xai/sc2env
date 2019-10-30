var sc2Treatment = "ModelBased";

function setToModelFreeTreatment(){
   controlsManager.setWaitCursor();
   sc2Treatment = "ModelFree";
   forgetCyTree();
   populatePrincipalVariationTrajectory(backingTreeRoot);
   var nodeMenuExist = document.getElementById("node-actions-label");
   if (nodeMenuExist == undefined){
       generateNodeActionMenu("node-menu", "?");
   }
   cy = cytoscape(treeData);
   var rootNodeId = backingTreeRoot["data"]["id"];
   addNextFourBestChildren(cy,cy.getElementById(rootNodeId));
   refreshCy();
   checkMenuAvailibleActions(cy.getElementById(rootNodeId))
   cy.zoom({
       level: treeZoom
     });
   var panInfo = {};
   panInfo["x"] = treePanX;
   panInfo["y"] = treePanY;
   cy.pan(panInfo);
   controlsManager.clearWaitCursor()
}

function setToModelBasedTreatment(){
   controlsManager.setWaitCursor();
   sc2Treatment = "ModelBased";
   forgetCyTree();
   populatePrincipalVariationTrajectory(backingTreeRoot);
   var nodeMenuExist = document.getElementById("node-actions-label");
   if (nodeMenuExist == undefined){
       generateNodeActionMenu("node-menu", "?");
   }
   cy = cytoscape(treeData);
   var rootNodeId = backingTreeRoot["data"]["id"];
   addNextFourBestChildren(cy,cy.getElementById(rootNodeId));
   refreshCy();
   checkMenuAvailibleActions(cy.getElementById(rootNodeId))
   controlsManager.clearWaitCursor();
}

function isTreatmentModelBased(){
   return (sc2Treatment == "ModelBased");
}