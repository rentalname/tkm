App.models.SignUp = Backbone.Model.extend({

	validation: {
		nickname: {
			required: true,
			maxLength: 255
		},
		email: [
			{ required: true },
			{ maxLength: 255 },
			{
				pattern: 'email',
				msg: 'Enter a valid email'
			}
		],
		password: {
			required: true,
			rangeLength: [5, 40]
		},
		repeatPassword: [
			{ required: true },
			{
				equalTo: 'password',
				msg: 'Password does not match'
			}
		]
	},

	sync: function(method, model, options) {
		switch (method) {
			case 'create':
				model.create(options);
				break;

			default:
				console.log('%c Method not allowed: ' + method, 'color: #ff0000;');
				break;
		}
	},

	create: function(options) {
		var message = this.toJSON();
		message['command'] = 'signUp';

		App.socket.send(message, {
			success: function(message) {
				if (typeof(options.success) === typeof(Function)) {
					options.success(message);
				}
			},
			failure: function(message) {
				if (typeof(options.failure) === typeof(Function)) {
					options.failure(message);
				}
			},
			error: function(message) {
				if (typeof(options.error) === typeof(Function)) {
					options.error(message);
				}
			}
		});
	}

});


App.models.Credentials = Backbone.Model.extend({

	validation: {
		email: [
			{ required: true },
			{ maxLength: 255 },
			{
				pattern: 'email',
				msg: 'Enter a valid email'
			}
		],
		password: {
			required: true,
			rangeLength: [5, 40]
		}
	},

	initialize: function() {
		App.vent.on('signIn', this.signIn, this);
		App.vent.on('signOut', this.signOut, this);
	},

	signIn: function(credentials) {
		this.set(credentials, { validate: true });

		if (this.isValid() === false) {
			return;
		}

		var message = this.toJSON();
		message['command'] = 'signIn';

		var options = {
			success: this.onSignInSuccess.bind(this),
			failure: this.onSignInFailure.bind(this),
			error: this.onSignInError.bind(this)
		}

		App.socket.send(message, options);
	},

	onSignInSuccess: function(message) {
		App.user.set(App.user.parse(message.result));

		$.cookie('email', this.get('email'), { expires: App.cookiesDaysOfLife });
		$.cookie('password', this.get('password'), { expires: App.cookiesDaysOfLife });

		App.vent.trigger('signIn:success', message);
	},

	onSignInFailure: function(message) {
		App.vent.trigger('signIn:failure', message);
	},

	onSignInError: function(message) {
		App.vent.trigget('signIn:error', message);
	},

	signOut: function() {
		$.removeCookie('email');
		$.removeCookie('password');

		document.location = '/index.html';
	}

});


App.models.User = Backbone.Model.extend({

	validation: {
		firstName: {
			required: false,
			maxLength: 255
		},
		lastName: {
			required: false,
			maxLength: 255
		},
		nickname: {
			required: true,
			maxLength: 255
		},
		email: {
			required: true,
			maxLength: 255,
			pattern: 'email'
		}
	},

	initialize: function() {
		App.vent.on('signUp', this.signUp, this);
		App.vent.on('createPost', this.createPost, this);
		App.vent.on('uploadPicture', this.uploadPicture, this);
	},

	toJSON: function() {
		return {
			id: this.get('id'),
			first_name: this.get('firstName'),
			last_name: this.get('lastName'),
			nickname: this.get('nickname'),
			email: this.get('email'),
			profile_picture: this.get('profilePicture')
		};
	},

	parse: function(result) {
		return {
			'id': result.id,
			'firstName': result.first_name,
			'lastName': result.last_name,
			'nickname': result.nickname,
			'email': result.email,
			'profilePicture': result.profile_picture
		};
	},

	getProfilePicture: function() {
		return this.get('profilePicture');
	},

	sync: function(method, model, options) {
		switch (method) {
			case 'update':
				model.update(options);
				break;

			default:
				console.log('%c Method not allowed: ' + method, 'color: #ff0000;');
				break;
		}
	},

	update: function(options) {
		var message = this.toJSON();
		message['command'] = 'updateProfile';

		App.socket.send(message, options);
	},

	uploadProfilePicture: function(file, options) {
		var formData = new FormData();
		formData.append('file', file);

		$.ajax({
			url: 'fileUpload',
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			success: options.success,
			error: options.error,
			xhr: function() {
				var xhr = jQuery.ajaxSettings.xhr();
				xhr.upload.addEventListener('progress', options.progress, false);
				return xhr;
			}
		});
	},

	changeProfilePicture: function(file, options) {
		var ajaxOptions = {
			success: $.proxy(this.onUploadProfilePictureSuccess, this, options),
			error: $.proxy(this.onUploadProfilePictureError, this, options.error),
			progress: options.progress
		};

		this.uploadProfilePicture(file, ajaxOptions);
	},

	onUploadProfilePictureSuccess: function(options, data, textStatus, jqXHR) {
		// @TODO: Handle if there was an FAILURE error when uploading (wrong format, size, etc..)

		var response = JSON.parse(data);
		var message = {
			command: 'changeProfilePicture',
			file: response.filename
		};

		App.socket.send(message, $.extend({}, options, {
			success: function(message) {
				this.set({ profilePicture: message.profile_picture}, { silent: true });
				this.trigger('change:profilePicture');

				if (typeof(options.success) === typeof(Function)) {
					options.success(message);
				}
			}.bind(this)
		}));
	},

	onUploadProfilePictureError: function(callback, jqXHR, textStatus, errorThrown) {
		if (typeof(callback) !== typeof(Function)) {
			return;
		}

		// @TODO: create an error to send with callback...
		var message = {};
		callback(message);
	},

	createPost: function(message, options) {
		var options = $.extend({}, options);

		message['command'] = 'createPost';
		App.socket.send(message, options);
	},

	uploadPicture: function(message, options) {
		var formData = new FormData();
		formData.append('file', message.picture);

		$.ajax({
			url: 'fileUpload',
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			xhr: function() {
				var xhr = jQuery.ajaxSettings.xhr();

				xhr.upload.addEventListener('progress', function(event) {
					var percent = 0;
					var position = event.loaded || event.position;
					var total = event.total;

					if (event.lengthComputable) {
						percent = Math.ceil(position / total * 100);
					}

					if (typeof(options.progress) === typeof(Function)) {
						options.progress(percent, options.data);
					}
				}, false);

				return xhr;
			},

			success: function(data) {
				if (typeof(options.success) === typeof(Function)) {
					options.success(data, options.data);
				}
			},

			error: function() {
				if (typeof(options.error) === typeof(Function)) {
					options.error(options.data);
				}
			}

		});
	}

});


