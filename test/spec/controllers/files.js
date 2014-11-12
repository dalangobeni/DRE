'use strict';

describe('Controller: FilesCtrl', function () {

  // load the controller's module
  beforeEach(module('phrPrototypeApp'));

  var FilesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    FilesCtrl = $controller('FilesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
