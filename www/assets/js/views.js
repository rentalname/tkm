App.views.IndexForms = Backbone.View.extend({

	el: '.index-forms',

	events: {
		'click .sign-up-link': 'showSignUpForm',
		'click .sign-in-link': 'showSignInForm'
	},

	initialize: function() {
		this.$signUpForm = this.$('.sign-up-form');
		this.$signInForm = this.$('.sign-in-form');
	},

	showSignUpForm: function(event) {
		event.preventDefault();

		this.$signInForm.hide();
		this.$signUpForm.show();
	},

	showSignInForm: function(event) {
		event.preventDefault();

		this.$signUpForm.hide();
		this.$signInForm.show();
	}

});

App.views.SignIn = Backbone.View.extend({

	el: '.sign-in-form',

	events: {
		'submit': 'signIn'
	},

	failureMessage: 'Invalid email & password combination.',
	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.$email = this.$('.sign-in-form__email');
		this.$password = this.$('.sign-in-form__password');
		this.$submitButton = this.$('.sign-in-form__submit-button');
		this.$errorMessage = this.$('.error-message');

		this.model = App.credentials;
		Backbone.Validation.bind(this);

		App.vent.on('signIn:success', this.onSuccess, this);
		App.vent.on('signIn:failure', this.onFailure, this);
		App.vent.on('signIn:error', this.onError, this);
	},

	signIn: function(event) {
		event.preventDefault();

		this.$submitButton.attr('disabled');
		this.$errorMessage.text('');

		var credentials = {
			email: $.trim(this.$email.val()),
			password: this.$password.val()
		};

		App.vent.trigger('signIn', credentials);
	},

	onSuccess: function(message) {
		document.location = 'home.html';
	},

	onFailure: function(message) {
		this.$errorMessage.text(message.failureMessage);
		this.$submitButton.removeAttr('disabled');
	},

	onError: function(message) {
		this.$errorMessage.text(this.errorMessage);
		this.$submitButton.removeAttr('disabled');
	}

});


App.views.SignUp = Backbone.View.extend({

	el: '.sign-up-form',

	events: {
		'submit': 'signUp'
	},

	successMessage: 'Welcome aboard! now you can sign in.',
	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.$nickname = this.$('.sign-up-form__nickname');
		this.$email = this.$('.sign-up-form__email');
		this.$password = this.$('.sign-up-form__password');
		this.$repeatPassword = this.$('.sign-up-form__repeat-password');
		this.$submitButton = this.$('.sign-up-form__submit-button');
		this.$successMessage = this.$('.success-message');
		this.$errorMessage = this.$('.error-message');

		this.model = new App.models.SignUp();
		Backbone.Validation.bind(this);
	},

	signUp: function(event) {
		event.preventDefault();

		this.$submitButton.attr('disabled');
		this.$successMessage.text('');
		this.$errorMessage.text('');

		this.model.save({
			'nickname': this.$nickname.val(),
			'email': this.$email.val(),
			'password': this.$password.val(),
			'repeatPassword': this.$repeatPassword.val()
		}, {
			success: this.onSuccess.bind(this),
			failure: this.onFailure.bind(this),
			error: this.onError.bind(this)
		});
	},

	onSuccess: function() {
		this.clearForm();

		this.$successMessage.text(this.successMessage);
		this.$submitButton.removeAttr('disabled');
	},

	onFailure: function(message) {
		this.$errorMessage.text(message.failureMessage);
		this.$submitButton.removeAttr('disabled');
	},

	onError: function() {
		this.$errorMessage.text(this.errorMessage);
		this.$submitButton.removeAttr('disabled');
	},

	clearForm: function() {
		this.$nickname.val('');
		this.$email.val('');
		this.$password.val('');
		this.$repeatPassword.val('');
	}

});


App.views.UserMenu = Backbone.View.extend({

	el: '.user-menu',

	events: {
		'click .user-menu__add-friend': 'addFriend',
		'click .user-menu__edit-profile': 'editProfile',
		'click .user-menu__sign-out': 'signOut'
	},

	initialize: function() {
		this.$profilePicture = this.$('.user-menu__profile-picture');
		this.$notifications = this.$('.user-menu__notifications');
		this.$nickname = this.$('.user-menu__nickname');

		this.listenTo(App.user, 'change:nickname', this.updateNickname);
		this.listenTo(App.user, 'change:profilePicture', this.updateProfilePicture);
		App.vent.on('signIn:success', this.fillIn, this);
	},

	addFriend: function(event) {
		event.preventDefault();
		App.vent.trigger('friendAdder:open');
	},

	editProfile: function(event) {
		event.preventDefault();
		App.vent.trigger('profileEditor:open');
	},

	signOut: function(event) {
		event.preventDefault();
		App.vent.trigger('signOut');
	},

	fillIn: function() {
		var profilePicture = App.profilePicturesPath + 'thumbnails/' + App.user.get('profilePicture');
		this.$profilePicture.attr('src', profilePicture);
		this.$notifications.hide();
		this.$nickname.text(App.user.get('nickname'));
	},

	updateNickname: function() {
		this.$nickname.text(App.user.get('nickname'));
	},

	updateProfilePicture: function() {
		var profilePicture = App.profilePicturesPath + 'thumbnails/' + App.user.get('profilePicture');
		this.$profilePicture.attr('src', profilePicture + '?' + new Date().getTime());
	}

});


