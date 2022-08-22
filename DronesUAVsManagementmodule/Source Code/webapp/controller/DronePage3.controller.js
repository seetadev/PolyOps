sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.connectedDrone.controller.DronePage3", {
		handleRouteMatched: function(oEvent) {
			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;
				var oPath;
				if (this.sContext) {
					oPath = {
						path: "/" + this.sContext,
						parameters: oParams
					};
					this.getView().bindObject(oPath);
				}
			}

		},
		_onPageNavButtonPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("launch_page", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		doNavigate: function(sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet, sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function(bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}

		},
		_onButtonPress: function(oEvent) {

			var sPopoverName = "popover_8";
			this.mPopovers = this.mPopovers || {};
			var oPopover = this.mPopovers[sPopoverName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oPopover) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "com.sap.build.standard.connectedDrone.view." + sPopoverName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oPopover = oView.getContent()[0];
					oPopover.setPlacement("Bottom");
					this.mPopovers[sPopoverName] = oPopover;
				}.bind(this));
			}

			return new Promise(function(fnResolve) {
				oPopover.attachEventOnce("afterOpen", null, fnResolve);
				oPopover.openBy(oSource);
				if (oView) {
					oPopover.attachAfterOpen(function() {
						oPopover.rerender();
					});
				} else {
					oView = oPopover.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onButtonPress1: function(oEvent) {

			var sDialogName = "dialog_14";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "com.sap.build.standard.connectedDrone.view." + sDialogName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oDialog = oView.getContent()[0];
					this.mDialogs[sDialogName] = oDialog;
				}.bind(this));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();
				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onLinkPress: function(oEvent) {

			var sDialogName = "dialog_13";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			var oSource = oEvent.getSource();
			var oBindingContext = oSource.getBindingContext();
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oView;
			if (!oDialog) {
				this.getOwnerComponent().runAsOwner(function() {
					oView = sap.ui.xmlview({
						viewName: "com.sap.build.standard.connectedDrone.view." + sDialogName
					});
					this.getView().addDependent(oView);
					oView.getController().setRouter(this.oRouter);
					oDialog = oView.getContent()[0];
					this.mDialogs[sDialogName] = oDialog;
				}.bind(this));
			}

			return new Promise(function(fnResolve) {
				oDialog.attachEventOnce("afterOpen", null, fnResolve);
				oDialog.open();
				if (oView) {
					oDialog.attachAfterOpen(function() {
						oDialog.rerender();
					});
				} else {
					oView = oDialog.getParent();
				}

				var oModel = this.getView().getModel();
				if (oModel) {
					oView.setModel(oModel);
				}
				if (sPath) {
					var oParams = oView.getController().getBindingParameters();
					oView.bindObject({
						path: sPath,
						parameters: oParams
					});
				}
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onComboBoxSelectionChange: function() {
			alert("Not Implemented Yet !");

		},
		_onComboBoxSelectionChange1: function() {
			alert("Not Implemented Yet");

		},
		_onComboBoxSelectionChange2: function() {
			alert("Not Implemented Yet");

		},
		_onComboBoxSelectionChange3: function() {
			alert("Not Implemented Yet");

		},
		applyFiltersAndSorters: function(sControlId, sAggregationName) {
			var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		updateBindingOptions: function(sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("DronePage3").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6"]["data"] = [{
				"dim0": "India",
				"mea0": "20",
				"Hour": "1 pm",
				"Regular": "100",
				"Decaf": "30",
				"__id": 0
			}, {
				"dim0": "Canada",
				"mea0": "30",
				"Hour": "2 pm",
				"Regular": "60",
				"Decaf": "40",
				"__id": 1
			}, {
				"dim0": "USA",
				"mea0": "50",
				"Hour": "3 pm",
				"Regular": "30",
				"Decaf": "50",
				"__id": 2
			}, {
				"dim0": "Japan",
				"mea0": "100",
				"Hour": "4 pm",
				"Regular": "100",
				"Decaf": "80",
				"__id": 3
			}, {
				"dim0": "Germany",
				"mea0": "70",
				"Hour": "5 pm",
				"Regular": "20",
				"Decaf": "100",
				"__id": 4
			}, {
				"Hour": "6 pm",
				"mea0": "40",
				"Regular": "60",
				"Decaf": "40",
				"__id": 5
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6"]["data"] = [{
				"dim0": "1 pm",
				"mea0": "100",
				"Decaf": "30",
				"__id": 0
			}, {
				"dim0": "2 pm",
				"mea0": "50",
				"Decaf": "60",
				"__id": 1
			}, {
				"dim0": "3 pm",
				"mea0": "40",
				"Decaf": "20",
				"__id": 2
			}, {
				"dim0": "4 pm",
				"mea0": "60",
				"Decaf": "80",
				"__id": 3
			}, {
				"dim0": "5 pm",
				"mea0": "70",
				"Decaf": "90",
				"__id": 4
			}, {
				"dim0": "6 pm",
				"mea0": "80",
				"Decaf": "40",
				"__id": 5
			}, {
				"50136ed8924859f6104261ed": null,
				"dim0": "7 pm",
				"mea0": "90",
				"Decaf": "30",
				"__id": 6
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6"]["data"] = [{
				"mea1": "1",
				"mea0": "60",
				"dim0": "1 pm",
				"__id": 0
			}, {
				"mea1": "2",
				"mea0": "100",
				"dim0": "2 pm",
				"__id": 1
			}, {
				"mea1": "3",
				"mea0": "90",
				"dim0": "3 pm",
				"__id": 2
			}, {
				"mea1": "4",
				"mea0": "80",
				"dim0": "4 pm",
				"__id": 3
			}, {
				"mea1": "5",
				"mea0": "70",
				"dim0": "5 pm",
				"__id": 4
			}, {
				"mea1": "6",
				"mea0": "78",
				"dim0": "6 pm",
				"__id": 5
			}, {
				"mea1": "7",
				"mea0": "100",
				"dim0": "7 pm",
				"__id": 6
			}, {
				"mea1": "8",
				"mea0": "70",
				"dim0": "8 pm",
				"__id": 7
			}, {
				"mea1": "9",
				"mea0": "67",
				"dim0": "9 pm",
				"__id": 8
			}, {
				"mea1": "10",
				"mea0": "65",
				"dim0": "10 pm",
				"__id": 9
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6"] = {};

			oData["sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6"]["data"] = [{
				"dim0": "1 pm",
				"mea0": "100",
				"__id": 0
			}, {
				"dim0": "2 pm",
				"mea0": "0",
				"__id": 1
			}, {
				"dim0": "3 pm",
				"mea0": "100",
				"__id": 2
			}, {
				"dim0": "4 pm",
				"mea0": "100",
				"__id": 3
			}, {
				"dim0": "5 pm",
				"mea0": "0",
				"__id": 4
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6'] = {
				"path": "/sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6/data",
				"model": "staticDataModel",
				"parameters": {}
			};

			oView.getModel("staticDataModel").setData(oData, true);

			function dateDimensionFormatter(oDimensionValue, sTextValue) {
				var oValueToFormat = sTextValue !== undefined ? sTextValue : oDimensionValue;
				if (oValueToFormat instanceof Date) {
					var oFormat = sap.ui.core.format.DateFormat.getDateInstance({
						style: "short"
					});
					return oFormat.format(oValueToFormat);
				}
				return oValueToFormat;
			}

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_LineChart-1492495527716-809672887b8ae21d0dba3b476_S6']);

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-items-sap_chart_ColumnChart-1490598562351-32cec818e0f6070f0db87c754_S4-809672887b8ae21d0dba3b476_S6']);

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ScatterChart-1492541544828-809672887b8ae21d0dba3b476_S6']);

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_m_VBox-1490596649278-32cec818e0f6070f0db87c754_S4-items-sap_chart_ColumnChart-1492547627201-809672887b8ae21d0dba3b476_S6']);

		}
	});
}, /* bExport= */ true);
