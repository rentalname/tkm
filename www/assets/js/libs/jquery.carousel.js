/*-----------------------------------------------
| Created by Gastón Sánchez for tokeep.me
-----------------------------------------------*/

(function($) {

	$.widget('tokeepme.carousel', {

		options: {
			visibleItems: 1,
			startPage: 1
		},

		_create: function() {
			this.$carousel = this.element.children('ul');
			this.$items = this.$carousel.children('li');
			this.$item = this.$items.last();
			this.padItems = [];
			this.isAnimating = false;

			this._bindButtons();
		},

		_removePad: function() {
			for (var i = 0; i < this.padItems.length; i++) {
				var $padItem = this.padItems[i];
				$padItem.remove();
			}

			this.$items = this.$carousel.children('li');
			this.padItems = [];
		},

		_addPad: function() {
			if ((this.$items.length % this.options.visibleItems) !== 0) {
				var padding = this.options.visibleItems - (this.$items.length % this.options.visibleItems);

				for (var i = 0; i < padding; i++) {
					var $li = $('<li></li>', { 'class': 'empty' });

					this.padItems.push($li);
					this.$carousel.append($li);
				}

				this.$items = this.$carousel.children('li');
			}
		},

		_bindButtons: function() {
			if (typeof(this.options.previousButton) !== 'undefined') {
				this.options.previousButton.on('click', function(event) {
					event.preventDefault();
					this.goToPage(this.currentPage + 1);
				}.bind(this));
			}

			if (typeof(this.options.nextButton) !== 'undefined') {
				this.options.nextButton.on('click', function(event) {
					event.preventDefault();
					this.goToPage(this.currentPage - 1);
				}.bind(this));
			}
		},

		adjust: function() {
			this._makeCalculus();
			this._setSizes();

			this.element.scrollLeft(0);
			this.currentPage = 1;
		},

		_init: function() {
			this._removePad();
			this._makeCalculus();
			this._addPad();

			this._setSizes();

			var scrollLeft = (this.options.startPage - 1) * (this.options.visibleItems * this.itemsIncrement);
			this.element.scrollLeft(scrollLeft);
			this.currentPage = this.options.startPage;
		},

		_setSizes: function() {
			this.$carousel.css('width', this.$items.length * this.itemsIncrement);

			for (var i = 0; i < this.$items.length; i++) {
				var $item = $(this.$items[i]);
				$item.css('width', this.itemsWidth);
			}
		},

		_makeCalculus: function() {
			this.itemsMargin = parseInt(this.$item.css('marginLeft'), 10);
			this.viewportWidth = this.element.width() - 1; // We substract 1 so it's not very tight
			this.viewportAvailableSpace = this.viewportWidth - ((this.options.visibleItems - 1) * this.itemsMargin);
			this.itemsWidth = this.viewportAvailableSpace / this.options.visibleItems;
			this.itemsIncrement = this.itemsWidth + this.itemsMargin;

			this.numberOfPages = Math.ceil(this.$items.length / this.options.visibleItems);
		},

		goToPage: function(page) {
			if (this.isAnimating) {
				return;
			}

			this.isAnimating = true;

			if (page > this.numberOfPages) {
				page = 1;
			} else if (page < 1) {
				page = this.numberOfPages;
			}

			var direction = page < this.currentPage ? -1 : 1;
			var pagesAway = Math.abs(this.currentPage - page);
			var scrollLeftDifference = pagesAway * (this.options.visibleItems * this.itemsIncrement) * direction;

			this.element.animate({
				scrollLeft : '+=' + scrollLeftDifference
			}, 400, function() {
				this.isAnimating = false;
			}.bind(this));

			this.currentPage = page;
		}

	});

})(jQuery);