App.views.Rings = Backbone.View.extend({

	el: '.site-rings',

	events: {
		'click .site-rings__central-text': 'showDashboard'
	},

	ringsProperties: [
	{
		ratio: 0.92,
		style: 'fill: #eef0eb;',
		friendRatio: 0.08
	},
	{
		ratio: 0.73,
		style: 'fill: #dde6d4; stroke:#d2e3be; stroke-width:1;',
		friendRatio: 0.09
	},
	{
		ratio: 0.52,
		style: 'fill: #bbd998; stroke:#a6d16d; stroke-width:1;',
		friendRatio: 0.1
	},
	{
		ratio: 0.20,
		style: 'fill: #fff; stroke:#a6d16d; stroke-width:1;'
	},
	{
		ratio: 0.15,
		style: 'fill: #8bc53f;'
	}
	],

	initialize: function() {
		App.vent.on('friends:ready', this.fillRings, this);
		//App.vent.on('friends:new', this.refreshFriends, this);
	},

	showDashboard: function() {
		App.vent.trigger('dashboard:show', [App.friends.groupedByRings[0][0].get('friendId')]);
	},

	render: function() {
		this.canvas = document.createElementNS(App.svgNS, 'svg');
		this.canvas.setAttribute('width', '100%');
		this.canvas.setAttribute('height', '100%');

		for (var i = 0; i < this.ringsProperties.length; i++) {
			var ringProperties = this.ringsProperties[i];
			var ring = document.createElementNS(App.svgNS, 'ellipse');
			var radius = ((ringProperties.ratio * 100) / 2) + '%';

			ring.setAttribute('rx', radius);
			ring.setAttribute('ry', radius);
			ring.setAttribute('cx', '50%');
			ring.setAttribute('cy', '50%');
			ring.setAttribute('style', ringProperties.style);

			this.canvas.appendChild(ring);
		}

		this.centerText = document.createElementNS(App.svgNS, 'text');
		this.centerText.setAttribute('text-anchor', 'middle');
		this.centerText.setAttribute('font-family', 'Lucida Grande');
		this.centerText.setAttribute('font-weight', 'bold');
		this.centerText.setAttribute('fill', 'white');
		this.centerText.setAttribute('x', '50%');
		this.centerText.setAttribute('y', '50%');
		this.centerText.setAttribute('dy', '.3em');
		this.centerText.setAttribute('class', 'site-rings__central-text');
		this.centerText.textContent = 'me';

		this.canvas.appendChild(this.centerText);
		this.el.appendChild(this.canvas);

		return this;
	},

	fillRings: function() {
		for (var i = 1; i < App.numberOfRings; i++) {
			var ringProperties = this.ringsProperties[(i * -1) + 3];
			var ringFriends = App.friends.groupedByRings[i];

			this.addRingFriends(ringProperties, ringFriends);
		}
	},

	addRingFriends: function(ringProperties, friends) {
		var angleBetweenFriends = 360 / friends.length;
		var radius = (ringProperties.ratio * 100) / 2;

		for (var i = 0; i < friends.length; i++) {
			var friend = friends[i];
			var angle = angleBetweenFriends * i;
			var coordinates = this.getEllipseCoordinates(angle, radius, radius);
			var options = {
				model: friend,
				ratio: ringProperties.friendRatio,
				coordinates: coordinates
			};

			this.canvas.appendChild(new App.views.Friend(options).render().el);
		}
	},

	// refreshFriends: function(friend) {
	// 	var ring = (friend.get('ring') * -1) + 3;
	// 	var ringProperties = this.ringProperties[ring];
	// 	var ringFriends = App.friends.groupedByRings[ring];

	// 	this.addRingFriends(ringProperties, ringFriends);
	// },

	getEllipseCoordinates: function(angle, rx, ry) {
		var radians = angle * (Math.PI / 180);

		return {
			x: rx  * Math.cos(radians),
			y: ry * Math.sin(radians)
		};
	}

});


App.views.Friend = Backbone.View.extend({

	events: {
		'click .site-rings__friend': 'showDashboard'
	},

	initialize: function(options) {
		this.setElement(document.createElementNS(App.svgNS, 'svg'));
		this.listenTo(this.model, 'change:notifications', this.updateNotifications);
	},

	showDashboard: function() {
		App.vent.trigger('dashboard:show', [this.model.get('friendId')]);
	},

	render: function() {
		var ratio = this.options.ratio * 100;
		var coordinates = {
			x: this.options.coordinates.x + (50 - (ratio / 2)),
			y: this.options.coordinates.y + (50 - (ratio / 2))
		}

		this.el.setAttribute('x', coordinates.x + '%');
		this.el.setAttribute('y', coordinates.y + '%');
		this.el.setAttribute('width', ratio + '%');
		this.el.setAttribute('height', ratio + '%');
		this.el.setAttribute('viewBox', '0 0 100 100');
		this.el.setAttribute('preserverAspectRatio', 'xMidYMid meet');

		this.shadow = document.createElementNS(App.svgNS, 'ellipse');
		this.shadow.setAttribute('rx', '34.8');
		this.shadow.setAttribute('ry', '43.5');
		this.shadow.setAttribute('cx', '36.8');
		this.shadow.setAttribute('cy', '45.5');
		this.shadow.setAttribute('fill', '#000');
		this.shadow.setAttribute('opacity', '.3');

		this.image = document.createElementNS(App.svgNS, 'image');
		this.image.setAttribute('width', '87');
		this.image.setAttribute('height', '87');
		this.image.setAttribute('x', '-8.7');
		this.image.setAttribute('y', '0');
		this.image.setAttribute('clip-path', 'url(#image-clipper-' + this.model.get('id') + ')');
		this.image.setAttributeNS(App.xlinkNS, 'href', 'uploads/profiles/thumbnails/' + this.model.getProfilePicture());
		this.image.setAttribute('title', this.model.get('nickname'));
		this.image.setAttribute('class', 'site-rings__friend');
		$(this.image).tooltip({ container: 'body' });

		this.clipPath = document.createElementNS(App.svgNS, 'clipPath');
		this.clipPath.setAttribute('id', 'image-clipper-' + this.model.get('id'));

		this.imageClipper = document.createElementNS(App.svgNS, 'ellipse');
		this.imageClipper.setAttribute('rx', '34.8');
		this.imageClipper.setAttribute('ry', '43.5');
		this.imageClipper.setAttribute('cx', '34.8');
		this.imageClipper.setAttribute('cy', '43.5');
		this.imageClipper.setAttribute('fill', '#000');
		this.clipPath.appendChild(this.imageClipper);

		this.notificationsCircle = document.createElementNS(App.svgNS, 'circle');
		this.notificationsCircle.setAttribute('r', '18');
		this.notificationsCircle.setAttribute('cx', '60.6');
		this.notificationsCircle.setAttribute('cy', '81');
		this.notificationsCircle.setAttribute('stroke', '#c0c0c0');
		this.notificationsCircle.setAttribute('stroke-width', '1');
		this.notificationsCircle.setAttribute('fill', '#fff');

		this.notificationsText = document.createElementNS(App.svgNS, 'text');
		this.notificationsText.setAttribute('text-anchor', 'middle');
		this.notificationsText.setAttribute('font-family', 'Lucida Grande');
		this.notificationsText.setAttribute('fill', '#57aade');
		this.notificationsText.setAttribute('x', '60.6');
		this.notificationsText.setAttribute('y', '81');
		this.notificationsText.setAttribute('dy', '.3em');
		this.notificationsText.setAttribute('class', 'site-rings__notifications-number');
		this.notificationsText.textContent = this.model.get('notifications');

		if (this.model.get('notifications') < 1) {
			this.hideNotifications();
		}

		this.el.appendChild(this.shadow);
		this.el.appendChild(this.image);
		this.el.appendChild(this.clipPath);
		this.el.appendChild(this.notificationsCircle);
		this.el.appendChild(this.notificationsText);

		return this;
	},

	updateNotifications: function(model) {
		var notifications = model.get('notifications');
		this.notificationsText.textContent = notifications;

		if (notifications > 0) {
			this.showNotifications();
		} else {
			this.hideNotifications();
		}
	},

	showNotifications: function() {
		this.notificationsCircle.setAttribute('display', 'block');
		this.notificationsText.setAttribute('display', 'block');
	},

	hideNotifications: function() {
		this.notificationsCircle.setAttribute('display', 'none');
		this.notificationsText.setAttribute('display', 'none');
	}

});