App.models.PasswordChanger = Backbone.Model.extend({

	validation: {
		newPassword: {
			required: true,
			rangeLength: [5, 40]
		},
		repeatPassword: [
			{ required: true },
			{
				equalTo: 'newPassword',
				msg: 'Password does not match'
			}
		],
		currentPassword: {
			required: true,
			rangeLength: [5, 40]
		}
	},

	changePassword: function(attributes, options) {
		this.set(attributes, { validate: true });

		if (this.isValid() === false) {
			return;
		}

		var message = this.toJSON();
		message['command'] = 'changePassword';

		App.socket.send(message, options);
	},

	updatePassword: function() {
		$.cookie('password', this.get('newPassword'), { expires: App.cookiesDaysOfLife });
	}

});


App.models.Friend = Backbone.Model.extend({

	validation: {
		friendId: {
			required: true,
			msg: 'Select somebody'
		},
		nickname: {
			required: true,
			maxLength: 50
		},
		ring: {
			required: true
		}
	},

	defaults: {
		notifications: 0
	},

	parse: function(result) {
		return {
			'id': result.id,
			'friendId': result.friend_id,
			'nickname': result.nickname,
			'ring': result.ring,
			'profilePicture': result.profile_picture,
			'myProfilePicture': result.my_profile_picture,
			'notifications': result.notifications
		};
	},

	toJSON: function() {
		return {
			'id': this.get('id'),
			'friend_id': this.get('friendId'),
			'nickname': this.get('nickname'),
			'ring': this.get('ring'),
			'profile_picture': this.get('profilePicture'),
			'my_profile_picture': this.get('myProfilePicture'),
			'notifications': this.get('notifications')
		};
	},

	sync: function(method, model, options) {
		switch (method) {
			case 'create':
				model.create(options);
				break;

			case 'update':
				model.update(options);
				break;

			default:
				console.log('%c Method not allowed: ' + method, 'color: #ff0000;');
				break;
		}
	},

	create: function(options) {
		var message = this.toJSON();
		message['command'] = 'addFriend';

		App.socket.send(message, options);
	},

	update: function(options) {
		var message = this.toJSON();
		message['command'] = 'updateFriend';

		App.socket.send(message, options);
	},

	uploadProfilePicture: function(file, options) {
		var formData = new FormData();
		formData.append('file', file);

		$.ajax({
			url: 'fileUpload',
			data: formData,
			processData: false,
			contentType: false,
			type: 'POST',
			success: options.success,
			error: options.error,
			xhr: function() {
				var xhr = jQuery.ajaxSettings.xhr();
				xhr.upload.addEventListener('progress', options.progress, false);
				return xhr;
			}
		});
	},

	getProfilePicture: function() {
		if (this.get('myProfilePicture') === null) {
 			return this.get('profilePicture');
		}

		return this.get('myProfilePicture');
	},

	changeProfilePicture: function(file, options) {
		var ajaxOptions = {
			success: $.proxy(this.onUploadProfilePictureSuccess, this, options),
			error: $.proxy(this.onUploadProfilePictureError, this, options.error),
			progress: options.progress
		};

		this.uploadProfilePicture(file, ajaxOptions);
	},

	onUploadProfilePictureSuccess: function(options, data, textStatus, jqXHR) {
		// @TODO: Handle if there was an FAILURE error when uploading (wrong format, size, etc..)

		var response = JSON.parse(data);
		var message = {
			command: 'updateFriendPicture',
			file: response.filename,
			friend_id: this.get('friendId'),
			id: this.get('id')
		};

		App.socket.send(message, $.extend({}, options, {
			success: function(message) {
				this.set({ myProfilePicture: message.profile_picture }, { silent: true });
				this.trigger('change:myProfilePicture');

				if (typeof(options.success) === typeof(Function)) {
					options.success(message);
				}
			}.bind(this)
		}));
	},

	onUploadProfilePictureError: function(callback, jqXHR, textStatus, errorThrown) {
		if (typeof(callback) !== typeof(Function)) {
			return;
		}

		// @TODO: create an error to send with callback...
		var message = {};
		callback(message);
	},

	removePicture: function(options) {
		var message = this.toJSON();
		message['command'] = 'removeFriendPicture';

		App.socket.send(message, options);
	}

});


