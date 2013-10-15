_.extend(Backbone.Validation.callbacks, {

	valid: function(view, attribute, selector) {
		var $input = view['$' + attribute];

		if (typeof($input) === 'undefined') {
			return;
		}

		var $container = $input.parent();
		var $errors = $container.find('.help-block');

		$container.removeClass('has-error');
		$errors.remove();
	},

	invalid: function(view, attribute, error, selector) {
		var $input = view['$' + attribute];

		if (typeof($input) === 'undefined') {
			return;
		}

		var $container = $input.parent();
		var $error = $('<span></span>', {
			class: 'help-block',
			text: error
		});

		$container.find('.help-block').remove();
		$container.addClass('has-error').append($error);
	}

});






