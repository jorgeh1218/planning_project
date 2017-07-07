sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"./Utilities",
	'sap/m/Button',
	'sap/m/Text',
	'sap/ui/model/Filter',
	"./Formatter"
], function(Controller, Dialog, Utilities, Button, Text, Filter, Formatter) {
	"use strict";
	var viewId;
	return Controller.extend("PlanificadorAppv2.controller.main", {
		Formatter: Formatter,
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Routing//////////
		//**////**////**////**////**////**////**////**////**////**////**////**//
		goBack: function() {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("main", {}, true /*no history*/ );
		},
		goBackFarm: function() {
			var oHistory, sPreviousHash;
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			oHistory = sap.ui.core.routing.History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				router.navTo("initial", {}, false);
			}
		},
		_onRouteMatched: function() {
			var model = this.getView().getModel("data");
			try {
				if (model.getProperty("/UX_farmSelected") == null) {
					this.goBackFarm();
				}
				if (model.getProperty("/UX_centerSelected") == null || model.getProperty("/UX_centerSelected") === "") {
					this.validateTabsAccess();
					this.setHeader();
				}
			} catch (error) {
				this.goBackFarm();
			}
		},
		_onRouteFormsMatch: function() {
			var model = this.getView().getModel("data");
			try {
				if (model.getProperty("/UX_farmSelected") == null) {
					this.goBackFarm();
				}
			} catch (error) {
				this.goBackFarm();
			}
		},
		onViewPlanRecord: function() {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("form", /*objeto de parámetros*/ {

			}, true /*create history*/ );
		},
		onViewPlanSanitaryRecord: function() {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("formSanitary", /*objeto de parámetros*/ {

			}, true /*create history*/ );
		},
		//Initialize dialog in null in order to not open several of them when clicking the button add
		showDialog: null,
		onCreateSanitaryRecord: function() {
			if (!this.showDialog) {
				console.log("ACA");
				this.showDialog = sap.ui.xmlfragment("PlanificadorAppv2.view.sanitaryDialog", this);
				this.getView().addDependent(this.showDialog);
				this.showDialog.open();
			}
		},
		onCreateSupplyRecord: function() {
			if (!this.showDialog) {
				this.showDialog = sap.ui.xmlfragment("PlanificadorAppv2.view.supplyDialog", this);
				this.getView().addDependent(this.showDialog);
				this.showDialog.open();
			}
		},
		onViewPlanSupplyRecord: function() {
			var router = sap.ui.core.UIComponent.getRouterFor(this);
			router.navTo("formSupplies", /*objeto de parámetros*/ {

			}, true /*create history*/ );
		},
		onInit: function() {
			var view = this.getView();
			viewId = view.getId() + "--";

			// apply content density mode to root view
			view.addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.getOwnerComponent().getRouter(this).getRoute("main").attachMatched(this._onRouteMatched, this);
			this.getOwnerComponent().getRouter(this).getRoute("form").attachMatched(this._onRouteFormsMatch, this);
			this.getOwnerComponent().getRouter(this).getRoute("formSanitary").attachMatched(this._onRouteFormsMatch, this);
			this.getOwnerComponent().getRouter(this).getRoute("formSupplies").attachMatched(this._onRouteFormsMatch, this);
		},
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Calls//////////
		//**////**////**////**////**////**////**////**////**////**////**////**//

		//////////////////////////////////////
		//Housing Plan Screen Calls//
		//////////////////////////////////////
		deleteHousingPlan: function(index) {
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs";
			var body = {
				"METHOD": "deleteHousingPlan",
				"HOUSINGPLANID": index
			};
			var call = {
				url: URL,
				method: 'PUT',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						//Show results successful if needed
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			console.log(JSON.stringify(body));
			$.ajax(call);
		},
		pullHousingPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//var settings = view.getModel("settings");
			//Need to pull breed and gender

			console.log("SHED");
			console.log(model.getProperty("/INTERNAL_shedSelected/SHEDID"));
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs?METHOD=getHousingPlanPerSehd&shedID=" +
				model.getProperty("/INTERNAL_shedSelected/SHEDID");
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log("Housing Plan");
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						settings.setProperty("/housingPlanBusyStatus", false);
						model.setProperty("/UX_housingPlan", res.results); //Revisar servicio, me estoy quedando con el objeto 0
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/housingPlanBusyStatus", true);
			$.ajax(call);
		},
		pushHousingPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");

			var shed = model.getProperty("/INTERNAL_shedSelected");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs";
			var body = {
				"SHEDID": shed.SHEDID,
				"BROILERBREEDID": view.byId("breed").getSelectedKey(),
				"GENDERID": view.byId("gender").getSelectedKey(),
				"QUANTITYBIRDS": view.byId("quantity").getValue(),
				"HOUSINGDATE": view.byId("dateHousing").getValue(),
				"EVICTIONDATE": view.byId("dateEviction").getValue(),
				"COMPLIANCESTATUSID": "52",
				"EXECUTIONSTATUSID": "52",
				"FIELD1": "",
				"FIELD2": "",
				"BROILERSLOTID": "",
				"CONSUMPTIONSTANDARDID": ""
			};
			console.log(JSON.stringify(body));
			var call = {
				url: URL,
				method: 'POST',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						//Show results successful if needed
						that.pullHousingPlan();
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		updateHousingPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var housingPlan, body, housingBroilersLot, housingConsumptionStandard;
			var shed = model.getProperty("/INTERNAL_shedSelected");

			//Attempting to get Plan ID
			housingPlan = model.getProperty("/INTERNAL_housingSelected/HOUSINGPLANID");
			housingBroilersLot = model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID");
			housingConsumptionStandard = model.getProperty("/INTERNAL_housingSelected/CONSUMPTIONSTANDARDID");

			if (housingBroilersLot == null)
				housingBroilersLot = "";
			if (housingConsumptionStandard == null)
				housingConsumptionStandard = "";

			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs";
			body = {
				"METHOD": "updateHousingPlan",
				"HOUSINGPLANID": housingPlan,
				"SHEDID": shed.SHEDID,
				"BROILERBREEDID": view.byId("breed").getSelectedKey(),
				"GENDERID": view.byId("gender").getSelectedKey(),
				"QUANTITYBIRDS": view.byId("quantity").getValue(),
				"HOUSINGDATE": view.byId("dateHousing").getValue(),
				"EVICTIONDATE": view.byId("dateEviction").getValue(),
				"COMPLIANCESTATUSID": "52",
				"EXECUTIONSTATUSID": "52",
				"FIELD1": "",
				"FIELD2": "",
				"BROILERSLOTID": housingBroilersLot,
				"CONSUMPTIONSTANDARDID": housingConsumptionStandard
			};
			var call = {
				url: URL,
				method: 'PUT',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						// Modify on local model what globally changed
						//Modify changes in Breed & Gender
						model.setProperty("INTERNAL_housingSelected/BROILERBREED/GENETICLINE", view.byId("breed").getSelectedItem().getText());
						model.setProperty("INTERNAL_housingSelected/BROILERBREED/ID", view.byId("breed").getSelectedKey());
						model.setProperty("INTERNAL_housingSelected/GENDER/ID", view.byId("gender").getSelectedKey());
						model.setProperty("INTERNAL_housingSelected/GENDER/NAME", view.byId("gender").getSelectedItem().getText());
						model.setProperty(model.getProperty("/INTERNAL_housingSelectedPath"), model.getProperty("/INTERNAL_housingSelected"));
						//	that.resetHousingRecordValues(); //Unset Plan as selected
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		completeHousingPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var housingPlan, body, housingBroilersLot, housingConsumptionStandard;
			var shed = model.getProperty("/INTERNAL_shedSelected");

			//Attempting to get Plan ID
			housingPlan = model.getProperty("/INTERNAL_housingSelected");
			housingBroilersLot = model.getProperty("/INTERNAL_lotCreated");
			housingConsumptionStandard = model.getProperty("/UX_supplyPlan/CONSUMPTIONSTANDARDID");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs";
			body = {
				"METHOD": "updateHousingPlan",
				"HOUSINGPLANID": housingPlan.HOUSINGPLANID,
				"SHEDID": shed.SHEDID,
				"BROILERBREEDID": housingPlan.BROILERBREED.ID,
				"GENDERID": housingPlan.GENDER.ID,
				"QUANTITYBIRDS": housingPlan.QUANTITYBIRDS,
				"HOUSINGDATE": housingPlan.HOUSINGDATE,
				"EVICTIONDATE": housingPlan.EVICTIONDATE,
				"COMPLIANCESTATUSID": "52",
				"EXECUTIONSTATUSID": "52",
				"FIELD1": "",
				"FIELD2": "",
				"BROILERSLOTID": housingBroilersLot,
				"CONSUMPTIONSTANDARDID": housingConsumptionStandard
			};
			console.log(body);
			var call = {
				url: URL,
				method: 'PUT',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						that.moveEntitySelectedForward(); //Move to the next entity
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);

		},
		/*updateHousingPlan: function() {
			var view = this.getView();
			var that = this;
			var flag_broilerCreated = false;
			var model = view.getModel("data");
			var housingPlanID, housingPlan, body;
			var shed = model.getProperty("/INTERNAL_shedSelected");

			//Attempting to get Plan ID
			housingPlan = model.getProperty("/INTERNAL_housingSelected/HOUSINGPLANID"); // Modificado el 02/05

			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHousing.xsjs";
			if (model.getProperty("/INTERNAL_housingSelected") == "") //Lot has not been created yet
			{
				body = {
					"METHOD": "updateHousingPlan",
					"HOUSINGPLANID": housingPlan,
					"SHEDID": shed.SHEDID,
					"BROILERBREEDID": view.byId("breed").getSelectedKey(),
					"GENDERID": view.byId("gender").getSelectedKey(),
					"QUANTITYBIRDS": view.byId("quantity").getValue(),
					"HOUSINGDATE": view.byId("dateHousing").getValue(),
					"EVICTIONDATE": view.byId("dateEviction").getValue(),
					"COMPLIANCESTATUSID": "52",
					"EXECUTIONSTATUSID": "52",
					"FIELD1": "",
					"FIELD2": "",
					"BROILERSLOTID": "",
					"CONSUMPTIONSTANDARDID": ""
				};
			} else {
				flag_broilerCreated = true;
				body = {
					"METHOD": "updateHousingPlan",
					"HOUSINGPLANID": housingPlan,
					"SHEDID": shed.SHEDID,
					"BROILERBREEDID": model.getProperty("/INTERNAL_housingSelected/BROILERBREED/ID"),
					"GENDERID": model.getProperty("/INTERNAL_housingSelected/GENDER/ID"),
					"QUANTITYBIRDS": model.getProperty("/INTERNAL_housingSelected/QUANTITYBIRDS"),
					"HOUSINGDATE": model.getProperty("/INTERNAL_housingSelected/HOUSINGDATE"),
					"EVICTIONDATE": model.getProperty("/INTERNAL_housingSelected/EVICTIONDATE"),
					"COMPLIANCESTATUSID": "52",
					"EXECUTIONSTATUSID": "52",
					"FIELD1": "",
					"FIELD2": "",
					"BROILERSLOTID": model.getProperty("/SERVICE_broilersLot"),
					"CONSUMPTIONSTANDARDID": model.getProperty("/INTERNAL_supplyStandardSelected/CONSUMPTIONSTANDARTID")
				};
				console.log(body);
			}
			var call = {
				url: URL,
				method: 'PUT',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						//model.setProperty(housingPath, model.getProperty("/INTERNAL_housingSelected")); // Modify on local model what globally changed
						//Modify changes in Breed & Gender
						model.setProperty("INTERNAL_housingSelected/BROILERBREED/GENETICLINE", view.byId("breed").getSelectedItem().getText());
						model.setProperty("INTERNAL_housingSelected/BROILERBREED/ID", view.byId("breed").getSelectedKey());
						model.setProperty("INTERNAL_housingSelected/GENDER/ID", view.byId("gender").getSelectedKey());
						model.setProperty("INTERNAL_housingSelected/GENDER/NAME", view.byId("gender").getSelectedItem().getText());
						//	that.resetHousingRecordValues(); //Unset Plan as selected
						that.pushSupplyPlan();
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},*/
		/*onEditHousing: function(oEvent) {
			var view = this.getView();
			var settings = view.getModel("settings");
			var model = view.getModel("data");
			view.getModel("settings").setProperty("/creating-housing", false); // Set property as false for creating housing since it is edit
			var object = oEvent.getSource().getBindingContext("data");
			model.setProperty("/INTERNAL_housingSelected", JSON.parse(JSON.stringify(model.getProperty(object.sPath)))); //Set Sanitary Element in Model as the Element Selected in the table
			model.setProperty("/INTERNAL_housingSelectedPath", object.sPath);
			settings.setProperty("/titleForm", "Editar");
			this.onViewPlanRecord();
			if (model.getProperty("/UX_gendersList") === "" || model.getProperty("/UX_gendersList") === null) {
				this.pullGenderAndBreed();
			}
		},*/
		confirmHousing: function() {
			var initial_density = 17;

			var that = this;
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");

			//fields to validate
			//var breed = view.byId("breed");
			//var gender = view.byId("gender");
			var dateIN = view.byId("dateHousing");
			var dateOUT = view.byId("dateEviction");
			var quantity = view.byId("quantity");

			var INTERNAL_housingSelected = model.getProperty("/INTERNAL_housingSelected");
			var housing, dialog, message = 'Desea confirmar los cambios realizados a este Plan de Alojamiento?';

			//Check first if density is not violated
			var width = parseInt(model.getProperty("/INTERNAL_shedSelected/STALLWIDTH"));
			var height = parseInt(model.getProperty("/INTERNAL_shedSelected/STALLHEIGHT"));
			var allocation = width * height * initial_density;
			//If what I am trying to house is bigger than allowed
			if (allocation < quantity.getValue()) {
				message = "Ha excedido la capacidad del galpón (" + allocation + " aves). Desea confirmar el alojamiento?";
			}
			//Show confirmation pop up
			dialog = new Dialog({
				title: 'Aviso',
				type: 'Message',
				content: new Text({
					text: message
				}),
				beginButton: new Button({
					text: 'Aceptar',
					press: function() {
						//Put selected on model 
						//model.setProperty(model.getProperty("/INTERNAL_housingSelectedPath"), model.getProperty("/INTERNAL_housingSelected"));
						//console.log(model.getProperty("/INTERNAL_housingSelectedPath"));
						//Update Standard Sorting
						/*	housing = model.getProperty("/UX_housingPlan");
							housing.sort(function(a, b) {
								return (parseInt(a.HOUSINGDATE) > parseInt(b.HOUSINGDATE)) ? 1 :
									((parseInt(b.HOUSINGDATE) > parseInt(a.HOUSINGDATE)) ? -1 : 0);
							});
							model.setProperty("/UX_housingPlan", housing);*/

						if ( /*breed.getValue() == "" || gender.getValue() == "" ||*/ quantity.getValue() == "" || dateIN.getValue() == "" ||
							dateOUT.getValue() == "") {
							Utilities.messageDialogCreator("Error", "Error: Faltan campos por llenar en el Plan de Alojamiento");
						} else {
							if (!settings.getProperty("/creating-housing"))
								that.updateHousingPlan();
							else
								that.pushHousingPlan();

							that.goBack();
						}
						dialog.close();
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
		},
		setBroilersLot: function() {
			var model = this.getView().getModel("data");
			var that = this;
			//Lote Planificado STATUS 55
			var SERVICE_broilersLot = {
				SHEDID: "" + model.getProperty("/INTERNAL_shedSelected/SHEDID"),
				WEIGHTUNIT: "24",
				IDSEX: "" + model.getProperty("/INTERNAL_housingSelected/GENDER/ID"),
				STATUSID: "55",
				ARRIVALDATE: "" + model.getProperty("/INTERNAL_housingSelected/HOUSINGDATE"),
				INITIALWEIGHT: "0",
				INITIALQUANTITY: "0",
				QUANTITY: "0",
				WEIGHT: "0",
				CHIKENSQUANTIY: "" + model.getProperty("/INTERNAL_housingSelected/QUANTITYBIRDS"),
				METHOD: "txBroilersLot"
			};
			console.log(SERVICE_broilersLot);
			var URL = "/SimpleAgro/services/XSJS/operationBroilersLot.xsjs";
			var call = {
				type: "POST",
				contentType: "application/json",
				url: URL,
				dataType: "json",
				data: JSON.stringify(SERVICE_broilersLot),
				success: function(res) {
					console.log(res);
					if (res.beanError.STATUS != 200) {
						//Mensaje de error:
						console.log(res.beanError.service + " - " + res.beanError.metodo + " - " + res.beanError.message);
						Utilities.messageDialogCreator("Error", "Error " + res.beanError.ERRORCODE + ": Error en la llamada al servicio");

					} else {
						model.setProperty("/INTERNAL_housingSelected/BROILERSLOTID", res.results.BROILERSLOTID);
						model.setProperty("/INTERNAL_lotCreated", res.results.BROILERSLOTID);
						that.completeHousingPlan();
						//console.log(res.results.BROILERSLOTID);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		getResourcesForSupplyPlan: function() {
			//Verify if lot is created 
			//this.setBroilersLot();
			//It is important to get the plan associated to the housing plan
			//If there is not a plan established, bring the standard then 
			var view = this.getView();
			var model = view.getModel("data");
			var housing = model.getProperty("/INTERNAL_housingSelected");
			console.log(housing);
			if (housing.CONSUMPTIONSTANDARDID == "" || housing.CONSUMPTIONSTANDARDID == null) //Lot has not been created
			{
				//view.byId("searchSupplyStandard").setValue("");
				view.getModel("settings").setProperty("/enabled-searchSupply", true);
				this.pullSupplyStandard();
			} else {
				//view.byId("searchSupplyStandard").setValue("");//Erase value
				view.getModel("settings").setProperty("/enabled-searchSupply", false); //
				this.pullSupplyPlan();
			}
		},

		//////////////////////////////////////
		//Supply Screen Calls//
		//////////////////////////////////////
		pullSupplyStandard: function() {
			var view = this.getView();
			var that = this;
			var i, j, length, detailLength;
			var model = view.getModel("data");
			var quantityBirds = parseInt(model.getProperty("/INTERNAL_housingSelected/QUANTITYBIRDS"));
			var settings = view.getModel("settings");
			//var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL =
				"/SimpleFarm/services/XSJS/operationPlanning.xsjs?METHOD=getConsumptionStandart2&" +
				"breedId=2" //+model.getProperty("/INTERNAL_housingSelected/BROILERBREED/ID")
				+ "&genderID=" + model.getProperty("/INTERNAL_housingSelected/GENDER/ID");
			console.log(URL);
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log("Standard Plan>");
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						/*length = res.results.details.length;
						for (i = 0; i != length; i++)
							res.results.details[i].TotalMultiplied = parseInt(res.results.details[i].Total) * quantityBirds;
						settings.setProperty("/supplyPlanBusyStatus", false);
						model.setProperty("/supplyStandard", res.results[0]);//Getting Service 0*/
						length = res.results.length;
						for (i = 0; i != length; i++) {
							res.results[i].UX_Key = i;
							res.results[i].UX_Identifier = "Plan de Consumo Estándar " + res.results[i].CONSUMPTIONSTANDARDID + "-" + i; //Functions as 
							// key to get the index easier
							detailLength = res.results[i].details.length;
							for (j = 0; j != detailLength; j++) {
								res.results[i].details[j].sort_intAge = parseInt(res.results[i].details[j].Age);
								res.results[i].details[j].TotalMultiplied = (parseFloat(res.results[i].details[j].Total) * quantityBirds) / 1000; //Toneladas
							}
						}
						model.setProperty("/SERVICE_supplyStandards", res.results);
						settings.setProperty("/supplyPlanBusyStatus", false);
						settings.setProperty("/searchSupplyBusyStatus", false);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/supplyPlanBusyStatus", true);
			settings.setProperty("/searchSupplyBusyStatus", true);
			$.ajax(call);
		},
		pullSupplyPlan: function() {
			var view = this.getView();
			var i, length;
			var that = this;
			var model = view.getModel("data");
			var quantityBirds = parseInt(model.getProperty("/INTERNAL_housingSelected/QUANTITYBIRDS"));
			var settings = view.getModel("settings");
			//var settings = view.getModel("settings");
			//Need to pull breed and gender

			var URL = "/SimpleFarm/services/XSJS/operationFoodPlan2.xsjs?" +
				"foodPlanID=18&method=forPlanning&clientID=10&PARTNERID=57";
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						if (!res.assert) //There is no plan yet
						{
							that.pullSupplyStandard();
						} else {
							console.log(res.results);
							length = res.results.details.length;
							for (i = 0; i != length; i++) {
								res.results.details[i].sort_intAge = parseInt(res.results.details[i].Age);
								res.results.details[i].TotalMultiplied = (parseFloat(res.results.details[i].Total) * quantityBirds) / 1000; // Toneladas
							}
							settings.setProperty("/supplyPlanBusyStatus", false);
							model.setProperty("/UX_supplyPlan", res.results);
						}
						//model.setProperty("/supplyStandard", res);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/supplyPlanBusyStatus", true);
			$.ajax(call);
		},
		pullSupplyElements: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var that = this;

			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationFood.xsjs?method=getFoods";
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						settings.setProperty("/selectBusyStatus", false);
						model.setProperty("/UX_supplies", res.results);
						that.onCreateSupplyRecord();
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/selectBusyStatus", false);
			$.ajax(call);
		},
		pushSupplyPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationFoodPlan2.xsjs";

			var body = {
				"BROILERSLOTID": model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID"),
				"FOODPLANID": +new Date(),
				"HOUSINGPLANID": model.getProperty("/INTERNAL_housingSelected/HOUSINGPLANID"),
				"details": model.getProperty("/UX_supplyPlan/details")
			};
			console.log(body);
			var call = {
				url: URL,
				method: 'POST',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						that.moveEntitySelectedForward(); //Move to the next entity
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},

		//////////////////////////////////////
		//Sanitary Screen Calls///////////////
		//////////////////////////////////////
		confirmSanitary: function() {

			var view = this.getView();
			var model = view.getModel("data");
			view.getModel("settings").setProperty("/sanitary-plan-edited", true);
			var sanitaryPlan = model.getProperty("/UX_sanitaryStandards");
			var INTERNAL_santiraySelected = model.getProperty("/INTERNAL_sanitarySelected"); //Array of dairy supplies
			var acum = 0;
			var supplies;

			//Validation missing

			if (model.getProperty("/INTERNAL_sanitarySelected/QUANTITY") == null || model.getProperty("/INTERNAL_sanitarySelected/QUANTITY") ==
				"" ||
				model.getProperty("/INTERNAL_sanitarySelected/AGE") == null || model.getProperty("/INTERNAL_sanitarySelected/AGE") == "") {
				Utilities.messageDialogCreator("Error", "Error: Faltan campos por llenar en el Plan de Alojamiento");
			} else {
				//Manual Refresh of Data Model
				//console.log("Linea 732 Sanitary Standards");
				//console.log(sanitaryPlan);
				/*model.setProperty("/UX_sanitaryStandards", "");
				model.setProperty("/UX_sanitaryStandards", sanitaryPlan);*/
				model.setProperty("/INTERNAL_sanitarySelected/sort_intAge", parseInt(model.getProperty("/INTERNAL_sanitarySelected/AGE"))); //Sorting Age
				this.goBack();
			}
			//Update total in general supplies
			/*	if( model.getProperty("/INTERNAL_sanitarySelected/AGE") == "" || model.getProperty("/INTERNAL_sanitarySelected/DOSE") == "")
				{
					
				}
			*/
			//model.setProperty(model.getProperty("/INTERNAL_sanitarySelectedPath/AGE"), model.getProperty("/INTERNAL_sanitarySelected/AGE")); //Update age if changed in view
			//model.setProperty(model.getProperty("/INTERNAL_sanitarySelectedPath/medicalSupplyDos"), model.getProperty("/INTERNAL_sanitarySelected/DOSE"));

			//Update Standard Sorting
			/*supplies.sort(function(a, b) {
				return (parseInt(a.AGE) > parseInt(b.AGE)) ? 1 :
					((parseInt(b.AGE) > parseInt(a.AGE)) ? -1 : 0);
			});*/
			//model.setProperty("/UX_sanitaryStandards", supplies);
		},
		pullSanitaryElements: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var that = this;

			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationMaterial.xsjs?METHOD=getMedicalSupplies";
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						settings.setProperty("/selectBusyStatus", false);
						model.setProperty("/UX_vaccines", res.results);
						that.onCreateSanitaryRecord();
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/selectBusyStatus", false);
			$.ajax(call);
		},
		pullSanitaryPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var length, i;
			//Need to pull breed and gende
			var URL = "/SimpleFarm/services/XSJS/operationHealthPlan.xsjs?broilersLotID=" + model.getProperty(
				"/INTERNAL_housingSelected/BROILERSLOTID") + "&METHOD=getPerBroilersLotID";
			console.log(model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID"));
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						if (res.results.length == 0) {
							console.log("Bring standard");
							settings.setProperty("/creating-sanitary", true);
							that.pullSanitaryStandard();
						} else {

							console.log("Bring santiray already");
							settings.setProperty("/creating-sanitary", false);
							settings.setProperty("/sanitaryPlanBusyStatus", false);
							/*res.results.sort(function(a, b) {
								return (parseInt(a.AGE) > parseInt(b.AGE)) ? 1 :
									((parseInt(b.AGE) > parseInt(a.AGE)) ? -1 : 0);
							});*/
							length = res.results.length;
							for (i = 0; i != length; i++)
								res.results[i].sort_intAge = parseInt(res.results[i].AGE);
							model.setProperty("/UX_sanitaryStandards", res.results);
						}
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/sanitaryPlanBusyStatus", true);
			$.ajax(call);
		},
		pullSanitaryStandard: function() {
			var view = this.getView();
			var that = this;
			var i, length;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHealthPlan.xsjs?standard=1&METHOD=getPerBroilersLotID";
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						settings.setProperty("/sanitaryPlanBusyStatus", false);
						/*res.results.sort(function(a, b) {
							return (parseInt(a.AGE) > parseInt(b.AGE)) ? 1 :
								((parseInt(b.AGE) > parseInt(a.AGE)) ? -1 : 0);
						});*/

						length = res.results.length;
						for (i = 0; i != length; i++)
							res.results[i].sort_intAge = parseInt(res.results[i].AGE);
						model.setProperty("/UX_sanitaryStandards", res.results);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/sanitaryPlanBusyStatus", true);
			$.ajax(call);
		},
		updateSanitaryPlan: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHealthPlan.xsjs";
			var modelDetails = model.getProperty("/UX_sanitaryStandards");
			var bodyDetails = [],
				i, element;
			var length = modelDetails.length;
			for (i = 0; i != length; i++) {
				element = {
					AGE: modelDetails[i].AGE,
					DOSE: modelDetails[i].QUANTITY,
					MEDICALSUPPLYID: modelDetails[i].MEDICALSUPPLYID
				};
				bodyDetails.push(element);
			}

			var body = {
				"ACTION": "updateWholePlan",
				"broilersLotID": model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID"),
				"housingPlanID": model.getProperty("/INTERNAL_housingSelected/HOUSINGPLANID"),
				"details": bodyDetails
			};
			console.log(body);
			var call = {
				url: URL,
				method: 'PUT',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statusCode + ": Error en la llamada al servicio");
					} else {
						that.moveEntitySelectedForward();
					}
				},
				error: function(err) {
					console.log(err);
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		pushSanitaryPlanHeader: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHealthPlan.xsjs";

			var body = {
				"housingPlanId": model.getProperty("/INTERNAL_housingSelected/HOUSINGPLANID"),
				"broilersLotId": model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID"),
				"creationDate": that.getFormattedDate()
			};
			console.log(body);
			var call = {
				url: URL,
				method: 'POST',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res.results);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						that.pushSanitaryPlanDetail(res.results.healthPlanId);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		pushSanitaryPlanDetail: function(healthPlanId) {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationHealthPlanDetail.xsjs";
			var modelDetails = model.getProperty("/UX_sanitaryStandards");
			var bodyDetails = [],
				i, element;
			var length = modelDetails.length;
			for (i = 0; i != length; i++) {
				element = {
					AGE: modelDetails[i].AGE,
					DOSE: modelDetails[i].QUANTITY,
					MEDICALSUPPLYID: modelDetails[i].MEDICALSUPPLYID
				};
				bodyDetails.push(element);
			}

			var body = {
				"healthPlanId": healthPlanId,
				"details": bodyDetails
			};
			console.log(body);
			var call = {
				url: URL,
				method: 'POST',
				data: JSON.stringify(body),
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.meta.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						that.moveEntitySelectedForward();
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			$.ajax(call);
		},
		/*onEditSanitary: function(oEvent) {
			var view = this.getView();
			var model = view.getModel("data");
			var object = oEvent.getSource().getBindingContext("data");
			model.setProperty("/INTERNAL_sanitarySelected", model.getProperty(object.sPath)); //Set Sanitary Element in Model as the Element Selected in the table
			model.setProperty("/INTERNAL_sanitarySelectedPath", object.sPath);
			this.onViewPlanSanitaryRecord();
		},*/

		///////////////////////////////////////////////
		//Gender and Breed Screen Calls///////////////
		/////////////////////////////////////////////
		pullGenderAndBreed: function() {
			var view = this.getView();
			var that = this;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			//Need to pull breed and gender
			var URL = "/SimpleFarm/services/XSJS/operationBreedGender.xsjs?clientID=10&PARTNERID=57&languageID=ES&METHOD=getBreedGender";
			var call = {
				url: URL,
				method: 'GET',
				dataType: 'json',
				success: function(res) {
					console.log(res);
					if (res.breeds[0].beanError.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else if (res.genders[0].beanError.statuscode !== 200) {
						Utilities.messageDialogCreator("Error", "Error " + res.meta.statuscode + ": Error en la llamada al servicio");
					} else {
						settings.setProperty("/selectBusyStatus", false);
						model.setProperty("/INTERNAL_breedgenderList/UX_breedsList", res.breeds[0].results);
						model.setProperty("/INTERNAL_breedgenderList/UX_gendersList", res.genders[0].results);
					}
				},
				error: function(err) {
					Utilities.messageDialogCreator("Error", "Error " + err.state.status + ": Error en la llamada al servicio");
				}
			};
			settings.setProperty("/selectBusyStatus", true);
			$.ajax(call);
		},
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Search fields
		//**////**////**////**////**////**////**////**//
		searchSupplyStandard: function(oEvent) {
			var view = this.getView();
			var model = view.getModel("data");
			var supplyModel = model.getProperty("/SERVICE_supplyStandards");
			var valueSearch = oEvent.getSource().getValue();
			console.log(supplyModel);
			var indexStandard = valueSearch.split("-")[1];
			var lengthStandards = supplyModel.length;
			try {
				if (indexStandard >= 0 && indexStandard < lengthStandards) //If it is within limits
				{
					model.setProperty("/UX_supplyPlan", supplyModel[indexStandard]);
				} else {
					model.setProperty("/UX_supplyPlan", "");
				}
			} catch (error) {
				model.setProperty("/UX_supplyPlan", "");
			}

		},
		onCenterSearch: function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("NAME", sap.ui.model.FilterOperator.Contains, sQuery);
				//var filter2 = new Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
				//	aFilters.push(filter2);
			}

			// update list binding
			var list = this.getView().byId("centerTable");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onShedSearch: function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("SHEDCODE", sap.ui.model.FilterOperator.Contains, sQuery);
				//var filter2 = new Filter("Tplnr", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
				//	aFilters.push(filter2);
			}

			// update list binding
			var list = this.getView().byId("shedTable");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onHousingSearch: function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("HOUSINGDATE", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("GENDER/NAME", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter3 = new Filter("BROILERBREED/GENETICLINE", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters = new sap.ui.model.Filter([filter, filter2, filter3]);
			}
			// update list binding
			var list = this.getView().byId("planTable");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onSupplySearch: function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Name", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("Age", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters = new sap.ui.model.Filter([filter, filter2]);
			}
			// update list binding
			var list = this.getView().byId("supplyTable");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		onSanitarySearch: function(oEvt) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("VACCINENAME", sap.ui.model.FilterOperator.Contains, sQuery);
				var filter2 = new Filter("AGE", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters = new sap.ui.model.Filter([filter, filter2]);
			}
			// update list binding
			var list = this.getView().byId("sanitaryTable");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		},
		handleSanitaryDialogSearch: function(oEvt) {
			var sValue = oEvt.getParameter("value");
			var oFilter = new Filter("NAME", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvt.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleSupplyDialogSearch: function(oEvt) {
			var sValue = oEvt.getParameter("value");
			var oFilter = new Filter("NAME", sap.ui.model.FilterOperator.Contains, sValue);
			var oBinding = oEvt.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Utilities
		//**////**////**////**////**////**////**////**//
		onSelectBreedChange: function(oEvt) {
			console.log(oEvt.getSource());
			console.log(oEvt.getParameters());
			var model = this.getView().getModel("data");
			var source = oEvt.getParameters().selectedItem.getBindingContext("data").sPath + "/BROILERBREEDID";
			var key = model.getProperty(source);
			console.log(key);
			model.setProperty("/INTERNAL_breedgenderList/valueBreed", key);
			console.log(model.getProperty("/INTERNAL_breedgenderList/valueBreed"));
		},
		onSelectGenderChange: function(oEvt) {
			var model = this.getView().getModel("data");
			var source = oEvt.getParameters().selectedItem.getBindingContext("data").sPath + "/GENDERID";
			var key = model.getProperty(source);
			console.log(key);
			model.setProperty("/INTERNAL_breedgenderList/valueGender", key);
		},
		centerSearchFieldReset: function() {
			var view = this.getView();
			var aFilters;
			var filter, list, binding, search;
			try {
				//Resetting filter centers
				search = view.byId("centerSearchField");
				list = view.byId("centerTable");
				binding = list.getBinding("items");
				binding.filter([], "Application");
				search.setValue("");
			} catch (error) {
				return;
			}
		},
		shedSearchFieldReset: function() {
			var view = this.getView();
			var aFilters;
			var filter, list, binding, search;
			try {
				//Resetting sheds
				search = view.byId("shedSearchField");
				list = view.byId("shedTable");
				binding = list.getBinding("items");
				binding.filter([], "Application");
				search.setValue("");
			} catch (error) {
				return;
			}
		},
		housingSearchFieldReset: function() {
			var view = this.getView();
			var aFilters;
			var filter, list, binding, search;
			try {
				//Resetting housing plan 
				search = view.byId("housingSearchField");
				list = view.byId("planTable");
				binding = list.getBinding("items");
				binding.filter([], "Application");
				search.setValue("");
			} catch (error) {
				return;
			}
		},
		sanitarySearchFieldReset: function() {
			var view = this.getView();
			var aFilters;
			var filter, list, binding, search;
			try {
				//Resetting sanitary plan 
				search = view.byId("sanitarySearchField");
				list = view.byId("sanitaryTable");
				binding = list.getBinding("items");
				binding.filter([], "Application");
				search.setValue("");
			} catch (error) {
				return;
			}
		},
		getFormattedDate: function() {
			var todayTime = new Date();
			var month = todayTime.getMonth();
			var day = todayTime.getDay();
			var year = todayTime.getFullYear();
			return year + "-" + month + "-" + day;
		},
		onSuggest: function(event) {
			var typeField = event.getSource();
			var sTerm = event.getParameter("suggestValue");
			var aFilters = [];
			if (sTerm) {
				aFilters.push(new Filter("UX_Identifier", sap.ui.model.FilterOperator.StartsWith, sTerm));
			}
			typeField.getBinding("suggestionItems").filter(aFilters);
			typeField.suggest();
		},
		handleCloseSanitaryDialog: function(oEvent) {
			var model = this.getView().getModel("data");
			var elementSelected;
			var arraySanitary = model.getProperty("/UX_sanitaryStandards");
			var aContexts = oEvent.getParameter("selectedContexts");
			var i, length;
			if (aContexts != null) {
				length = aContexts.length;
				for (i = 0; i != length; i++) {
					elementSelected = {
						QUANTITY: model.getProperty(aContexts[i].sPath + "/medicalSupplyDOSE"),
						MEDICALSUPPLYID: model.getProperty(aContexts[i].sPath + "/MEDICALSUPPLIESID"),
						NAME: model.getProperty(aContexts[i].sPath + "/NAME"),
						APPLICATIONMETHOD: model.getProperty(aContexts[i].sPath + "/APPMETHOD/APPMETHODNAME"),
						PRESENTATION: model.getProperty(aContexts[i].sPath + "/PRESENTATION"),
						medicalSupplyDOSE: model.getProperty(aContexts[i].sPath + "/MEDICALSUPPLYDOSE"),
						medicalSupplyMUNIT: model.getProperty(aContexts[i].sPath + "/MESSUREUNIT/MESSURENAME"),
						AGE: ""
					};
					arraySanitary.push(elementSelected);
				}
				model.setProperty("/UX_sanitaryStandards", arraySanitary);
			}
			//oEvent.getSource().getBinding("items").filter([]);
			this.showDialog = null;
		},
		handleCloseSupplyDialog: function(oEvent) {
			var model = this.getView().getModel("data");
			var elementSelected;
			var arraySanitary = model.getProperty("/UX_supplyPlan/details");
			var aContexts = oEvent.getParameter("selectedContexts");
			var i, length;
			if (aContexts != null) {
				length = aContexts.length;
				for (i = 0; i != length; i++) {
					elementSelected = {
						Age: "",
						Days: "",
						Name: model.getProperty(aContexts[i].sPath + "/NAME"),
						FoodID: model.getProperty(aContexts[i].sPath + "/FOODID"),
						Total: "",
						Unit: "gr.",
						supplies: []
					};
					arraySanitary.push(elementSelected);
				}
				model.setProperty("/UX_supplyPlan/details", arraySanitary);
				//oEvent.getSource().getBinding("items").filter([]);
			}
			this.showDialog = null;
		},
		resetHousingRecordValues: function() {

			var model = this.getView().getModel("data");

			model.setProperty("/INTERNAL_housingSelected/HOUSINGDATE", "");
			model.setProperty("/INTERNAL_housingSelected/EVICTIONDATE", "");
			model.setProperty("/INTERNAL_housingSelected/QUANTITYBIRDS", "");
			model.setProperty("/INTERNAL_housingSelected/BROILERBREED/ID", "");
			model.setProperty("/INTERNAL_housingSelected/BROILERBREED/GENETICLINE", "");
			model.setProperty("/INTERNAL_housingSelected/GENDER/ID", "");
			model.setProperty("/INTERNAL_housingSelected/GENDER/NAME", "");
			model.setProperty("/INTERNAL_housingSelected/GENDER/TEXT", "");
			model.setProperty("/INTERNAL_housingSelected/FIELD1", "");
			model.setProperty("/INTERNAL_housingSelected/FIELD2", "");
			model.setProperty("/INTERNAL_housingSelected/SHEDID", model.getProperty("/INTERNAL_shedSelected/SHEDID"));
		},
		onChangeHousingDate: function(oEvent) {
			var id = oEvent.getParameters().id;
			var view = this.getView();
			var model = view.getModel("data");

			//	var eviction = view.byId("dateEviction").getDateValue(); //Get initial date
			var housing = view.byId(id).getDateValue(); //Get housing date
			var date = new Date(housing);
			date.setDate(date.getDate() + 42);

			var datepicker = new sap.m.DatePicker();
			//datepicker.setDisplayFormat("yyyy-MM-dd");
			//datepicker.setValueFormat("yyyy-MM-dd");
			datepicker.setDateValue(new Date(date));

			model.setProperty("/INTERNAL_housingSelected/EVICTIONDATE", datepicker.getValue());

			/*view.byId("dateEviction").setDateValue(new Date(housing)); //Copy housing date
			eviction = view.byId("dateEviction").getDateValue();
			eviction.setDate(eviction.getDate() + 42); //Add 42 days to housing date
			 //Set new date
			console.log(view.byId("dateEviction").getDateValue());*/
			//	console.log();
		},
		//Method to set the header status that follows the advance in the app
		setHeader: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var currentAcum = "";
			var stringSeparator = " >> ";
			var farm = model.getProperty("/UX_farmSelected");
			var center = model.getProperty("/UX_centerSelected");
			var shed = model.getProperty("/INTERNAL_shedSelected");
			var lot = model.getProperty("/INTERNAL_housingSelected/BROILERSLOTID");

			if (farm !== "") {
				currentAcum = farm.BROILERSFARMID;
				if (center !== "") {
					currentAcum += stringSeparator + center.NAME;
					if (shed !== "") {
						currentAcum += stringSeparator + shed.SHEDCODE;
						if (lot !== "") {
							currentAcum += stringSeparator + "Lote " + lot;
						}
					}
				}
			}
			try {
				view.byId("statusHeader").setText(currentAcum);
			} catch (error) {
				console.log(error);
			}
			//console.log("StatusHeader View> " + view.byId("statusHeader"));
		},
		//Method to validate correctness and fulfillment of fields
		isSupplyModelConsistent: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var arrayDetails = model.getProperty("/UX_supplyPlan/details");
			var arraySupplies;
			var detailElement;
			var length = arrayDetails.length,
				lengthSupply;
			var i = 0,
				j = 0;
			var emptyField = false;
			while (!emptyField && i != length) {

				j = 0;
				emptyField = false;
				detailElement = arrayDetails[i];
				lengthSupply = detailElement.supplies.length;
				//Validating empty fields in supply
				if ((detailElement.Age == null || detailElement.Age == "") || (detailElement.Days == null) ||
					(detailElement.Total == null)) {
					emptyField = true; //There is an empty field, data is not consistent. For example, when an element is added and not modified
				}
				//Validating empty fields in details
				while (!emptyField && j != lengthSupply) {
					if (detailElement.supplies[j].supplyDay == null || detailElement.supplies[j].supplyDay == "") {
						emptyField = true;
					}
					if (detailElement.supplies[j].supplyQuantity == null || detailElement.supplies[j].supplyQuantity == "") {
						emptyField = true;
					}
					j++;
				}
				i++;
			}
			if (emptyField) {
				Utilities.messageDialogCreator("Error", "Debe completar los campos vacíos en el Plan de Alimentación");
				return false;
			}
			return true;
		},
		isSanitaryModelConsistent: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var arraySanitary = model.getProperty("/UX_sanitaryStandards");
			var length = arraySanitary.length;
			var emptyField = false;
			var i = 0;
			while (!emptyField && i != length) {
				if (arraySanitary[i].AGE == null || arraySanitary[i].AGE == "")
					emptyField = true;
				if (arraySanitary[i].QUANTITY == null || arraySanitary[i].QUANTITY == "")
					emptyField = true;
				i++;
			}
			if (emptyField) {
				Utilities.messageDialogCreator("Error", "Debe completar los campos vacíos en el Plan Sanitario");
				return false;
			}
			return true;
		},
		//Method to set selected tab as center and erase data saved
		validateTabsAccess: function() {
			var view = this.getView();
			viewId = view.getId() + "--";
			var model = view.getModel("settings");
			try {

				model.setProperty("/entitySelected", "centerFilter"); //We are at centers now
				view.byId("tabBar").setSelectedKey(viewId + "centerFilter");

				view.byId("centerTable").removeSelections(true);
				view.byId("supplyTable").removeSelections(true);
				view.byId("sanitaryTable").removeSelections(true);
				view.byId("planTable").removeSelections(true);

				model.setProperty("/enabled-shed", false);
				model.setProperty("/enabled-plan", false);
				model.setProperty("/enabled-supply", false);
				model.setProperty("/enabled-sanitary", false);

				model.setProperty("/visibility-nextButton", false);
				model.setProperty("/visibility-addButton", false);
				model.setProperty("/visibility-eraseButton", false);
				//	model.setProperty("/visibility-editButton", false);

			} catch (error) {
				console.log(error);
			}
		},

		//**////**////**////**////**////**////**////**////**////**////**////**//
		// Section: Transitions Logic////////////////////////////////////////////
		//**////**////**////**////**////**////**////**////**////**////**////**//

		//Method to set the entity forward to the next step in the icontab
		moveEntitySelectedForward: function() {
			var view = this.getView();
			viewId = view.getId() + "--";
			var model = view.getModel("settings");
			var dataModel = view.getModel("data");
			var entitySelected = model.getProperty("/entitySelected");
			var statusHeader = view.byId("statusHeader");
			//Order defined in UX
			switch (entitySelected) {
				case "centerFilter":
					//Set Title and header
					model.setProperty("/titleObjectHeader", "Galpones");
					//Set button and tabs visibility
					model.setProperty("/visibility-nextButton", false);
					model.setProperty("/enabled-shed", true);
					model.setProperty("/enabled-plan", false);
					model.setProperty("/enabled-supply", false);
					model.setProperty("/enabled-sanitary", false);

					//Set entity selected
					model.setProperty("/entitySelected", "shedFilter");

					//Move to next Tab
					view.byId("tabBar").setSelectedKey(viewId + "shedFilter");

					//Remove selections from following tables
					view.byId("supplyTable").removeSelections(true);
					view.byId("sanitaryTable").removeSelections(true);
					view.byId("planTable").removeSelections(true);
					model.setProperty("/supply-plan-edited", false);
					model.setProperty("/sanitary-plan-edited", false);
					dataModel.setProperty("/INTERNAL_shedSelected", ""); //Erase any selected previous shed

					//SearchFields Reset
					this.shedSearchFieldReset();
					break;
				case "shedFilter":
					//Set entity selected
					model.setProperty("/entitySelected", "planFilter");
					view.byId("tabBar").setSelectedKey(viewId + "planFilter");

					//Set header
					model.setProperty("/titleObjectHeader", "Planes de Alojamiento");

					//Remove selections from following tables
					view.byId("supplyTable").removeSelections(true);
					view.byId("sanitaryTable").removeSelections(true);
					view.byId("planTable").removeSelections(true);
					model.setProperty("/supply-plan-edited", false);
					model.setProperty("/sanitary-plan-edited", false);

					//Set buttons and tabs visibility
					model.setProperty("/enabled-plan", true);
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/visibility-addButton", true);
					model.setProperty("/visibility-eraseButton", true);
					model.setProperty("/visibility-editButton", true);
					model.setProperty("/enabled-supply", false);
					model.setProperty("/enabled-sanitary", false);
					//SearchFields Reset
					this.housingSearchFieldReset();

					this.pullHousingPlan();

					break;
				case "planFilter":
					//Set entity selected
					model.setProperty("/entitySelected", "supplyFilter");
					view.byId("tabBar").setSelectedKey(viewId + "supplyFilter");

					//Set Header and title
					model.setProperty("/titleObjectHeader", "Plan de Alimentación");

					//Remove selections from following tables
					view.byId("supplyTable").removeSelections(true);
					view.byId("sanitaryTable").removeSelections(true);
					model.setProperty("/supply-plan-edited", false);
					model.setProperty("/sanitary-plan-edited", false);

					//Set buttons visibility
					model.setProperty("/enabled-supply", true);
					model.setProperty("/enabled-sanitary", false);
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/visibility-addButton", true);
					model.setProperty("/visibility-eraseButton", true);
					//Bind table to null to update after call
					dataModel.setProperty("/UX_supplyPlan", "");

					this.getResourcesForSupplyPlan();

					//	model.setProperty("/visibility-editButton", true);
					break;
				case "supplyFilter":
					//Set entity selected
					model.setProperty("/entitySelected", "sanitaryFilter");
					view.byId("tabBar").setSelectedKey(viewId + "sanitaryFilter");

					//Set Title Header
					model.setProperty("/titleObjectHeader", "Plan Sanitario");

					//Set visibility
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/visibility-editButton", true);
					model.setProperty("/enabled-sanitary", true);
					//	model.setProperty("/visibility-editButton", true);

					//Remove selections from following tables
					model.setProperty("/sanitary-plan-edited", false);
					view.byId("sanitaryTable").removeSelections(true);
					//SearchFields Reset
					this.sanitarySearchFieldReset();
					//Pull Sanitary standard for next screen
					this.pullSanitaryPlan();
					break;
				case "sanitaryFilter":
					this.goBackFarm();
					break;
			}
			this.setHeader();
		},
		selectedIconTab: function() {
			var view = this.getView();
			var key = view.byId("tabBar").getSelectedKey();
			//Getting selected key, separating string from viewIdString
			key = key.split("--")[1];
			//Set entity selected
			var model = view.getModel("settings");
			var entitySelected = model.getProperty("/entitySelected");
			model.setProperty("/entitySelected", key);
			switch (key) {
				//Setting visibility and titles according to the tab selected
				case "centerFilter":
					model.setProperty("/visibility-addButton", false);
					model.setProperty("/visibility-nextButton", false);
					model.setProperty("/visibility-editButton", false);
					model.setProperty("/visibility-eraseButton", false);
					model.setProperty("/titleObjectHeader", "Núcleos");
					break;
				case "shedFilter":
					model.setProperty("/visibility-addButton", false);
					model.setProperty("/visibility-nextButton", false);
					model.setProperty("/visibility-editButton", false);
					model.setProperty("/visibility-eraseButton", false);
					model.setProperty("/titleObjectHeader", "Galpones");
					break;
				case "planFilter":
					model.setProperty("/visibility-addButton", true);
					model.setProperty("/visibility-editButton", true);
					model.setProperty("/visibility-eraseButton", true);
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/titleObjectHeader", "Planes de Alojamiento");
					break;
				case "sanitaryFilter":
					model.setProperty("/visibility-editButton", false);
					model.setProperty("/visibility-addButton", true);
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/visibility-eraseButton", true);
					model.setProperty("/titleObjectHeader", "Plan Sanitario");
					break;
				case "supplyFilter":
					model.setProperty("/visibility-editButton", true);
					model.setProperty("/visibility-nextButton", true);
					model.setProperty("/visibility-eraseButton", true);
					model.setProperty("/titleObjectHeader", "Plan de Alimentación");
					break;
			}
			/*if (entitySelected === key) {
				model.setProperty("/visibility-nextButton", true);
			} else {
				model.setProperty("/visibility-nextButton", false);
			}*/
		},
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Visibility 
		//**////**////**////**////**////**////**////**////**////**////**////**//
		/*onSelectionChange: function() {
			var view = this.getView();
			var model = view.getModel("settings");
			model.setProperty("/visibility-nextButton", true);
		},*/
		onPress: function(oEvent) {
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var object = oEvent.getSource().getBindingContext("data");
			var elementSelected = model.getProperty(object.sPath); // Getting the data based on the path that the user used
			switch (settings.getProperty("/entitySelected")) {
				case "centerFilter":
					model.setProperty("/UX_centerSelected", elementSelected); // Set centerSelected
					break;
				case "shedFilter":
					model.setProperty("/INTERNAL_shedSelected", elementSelected); // Set shedSelected
					break;

			}
			this.onNext();
		},

		//**////**////**////**////**////**////**////**//
		//Section: Buttons Toolbar//
		//**////**////**////**////**////**////**////**////**////**////**////**//
		onNext: function() {
			var error = false;
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");

			switch (settings.getProperty("/entitySelected")) {
				case "planFilter":
					if (view.byId("planTable").getSelectedItem() != null) //There are records selected
					{
						//Set Housing Selected in model
						model.setProperty("/INTERNAL_housingSelected",
							model.getProperty(view.byId("planTable").getSelectedItem().getBindingContext("data").sPath));
						this.moveEntitySelectedForward(); //Move to the next entity
					} else {
						Utilities.messageDialogCreator("Aviso", "Debe seleccionar un Plan de Alojamiento para poder confirmar");
						error = true;
					}
					break;
				case "supplyFilter":
					//Validation standard picked missing
					if (this.isSupplyModelConsistent()) {
						if (model.getProperty("/INTERNAL_housingSelected/CONSUMPTIONSTANDARDID") == "" ||
							model.getProperty("/INTERNAL_housingSelected/CONSUMPTIONSTANDARDID") == null) {
							//There is no supply plan for the housing plan, also there is no lot
							this.setBroilersLot(); //This method calls push plan
						} else {
							if (settings.getProperty("/supply-plan-edited")) //If it was Edited
							{
								console.log("Push Supply");
								this.pushSupplyPlan();
							} else
								this.moveEntitySelectedForward();
						}
					}
					break;
				case "sanitaryFilter":
					if (this.isSanitaryModelConsistent()) {

						console.log("Aca2");
						if (settings.getProperty("/creating-sanitary")) {
							console.log("Aca3");
							this.pushSanitaryPlanHeader();
						} else { //Plan already existed, there has to be an update
							if (settings.getProperty("/sanitary-plan-edited")) {
								console.log("Update Sanitary");
								this.updateSanitaryPlan();
							} else
								this.moveEntitySelectedForward();
						}
					}
					break;
				default:
					this.moveEntitySelectedForward();
			}
			/*if (!error) {
				this.moveEntitySelectedForward(); //Move to the next entity
			}*/
		},
		onDelete: function() {
			var that = this;
			var view = this.getView();
			var field, array, ii, housingID, dialog, length;

			var table;
			var model = view.getModel("data");
			var settings = view.getModel("settings");

			switch (settings.getProperty("/entitySelected")) {
				case "planFilter":
					try {
						table = view.byId("planTable");
						field = table.getSelectedItem().getBindingContext("data").sPath;
						if (field != null) {
							dialog = new Dialog({
								title: 'Eliminar',
								type: 'Message',
								content: new Text({
									text: 'Se eliminará este Plan de Alojamiento con todos sus datos asociados'
								}),
								beginButton: new Button({
									text: 'Aceptar',
									press: function() {

										housingID = model.getProperty(field + "/HOUSINGPLANID"); //Getting ID
										field = field.split("/")[2]; //Get Index Selected
										//Make call 
										that.deleteHousingPlan(housingID);
										array = model.getProperty("/UX_housingPlan");
										//If was deleted from service
										array.splice(parseInt(field), 1); //Deleting the selected element from model
										model.setProperty("/UX_housingPlan", array); //Update model
										table.removeSelections(true); //Unselect elements from table
										that.resetHousingRecordValues(); //Unset plan as selected
										dialog.close();
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
						}
					} catch (error) {
						Utilities.messageDialogCreator("Eliminar", "Debe elegir un plan para poder usar esta funcionalidad");
					}
					break;
				case "supplyFilter":
					try {
						table = view.byId("supplyTable");
						field = table._aSelectedPaths; // Array Selected Elements
						if (field != null) {
							dialog = new Dialog({
								title: 'Eliminar',
								type: 'Message',
								content: new Text({
									text: 'Se realizarán modificaciones en los elementos del Plan de Alimentación'
								}),
								beginButton: new Button({
									text: 'Aceptar',
									press: function() {
										length = field.length;
										array = model.getProperty("/UX_supplyPlan/details");
										for (ii = length - 1; ii != -1; ii--) {
											array.splice(parseInt(field[ii].split("/")[3]), 1); //Deleting the selected element from model
										}
										settings.setProperty("/supply-plan-edited", true);
										model.setProperty("/UX_supplyPlan/details", array); //Update model
										table.removeSelections(true); //Unselect elements from table
										dialog.close();
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
						}
					} catch (error) {
						Utilities.messageDialogCreator("Eliminar", "Debe elegir un plan para poder usar esta funcionalidad");
					}
					break;
				case "sanitaryFilter":
					try {
						table = view.byId("sanitaryTable");
						field = table._aSelectedPaths; // Array Selected Elements
						if (field != null) {
							dialog = new Dialog({
								title: 'Eliminar',
								type: 'Message',
								content: new Text({
									text: 'Se realizarán modificaciones en los elementos del Plan Sanitario'
								}),
								beginButton: new Button({
									text: 'Aceptar',
									press: function() {
										length = field.length;
										console.log(length);
										array = model.getProperty("/UX_sanitaryStandards");
										for (ii = length - 1; ii != -1; ii--) {
											array.splice(parseInt(field[ii].split("/")[2]), 1); //Deleting the selected element from model
										}
										model.setProperty("/sanitary-plan-edited", false);
										model.setProperty("/UX_sanitaryStandards", array); //Update model
										table.removeSelections(true); //Unselect elements from table
										dialog.close();
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
						}
					} catch (error) {
						Utilities.messageDialogCreator("Eliminar", "Debe elegir un plan para poder usar esta funcionalidad");
					}
					break;

			}
		},
		deleteSupplyElements: function() {
			var view = this.getView();
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var field, dialog, length, array, table, ii;

			table = view.byId("supplyElements");
			field = table._aSelectedPaths; // Array Selected Elements
			if (field != null) {
				dialog = new Dialog({
					title: 'Aviso',
					type: 'Message',
					content: new Text({
						text: 'Se realizarán cambios en el Plan de Alimentación'
					}),
					beginButton: new Button({
						text: 'Aceptar',
						press: function() {
							console.log(field);
							length = field.length;
							array = model.getProperty("/INTERNAL_supplySelected/supplies");
							console.log(array);
							for (ii = length - 1; ii != -1; ii--) {
								array.splice(parseInt(field[ii].split("/")[3]), 1); //Deleting the selected element from model
							}
							model.setProperty("/INTERNAL_supplySelected/supplies", array); //Update model
							table.removeSelections(true); //Unselect elements from table
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			}
		},
		onAdd: function() {
			var view = this.getView();
			var settings = view.getModel("settings");
			switch (settings.getProperty("/entitySelected")) {
				case "planFilter":
					settings.setProperty("/creating-housing", true);
					//Need to consult data
					if (view.getModel("data").getProperty("/INTERNAL_breedgenderList/UX_gendersList") === "" || view.getModel("data").getProperty(
							"/INTERNAL_breedgenderList/UX_gendersList") === null) {
						this.pullGenderAndBreed();
					}
					settings.setProperty("/titleForm", "Crear");
					this.resetHousingRecordValues();
					this.onViewPlanRecord();
					break;
				case "supplyFilter":
					settings.setProperty("/titleForm", "Crear");
					//this.onViewPlanSupplyRecord();
					this.pullSupplyElements();

					break;
				case "sanitaryFilter":
					settings.setProperty("/titleForm", "Crear");
					//this.onCreateSanitaryRecord();
					this.pullSanitaryElements();
					break;
			}
		},
		addSupplyElements: function() {
			var view = this.getView(),
				day;
			var model = view.getModel("data");
			var array = model.getProperty("/INTERNAL_supplySelected/supplies"); //Array of supplies
			var element;
			if (array.length != 0) {
				day = array[array.length - 1].supplyDay; //Accessing last element
				day = parseInt(day) + 1;
				element = {
					"supplyDay": "" + day,
					"supplyQuantity": "0"
				}; //New Element to insert
				array.splice(array.length, 0, element);
			} else {
				element = {
					"supplyDay": "",
					"supplyQuantity": "0"
				}; //New Element to insert
				array.push(element);
			}
			model.setProperty("/INTERNAL_supplySelected/supplies", array);
		},

		onEdit: function(oEvent) {
			var view = this.getView();
			var object;
			var model = view.getModel("data");
			var settings = view.getModel("settings");
			var entitySelected = settings.getProperty("/entitySelected");

			switch (entitySelected) {
				case "planFilter":
					settings.setProperty("/creating-housing", false); // Set property as false for creating housing since it is edit
					object = oEvent.getSource().getBindingContext("data");
					model.setProperty("/INTERNAL_housingSelected", JSON.parse(JSON.stringify(model.getProperty(object.sPath)))); //Set Sanitary Element in Model as the Element Selected in the table
					model.setProperty("/INTERNAL_housingSelectedPath", object.sPath);

					//Setting selected values in selects
					model.setProperty("/INTERNAL_breedgenderList/valueBreed", model.getProperty("/INTERNAL_housingSelected/BROILERBREED/ID"));
					model.setProperty("/INTERNAL_breedgenderList/valueGender", model.getProperty("/INTERNAL_housingSelected/GENDER/ID"));

					settings.setProperty("/titleForm", "Editar");
					this.onViewPlanRecord();
					if (model.getProperty("/INTERNAL_breedgenderList/UX_gendersList") === "" || model.getProperty(
							"/INTERNAL_breedgenderList/UX_gendersList") === null) {
						this.pullGenderAndBreed();
					}
					break;
				case "supplyFilter":
					model.setProperty("/supply-plan-edited", true);
					object = oEvent.getSource().getBindingContext("data");
					model.setProperty("/INTERNAL_supplySelected", model.getProperty(object.sPath)); //Set Supply Element in Model as the Element Selected in the table
					model.setProperty("/INTERNAL_supplySelectedPath", object.sPath); //Set Path Selected
					this.onViewPlanSupplyRecord();
					break;
				case "sanitaryFilter":
					model.setProperty("/sanitary-plan-edited", true); //
					object = oEvent.getSource().getBindingContext("data");
					model.setProperty("/INTERNAL_sanitarySelected", model.getProperty(object.sPath)); //Set Sanitary Element in Model as the Element Selected in the table
					model.setProperty("/INTERNAL_sanitarySelectedPath", object.sPath);
					this.onViewPlanSanitaryRecord();
					break;
			}
		},
		/*onEditSupply: function(oEvent) {
			var view = this.getView();
			var model = view.getModel("data");
			var object = oEvent.getSource().getBindingContext("data");
			model.setProperty("/INTERNAL_supplySelected", model.getProperty(object.sPath)); //Set Supply Element in Model as the Element Selected in the table
			model.setProperty("/INTERNAL_supplySelectedPath", object.sPath); //Set Path Selected
			this.onViewPlanSupplyRecord();
		},*/
		confirmSupplies: function() {

			var view = this.getView();
			view.getModel("settings").setProperty("/supply-plan-edited", true);
			var model = view.getModel("data");
			var supplyPlan = model.getProperty("/UX_supplyPlan/details");
			var quantityBirds = parseInt(model.getProperty("/INTERNAL_housingSelected/QUANTITYBIRDS"));
			var INTERNAL_supplySelected = model.getProperty("/INTERNAL_supplySelected/supplies"); //Array of dairy supplies
			var acum = 0;
			var ii, length = INTERNAL_supplySelected.length;

			for (ii = 0; ii !== length; ii++) {
				acum += parseFloat(INTERNAL_supplySelected[ii].supplyQuantity); //Adding to notify new total of supplies to ask
			}

			//model.setProperty(model.getProperty("/INTERNAL_supplySelectedPath" + "/Total"), acum);

			//Update Days of the supply
			model.setProperty("/INTERNAL_supplySelected/Days", model.getProperty("/INTERNAL_supplySelected/supplies").length);
			//Update total in selected
			model.setProperty("/INTERNAL_supplySelected/Total", acum);
			model.setProperty("/INTERNAL_supplySelected/TotalMultiplied", (acum * quantityBirds) / 1000); // Toneladas
			//Our initial age is the supply day of the first element
			model.setProperty("/INTERNAL_supplySelected/Age", model.getProperty("/INTERNAL_supplySelected/supplies/0/supplyDay")); //Initial Age
			model.setProperty("/INTERNAL_supplySelected/sort_intAge", parseInt(model.getProperty(
				"/INTERNAL_supplySelected/supplies/0/supplyDay"))); //Initial Age

			model.setProperty(model.getProperty("/INTERNAL_supplySelectedPath"), model.getProperty("/INTERNAL_supplySelected"));

			//Manual Refresh of Data Model
			model.setProperty("/UX_supplyPlan/details", "");
			model.setProperty("/UX_supplyPlan/details", supplyPlan);

			this.goBack();
		},
		//**////**////**////**////**////**////**////**////**////**////**////**//
		//Section: Extra//////////
		//**////**////**////**////**////**////**////**////**////**////**////**//
		onBeforeRendering: function() {

		},
		onAfterRendering: function() {
			//	this.setHeader();
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