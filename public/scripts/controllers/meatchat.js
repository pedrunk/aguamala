'use strict';
  angular.module('h2o.meatchat', []).
  controller('meatchat', function ($rootScope, $scope, $location, $http, $routeParams, cameraHelper) {
    $scope.menuList = document.getElementById('menu_list');
    $scope.canSend = false;
    $scope.roomId = $routeParams.id;
    $scope.CHAR_LIMIT = 250;
    $scope.$on('$routeChangeStart', function(event, current, previous, rejection) {
    console.log('%c well ok bye bye! ', 'background: #222; color: #bada55');
    var log = {
    	room: $scope.roomId,
    	type: 'leave'
    	}; 
    $rootScope.socket.send(JSON.stringify(log));	
    });
    $scope.$on("$routeChangeSuccess", function(event, next, current) {
              var log = {
        	    room: $scope.roomId,
        	    type: 'join'
        	    };
        	if ($rootScope.socket.readyState)    
             $rootScope.socket.send(JSON.stringify(log));
          else
             setTimeout(function(){$rootScope.socket.send(JSON.stringify(log))}, 300)
    });
    $(document).on('keydown', function (event) {
      if (event.keyCode === 27)
         if (($('.header').css('display'))==='block')
            $('').css('display', 'none')
         else
            $('.header').css('display', 'block')
      if (event.target !== $('#add-chat')[0]) {
         $('#add-chat').focus();
         }
    });
    $scope.fingerprint = new Fingerprint({ canvas: true }).get();
  		        $http.get('/api/signos/'+$scope.roomId).success(function(data) {
  		      	    $scope.parseThread(data, function(){
  		      	    	console.log('done');
  		      	    	setTimeout(function(){
  		      	    		  $scope.canSend = true;
  		      	    	    $('#add-chat').prop('readonly', false);
  		      	    	    $('#add-chat-blocker').addClass('hidden');
  		      	    	}, 300);
  		      	    });
  		  	        });
    $scope.resetForm = function () {
         $scope.errors = false;
         $scope.message = '';
         $scope.picture = '';
         $scope.showCamera = false;
       };  			  
    $scope.parseThread = function(msgs, callback) {
    	//console.log(msgs.threads.length);
    	if (msgs.threads.length>0) {
    	   msgs.threads.reverse();
    	   //console.log(msgs.threads);
         _.each(msgs.threads, function(data){
              var chatList = $('.chats ul');
              var li = document.createElement('li');
              var msg = document.createElement('p');
              var pic = document.createElement('img');
              msg.innerHTML = data.msg;
              pic.src = data.pic;
              li.appendChild(msg);
              li.appendChild(pic);
              chatList.append(li);
           });
    	  }
    callback();
    };
    $scope.parsekey = function(ev) {
      $('#counter').text(parseInt($scope.CHAR_LIMIT - $('#add-chat').val().length));
    };
    $scope.promptCamera = function () {
        if (navigator.getMedia) {
          $scope.showCamera = true;
          cameraHelper.startStream();
        } else {
          $scope.back();
        }
      };
    $scope.recordCamera = function () {
        $('#add-chat').prop('readonly', true);
        $scope.canSend = false;
        $('#add-chat-blocker').removeClass('hidden');
        cameraHelper.startScreenshot(function (pictureData) {
          $scope.$apply(function () {
          	if (pictureData){
               $scope.picture = pictureData;
               var msg = {
                 type: 'meat',
               	 pic: $scope.picture,
               	 msg: $('#add-chat').val(),
               	 fingerprint: $scope.fingerprint,
               	 room: $scope.roomId
                 };
               $rootScope.socket.send(JSON.stringify(msg));
          	   }
          	$('#add-chat').val('');
            $('#add-chat').prop('readonly', false);
            $scope.canSend = true;
            $('#add-chat-blocker').addClass('hidden');
          });
        });
      };
    $scope.sendMessage = function (ev) {
        if ($scope.canSend)
           {
           $scope.recordCamera();
           }
           else
              {
              console.log('on it');
              }
      };
    $scope.resetForm();
    $scope.promptCamera();
    });