'use strict';

angular.module('h2o.controllers', [
   'h2o.meatchat',
   'h2o.aguamala',
   'h2o.app'
   ]).
  controller('h2o', function($rootScope, $scope, $http, $location, cameraHelper, auth){
    $scope.homeLink = document.getElementById('logoapp');
    $rootScope.menuList = document.getElementById('menu_list');
    $scope.load = document.getElementById('load');
    $scope.loadCont = document.getElementById('loadCont');
    $scope.twtfeedbtn = document.getElementById('twtfeedbtn');
    $scope.twtfeedCount = document.getElementById('twtfeedCount');
    $rootScope.heartbeats = 0;
    $scope.currentLink = $scope.homeLink;
    $rootScope.loading = function(){
      if ($rootScope.start) {
         $rootScope.start = false;
         $rootScope.menuList.style.display = 'none';
         $scope.homeLink.style.display = 'none';
         $scope.loadCont.style.display = 'block';
         }
      else {
         $rootScope.start = true;
         $rootScope.menuList.style.display = 'block';
         $scope.homeLink.style.display = 'block';
         $scope.loadCont.style.display = 'none';
         }
    };
    $scope.homeLink.addEventListener('click', function(){
      $scope.currentLink.className = '';
      });
    $scope.twtfeedbtn.addEventListener('click', function(){
      $scope.twtfeedCount.innerHTML = '';
      });
    var $rota = $('#load'),
        degree = 0,
        timer;
    $scope.rotate = function() {
        $rota.css({ transform: 'rotate(' + degree + 'deg)'});
        // timeout increase degrees:
        timer = setTimeout(function() {
            ++degree;
            $scope.rotate(); // loop it
        },25);
    };
    $scope.rotate();    // run it!
    $('#logoapp').on('click', function(){
      cameraHelper.resetStream();
        $scope.$apply(function(){
          $location.path("/");
        });
      });
    $scope.setupWaypoints = function (rawLi) {
      var li = $(rawLi);
      li.waypoint(function (direction) {
        li.toggleClass('out-of-view', direction === 'down');
      }, {
        offset: function () {
          return -li.height();
        }
      });
      li.waypoint(function (direction) {
        li.toggleClass('out-of-view', direction === 'up');
      }, {
        offset: '100%'
      });
    };
    $rootScope.loadMenu = function(){
      if ($rootScope.state === 'loading') {
        _.each($rootScope.menuItems, function(value){
             var li = document.createElement('li');
             var link = document.createElement('a');
             var ic = document.createElement('i');
             if (value.url === $location.path()) {
                li.className = 'active';
                $scope.currentLink = li;
                }
             link.innerHTML = ' '+value.name;
             li.dataset.url = value.url;
             ic.className = 'fa fa-'+value.icon;
             link.addEventListener('click', function(){
                   if ($location.path()!==value.url)
                      cameraHelper.resetStream();
                   var links = this.parentNode.parentNode.childNodes;
                   for(var i=0; i<links.length; i++) {
                      if (links[i] !== this.parentNode)
                         links[i].className = '';
                      else {
                         links[i].className = 'active';
                         $scope.currentLink = this.parentNode;
                         }
                      }
                   $scope.$apply(function(){
                     $location.path(value.url);
                   });
                  }, false);
         link.insertBefore(ic, link.firstChild);
         li.appendChild(link);
         $rootScope.menuList.appendChild(li);
         });
       }
       else {
          var links = $rootScope.menuList.childNodes;
          for(var i=0; i<links.length; i++) {
             if (links[i].dataset.url!==$location.path())
                links[i].className = '';
             else
                links[i].className = 'active';
             }
          }
    };
    $rootScope.socket.onerror = function (wss) {
     console.log('err');
    };
    $rootScope.socket.onclose = function (wss) {
      $scope.loadCont.style.display = 'block';
      setTimeout(function(){
        window.location.href = '/';
      }, 2000);

    };
    $rootScope.socket.onopen = function (wss) {
      var log = {
        app: $rootScope.app,
        type: 'start'
        };
    $rootScope.socket.send(JSON.stringify(log));
      setInterval(function(){
      var log = {
        app: $rootScope.app,
        type: 'ping'
        };
      $rootScope.socket.send(JSON.stringify(log));
      },3000);
      };
    $rootScope.$on('$routeChangeStart', function(event, current, previous, rejection) {
      $rootScope.loadMenu();
      $rootScope.included = 'loading';
      });
    $rootScope.$on('$includeContentLoaded', function(event) {
      $rootScope.included = 'start';
      });
    $rootScope.socket.onmessage = function (event) {
        var data = JSON.parse(event.data);
          if ((data)&&(data.type)){
            switch(data.type) {
               case 'start':
                      $rootScope.uname = data.uname;
                      $rootScope.menuItems = data.menu;
                      $rootScope.sid = data.sid;
                      var loggedInfo = document.getElementById('loggedInfo');
                      if ($rootScope.uname !== 'alien') {
                          loggedInfo.childNodes[0].innerHTML = ' <span class="glyphicon glyphicon-off"></span>';
                          loggedInfo.childNodes[2].childNodes[1].childNodes[0].innerHTML = '<small><b>'+$rootScope.uname+'</b> Salir'+'</small>';
                          loggedInfo.childNodes[2].addEventListener('click', function(){
                          auth.logout();
                          });
                         }
                      else
                         loggedInfo.style.display = 'none';
                      $rootScope.loadMenu();
                      $rootScope.state = 'start';
               break;
               case 'meat':
                      var chatList = document.getElementById('chatList');
                      var li = document.createElement('li');
                      var msg = document.createElement('p');
                      var pic = document.createElement('img');
                      msg.innerHTML = data.msg;
                      if (data.pic)
                         pic.src = data.pic;
                      else {
                         pic = document.createElement('span');
                         var i = document.createElement('i');
                         var ii = document.createElement('i');
                         pic.className = 'fa-stack fa-2x fa-lg';
                         i.className = 'fa fa-camera fa-stack-1x';
                         ii.className = 'fa fa-ban fa-stack-2x text-danger';
                         pic.appendChild(i);
                         pic.appendChild(ii);
                         pic.style.position = 'absolute';
                         pic.style.top = '13px';
                         pic.style.left = '30px';
                         }
                      li.appendChild(msg);
                      li.appendChild(pic);
                      chatList.appendChild(li);
                      $('body').stop().animate({
                          scrollTop: $('body')[0].scrollHeight
                      }, 800);
                      $(li).css({ transform: 'rotate(0deg)'});
               break;
               case 'pong':
                    $rootScope.heartbeats++;
               break;
               case 'sign_in_fail':
                     var panel = document.getElementById('signinPanelBody');
                     var div = document.createElement('div');
                     var btn = document.createElement('button');
                     var msg = document.createElement('p');
                     div.className = 'alert alert-danger alert-dismissable';
                     btn.type = 'button';
                     btn.className = 'close';
                     btn.dataset.dismiss = 'alert';
                     btn.innerHTML = '&times;';
                     msg.innerHTML = data.response.toString();
                     div.appendChild(btn);
                     div.appendChild(msg);
                     panel.insertBefore(div, panel.firstChild);
                     $scope.singin_pssw = document.getElementById('singin_pssw');
                     $scope.user_signin = document.getElementById('user_signin');
                     $scope.singin_pssw.value = '';
                     $scope.singin_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña';
                     $scope.singin_pssw.parentNode.className = 'form-group';
                     $scope.user_signin.disabled = true;
                     $rootScope.loading();
               break;
               case 'sign_in_ok':
                     if (data.sid === $rootScope.sid)
                        auth.login(data.response);
               break;
               case 'sign_out':
                     if (data.uname === $rootScope.uname)
                        auth.logout();
               break;
               case 'sign_up_fail':
                     var panel = document.getElementById('signupPanelBody');
                     var div = document.createElement('div');
                     var btn = document.createElement('button');
                     var msg = document.createElement('p');
                     div.className = 'alert alert-danger alert-dismissable';
                     btn.type = 'button';
                     btn.className = 'close';
                     btn.dataset.dismiss = 'alert';
                     btn.innerHTML = '&times;';
                     msg.innerHTML = data.response.detail;
                     div.appendChild(btn);
                     div.appendChild(msg);
                     panel.insertBefore(div, panel.firstChild);
                     $scope.singup_email = document.getElementById('singup_email');
                     $scope.singup_email.parentNode.childNodes[1].innerHTML = 'Email no valido';
                     $scope.singup_email.parentNode.className = 'form-group has-error';
                     $scope.singup_pssw = document.getElementById('singup_pssw');
                     $scope.user_signup = document.getElementById('user_signup');
                     $scope.singup_pssw.value = '';
                     $scope.singup_pssw.parentNode.childNodes[1].innerHTML = 'Contraseña';
                     $scope.singup_pssw.parentNode.className = 'form-group';
                     $scope.user_signup.disabled = true;
                     $rootScope.loading();
               break;
               case 'sign_up_ok':
                  if (data.sid === $rootScope.sid)
                    auth.login(data.response);
               break;
               case 'twt_up':
                    console.log(data.response);
                    if ($scope.twtfeedCount.innerHTML === '')
                       $scope.twtfeedCount.innerHTML = '1';
                    else
                       $scope.twtfeedCount.innerHTML = (parseInt($scope.twtfeedCount.innerHTML)+1).toString();
                    $scope.twtfeed = document.getElementById('twtfeedL');
                    var li = document.createElement('li');
                    var link = document.createElement('a');
                    var img = document.createElement('img');
                    var mbody = document.createElement('div');
                    li.className = 'list-group-item media';
                    li.role = 'presentation';
                    link.className = 'pull-left';
                    link.target = '_blank';
                    link.href = data.response.profile_pic;
                    img.className = 'media-object';
                    img.src = data.response.profile_pic;
                    img.alt = data.response.user;
                    link.appendChild(img);
                    mbody.className = 'media-body';
                    mbody.innerHTML = data.response.msg.toString();
                    li.appendChild(link);
                    li.appendChild(mbody);
                    $scope.twtfeed.insertBefore(li, $scope.twtfeed.firstChild);
               break;
               case 'join':
                 if (data.sid === $rootScope.sid)
                      window.location.href = "/meat/"+data.room;
               break;
               case 'freebase_description':
                    $scope.freebase = document.getElementById('freebase');
                    var li = document.createElement('li');
                    var img = document.createElement('img');
                    var mbody = document.createElement('div');
                    var mtitle = document.createElement('h4');
                    var msg = document.createElement('p');
                    li.className = 'list-group-item';
                    mbody.className = 'media-body';
                    mtitle.className = 'media-heading';
                    msg.innerHTML = data.response;
                    mtitle.innerHTML = data.query;
                    mbody.appendChild(mtitle);
                    mbody.appendChild(msg);
                    li.appendChild(mbody);
                    $scope.freebase.insertBefore(li, $scope.freebase.firstChild);
                    $rootScope.loading();
               break;
               }
              }
          };
    });