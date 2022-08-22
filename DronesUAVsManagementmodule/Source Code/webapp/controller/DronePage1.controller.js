sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History"
], function(BaseController, MessageBox, Utilities, History) {
	"use strict";

	return BaseController.extend("com.sap.build.standard.connectedDrone.controller.DronePage1", {
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
		_onObjectListItemPress: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DronePage2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onObjectListItemPress1: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DronePage2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onObjectListItemPress2: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DronePage2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},
		_onObjectListItemPress3: function(oEvent) {

			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function(fnResolve) {

				this.doNavigate("DronePage2", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function(err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

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
			this.oRouter.getTarget("DronePage1").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			var oView = this.getView(),
				oData = {},
				self = this;
			var oModel = new sap.ui.model.json.JSONModel();
			oView.setModel(oModel, "staticDataModel");
			self.oBindingParameters = {};

			oData["sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611"] = {};

			oData["sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611"]["data"] = [{
				"dim0": "Goods Delivery",
				"mea0": "2",
				"__id": 0
			}, {
				"dim0": "Security Surveillance",
				"mea0": "4",
				"__id": 1
			}, {
				"dim0": "Monitoring",
				"mea0": "8",
				"__id": 2
			}, {
				"dim0": "Health Aid",
				"mea0": "10",
				"__id": 3
			}];

			self.oBindingParameters['sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611'] = {
				"path": "/sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611/data",
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

			var aDimensions = oView.byId("sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611").getDimensions();
			aDimensions.forEach(function(oDimension) {
				oDimension.setTextFormatter(dateDimensionFormatter);
			});

		},
		onAfterRendering: function() {

			var oChart,
				self = this,
				oBindingParameters = this.oBindingParameters,
				oView = this.getView();

			oChart = oView.byId("sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611");
			oChart.bindData(oBindingParameters['sap_Responsive_Page_0-content-sap_chart_DonutChart-1535087939611']);

		}
	});
}, /* bExport= */ true);
