App.routers.Index = Backbone.Router.extend({

	initialize: function() {
		App.vent.on('socket:connected', function() {
			new App.views.SignIn();
			new App.views.SignUp();
			new App.views.IndexForms();
		});
	}

});

App.routers.Home = Backbone.Router.extend({

	initialize: function() {
		App.userMenu = new App.views.UserMenu();
		App.rings = new App.views.Rings();
		App.rings.render();

		App.watchBreakpoints();

		App.vent.on('socket:connected', function() {
			App.credentials.set({
				email: email,
				password: password
			});

			App.vent.trigger('signIn');
		});

		App.vent.on('signIn:success', function() {
			// App.socket.send({command:'buildCategoriesTree'}, {
			// 	success: function(message) {
			// 		console.log(JSON.stringify(message.categoriesMap));
			// 		console.log('and now the tree...');
			// 		console.log(JSON.stringify(message.categoriesTree));
			// 	}
			// });
			App.friends = new App.collections.Friends();
			App.friends.fetch({
				reset: true,
				error: function() {
					console.log('%cError fetching friends...', 'color: #ff0000;');
				}
			});
		}, this);

		App.vent.on('friends:ready', function() {
			// var options = {
			// 	success: function(message) {
			// 		App.categoriesTree = message.result;
			// 		App.vent.trigger('categoriesTree:ready');
			// 	},
			// 	error: function() {
			// 		console.log('Error retrieving categories tree...');
			// 	}
			// };

			// App.socket.send({ command: 'getCategoriesTree' }, options);
			App.vent.trigger('categoriesTree:ready');
		});

		App.vent.on('categoriesTree:ready', function() {
			App.dashboard = new App.views.Dashboard();
			App.dashboard.render();

			App.replies = new App.views.RepliesWidget();

			App.publisher = new App.views.Publisher();
			App.publisher.render();

			App.friendAdder = new App.views.FriendAdder();
			App.friendAdder.render();

			App.profileEditor = new App.views.ProfileEditor();
			App.profileEditor.render();

			App.passwordChanger = new App.views.PasswordChanger();
		});

		App.vent.on('signIn:error', function() {
			$.removeCookie('email');
			$.removeCookie('password');
			document.location = '/index.html';
		});
	}

});