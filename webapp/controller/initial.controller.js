sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	'sap/m/Button',
	"./Utilities",
	'sap/m/Text'
], function(Controller, Dialog, Button, Utilities, Text) {
	"use strict";

	return Controller.extend("PlanificadorAppv2.controller.initial", {
		onInit: function() {
			// apply content density mode to root view

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			this.getOwnerComponent().getRouter(this).getRoute("initial").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function() {
			var that = this;
			var data = this.getView().getModel("data");
			var settings = this.getView().getModel("settings");
			console.log(data.getProperty("/INTERNAL_housingSelected/COMPLIANCESTATUSID"));
			//data.attachRequestCompleted(function() {
			try {
				if (data.getProperty("/UX_farmSelected") == "" || data.getProperty("/UX_farmSelected") == null) //Definir modelo
				{
					//Operations
					//clientID=9&PARTNERID=54
					var URL = "/SimpleFarm/services/XSJS/operationPlanning.xsjs?clientID=10&PARTNERID=57&METHOD=getFarms";
					var call = {
						url: URL,
						method: 'GET',
						dataType: 'json',
						success: function(res) {
							console.log(res);
							if (res.beanError.statuscode !== 200) {
								console.log(res.beanError);
								Utilities.messageDialogCreator("Error", "Error:" + res.beanError.statuscode + "en la llamada al servicio");

							} else {
								settings.setProperty("/farmBusyStatus", false);
								res.results.sort(function(a, b) {
									return (a.BROILERSFARMID > b.BROILERSFARMID) ? 1 :
										((b.BROILERSFARMID > a.BROILERSFARMID) ? -1 : 0);
								}); // Sort Farms by BROILERSFARMID
								
								that.getView().getModel("data").setProperty("/UX_farms", res.results);
								
							}
						},
						error: function(res) {
							console.log(res.beanError);

							Utilities.messageDialogCreator("Error", "Error:" + res.beanError.statuscode + "en la llamada al servicio");
						}
					};
					settings.setProperty("/farmBusyStatus", true);
					$.ajax(call);
				}
			} catch (error) {
				console.log(error);
			}

			//		});
		},
		handlePress: function(oEvent) {
			//var route = oEvent.getSource().oBindingContexts.tiles.sPath.split("/galpones/",2);
			var view = this.getView();
			var model = view.getModel("settings");
			var dataModel = view.getModel("data");
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			var object = oEvent.getSource().getBindingContext("data").getObject();

			//If another farm is selected there is the need to erase any changes saved previously in other operations
			console.log(object.BROILERSFARMID + " vs. " + dataModel.getProperty("/UX_farmSelected/BROILERSFARMID"));
			if ((dataModel.getProperty("/UX_farmSelected") !== null && dataModel.getProperty("/UX_farmSelected") !== "") &&
				(dataModel.getProperty("/UX_centerSelected") !== null && dataModel.getProperty("/UX_centerSelected") !== "") &&
				object.BROILERSFARMID !== dataModel.getProperty("/UX_farmSelected/BROILERSFARMID")) {
				//Send Warning losing all changes
				var dialog = new Dialog({
					title: 'Confirmar',
					type: 'Message',
					content: new Text({
						text: 'Si continua, perderá los cambios realizados en cualquier otra granja'
					}),
					beginButton: new Button({
						text: 'Aceptar',
						press: function() {

							dataModel.setProperty("/INTERNAL_shedSelected", "");
							dataModel.setProperty("/UX_centerSelected", "");
							dataModel.setProperty("/INTERNAL_supplySelected", "");
							dataModel.setProperty("/INTERNAL_sanitarySelected", "");
							dataModel.setProperty("/UX_farmSelected/", object);
							dialog.close();
							router.navTo("main", /*objeto de parámetros*/ {}, false /*create history*/ );
						}
					}),
					endButton: new Button({
						text: 'Cancelar',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});

				dialog.open();
			} else {
				dataModel.setProperty("/UX_farmSelected/", object);
				router.navTo("main", /*objeto de parámetros*/ {}, false /*create history*/ );
			}
		},
		onAfterRendering: function() {
			/*      var dialog = new sap.m.Dialog({
    			title: "Error",
    			type: "Message",
    			state: "Error",
    			content: new sap.m.Text({
    				text: "Ocurrió un error al momento de Geolocalizar el galpón."
    			}),
    			beginButton: new sap.m.Button({
    				text: "OK",
    				press: function () {
    					dialog.close();
    				}
    			}),
    			afterClose: function() {
    				dialog.destroy();
    			}
    		});

    		dialog.open();*/
		}
	});

});