App.views.Dashboard = Backbone.View.extend({

	el: '.site-dashboard',

	events: {
		'click .site-dashboard__close-button': 'close',
		'click .site-dashboard__column-link--favorites': 'showFavoritesColumn',
		'click .site-dashboard__column-link--i-want': 'showIWantColumn',
		'click .site-dashboard__column-link--notes': 'showNotesColumn',
		'click .site-dashboard__column-link--media': 'showMediaColumn'
	},

	initialize: function() {
		this.peoplePicker = new App.views.PeoplePicker();
		this.carousel = new App.views.Carousel();
		this.friends = [];
		this.isOpen = false;

		App.vent.on('dashboard:show', this.show, this);
		App.vent.on('breakpoint', this.adjust, this);
	},

	showFavoritesColumn: function(event) {
		event.preventDefault();
		this.carousel.showPage(1);
	},

	showIWantColumn: function(event) {
		event.preventDefault();
		this.carousel.showPage(2);
	},

	showNotesColumn: function(event) {
		event.preventDefault();
		this.carousel.showPage(3);
	},

	showMediaColumn: function(event) {
		event.preventDefault();
		this.carousel.showPage(4);
	},

	render: function() {
		this.peoplePicker.render({ includeRing0: true });
		this.carousel.$el.before(this.peoplePicker.el);

		this.peoplePicker.multiselect({
			noneSelectedText: 'Who you want to see posts?',
			beforeopen: this.beforePeoplePickerOpens.bind(this),
			close: this.refresh.bind(this)
		});

		this.peoplePicker.$button.addClass('site-dashboard__people-picker');

		this.carousel.render();
		this.carousel.carousel({
			visibleItems: App.breakpoint === 0 ? 1 : App.breakpoint,
			previousButton: this.$('.site-dashboard__previous-button'),
			nextButton: this.$('.site-dashboard__next-button')
		});
	},

	beforePeoplePickerOpens: function() {
		if (App.breakpoint < 2) {
			this.peoplePicker.$widget.css('width', this.carousel.$el.width() + 'px');
		} else {
			this.peoplePicker.$widget.css('width', this.peoplePicker.$button.css('width'));
		}
	},

	show: function(friends) {
		this.$el.css('z-index', App.getHighestZIndex());
		this.$el.show();

		if (this.isOpen === true) {
			this.clean();
		}

		this.adjust(App.breakpoint);

		this.friends = friends;
		this.peoplePicker.checkFriends(friends);
		this.carousel.reload(friends);

		this.isOpen = true;
	},

	close: function() {
		this.$el.hide();
		this.clean();
		this.isOpen = false;
	},

	refresh: function() {
		var checkboxes = this.peoplePicker.getChecked();
		var checkedFriends = [];

		for (var i = 0; i < checkboxes.length; i++) {
			var checkbox = checkboxes[i];
			checkedFriends.push(parseInt(checkbox.value, 10));
		}

		if (checkboxes.length === this.friends.length) {
			if (checkedFriends.sort().join(',') === this.friends.sort().join(',')) {
				console.log('%cSAME PEOPLE.', '#c09853');
				return;
			}
		}

		this.show(checkedFriends);
	},

	adjust: function(breakpoint) {
		if (breakpoint === 0) {
			this.carousel.setOption('startPage', 3);
			breakpoint = 1;
		}

		this.carousel.setOption('visibleItems', breakpoint);
		this.carousel.carousel();

		this.peoplePicker.setOption('selectedList', breakpoint);
	},

	clean: function() {
		this.peoplePicker.uncheckAll();
		this.friends = [];
	},

	addPost: function(post) {
		// @TODO: handle model from low level...
		var columnCollection = this.carousel.getColumn(post.root_category_id);
		columnCollection.addNew(post);
	}

});


App.views.Carousel = Backbone.View.extend({

	el: '.site-dashboard__carousel',

	initialize: function() {
		this.collections = [];
		this.$columnsList = $('<ul></ul>', {
			'class': 'carousel'
		});

		$(window).on('resize', _.throttle(this.adjust.bind(this), 300));
	},

	render: function(friends) {
		for (var i = 0; i < App.categoriesTree.length; i++) {
			var category = App.categoriesTree[i];
			var collection = new App.collections.Posts([], {
				rootCategoryId: category.id,
				rootCategoryName: category.name,
				friends: []
			});

			var column = new App.views.Column({ collection: collection });
			this.$columnsList.append(column.render().el);

			this.collections.push(collection);
		}

		this.$el.append(this.$columnsList);

		return this;
	},

	carousel: function(options) {
		this.$el.carousel(options);
	},

	showPage: function(page) {
		this.$el.carousel('goToPage', page);
	},

	reload: function(friends) {
		for (var i = 0; i < this.collections.length; i++) {
			var collection = this.collections[i];

			collection.friends = friends;
			collection.currentPage = 0;
			collection.fetch({ reset: true });

			this.carousel();
		}
	},

	setOption: function(option, value) {
		this.$el.carousel('option', option, value);
	},

	adjust: function() {
		this.$el.carousel('adjust');
	},

	getColumn: function(id) {
		for (var i = 0; i < this.collections.length; i++) {
			var collection = this.collections[i];

			if (collection.rootCategoryId === id) {
				return collection;
			}
		}

		return null;
	}

});


