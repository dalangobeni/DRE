'use strict';

/**
 * @ngdoc directive
 * @name phrPrototypeApp.directive:profile
 * @description
 * # profile
 */
angular.module('phrPrototypeApp')
  .directive('profile', function () {
    return {
      template: '<div class="profile"><div class="profile-body"><div class="profile-image">' +
      			'<img class="img-responsive center-block" src="images/img-demo.png"></div>' +
				'<div class="profile-content"><h4>Suzie Demo</h4><p>suzie@amida-demo.com</p><p>Born: 6/25/1982</p>' +
				'</div></div></div>',
      restrict: 'EA',
      link: function postLink(scope, element, attrs) {
        	
      }
    };
  });
