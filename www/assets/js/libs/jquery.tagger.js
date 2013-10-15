/*------------------------------------------------
| Created by Gastón Sánchez for greenrings.net
------------------------------------------------*/

(function($){

	$.widget('tokeepme.tagger', {

		options: {
			categoriesTree: [],
			default: [],
			noneSelectedText: 'Select tags',
			selectedText: '# selected',
			socket: null,
			commands: {
				addTag: '',
				fetchTags: ''
			}
		},

		_create: function() {
			this.$parent = this.element.parent();
			this.$menu = $('<div></div>', { 'class': 'tkm-tagger', tabindex: -1 });
			this.isOpen = false;
			this.isValid = null;
			this.selectedLevels = [];
			this.selectedTags = {};
			this.numberOfLevels = 0;

			this._createMenu();
			this.selectCategory(this.options.default);
			this._bindEvents();
		},

		_createMenu: function() {
			if (this.options.categoriesTree.length > 0) {
				var rootList = {
					id: null,
					children: this.options.categoriesTree
				};

				this._createLevel([rootList]);
			}

			this.$menu.appendTo($('body'));
		},

		_bindEvents: function() {
			this._on(this.element, {
				click: function(event) {
					event.stopPropagation();
					event.preventDefault();

					if (this.isOpen === true) {
						this.close();
					} else {
						this.open();
					}
				},
				mousedown: function(event) {
					if (this.isOpen === true) {
						event.stopPropagation();
					}
				}
			});
		},

		_menuKeyboardHandler: function(event) {
			switch (event.which) {
				case 27: // Escape
				this.close();
				break;
			}
		},

		open: function()  {
			var position = this.element.offset();

			this.$menu.css({
				top: position.top + this.element.outerHeight(),
				right: $(window).width() - (position.left + this.element.outerWidth())
			});

			this._show(this.$menu, {});
			this.$menu.focus();

			this._on(this.$menu, {
				keydown: this._menuKeyboardHandler
			});

			this._on(document, {
				mousedown: function(event) {
					if ($(event.target).parents().index(this.$menu) === -1) {
						this.close();
					}
				}
			});

			this.isOpen = true;
		},

		close: function() {
			this._hide(this.$menu);
			this._off(this.$menu, 'keydown');
			this._off($(document), 'mousedown');

			this.isOpen = false;

			if (typeof(this.options.close) === typeof(Function)) {
				this.options.close();
			}
		},

		_createLevel: function(lists) {
			var $level = $('<div></div>', {
				'class': 'tkm-tagger__level',
				data: { id: this.numberOfLevels++ }
			});
			var nextLevelLists = [];

			for (var i = 0; i < lists.length; i++) {
				var list = lists[i];
				var $list = null;

				if (typeof(list.children) === 'undefined') {
					$list = this._createTagsList(list);
				} else {
					$list = this._createList(list, nextLevelLists);
				}

				$level.append($list);
			}

			this.$menu.append($level);

			if (nextLevelLists.length > 0) {
				this._createLevel(nextLevelLists);
			}
		},

		_createList: function(list, nextLevelLists) {
			var $list = $('<ul></ul>', { 'class': 'tkm-tagger__list' });

			if (typeof(list.id) !== 'undefined' && list.id !== null) {
				$list.data('id', list.id);
			}

			for (var i = 0; i < list.children.length; i++) {
				var category = list.children[i];

				var $category = $('<li></li>', {
					'class': 'tkm-tagger__category category-' + category.id,
					text: category.name,
					data: { id: category.id }
				}).on('click', $.proxy(function(event) {
					event.preventDefault();
					this._openSublist($(event.currentTarget));
				}, this));

				$list.append($category);

				var sublist = { id: category.id };

				if (typeof(category.children) !== 'undefined' &&
					(Array.isArray(category.children) && category.children.length > 0)) {
					sublist['children'] = category.children;
				}

				nextLevelLists.push(sublist);
			}

			return $list;
		},

		_createTagsList: function(list) {
			var $list = $('<ul></ul>', {
				'class': 'tkm-tagger__list tkm-tagger__list--tags',
				data: { 'areTagsFetched': false }
			});

			if (typeof(list.id) !== 'undefined' && list.id !== null) {
				$list.data('id', list.id);
			}

			var $input = $('<input>', {
				'class': 'tkm-tagger__input',
				type: 'text',
				placeholder: 'Add a tag',
				data: {
					'category-id': list.id
				}
			});

			this._on($input, {
				focus: function(event) {
					this._on($input, {
						keydown: this._inputKeyboardHandler
					});
				},
				blur: function(event) {
					this._off($input, 'keydown');
				}
			});

			$list.append($('<li></li>').append($input));

			return $list;
		},

		_fetchTags: function($sublist) {
			$sublist.data('areTagsFetched', true);

			this.options.socket.send({
				command: this.options.commands.fetchTags,
				category_id: $sublist.data('id')
			}, {
				success: $.proxy(this._addTags, this, $sublist),
				error: this._addTagsError.bind(this)
			});
		},

		_addTags: function($tagsList, message) {
			var tags = message.result;

			for (var i = 0; i < tags.length; i++) {
				var tag = tags[i];
				$tagsList.append(this._createTag(tag.id, tag.name));
			}
		},

		_addTagsError: function(message) {
			console.log('%cError fetching tags', 'color: #ff0000;');
		},

		_createTag: function(id, name) {
			var $tag = $('<li></li>', {
				'class': 'tkm-tagger__tag',
				text: name,
				data: { id: id }
			});

			this._on($tag, {
				click: function(event) {
					var $tag = $(event.currentTarget);
					var id = $tag.data('id');

					if ($tag.hasClass('tkm-tagger__tag--active') === false) {
						this.selectedTags[id] = $tag.addClass('tkm-tagger__tag--active');
					} else {
						$tag.removeClass('tkm-tagger__tag--active')
						delete this.selectedTags[id];
					}

					this._updateElementText();
				}
			});

			return $tag;
		},

		_inputKeyboardHandler: function(event) {
			switch (event.which) {
		        case 13: // Enter
		        this._addTag($(event.currentTarget));
		        break;
		    }
		},

		_updateElementText: function() {
			var numberOfSelectedTags = Object.keys(this.selectedTags).length;

			if (numberOfSelectedTags === 0) {
				this.element.text(this.options.noneSelectedText);
			} else {
				this.element.text(this.options.selectedText.replace('#', numberOfSelectedTags));
			}
		},

		_validateTag: function(tag) {
			this.tagErrors = [];

			if (tag.length === 0) {
				this.tagErrors.push("Can't be blank");
			} else if (tag.length > 255) {
				this.tagErrors.push("Tag can't exceed 255 characters");
			}

			return this.tagErrors.length === 0;
		},

		_addTag: function($input) {
			var name = $.trim($input.val());
			var $sibling = $input.next();

			if (!this._validateTag(name)) {
				var error = this.tagErrors[0];

				if ($sibling.length === 0){
					$input.after($('<span></span>', { 'class': 'tkm-tagger__tag-error', text: error }));
				} else {
					$sibling.text(error);
				}

				return;
			} else {
				if ($sibling.length > 0) {
					$sibling.remove();
				}
			}

			var message = {
				command: this.options.commands.addTag,
				name: name,
				category_id: $input.data('category-id')
			};

			var options = {
				success: $.proxy(this._addTagSuccess, this, $input),
				failure: $.proxy(this._addTagFailure, this, $input),
				error: $.proxy(this._addTagError, this, $input)
			};

			this.options.socket.send(message, options);
		},

		_addTagSuccess: function($input, message) {
			$input.parent().after(this._createTag(message.id, message.name));
			$input.val('');
		},

		_addTagFailure: function($input, message) {
			var $sibling = $input.next();
			var error = message['failureMessage'];

			if ($sibling.length === 0){
				$input.after($('<span></span>', {
					'class': 'tkm-tagger__tag-error',
					text: error
				}));
			} else {
				$sibling.text(error);
			}
		},

		_addTagError: function($input, message) {
			var $sibling = $input.next();
			var error = 'An error occurred';

			if ($sibling.length === 0){
				$input.after($('<span></span>', {
					'class': 'tkm-tagger__tag-error',
					text: error
				}));
			} else {
				$sibling.text(error);
			}
		},

		_openSublist: function($category) {
			var $currentLevel = $category.closest('.tkm-tagger__level');
			var levelId = $currentLevel.data('id');
			var categoryId = $category.data('id');

			$currentLevel.next().children().each($.proxy(function(index, element) {
				var $sublist = $(element);

				if (categoryId === $sublist.data('id')) {
					if ($sublist.data('areTagsFetched') === false) {
						this._fetchTags($sublist);
					}

					this.clearLevels(levelId);
					$category.addClass('tkm-tagger__category--active');
					$sublist.addClass('tkm-tagger__list--active');

					this.selectedLevels.push({ $category: $category, $list: $sublist });

					// Breaks out of each loop
					return false;
				}
			}, this));
		},

		clearLevels: function(start) {
			var start = typeof(start) === 'undefined' ? 0 : start;

			for (var i = start; i < this.selectedLevels.length; i++) {
				var $level = this.selectedLevels[i];

				$level.$category.removeClass('tkm-tagger__category--active');
				$level.$list.removeClass('tkm-tagger__list--active');
			}

			this.clearTags();
			this.selectedLevels.splice(start, this.selectedLevels.length - start);
		},

		clearTags: function() {
			for (var key in this.selectedTags) {
				var $tag = this.selectedTags[key];
				$tag.removeClass('tkm-tagger__tag--active');
			}

			this.selectedTags = {};
			this._updateElementText();
		},

		_destroy: function() {
			// @TODO: Destroy method
			// Deletes this.$menu... And remove .tagger class and inputs...
		},

		validate: function() {
			var level = this._getLastSelectedLevel();
			var isValid = false;

			if (typeof(level) !== 'undefined') {
				isValid = level.$list.hasClass('tkm-tagger__list--tags');
			}

			return this.isValid = isValid;
		},

		getIsValid: function() {
			return this.isValid;
		},

		_getLastSelectedLevel: function() {
			return this.selectedLevels[this.selectedLevels.length - 1];
		},

		selectCategory: function(categories) {
			this.clearLevels();
			var $lastList = this.$menu.children().first().children().first();

			for (var level = 0; level < categories.length; level++) {
				var categoryId = categories[level];
				var $category = false;

				$lastList.children().each(function(index, element) {
					var $element = $(element);

					if (categoryId === parseInt($element.data('id'), 10)) {
						$category = $element;
						return false;
					}
				});

				if ($category === false) {
					this.clearLevels();
					break;
				}

				$lastList = this._openSublist($category);
			}
		},

		getCategory: function() {
			var lastLevel = this._getLastSelectedLevel();
			return lastLevel.$list.data('id');
		},

		getTags: function() {
			var tags = [];

			for (var tagId in this.selectedTags) {
				tags.push(tagId);
			}

			return tags;
		}

    });

})(jQuery);