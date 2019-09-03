
function intitTreeFunctions(cy){
    // cy.nodes().ungrabify();
    cy.center(cy.nodes());
    //toggle show and hide nodes on hover over. Dont allow nodes at at d =0,1 to hide
    cy.on('click', 'node', function (evt) {
        if (this.scratch().restData == undefined || this.scratch().restData == null) {
            // Save node data and remove
            this.scratch({
            restData: this.successors().targets().remove()
            });
        }
        else {
            // Restore the removed nodes from saved data
            this.scratch().restData.restore();
            this.scratch({ restData: null });
        }
    });
}