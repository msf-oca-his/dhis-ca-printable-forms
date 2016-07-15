var DhisModel = angular.module("DhisCommons", [])
DhisModel.factory("DhisModel", [function(){
  this.DataSet = require("./dhis-model/DataSet.js")
  this.DataElement = require("./dhis-model/DataElement.js")
  this.CategoryCombination = require("./dhis-model/CategoryCombination.js")
  this.DataSetSection = require("./dhis-model/DataSetSection.js")
  return this;
}]);
