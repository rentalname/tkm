App.collections.Friends = Backbone.Collection.extend({

	model: App.models.Friend,

	initialize: function() {
		this.groupedByRings = {};

		for (var i = 0; i < App.numberOfRings; i++) {
			this.groupedByRings[i] = [];
		}

		this.on('reset', this.onReset, this);
		this.on('add', this.onAdd, this);
	},

	parse: function(message) {
		return message.result;
	},

	sync: function(method, model, options) {
		switch (method) {
			case 'read':
				model.read(options);
				break;
		}
	},

	read: function(options) {
		var message = {};
		message['command'] = 'getFriends';

		App.socket.send(message, options);
	},

	onReset: function() {
		for (var i = 0; i < this.models.length; i++) {
			var friend = this.models[i];
			this.classifyFriend(friend);
		}

		App.vent.trigger('friends:ready', this);
	},

	onAdd: function(friend) {
		this.classifyFriend(friend);
		App.vent.trigger('friends:new', friend);
	},

	classifyFriend: function(friend) {
		this.groupedByRings[friend.get('ring')].push(friend);
	}

});


App.collections.Posts = Backbone.Collection.extend({

	model: App.models.Post,

	perPage: 10,

	initialize: function(models, options) {
		this.friends = options.friends;
		this.rootCategoryId = options.rootCategoryId;
		this.rootCategoryName = options.rootCategoryName;
		this.currentPage = 0;
	},

	sync: function(method, collection, options) {
		switch (method) {
			case 'read':
				collection.read(options);
				break;

			default:
				console.log('%c Method not allowed: ' + method, 'color: #ff0000;');
				break;
		}
	},

	read: function(options) {
		var message = {
			command: 'getFriendsPostsFromCategory',
			friends: this.friends,
			root_category_id: this.rootCategoryId,
			page: ++this.currentPage,
			perPage: this.perPage
		};

		App.socket.send(message, options);
	},

	parse: function(message) {
		return message.result;
	},

	addNew: function(post) {
		var model = new this.model(post);
		this.add(model, { silent: true });
		this.trigger('add:new', model);
	}

});


App.collections.Replies = Backbone.Collection.extend({

	model: App.models.Reply,

	initialize: function(models, options) {
		this.postId = options.postId;
	},

	parse: function(message) {
		return message.result;
	},

	sync: function(method, collection, options) {
		switch (method) {
			case 'read':
				collection.read(options);
				break;

			default:
				console.log('%c Method not allowed: ' + method, 'color: #ff0000;');
				break;
		}
	},

	read: function(options) {
		var message = {
			command: 'getReplies',
			post_id: this.postId,
		};

		App.socket.send(message, options);
	}

});









