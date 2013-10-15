/*-----------------------------------------------
| Created by Gastón Sánchez for tokeep.me
-----------------------------------------------*/

(function($) {

	$.widget('tokeepme.ringSelector', {

		options: {},

		_create: function() {
			this._renderWidget();
			this.element.hide().parent().append(this.$widget);
		},

		_renderWidget: function() {
			this.$selectOptions = this.element.children();
			this.$widget = $('<ul></ul>', {
				'class': 'ring-selector'
			});

			for (var i = 0; i < this.$selectOptions.length; i++) {
				var option = this.$selectOptions[i];
				var $option = $(option);
				var ring = $option.val();

				var $li = $('<li></li>').data('ring', ring);
				var $a = $('<a></a>', {
					href: '#',
					text: ring
				});

				if (option.selected) {
					$li.addClass('selected');
				}

				$a.on('click', this.selectRing.bind(this));

				$li.append($a);
				this.$widget.append($li);
			}

			this.$rings = this.$widget.children();
		},

		selectRing: function(event) {
			event.preventDefault();
			var $ring = $(event.currentTarget).parent();

			this.element.val($ring.data('ring'));
			this.$rings.removeClass('selected');
			$ring.addClass('selected');
		}

	});

})(jQuery);