App.views.Column = Backbone.View.extend({

	tagName: 'li',

	className: 'carousel__column',

	attributes: function() {
		return {
			'data-category-id': this.collection.rootCategoryId
		}
	},

	pixelsBeforeLoadMore: 300,

	initialize: function() {
		this.throttledLoadMore = _.throttle(this.loadMore.bind(this), 300);

		this.listenTo(this.collection, 'add:new', this.addNewPost);
		this.listenTo(this.collection, 'add', this.addPost);
		this.listenTo(this.collection, 'reset', this.reset);
	},

	render: function() {
		this.$title = $('<h3></h3>', { 'class': 'carousel__column-title category-' + this.collection.rootCategoryId });
		this.$titleSpan = $('<span></span>', { text: this.collection.rootCategoryName });
		this.$postsContainer = $('<div></div>', { 'class': 'carousel__posts-container' });
		this.$postsList = $('<ul></ul>', { 'class': 'carousel__posts-list' });

		this.$title.append(this.$titleSpan);
		this.$el.append(this.$title);
		this.$postsContainer.append(this.$postsList);
		this.$el.append(this.$postsContainer);

		return this;
	},

	addPosts: function(posts) {
		if (posts.length === this.collection.perPage) {
			this.$postsList.on('scroll', this.throttledLoadMore);
		} else {
			console.log('%cEnd of column, no more posts...', 'color:#468847;');
		}

		for (var i = 0; i < posts.length; i++) {
			this.addPost(posts[i]);
		}
	},

	addPost: function(model) {
		var post = new App.views.Post({ model: model });
		this.$postsList.append(post.render().el);
		post.fancybox();
	},

	addNewPost: function(model) {
		var post = new App.views.Post({ model: model });
		this.$postsList.prepend(post.render().el);
		post.fancybox();
	},

	loadMore: function() {
		var scrollHeight = this.$postsList[0].scrollHeight;
		var scrollTopLimit = scrollHeight - (this.$postsList.height() + this.pixelsBeforeLoadMore);

		if(this.$postsList.scrollTop() >= scrollTopLimit) {
			this.$postsList.off('scroll', this.throttledLoadMore);
			console.log('%c Loading more posts...', 'color:#468847;');
			this.collection.fetch({
				error: this.fetchPostsError.bind(this)
			});
		}
	},

	fetchPostsError: function() {
		// @TODO: What do we do?
		console.log('%cERROR FETCHING POSTS.', '#ff0000');
	},

	reset: function(collection) {
		this.$postsList.empty();
		this.addPosts(collection.models);
	}

});


App.views.Post = Backbone.View.extend({

	tagName: function() {
		return this.options.mode === 'reply' ? 'div' : 'li';
	},

	className: 'carousel__post',

	events: {
		'click .carousel__replies-link': 'showReplies',
		'click .carousel__delete-picture-link': 'deletePicture',
		'click .carousel__toggle-options-link': 'toggleOptions',
		'click .carousel__update-post-link': 'update',
		'click .carousel__edit-post-link': 'edit',
		'click .carousel__edit-tags-link': 'tags',
		'click .carousel__delete-post-link': 'delete'
	},

	template: _.template($('#post-template').html()),

	initialize: function(options) {
		this.mode = options.mode;
		this.friend = this.model.get('friend');
		this.isUser = App.user.get('id') === this.friend.get('friendId');
	},

	showReplies: function(event) {
		event.preventDefault();
		event.stopPropagation();

		if (this.model.get('is_new') === true) {
			this.markAsRead();
		}

		App.vent.trigger('replies:show', this.model);
	},

	render: function() {
		this.$el.append(this.template({
			post: this.model,
			categories: this.model.getCategories().reverse().slice(1),
			tags: this.model.get('tags'),
			friend: this.friend,
			pictures: this.model.get('pictures'),
			isUser: this.isUser,
			mode: this.mode
		}));

		this.$header = this.$('.carousel__post-header');
		this.$optionsLink = this.$('.carousel__toggle-options-link');
		this.$options = this.$('.carousel__post-options');

		this.addHeader();

		if (this.model.get('is_new') === true) {
			this.markAsNew();
		}

		if (this.isUser === true) {
			this.$el.on('click', function(event) {
				this.$optionsLink.toggle();
			}.bind(this));
		}

		return this;
	},

	addHeader: function() {
		if (this.isUser === false) {
			var $profilePicture = $('<img>', {
				'class': 'carousel__friend-picture',
				src: 'uploads/profiles/thumbnails/' + this.friend.getProfilePicture()
			});

			this.$header.prepend($profilePicture);
		} else {
			var peoplePicker = new App.views.PeoplePicker();

			peoplePicker.render({ includeRing0: false });
			this.$header.prepend(peoplePicker.el);

			peoplePicker.multiselect({
				noneSelectedText: '',
				beforeopen: function(event, ui) {
					peoplePicker.$widget.css('width', this.$el.width() + 'px');
				}.bind(this)
			});
			peoplePicker.$button.addClass('carousel__people-picker');
		}
	},

	markAsNew: function() {
		this.$el.addClass('new');
		this.$el.on('click', this.markAsRead.bind(this));
	},

	markAsRead: function(event) {
		var callbacks = {
			success: function() {
				this.$el.off(event);
				this.$el.removeClass('new');

				if (typeof(this.$clone) !== 'undefined') {
					this.$clone.removeClass('new');
				}
			}.bind(this),
			error: function() {
				console.log('%C Error marking post as read...', '#ff0000');
			}
		};

		this.model.markAsRead(callbacks);
	},

	toggleOptions: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.$options.toggle();
	},

	fancybox: function() {
		this.$('.carousel__picture-link').fancybox();
	}

});


App.views.RepliesWidget = Backbone.View.extend({

	el: '.replies-widget',

	events: {
		'submit': 'reply',
		'click .replies-widget__close-button': 'close',
	},

	initialize: function() {
		this.$postContainer = this.$('.replies-widget__post');
		this.$repliesList = this.$('.replies-widget__replies');
		this.$reply = this.$('.replies-widget__reply-input');
		this.$submitButton = this.$('.replies-widget__submit-button');
		this.$errorMessage = this.$('.error-message');

		App.vent.on('replies:show', this.open, this);
	},

	open: function(post) {
		this.$el.css('z-index', App.getHighestZIndex());

		this.stopListening();
		this.model = post.get('replies');
		this.listenTo(this.model, 'reset', this.reset);

		this.model.fetch({ reset: true });

		var postView = new App.views.Post({ model: post, mode: 'reply' });
		postView.$el.addClass('replies-widget__post');
		this.$postContainer.append(postView.render().el);

		this.$el.fadeIn();
	},

	close: function() {
		this.$errorMessage.text('');
		this.$el.fadeOut(400, function() {
			this.clear();
		}.bind(this));
	},

	clear: function() {
		this.$postContainer.empty();
		this.$repliesList.empty();
		this.$reply.val('');
	},

	addReplies: function(models) {
		for (var i = 0; i < models.length; i++) {
			this.addReply(models[i]);
		}
	},

	addReply: function(model) {
		var reply = new App.views.Reply({ model: model });
		this.$repliesList.append(reply.render().el);
	},

	reset: function(collection) {
		this.$repliesList.empty();
		this.addReplies(collection.models);
	},

	reply: function(event) {
		event.preventDefault();

		var reply = new App.models.Reply();
		Backbone.Validation.bind(this);

		var options = {
			success: this.onSuccess.bind(this),
			failure: this.onFailure.bind(this),
			error: this.onError.bind(this)
		};

		this.model.save({
			friendId: this.$friendId.val(),
			nickname: $.trim(this.$nickname.val()),
			ring: this.ringSelector.$el.val()
		}, options);
	}

});


