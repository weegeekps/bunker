app.factory('user', function(bunkerApi, $timeout) {

	var typingTimeout;
	var userId = window.userId;
	var user = bunkerApi.user.get({id: userId});
	var settings = bunkerApi.userSettings.get({user: userId});

	return {
		current: user,
		settings: settings,
		broadcastTyping: function(roomId) {

			if(!user.$resolved) return; // Not ready yet

			if(user.typingIn != roomId) { // Only need to do anything if it's not already set
				user.typingIn = roomId;
				user.$activity();
			}

			if(user.typingIn) { // Only need to reset in 2 seconds if room is set
				if (typingTimeout) $timeout.cancel(typingTimeout); // Cancel current timeout (if any)
				typingTimeout = $timeout(function () {
					user.typingIn = null;
					user.$activity();
					typingTimeout = null;
				}, 2000);
			}
		}
	};
});