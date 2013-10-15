/*--------------------------------------------------------------
| WebSocket Interface created by Gastón Sánchez for tokeep.me
--------------------------------------------------------------*/

function eWebSocket(host, port) {
	this.host = host || this.getCurrentHost();
	this.port = port || 8081;

	this.callbacks = {};
	this._nextMessageId = 0;
}

eWebSocket.prototype = {
	constructor: eWebSocket,
	SUCCESS_RETURN_CODE: 'OK',
	FAILURE_RETURN_CODE: 'FAILURE',
	ERROR_RETURN_CODE: 'NOT_OK',

	connect: function() {
		this.socket = new WebSocket('ws://' + this.host + ':' + this.port);

		this.socket.onopen = this.onopen;
		this.socket.onclose = this.onclose;
		this.socket.onerror = this.onerror;
		this.socket.onmessage = this.onmessage.bind(this);
	},

	getCurrentHost: function() {
		return window.location.host === '' ? 'www.greenrings.net' : window.location.hostname;
	},

	isFunction: function(possibleFunction) {
		return typeof(possibleFunction) === typeof(Function);
	},

	onopen: function(event) {
		console.log('Socket connected.');
	},

	onclose: function(event) {
		console.log('Socket connection closed.');
	},

	onerror: function(event) {
		console.log('Socket connection error.', event);
	},

	onmessage: function(event) {
		var message = JSON.parse(event.data);
		var messageId = message['messageId'];
		var callbacks = this.callbacks[messageId];

		console.log('Message received. ', message);

		if (message.returnCode === this.SUCCESS_RETURN_CODE && this.isFunction(callbacks['success'])) {
			callbacks.success(message, callbacks['data']);
		} else if (message.returnCode === this.FAILURE_RETURN_CODE && this.isFunction(callbacks['failure'])) {
			callbacks.failure(message, callbacks['data']);
		} else if (message.returnCode === this.ERROR_RETURN_CODE && this.isFunction(callbacks['error'])) {
			callbacks.error(message, callbacks['data']);
		} else {
			this.router(message);
		}

		delete this.callbacks[messageId];
	},

	send: function(message, options) {
		var messageId = this._nextMessageId++;

		message['messageId'] = messageId;
		this.callbacks[messageId] = options;

		console.log('Sending message. ', message);
		this.socket.send(JSON.stringify(message));
	},

	router: function(message) {

	}
};