App.views.Reply = Backbone.View.extend({

	tagName: 'li',

	className: 'replies-widget__reply',

	template: _.template($('#reply-template').html()),

	initialize: function() {
	},

	render: function() {
		this.$el.append(this.template({ reply: this.model }));
		return this;
	}

});


App.views.Publisher = Backbone.View.extend({

	el: '.site-publisher',

	events: {
		'submit': 'publish',
		'click .site-dashboard__cancel-button': 'close',
		'change .site-publisher__picture-input': 'uploadPicture'
	},

	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.peoplePicker = new App.views.PeoplePicker();
		this.$tagger = this.$('.site-publisher__tagger-button');
		this.$picturesContainer = this.$('.site-publisher__pictures-container');
		this.$content = this.$('.site-publisher__content-input');
		this.$submitButton = this.$('.site-dashboard__cancel-button');
		this.$errorMessage = this.$('.error-message');

		/* Don't like this to be here... */
		this.$headerLink = $('.publish-links__normal');
		this.$headerLink.on('click', this.open.bind(this));
		/* Don't like this to be here... */

		this.errors = {
			category: [],
			content: []
		};
	},

	render: function() {
		this.peoplePicker.render({ includeRing0: false });
		this.$tagger.after(this.peoplePicker.el);

		this.peoplePicker.multiselect({
			noneSelectedText: 'Me Only (who can see this?)',
			selectedList: 1,
			beforeopen: this.beforePeoplePickerOpens.bind(this)
		});

		this.peoplePicker.$button.addClass('site-publisher__people-picker');

		this.$tagger.tagger({
			categoriesTree: App.categoriesTree,
			default: [3],
			socket: App.socket,
			commands: {
				addTag: 'addTag',
				fetchTags: 'getTags'
			}
		});

		this.$tagger.tooltip({ title: 'Choose a category', trigger: 'manual' });
	},

	beforePeoplePickerOpens: function() {
		this.peoplePicker.$widget.css('width', this.peoplePicker.$button.parent().width() + 'px');
	},

	open: function(event) {
		event.preventDefault();

		this.$headerLink.closest('.publish-links').hide();
		this.$el.css('z-index', App.getHighestZIndex()).fadeIn();
	},

	close: function() {
		this.$el.fadeOut(null, function() {
			this.$headerLink.closest('.publish-links').show();
		}.bind(this));
	},

	uploadPicture: function(event) {
		var input = event.currentTarget;

		if (input.value === '') {
			return;
		}

		for (var i = 0; i < input.files.length; i++) {
			var placeholder = this.addPicturePlaceholder();

			var options = {
				success: this.uploadPictureSuccess.bind(this),
				error: this.uploadPictureError.bind(this),
				progress: this.uploadPictureProgress.bind(this),
				data: placeholder
			};

			App.vent.trigger('uploadPicture', { picture: input.files[i] }, options);
		}

		input.value = '';
	},

	addPicturePlaceholder: function() {
		var $placeholder = $('<div></div>', {
			'class': 'site-publisher__picture site-publisher__picture--placeholder'
		});
		var $uploadbar = $('<div></div>', { 'class': 'site-publisher__uploadbar' });
		var $uploadbarProgress = $('<div></div>', { 'class': 'site-publisher__uploadbar-progress' });

		$uploadbar.append($uploadbarProgress);
		$placeholder.append($uploadbar);
		this.$picturesContainer.append($placeholder);

		this.$picturesContainer.show();

		return {
			$element: $placeholder,
			$uploadbar: $uploadbar,
			$uploadbarProgress: $uploadbarProgress
		};
	},

	uploadPictureSuccess: function(response, data) {
		// @TODO: we should not be doing this...
		var response = JSON.parse(response);

		if (response.success === true) {
			this.addPicture(response.filename, data);
		} else {
			data.$uploadbarProgress.addClass('site-publisher__uploadbar-progress--error');

			setTimeout(function() {
				data.$element.fadeOut();
			}, 3000);
		}
	},

	uploadPictureError: function(data) {
		data.$uploadbarProgress.addClass('site-publisher__uploadbar-progress--error');

		setTimeout(function() {
			data.$element.fadeOut();
		}, 3000);
	},

	uploadPictureProgress: function(percent, data) {
		data.$uploadbarProgress.css('width', percent + '%');
	},

	addPicture: function(filename, data) {
		var $picture = $('<a></a>', { 'class': 'site-publisher__picture', href: App.tempPath + filename });
		var $image = $('<img>', {
			src: App.tempPath + 'thumbnails/' + filename,
			data: {
				filename: filename
			}
		});
		var $closeButton = $('<button></button>', {
			type: 'button',
			'class': 'close',
			html: '&times;',
			on: {
				click: this.deletePicture.bind(this)
			}
		});

		$picture.append($closeButton);
		$picture.append($image);

		data.$element.replaceWith($picture);

		$picture.fancybox();
	},

	deletePicture: function(event) {
		event.preventDefault();
		event.stopPropagation();

		var $closeButton = $(event.currentTarget);
		var self = this;

		$closeButton.parent().fadeOut(400, function() {
			$(this).remove();

			if (self.$picturesContainer.children().length === 0) {
				self.$picturesContainer.hide();
			}
		});
	},

	deletePictures: function() {
		this.$picturesContainer.empty().hide();
	},

	getPictures: function() {
		var containerChildren = this.$picturesContainer.children();
		var pictures = [];

		for (var i = 0; i < containerChildren.length; i++) {
			var $picture = $(containerChildren[i]);

			if (!$picture.hasClass('site-publisher__picture--placeholder')) {
				var $image = $picture.children('img');
				pictures.push($image.data('filename'));
			}
		}

		return pictures;
	},

	publish: function(event) {
		event.preventDefault();

		if (this.countErrors() > 0) {
			this.removeErrors();
		}

		this.$errorMessage.text('');

		if (this.validate()) {
			this.$submitButton.attr('disabled');

			var data = {
				visibility: this.peoplePicker.$el.val(),
				categoryId: this.$tagger.tagger('getCategory'),
				tags: this.$tagger.tagger('getTags'),
				content: this.$content.val(),
				pictures: this.getPictures()
			};

			var callbacks = {
				'success': this.onSuccess.bind(this),
				'error': this.onError.bind(this)
			};

			App.vent.trigger('createPost', data, callbacks);
		} else {
			this.showErrors();
		}
	},

	onSuccess: function() {
		this.close();
		this.clear();
		this.$submitButton.removeAttr('disabled');
	},

	onError: function() {
		this.$errorMessage.text(this.errorMessage).effect('highlight');
		this.$submitButton.removeAttr('disabled');
	},

	validate: function() {
		this.errors = {
			category: [],
			content: []
		};

		if (this.$content.val() === '') {
			this.errors.content.push("Can't be blank.");
		}

		if (this.$tagger.tagger('validate') === false) {
			this.errors.category.push('Choose a category');
			this.$tagger.tooltip('show');
		} else {
			this.$tagger.tooltip('hide');
		}

		return this.countErrors() == 0 ? true : false;
	},

	countErrors: function() {
		var numberOfErrors = 0;

		for (var field in this.errors) {
			var errors = this.errors[field];
			numberOfErrors += errors.length;
		};

		return numberOfErrors;
	},

	showErrors: function() {
		for (var field in this.errors) {
			var errors = this.errors[field];

			if (errors.length > 0) {
				var $field = this['$' + field];

				if (typeof($field) === 'undefined') {
					continue;
				}

				$field.parent().addClass('has-error');

				for (var index in errors) {
					var error = errors[index];

					$('<span></span>', {
						class: 'help-block'
					}).text(error).appendTo($field.parent());
				}
			}
		}
	},

	removeErrors: function() {
		for (var field in this.errors) {
			var errors = this.errors[field];
			var $field = this['$' + field];

			if (typeof($field) === 'undefined') {
				continue;
			}

			$field.parent().removeClass('has-error')
			.children('.help-block').remove();
		}
	},

	clear: function() {
		this.peoplePicker.uncheckAll();
		this.deletePictures();
		this.$tagger.tagger('clearLevels');
		this.$tagger.tagger('selectCategory', [3]);
		this.$tagger.tooltip('hide');
		this.$content.val('');
	}

});


