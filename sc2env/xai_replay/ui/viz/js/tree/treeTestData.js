
// const observer = new MutationObserver(function (mutations){
//   mutations.forEach(function (mutation){
//     if (mutation.addedNodes.length){
//       for (var i in mutation.addedNodes){
//         console.log(mutation.addedNodes);
//       }
//       cy.nodes().forEach(function( ele ){
//         var nexusToolTip = document.getElementById( ele.data("id") + "_nexus_graph_container" )
//         nexusToolTip.addEventListener('mouseover', function (event){
//           console.log("NEXUS")
//           var toolTip = document.createElement("div");
//           var toolTipVal = document.createTextNode("nexus health: ")
//           toolTip.appendChild(toolTipVal);
//           toolTip.appendChild(toolTip);
//           toolTip.style.backgroundColor = "black";
//           toolTip.style.color = "white";
//           toolTip.style.zIndex = 1000;
//         });
//       });
//     }
//   })
// })

// const treeContainer = document.getElementById("cy");
// observer.observe(treeContainer, {childList:true});



