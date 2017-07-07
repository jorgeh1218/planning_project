sap.ui.define([
 "sap/ui/core/mvc/Controller"
], function(BaseController) {
 "use strict";

 return BaseController.extend("PlanificadorAppv2.controller.App", {

  onInit: function() {
   //Aplica el modo de densidad de contenido a la vista raíz
   this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
  }
 });
});