App.views.FriendAdder = Backbone.View.extend({

	el: '.friend-adder',

	events: {
		'click .friend-adder__cancel-button': 'close',
		'submit': 'addFriend'
	},

	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.ringSelector = new App.views.RingSelector();

		this.$searchTerm = this.$('.friend-adder__search-term-input');
		this.$friendId = this.$('.friend-adder__friend-id-input');
		this.$nickname = this.$('.friend-adder__nickname-input');
		this.$ringSelectorContainer = this.$('.friend-adder__ring-selector-container');
		this.$submitButton = this.$('.friend-addder__submit-button');
		this.$successMessage = this.$('.success-message');
		this.$errorMessage = this.$('.error-message');

		App.vent.on('friendAdder:open', this.open, this);
	},

	render: function() {
		this.$searchTerm.autocomplete({
			source: 'people',
			minLength: 3,
			messages: {
				noResults: '',
				results: function() {}
			},
			select: this.selectPerson.bind(this),
			change: this.checkIfSelected.bind(this),
			open: this.openAutocomplete.bind(this)
		}).data('ui-autocomplete')._renderItem = this.renderPerson;

		this.$ringSelectorContainer.append(this.ringSelector.render().el);
		this.ringSelector.ringSelector();
	},

	openAutocomplete: function(event, ui) {
		var width = this.$searchTerm.parent().width();
		this.$searchTerm.autocomplete('widget')
		.css('z-index', App.getHighestZIndex())
		.css('width', width + 'px');
	},

	renderPerson: function($ul, item) {
		var $li = $('<li></li>');
		var $link = $('<a></a>');
		var $profilePicture = $('<img>', { src: 'uploads/profiles/thumbnails/' + item.profilePicture });

		$link.append($profilePicture)
		$link.append(' ' + item.label);
		$li.append($link);
		$ul.append($li);

		return $li;
	},

	selectPerson: function(event, ui) {
		this.$friendId.val(ui.item.id);
		this.$nickname.val(ui.item.label).removeAttr('disabled');
	},

	checkIfSelected: function(event, ui) {
		if (ui.item === null) {
			this.$friendId.val('');
			this.$nickname.val('').attr('disabled', 'disabled');
		}
	},

	open: function() {
		this.model = new App.models.Friend();
		Backbone.Validation.bind(this);

		this.$el.css('z-index', App.getHighestZIndex());
		this.$el.fadeIn();
	},

	close: function() {
		Backbone.Validation.unbind(this);

		this.$successMessage.text('');
		this.$errorMessage.text('');
		this.$el.fadeOut(400, function() {
			this.clear();
		}.bind(this));
	},

	addFriend: function(event) {
		event.preventDefault();

		this.$successMessage.text('');
		this.$errorMessage.text('');

		var options = {
			success: this.onSuccess.bind(this),
			failure: this.onFailure.bind(this),
			error: this.onError.bind(this)
		};

		this.model.save({
			friendId: this.$friendId.val(),
			nickname: $.trim(this.$nickname.val()),
			ring: this.ringSelector.$el.val()
		}, options);
	},

	onSuccess: function() {
		App.friends.add(this.model);
		this.$el.fadeOut();
	},

	onFailure: function(message) {
		this.$errorMessage.text(message.failureMessage);
	},

	onError: function() {
		this.$errorMessage.text(this.errorMessage);
	},

	clear: function() {
		this.$searchTerm.val('');
		this.$friendId.val('');
		this.$nickname.val('').attr('disabled', 'disabled');
	}

});


