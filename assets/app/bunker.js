window.app = angular.module('bunker', [
	'ngTouch',
	'ngSanitize',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ui.bootstrap',
	'youtube-embed',
	'angular.filter',
	'hljs',
	'plangular', /* soundcloud embed */
	'notification',
	'angularStats',
	'ui.sortable'
])
	.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('chat', {
				abstract: true,
				url: '/rooms',
				templateUrl: '/assets/app/chat/chat.html',
				controller: 'ChatController as chat'
			})
			.state('chat.room', {
				// Having this be a child state stops the state from reloading view
				// The 'chat' state/controller/view will be in use
				url: '/{roomId}'
			})
			.state('inbox', {
				url: '/inbox',
				templateUrl: '/assets/app/inbox/list.html',
				controller: 'InboxController as inbox'
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date&message',
				templateUrl: '/assets/app/room/roomHistory.html',
				controller: 'RoomHistoryController as room'
			});
	})
	.config(function ($compileProvider, gravatarServiceProvider) {
		// disable debug info
		//$compileProvider.debugInfoEnabled(window.debugging || !window.isProduction);

		// to reenable in prod, use
		// angular.reloadWithDebugInfo()

		gravatarServiceProvider.defaults = {
			'default': 'identicon'
		}
	})
	.run(function ($rootScope, $document, bunkerListener, bunkerData) {

		// html5 visibility api instead of win.focus or win.blur
		$document.on('visibilitychange', function () {
			$rootScope.$broadcast(document.hidden ? 'visibilityHide' : 'visibilityShow');
		});

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
			$rootScope.roomId = toParams.roomId || null;
			$rootScope.$broadcast('roomIdChanged', $rootScope.roomId);
		});

		var socket = io.connect();
		socket.on('connect', function () {

			io.socket = sailsApiWrapper(socket);
			bunkerListener.init();
			bunkerData.start();
		});
	});


function sailsApiWrapper(socket){
	socket.get = function (endpoint, cb) {
		socket.emit(endpoint, {}, cb);
	};

	socket.put = function (endpoint, _data, _cb) {
		var cb = _cb || _data;
		var data = _.isObject(_data) ? _data : undefined;
		socket.emit(endpoint, data, cb);
	};

	socket.post = function (endpoint, _data, _cb){
		var cb = _cb || _data;
		var data = _.isObject(_data) ? _data : undefined;
		socket.emit(endpoint, data, cb);
	}


	return socket
}
