/*=======================================================================
Copyright 2013 Amida Technology Solutions (http://amida-tech.com)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
======================================================================*/

var express = require('express');
var app = module.exports = express();
var allergy = require('../../../models/allergies');
var mergeFunctions = require('../../merge')

//Get all allergies.
function getAllergies(callback) {

  allergy.find(function(err, queryResults) {
    if (err) {
      callback(err);
    } else {
      callback(null, queryResults);
    }
  });

}

//Gets a single allergy based on id.
function getAllergy(input_id, callback) {
  allergy.findOne({
    _id: input_id
  }, function(err, allergyEntry) {
    if (err) {
      callback(err);
    } else {
      callback(null, allergyEntry);
    }
  });
}

function updateAllergyAndMerge (input_allergy, sourceID, callback) {

  var mergeFlag = false;
  var updateFlag = false;

  var tmpMergeEntry = {
    entry_type: 'allergy',
    entry_id: input_allergy._id,
    record_id: sourceID,
    merged: new Date(),
    merge_reason: 'duplicate'
  }

  function checkUAMFinished () {
    if (mergeFlag && updateFlag) {
      callback(null);
    }
  }

  mergeFunctions.saveMerge(tmpMergeEntry, function(err, saveResults) {
    if (err) {
      callback(err);
    } else {
      mergeFlag = true;
      checkUAMFinished();
    }
  })

  updateAllergy(input_allergy, function(err, saveObject) {
    if (err) {
      callback(err);
    } else {
      updateFlag = true;
      checkUAMFinished();
    }
  });

}

module.exports.updateAllergyAndMerge = updateAllergyAndMerge;

function updateAllergy(input_allergy, callback) {

  input_allergy.save(function(err, saveObject) {
    if (err) {
      callback(err);
    } else {
      callback(null, saveObject);
    }
  });
}

module.exports.getAllergy = getAllergy;
//module.exports.updateAllergy = updateAllergy;

function createAllergyObjectMetaData(allergyInputObject, sourceID) {

  allergyInputObject.metadata = {};
  allergyInputObject.metadata.attribution = [];

  var allergyAttribution = {};

  if (sourceID) {
    allergyAttribution = {
      record_id: sourceID,
      attributed: new Date(),
      attribution: 'new'
    }
  }

  allergyInputObject.metadata.attribution.push(allergyAttribution);

  return allergyInputObject;

}


function createAllergyObject(allergyInputObject) {

  //console.log(allergyInputObject);

  var allergySaveObject = {};

  //allergySaveObject.metadata = {};
  //allergySaveObject.metadata.attribution = [];

  //var allergyAttribution = {};

  //if (sourceID) {
  //  allergyAttribution = {
  //    record_id: sourceID,
  //    attributed: new Date(),
  //    attribution: 'new'
  //  }
  //}

  //allergySaveObject.metadata.attribution.push(allergyAttribution);

  //Really need to do much better validation all in here.
  if (allergyInputObject.date_range) {
    allergySaveObject.date_range = {};
    allergySaveObject.date_range.start = allergyInputObject.date_range.start;
    allergySaveObject.date_range.end = allergyInputObject.date_range.end;
  }

  if (allergyInputObject.name) {
    allergySaveObject.name = allergyInputObject.allergen.name;
  }

  if (allergyInputObject.code) {
    allergySaveObject.code = allergyInputObject.allergen.code;
  }

  if (allergyInputObject.code_system) {
    allergySaveObject.code_system = allergyInputObject.allergen.code_system_name;
  }

  if (allergyInputObject.code_system_name) {
    allergySaveObject.code_system_name = allergyInputObject.code_system_name;
  }

  if (allergyInputObject.status) {
    allergySaveObject.status = allergyInputObject.status;
  }

  if (allergyInputObject.severity) {
    allergySaveObject.severity = allergyInputObject.severity;
  }

  if (allergyInputObject.reaction) {
    allergySaveObject.reaction = {};
    allergySaveObject.reaction.name = allergyInputObject.reaction.name;
    allergySaveObject.reaction.code = allergyInputObject.reaction.code;
    allergySaveObject.reaction.code_system = allergyInputObject.reaction.code_system;
  }

  return allergySaveObject;
}

module.exports.createAllergyObject = createAllergyObject;

//Saves an array of incoming allergies.
function saveAllergies(inputArray, sourceID, callback) {

  function saveAllergyObject(allergySaveObject, allergyObjectNumber, callback) {

    function checkSAMFinished() {
      if (mergeFlag && saveFlag) {
        callback(null, allergyObjectNumber);
      }
    }

    var tempAllergy = new allergy(allergySaveObject);

    tempAllergy.save(function(err, saveResults) {
      if (err) {
        callback(err);
      } else {

        var tmpMergeEntry = {
          entry_type: 'allergy',
          entry_id: saveResults._id,
          record_id: saveResults.metadata.attribution[0].record_id,
          merged: new Date(),
          merge_reason: 'new'
        }

        mergeFunctions.saveMerge(tmpMergeEntry, function(err, mergeResults) {
          if (err) {
            callback(err);
          } else {
            callback(null, allergyObjectNumber);
          }
        });
      }
    });

  }

  for (var i = 0; i < inputArray.length; i++) {
    var allergyObject = createAllergyObjectMetaData(inputArray[i], sourceID);
    saveAllergyObject(allergyObject, i, function(err, savedObjectNumber) {
      if (savedObjectNumber === (inputArray.length - 1)) {
        callback(null);
      }
    });
  }

}

//Get all allergies API.
app.get('/api/v1/record/allergies', function(req, res) {

  getAllergies(function(err, allergyList) {
    if (err) {
      res.send(400, err);
    } else {
      var allergyJSON = {};
      allergyJSON.allergies = allergyList;
      res.send(allergyJSON);
    }

  });

});


module.exports.getAllergies = getAllergies;
module.exports.saveAllergies = saveAllergies;