App.views.ProfileEditor = Backbone.View.extend({

	el: '.profile-editor',

	events: {
		'submit': 'save',
		'click .profile-editor__cancel-button': 'close',
		'change .profile-editor__profile-picture-input': 'changeProfilePicture',
		'click .profile-editor__change-password-link': 'changePassword',
		'click .profile-editor__profile-picture .close': 'removePicture'
	},

	successMessage: 'Settings updated!',
	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.peoplePicker = new App.views.PeoplePicker({ multiple: false });
		this.$peoplePickerContainer = this.$('.profile-editor__people-picker-container');
		this.$profileContainer = this.$('.profile-editor__profile-container');
		this.$submitButton = this.$('.profile-editor__submit-button');
		this.$successMessage = this.$('.success-message');
		this.$errorMessage = this.$('.error-message');
		this.profile = null;
		this.isUser = null;

		App.vent.on('profileEditor:open', this.open, this);
	},

	render: function() {
		this.peoplePicker.render({ includeRing0: true });
		this.$peoplePickerContainer.append(this.peoplePicker.el);

		this.peoplePicker.multiselect({
			noneSelectedText: 'Select somebody',
			selectedList: 1,
			open: function() {
				var width = this.$peoplePickerContainer.width();
				this.peoplePicker.$widget.css('width', width + 'px');
			}.bind(this),
			close: this.showProfile.bind(this)
		});

		this.showProfile();
	},

	open: function() {
		this.$el.css('z-index', App.getHighestZIndex());
		this.$el.fadeIn();
	},

	close: function() {
		this.$successMessage.text('');
		this.$errorMessage.text('');

		this.$el.fadeOut(300, function() {
			this.showProfile();
		}.bind(this));
	},

	showProfile: function() {
		var userId = parseInt(this.peoplePicker.$el.val(), 10);
		var friend = App.friends.findWhere({ friendId: userId });
		var profile = null;
		this.isUser = userId === App.user.get('id') ? true : false;

		this.$successMessage.text('');
		this.$errorMessage.text('');

		if (this.isUser === true) {
			profile = new App.views.UserSettings({
				el: this.$profileContainer,
				model: App.user,
				friend: friend
			});
		} else {
			profile = new App.views.FriendSettings({
				el: this.$profileContainer,
				model: friend
			});
		}

		this.stopListening();
		this.listenTo(profile.model, 'change:profilePicture', this.updateProfilePicture);
		this.listenTo(profile.model, 'change:myProfilePicture', this.updateProfilePicture);

		this.profile = profile;
		this.profile.render();
		this.updateProfilePicture();
	},

	save: function(event) {
		event.preventDefault();

		this.$successMessage.text('');
		this.$errorMessage.text('');

		this.profile.save({
			success: this.onSuccess.bind(this),
			error: this.onError.bind(this)
		});
	},

	onSuccess: function() {
		this.$successMessage.text(this.successMessage);
	},

	onError: function() {
		this.$errorMessage.text(this.errorMessage);
	},

	changeProfilePicture: function(event) {
		var input = event.currentTarget;

		if (input.value === '') {
			return;
		}

		var file = input.files[0];

		if (this.validateProfilePicture(file) === false) {
			return;
		}

		var uploadbar = this.addProfilePictureUploadbar();

		var options = {
			success: this.changeProfilePictureSuccess.bind(this),
			failure: $.proxy(this.changeProfilePictureFailure, this, uploadbar),
			error: $.proxy(this.changeProfilePictureError, this, uploadbar),
			progress: $.proxy(this.changeProfilePictureProgress, this, uploadbar)
		};

		this.profile.model.changeProfilePicture(file, options);

		input.value = '';
	},

	validateProfilePicture: function(file) {
		var errors = [];

		if (App.allowedImageTypes.indexOf(file.type) === -1) {
			errors.push('File type not allowed');
		}

		if (file.size > App.imageMaximumSize) {
			errors.push('File too big, maximum allowed is ' + bytesToSize(App.imageMaximumSize));
		}

		if (errors.length > 0) {
			this.profile.$profilePicture.tooltip({
				title: errors[0],
				trigger: 'manual'
			}).tooltip('show');

			return false;
		} else {
			this.profile.$profilePicture.tooltip('destroy');
		}

		return true;
	},

	addProfilePictureUploadbar: function() {
		var $uploadbar = $('<div></div>', { 'class': 'profile-editor__uploadbar' });
		var $uploadbarProgress = $('<div></div>', { 'class': 'profile-editor__uploadbar-progress' });

		this.profile.$profilePicture.empty();
		$uploadbar.append($uploadbarProgress);
		this.profile.$profilePicture.append($uploadbar);

		return {
			$element: $uploadbar,
			$uploadbarProgress: $uploadbarProgress
		};
	},

	changeProfilePictureSuccess: function(message) {
		// profile picture changes succesfully...
	},

	changeProfilePictureFailure: function(message) {
		uploadbar.$uploadbarProgress.addClass('profile-editor__uploadbar-progress--error');

		setTimeout(function() {
			this.updateProfilePicture();
		}.bind(this), 3000);
	},

	changeProfilePictureError: function(message) {
		uploadbar.$uploadbarProgress.addClass('profile-editor__uploadbar-progress--error');

		setTimeout(function() {
			this.updateProfilePicture();
		}.bind(this), 3000);
	},

	changeProfilePictureProgress: function(uploadbar, event) {
		var progress = this.calculateProgress(event);
		uploadbar.$uploadbarProgress.css('width', progress + '%');
	},

	calculateProgress: function(event) {
		var percent = 0;
		var position = event.loaded || event.position;
		var total = event.total;

		if (event.lengthComputable) {
			percent = Math.ceil(position / total * 100);
		}

		return percent;
	},

	updateProfilePicture: function() {
		var picture = App.profilePicturesPath + this.profile.model.getProfilePicture();
		var pictureThumbnail = App.profilePicturesPath + 'thumbnails/' + this.profile.model.getProfilePicture();

		var $pictureLink = $('<a></a>', {
			'class': 'profile-editor__profile-picture-link',
			href: picture
		});
		var $picture = $('<img>', {
			'class': 'profile-editor__profile-picture-image',
			src: pictureThumbnail + '?' + new Date().getTime()
		});
		var $label = $('<label></label>', {
			'class': 'profile-editor__profile-picture-label',
			text: 'Change Picture'
		});
		var $input = $('<input>', {
			'class': 'profile-editor__profile-picture-input',
			type: 'file',
			accept: 'image/*',
			capture: ''
		});

		if (this.isUser === false && this.profile.model.get('myProfilePicture') !== null) {
			var $closeButton = $('<button></button>', {
				'class': 'close',
				type: 'button',
				html: '&times;'
			});

			$closeButton.on('click', this.profile.removePicture.bind(this.profile));

			$pictureLink.append($closeButton);
		}

		$pictureLink.append($picture);
		$label.append($input);

		this.profile.$profilePicture.empty();
		this.profile.$profilePicture.append($pictureLink);
		this.profile.$profilePicture.append($label);

		$pictureLink.fancybox();
	},

	changePassword: function(event) {
		event.preventDefault();
		App.vent.trigger('changePassword');
	}

});