App.models.Post = Backbone.Model.extend({

	initialize: function() {
		var replies = new App.collections.Replies([], { postId: this.get('id') });

		this.set('replies', replies);
		this.set('friend', App.friends.findWhere({ friendId: this.get('user_id') }));
	},

	parse: function(result) {
		// @TODO: we should parse this............
		return result;
	},

	// toJSON: function() {
		// @TODO: And we should denormalize here..........
	// },

	getCategories: function() {
		var category = this.getCategory(this.get('category_id'));
		var categories = [category];

		while (this.isRootCategory(category) === false) {
			category = this.getParentCategory(category);
			categories.push(category);
		}

		return categories;
	},

	isRootCategory: function(category) {
		return category.parent_id === null;
	},

	getCategory: function(categoryId) {
		return App.categoriesMap[categoryId.toString()];
	},

	getParentCategory: function(category) {
		return App.categoriesMap[category.parent_id.toString()];
	},

	getSanitizedContent: function() {
		return this.get('content').replace(/\n/g, '<br>');
	},

	markAsRead: function(callbacks) {
		if (typeof(callbacks) === 'object') {
			var successCallback = callbacks['success'];
			var errorCallback = callbacks['error'];
		}

		var options = {
			success: function(message) {
				this.onMarkAsReadSuccess();

				if (typeof(successCallback) === typeof(Function)) {
					successCallback();
				}
			}.bind(this)
		};

		if (typeof(errorCallback) === typeof(Function)) {
			options['error'] = errorCallback;
		}

		var message = {
			command: 'markPostAsRead',
			post_id: this.get('id'),
			friend_id: this.get('friend').get('friendId')
		};

		App.socket.send(message, options);
	},
	onMarkAsReadSuccess: function() {
		var friend = this.get('friend');
		var notifications = friend.get('notifications');

		this.set('is_new', false);
		friend.set('notifications', --notifications);
	},
	delete: function(options) {
		var message = {
			command: 'deletePost',
			postId: this.get('id')
		};

		App.socket.send(message, options);
	}
});


App.models.Reply = Backbone.Model.extend({

	validation: {
		nickname: {
			required: true,
			maxLength: 255
		}
	},

	initialize: function() {
		this.friend = App.friends.findWhere({ friendId: this.get('userId') });
		this.isFriend = typeof(this.friend) !== typeof(void(0));
	},

	getNickname: function() {
		return this.isFriend === true ? this.friend.get('nickname') : this.get('nickname');
	},

	getProfilePicture: function() {
		return this.isFriend === true ? this.friend.getProfilePicture() : this.get('profilePicture');
	},

	parse: function(result) {
		return {
			id: result.id,
			createdAt: result.created_at,
			text: result.text,
			userId: result.user_id,
			postId: result.post_id,
			nickname: result.nickname,
			profilePicture: result.profile_picture
		}
	},

	toJSON: function() {
		return {
			id: this.get('id'),
			created_at: this.get('createdAt'),
			text: this.get('text'),
			user_id: this.get('userId'),
			post_id: this.get('postId'),
			nickname: this.get('nickname'),
			profile_picture: this.get('profilePicture')
		}
	}

});