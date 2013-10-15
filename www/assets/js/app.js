var App = {

	routers: {},
	models: {},
	collections: {},
	views: {},
	vent: _.extend({}, Backbone.Events),
	socket: null,
	cookiesDaysOfLife: 30,
	numberOfRings: 4,
	svgNS: 'http://www.w3.org/2000/svg',
	xlinkNS: 'http://www.w3.org/1999/xlink',
	allowedImageTypes: ['image/png', 'image/jpeg', 'image/gif'],
	imageMaximumSize: 20970000, // 20 MB
	profilePicturesPath: 'uploads/profiles/',
	tempPath: 'uploads/temp/',
	highestZIndex: 1000,
	$body: $('body'),
	breakpoint: 0,

	getHighestZIndex: function() {
		return ++this.highestZIndex;
	}

};

App.init = function() {
	this.socket = new eWebSocket();

	this.socket.onopen = function(event) {
		this.vent.trigger('socket:connected');
		console.log('Socket connected.');
	}.bind(this);

	this.socket.onclose = function(event) {
		this.vent.trigger('socket:disconnected');
		console.log('Socket connection closed.');
	}.bind(this);

	this.socket.onerror = function(event) {
		this.vent.trigger('socket:error');
		console.log('Socket connection error. ', event);
	}.bind(this);

	this.socket.router = function(message) {
		switch (message['command']) {
			case 'post:new':
				var friend = App.friends.findWhere({ friendId: message.post.user_id });
				friend.set('notifications', friend.get('notifications') + 1);

				if (App.dashboard.isOpen === true && App.dashboard.friends.indexOf(friend.get('friendId')) !== -1) {
					App.dashboard.addPost(message.post);
				}

				break;

			default:
				console.log('Unknown message received. ', message);
				break;
		}
	}.bind(this);

	this.socket.connect();

	App.credentials = new App.models.Credentials();
	App.user = new App.models.User();
};

App.watchBreakpoints = function() {
	this.checkBreakpoint();
	$(window).on('resize', _.throttle(this.checkBreakpoint.bind(this), 500));
};

App.checkBreakpoint = function() {
	var width = this.$body.width();
	var breakpoint = 0;

	if (width >= 435) {
		breakpoint = 1;
	}

	if (width >= 750) {
		breakpoint = 2;
	}

	if (width >= 960) {
		breakpoint = 3;
	}

	if (breakpoint !== this.breakpoint) {
		this.breakpoint = breakpoint;
		this.vent.trigger('breakpoint', breakpoint);
	}
};








/*-------------------------
| Global functions
-------------------------*/
var monthsName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var monthsShortName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatAMPM(date) {
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = hours >= 12 ? 'pm' : 'am';

	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;

	return hours + ':' + minutes + ' ' + ampm;
}

function parseDate(UTCTime) {
	date = new Date(UTCTime);
	return monthsShortName[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear()
			+ ' ' + formatAMPM(date);
}

function bytesToSize(bytes) {
	if (bytes == 0) {
		return '0 Bytes';
	}

	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};