App.views.UserSettings = Backbone.View.extend({

	template: _.template($('#user-settings').html()),

	initialize: function() {
		Backbone.Validation.bind(this);
	},

	render: function() {
		var template = this.template({
			user: this.model,
			friendProfile: this.options.friend
		});

		this.$el.html(template);
		this.cacheFields();
	},

	cacheFields: function() {
		this.$firstName = this.$('.profile-editor__first-name-input');
		this.$lastName = this.$('.profile-editor__last-name-input');
		this.$nickname = this.$('.profile-editor__nickname-input');
		this.$email = this.$('.profile-editor__email-input');
		this.$profilePicture = this.$('.profile-editor__profile-picture');
	},

	save: function(options) {
		this.model.save({
			firstName: $.trim(this.$firstName.val()),
			lastName: $.trim(this.$lastName.val()),
			nickname: $.trim(this.$nickname.val()),
			email: $.trim(this.$email.val())
		}, options);
	}

});


App.views.FriendSettings = Backbone.View.extend({

	template: _.template($('#friend-settings').html()),

	initialize: function() {
		this.ringSelector = new App.views.RingSelector();

		Backbone.Validation.bind(this);
	},

	render: function() {
		var template = this.template({
			friend: this.model,
		});

		this.$el.html(template);
		this.showRingSelector();

		this.cacheFields();
	},

	showRingSelector: function() {
		var $ringSelectorContainer = this.$('.profile-editor__ring-selector-container');

		this.ringSelector.render();
		this.ringSelector.$el.val(this.model.get('ring'));

		$ringSelectorContainer.append(this.ringSelector.el);
		this.ringSelector.ringSelector();
	},

	cacheFields: function() {
		this.$nickname = this.$('.profile-editor__nickname-input');
		this.$ring = this.ringSelector.$el;
		this.$profilePicture = this.$('.profile-editor__profile-picture');
	},

	save: function(options) {
		this.model.save({
			'nickname': $.trim(this.$nickname.val()),
			'ring': parseInt(this.$ring.val(), 10)
		}, options);
	},

	removePicture: function(event) {
		event.preventDefault();
		event.stopPropagation();

		this.$profilePicture.tooltip('destroy');

		this.model.removePicture({
			success: this.onRemovePictureSuccess.bind(this),
			error: this.onRemovePictureError.bind(this)
		});
	},

	onRemovePictureSuccess: function(message) {
		this.model.set('myProfilePicture', null);
	},

	onRemovePictureError: function(message) {
		this.$profilePicture.tooltip({
			title: 'Error, try again later',
			trigger: 'manual'
		}).tooltip('show');
	}

});


App.views.PasswordChanger = Backbone.View.extend({

	el: '.password-changer',

	events: {
		'submit': 'save',
		'click .password-changer__cancel-button': 'close'
	},

	successMessage: 'Password changed!',
	errorMessage: 'We had a problem, try again.',

	initialize: function() {
		this.$newPassword = this.$('.password-changer__new-password-input');
		this.$repeatPassword = this.$('.password-changer__repeat-password-input');
		this.$currentPassword = this.$('.password-changer__current-password-input')
		this.$submitButton = this.$('.password-changer__submit-button');
		this.$successMessage = this.$('.success-message');
		this.$errorMessage = this.$('.error-message');

		this.model = new App.models.PasswordChanger();
		Backbone.Validation.bind(this);

		App.vent.on('changePassword', this.open, this);
	},

	open: function() {
		this.$el.css('z-index', App.getHighestZIndex());
		this.$el.fadeIn();
	},

	close: function() {
		this.$el.fadeOut();
	},

	save: function(event) {
		event.preventDefault();

		this.$successMessage.text('');
		this.$errorMessage.text('');

		this.model.changePassword({
			newPassword: this.$newPassword.val(),
			repeatPassword: this.$repeatPassword.val(),
			currentPassword: this.$currentPassword.val()
		}, {
			success: this.onSuccess.bind(this),
			failure: this.onFailure.bind(this),
			error: this.onError.bind(this)
		});
	},

	onSuccess: function(message) {
		// @TODO: THIS IS WRONG
		this.model.updatePassword();

		this.clean();
		this.$successMessage.text(this.successMessage);
	},

	onFailure: function(message) {
		this.$errorMessage.text(message.failureMessage);
	},

	onError: function(message) {
		this.$errorMessage.text(this.errorMessage);
	},

	clean: function() {
		this.$newPassword.val('');
		this.$repeatPassword.val('');
		this.$currentPassword.val('');
	}

});


App.views.PeoplePicker = Backbone.View.extend({

	tagName: 'select',

	initialize: function() {
		this.multiple = this.options.multiple === false ? false : true;
		this.label = this.multiple === true ? 'Check all' : 'Select somebody';
	},

	render: function(options) {
		if (this.multiple !== false) {
			this.$el.attr('multiple', 'multiple');
		}

		var ring = options.includeRing0 === true ? 0 : 1;
		for (; ring < App.numberOfRings; ring++) {
			var $optgroup = this.renderOptgroup(ring);
			this.$el.append($optgroup);
		}

		return this;
	},

	renderOptgroup: function(ring, options) {
		var ringFriends = App.friends.groupedByRings[ring];

		var $optgroup = $('<optgroup></optgroup>', {
			'class': 'people-picker__ring-' + ring,
			label: '<span class="people-picker__ring-number">' + ring + '</span> ' + this.label
		});

		for (var i = 0; i < ringFriends.length; i++) {
			var friend = ringFriends[i];

			var $option = $('<option></option>', {
				'class': 'people-picker__ring-' + ring + '-option',
				text: friend.get('nickname'),
				value: friend.get('friendId')
			});

			$optgroup.append($option);
		}

		return $optgroup;
	},

	multiselect: function(options) {
		options['multiple'] = this.multiple;
		this.$el.multiselect(options);

		this.$button = this.$el.multiselect('getButton');
		this.$widget = this.$el.multiselect('widget');
	},

	refresh: function() {
		this.$el.multiselect('refresh');
	},

	getChecked: function() {
		return this.$el.multiselect('getChecked');
	},

	checkFriends: function(friends) {
		for (var i = 0; i < friends.length; i++) {
			var friendId = friends[i];
			this.checkFriend(friendId);
		}
	},

	checkFriend: function(friendId) {
		this.$widget.find(':checkbox').each(function(){
			if (parseInt($(this).val(), 10) === friendId) {
				this.click();
				return false;
			}
		});
	},

	uncheckAll: function () {
		this.$el.multiselect('uncheckAll');
	},

	setOption: function(option, value) {
		this.$el.multiselect('option', option, value);
	}

});


App.views.RingSelector = Backbone.View.extend({

	tagName: 'select',

	render: function() {
		for (var i = 1; i < App.numberOfRings; i++) {
			var $option = $('<option></option>', {
				value: i,
				text: i
			});

			this.$el.append($option);
		}

		return this;
	},

	ringSelector: function() {
		this.$el.ringSelector();
	}

});


