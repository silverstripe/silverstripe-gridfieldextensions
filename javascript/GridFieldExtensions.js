(function($) {
	let preventReorderUpdate = false;
	let updateTimeouts = [];

	$.entwine("ss", function($) {
		/**
		 * GridFieldAddExistingSearchButton
		 */

		$(".add-existing-search-dialog").entwine({
			loadDialog: function(deferred) {
				var dialog = this.addClass("loading").children(".ui-dialog-content").empty();

				deferred.done(function(data) {
					dialog.html(data).parent().removeClass("loading");
				});
			}
		});

		$(".ss-gridfield .add-existing-search").entwine({
			onclick: function() {
				var dialog = $("<div></div>").appendTo("body").dialog({
					modal: true,
					resizable: false,
					width: 500,
					height: 600,
					draggable: false,
					title: this.text(),
					close: function() {
						$(this).dialog("destroy").remove();
					}
				});

				dialog.parent().addClass("add-existing-search-dialog").loadDialog(
					$.get(this.prop("href"))
				);
				dialog.data("grid", this.closest(".ss-gridfield"));

				return false;
			}
		});

		$(".add-existing-search-dialog .add-existing-search-form").entwine({
			onsubmit: function() {
				this.closest(".add-existing-search-dialog").loadDialog($.get(
					this.prop("action"), this.serialize()
				));
				return false;
			}
		});

		// Allow the list item to be clickable as well as the anchor
    $('.add-existing-search-dialog .add-existing-search-items .list-group-item-action').entwine({
      onclick: function() {
        if (this.children('a').length > 0) {
          this.children('a').first().trigger('click');
        }
      }
    });

		$(".add-existing-search-dialog .add-existing-search-items a").entwine({
			onclick: function() {
				var link = this.closest(".add-existing-search-items").data("add-link");
				var id   = this.data("id");

				var dialog = this.closest(".add-existing-search-dialog")
					 .addClass("loading")
					 .children(".ui-dialog-content")
					 .empty();

				$.post(link, { id: id }, function() {
					dialog.data("grid").reload();
					dialog.dialog("close");
				});

				return false;
			}
		});

		$(".add-existing-search-dialog .add-existing-search-pagination a").entwine({
			onclick: function() {
				this.closest(".add-existing-search-dialog").loadDialog($.get(
					this.prop("href")
				));
				return false;
			}
		});

		/**
		 * GridFieldAddNewInlineButton
		 */

		$(".ss-gridfield.ss-gridfield-editable").entwine({
			reload: function(opts, success) {
				var grid  = this;
				// Record position of all items
				var added = [];
				var index = 0; // 0-based index
				grid.find("tbody:first .ss-gridfield-item").each(function() {
					// Record inline items with their original positions
					if ($(this).is(".ss-gridfield-inline-new")) {
						added.push({
							'index': index,
							'row': $(this).detach()
						});
					}
					index++;
				});

				this._super(opts, function() {
					var body = grid.find("tbody:first");
					$.each(added, function(i, item) {
						var row = item['row'],
							index = item['index'],
							replaces;
						// Insert at index position
						if (index === 0) {
							body.prepend(row);
						} else {
							// Find item that we could potentially insert this row after
							replaces = body.find('.ss-gridfield-item:nth-child(' + index + ')');
							if (replaces.length) {
								replaces.after(row);
							} else {
								body.append(row);
							}
						}
						grid.find("tbody:first").children(".ss-gridfield-no-items").hide();
					});

					if(success) success.apply(grid, arguments);
				});
			},
			onpaste: function(e) {
				// The following was used as a basis for clipboard data access:
				// http://stackoverflow.com/questions/2176861/javascript-get-clipboard-data-on-paste-event-cross-browser
				var clipboardData = typeof e.originalEvent.clipboardData !== "undefined" ? e.originalEvent.clipboardData : null;
				if (clipboardData) {
					// Get current input wrapper div class (ie. 'col-Title')
					var input = $(e.target);
					var inputType = input.attr('type');
					if (inputType === 'text' || inputType === 'email')
					{
						var lastInput = this.find(".ss-gridfield-inline-new:last").find("input");
						if (input.attr('type') === 'text' && input.is(lastInput) && input.val() === '')
						{
							var inputWrapperDivClass = input.parent().attr('class');
							// Split clipboard data into lines
							var lines = clipboardData.getData("text/plain").match(/[^\r\n]+/g);
							var linesLength = lines.length;
							// If there are multiple newlines detected, split the data into new rows automatically
							if (linesLength > 1)
							{
								var elementsChanged = [];
								for (var i = 1; i < linesLength; ++i)
								{
									this.trigger("addnewinline");
									var row = this.find(".ss-gridfield-inline-new:last");
									var rowInput = row.find("."+inputWrapperDivClass).find("input");
									rowInput.val(lines[i]);
									elementsChanged.push(rowInput);
								}
								// Store the rows added via this method so they can be undo'd.
								input.data('pasteManipulatedElements', elementsChanged);
								// To set the current row to not just be all the clipboard data, must wait a frame
								setTimeout(function() {
									input.val(lines[0]);
								}, 0);
							}
						}
					}
				}
			},
			onkeyup: function(e) {
				if (e.ctrlKey && e.key.toLowerCase() === "z")
				{
					var target = $(e.target);
					var elementsChanged = target.data("pasteManipulatedElements");
					if (typeof elementsChanged !== "undefined" && elementsChanged && elementsChanged.length)
					{
						for (var i = 0; i < elementsChanged.length; ++i)
						{
							elementsChanged[i].closest('tr').remove();
						}
						target.data("pasteManipulatedElements", []);
					}
				}
			},
			onaddnewinline: function(e) {
				if(e.target != this[0]) {
					return;
				}

				var tmpl = window.tmpl;
				var row = this.find(".ss-gridfield-add-inline-template:last");
				var num = this.data("add-inline-num") || 1;

				tmpl.cache[this[0].id + "ss-gridfield-add-inline-template"] = tmpl(row.html());

				this.find("tbody:first").prepend(tmpl(this[0].id + "ss-gridfield-add-inline-template", { num: num }));
				this.find("tbody:first").children(".ss-gridfield-no-items").hide();
				this.data("add-inline-num", num + 1);

				// Rebuild sort order fields
				$(".ss-gridfield-orderable tbody").rebuildSort();
			}
		});

		$(".ss-gridfield-add-new-inline").entwine({
			onclick: function() {
				this.getGridField().trigger("addnewinline");
				return false;
			}
		});

		$(".grid-field .action.ss-gridfield-delete-inline").entwine({
			onclick: function() {
				var msg = ss.i18n._t("GridFieldExtensions.CONFIRMDEL", "Are you sure you want to delete this?");

				if(confirm(msg)) {
					this.parents("tr.ss-gridfield-inline-new:first").remove();
				}

				return false;
			}
		});

		/**
		 * GridFieldAddNewMultiClass
		 */

		$(".ss-gridfield-add-new-multi-class .btn__addnewmulticlass").entwine({
			onclick: function() {
				var link = this.data("href");
				var cls  = this.parents(".ss-gridfield-add-new-multi-class").find("select").val();

				if(cls && cls.length) {
					this.getGridField().showDetailView(link.replace("{class}", encodeURI(cls)));
				}

				return false;
			}
		});

		$(".action--new__multi-class").entwine({
			onmatch: function () {
				const hrefTemplate = this.data('hrefTemplate');
				const classes = this.data('classes');
				const liHtml = Object.keys(classes).map(className => {
					const link = hrefTemplate.replace('{class}', className);
					const linkText = ss.i18n.inject(
						ss.i18n._t('GridFieldExtensions.ADD_CLASS', 'Add: <i>{classname}</i>'),
						{classname: classes[className]}
					);
					return `<li><a href="${link}">${linkText}</a></li>`;
				});

				const listElement = $(`<ul class="grid-field-inline-new--multi-class-list">${liHtml.join('')}</ul>`);
				listElement.insertBefore(this);

				this.on('click', function () {
					listElement.toggleClass('grid-field-inline-new--multi-class-list__visible');
				});
			},
		});

		$(".ss-gridfield-add-new-multi-class select").entwine({
			onadd: function() {
				this.update();
			},
			onchange: function() {
				this.update();
			},
			update: function() {
				var btn = this.parents(".ss-gridfield-add-new-multi-class").find('[data-add-multiclass]');

				if(this.val() && this.val().length) {
					btn.removeClass('disabled');
				} else {
					btn.addClass('disabled');
				}
			}
		});

		/**
		 * GridFieldEditableColumns
		 */

		$('.ss-gridfield-editable .ss-gridfield-item').entwine({
			onclick: function(e) {
				var target = $(e.target);
				// The cell of this row that holds the target. Matching against the row's own cells,
				// rather than the nearest td, keeps a table nested inside a field from being mistaken
				// for the row's cell.
				var cell = target.closest(this.children('td'));
				// Skip the default row click action when a field, label, link or button was clicked,
				// or markup inside a cell that holds an editable field. The second case covers widgets
				// that hide the field and draw their own markup next to it (toggle switches, select2,
				// date pickers). A click on the cell itself or on other row space opens the record.
				if (
					target.closest('input, select, textarea, label, a, button, .editable-column-field, .action-menu').length
					|| (cell.length && !target.is(cell) && cell.find('.editable-column-field').length)
				) {
					e.stopPropagation();
					return;
				}
				this._super(e);
			}
		});

		/**
		 * GridFieldOrderableRows
		 */

		$(".ss-gridfield-orderable tbody").entwine({
      /**
       * Update the edit form "Publish" button state to be dirty.
       *
       * We do not update the state of the "Save" button because reordering items includes
       * saving the records.
       *
       * This is fairly hackish code that duplicates the behaviour in CMSMain.Editform.js
       * for the onmatch handleronmatch handler of `.cms-edit-form.changed`, however there's
       * no clean way to do this without duplicating code since the existing jQuery change
       * tracker does not allow independently updating only the publish button.
       */
      handleUnpublishedVersionedState: function () {
        const cssSelector = [
          // CMS page edit form publish button
          '.cms-edit-form button[data-text-alternate]#Form_EditForm_action_publish',
          // GridField managed DataObject edit form publish button
          '.cms-edit-form button[data-text-alternate]#Form_ItemEditForm_action_doPublish'
        ].join(',');
        const publishButtons = $(cssSelector);
        if (!publishButtons.length) {
          return;
        }
        publishButtons.each(function() {
          const button = $(this);
          const buttonTitle = button.find('.btn__title');

          // Button needs to be updated only if it's in published state.
          // If the "standard" text data has been set and the current text
          // doesn't match it, that means the button is in its NON-published state
          // and we can skip this.
          const standardText = button.data('textStandard');
          if (standardText && buttonTitle.text() !== standardText) {
            return;
          }

          // Set alternate-text
          const alternateText = button.data('textAlternate');
          if (alternateText) {
            button.data('textStandard', buttonTitle.text());
            buttonTitle.text(alternateText);
          }

          // Extra classes can also be specified as add / remove
          const alternateClassesAdd = button.data('btnAlternateAdd');
          if (alternateClassesAdd) {
            button.addClass(alternateClassesAdd);
          }
          const alternateClassesRemove = button.data('btnAlternateRemove');
          if (alternateClassesRemove) {
            button.removeClass(alternateClassesRemove);
          }

          // Icons in the child element can also be swapped out
          const iconElement = button.find('.btn__icon');
          if (iconElement.length === 0) {
            return;
          }
          const alternateIcon = button.data('iconAlternate');
          if (alternateIcon) {
            iconElement.addClass(`font-icon-${alternateIcon}`);
          }
          const standardIcon = button.data('iconStandard');
          if (standardIcon) {
            iconElement.addClass(`font-icon-${standardIcon}`);
          }
        });
      },

      // reload the gridfield without triggering the change event
      // this is because the change has already been saved by reorder action
      reload: function (ajaxOpts, successCallback) {
        var self = this.getGridField(), form = this.closest('form'),
          focusedElName = this.find(':input:focus').attr('name'), // Save focused element for restoring after refresh
          data = form.find(':input').serializeArray();

        if (!ajaxOpts) {
          ajaxOpts = {};
        }
        if (!ajaxOpts.data) {
          ajaxOpts.data = [];
        }
        ajaxOpts.data = ajaxOpts.data.concat(data);

        // Include any GET parameters from the current URL, as the view state might depend on it.
        // For example, a list prefiltered through external search criteria might be passed to GridField.
        if (window.location.search) {
          ajaxOpts.data = window.location.search.replace(/^\?/, '') + '&' + $.param(ajaxOpts.data);
        }

        form.addClass('loading');

        $.ajax($.extend({}, {
          headers: {"X-Pjax": 'CurrentField'},
          type: "POST",
          url: this.data('url'),
          dataType: 'html',
          success: function (data) {
            // Replace the grid field with response, not the form.
            // TODO Only replaces all its children, to avoid replacing the current scope
            // of the executing method. Means that it doesn't retrigger the onmatch() on the main container.
            self.empty().append($(data).children());

            // Refocus previously focused element. Useful e.g. for finding+adding
            // multiple relationships via keyboard.
            if (focusedElName) self.find(':input[name="' + focusedElName + '"]').focus();

            // update CMS preview
            var preview = $('.cms-preview');
            if (preview.length) {
              preview.entwine('.ss.preview')._initialiseFromContent();
            }

            form.removeClass('loading');
            if (successCallback) {
              successCallback.apply(this, arguments);
            }
            self.trigger('reload', self);

            // Update publish button display state if appropriate.
            self.handleUnpublishedVersionedState();
          },
          error: function (e) {
            alert(i18n._t('Admin.ERRORINTRANSACTION'));
            form.removeClass('loading');
          }
        }, ajaxOpts));
      },
			rebuildSort: function() {
				var grid = this.getGridField();

				// Get lowest sort value in this list (respects pagination)
				var minSort = null;
				grid.getItems().each(function() {
					// get sort field
					var sortField = $(this).find('.ss-orderable-hidden-sort');
					if (sortField.length) {
						var thisSort = sortField.val();
						if (minSort === null && thisSort > 0) {
							minSort = thisSort;
						} else if (thisSort > 0) {
							minSort = Math.min(minSort, thisSort);
						}
					}
				});
				minSort = Math.max(1, minSort);

				// With the min sort found, loop through all records and re-arrange
				var sort = minSort;
				grid.getItems().each(function() {
					// get sort field
					var sortField = $(this).find('.ss-orderable-hidden-sort');
					if (sortField.length) {
						sortField.val(sort);
						sort++;
					}
				});
			},
			onadd: function() {
				var self = this;

				var helper = function(e, row) {
					return row.clone()
							  .addClass("ss-gridfield-orderhelper")
							  .width("auto")
							  .find(".col-buttons")
							  .remove()
							  .end();
				};

				var update = function(event, ui) {
					// If the item being dragged is unsaved, don't do anything
					var postback = true;
					if ((ui != undefined) && ui.item.hasClass('ss-gridfield-inline-new')) {
						postback = false;
					}

					// Rebuild all sort hidden fields
					self.rebuildSort();

					// Check if we are allowed to postback
					var grid = self.getGridField();
					if (grid.data("immediate-update") && postback)
					{
						self.reload({
							url: grid.data("url-reorder")
						});
					}
					else
					{
						// Tells the user they have unsaved changes when they
						// try and leave the page after sorting, also updates the
						// save buttons to show the user they've made a change.
						var form = $('.cms-edit-form');
						form.addClass('changed');
					}
				};

				this.sortable({
					handle: ".handle",
					helper: helper,
					opacity: .7,
					update: update
				});
			},
			onremove: function() {
				if(this.data('sortable')) {
					this.sortable("destroy");
				}
			}
		});

		$(".ss-gridfield-orderable .ss-gridfield-previouspage, .ss-gridfield-orderable .ss-gridfield-nextpage").entwine({
			onadd: function() {
				var grid = this.getGridField();

				if(this.is(":disabled")) {
					return false;
				}

				var drop = function(e, ui) {
					var page;

					if($(this).hasClass("ss-gridfield-previouspage")) {
						page = "prev";
					} else {
						page = "next";
					}

					grid.find("tbody").sortable("cancel");
					grid.reload({
						url: grid.data("url-movetopage"),
						data: [
							{ name: "move[id]", value: ui.draggable.data("id") },
							{ name: "move[page]", value: page }
						]
					});
				};

				this.droppable({
					accept: ".ss-gridfield-item",
					activeClass: "ui-droppable-active ui-state-highlight",
					disabled: this.prop("disabled"),
					drop: drop,
					tolerance: "pointer"
				});
			},
			onremove: function() {
				if(this.hasClass("ui-droppable")) this.droppable("destroy");
			}
		});

        /**
         * GridFieldConfigurablePaginator
         */
        $('.ss-gridfield-configurable-paginator .pagination-page-size-select').entwine({
            onchange: function () {
                this.parent().find('.ss-gridfield-pagesize-submit').trigger('click');
            }
        });

		/**
		 * GridFieldNestedForm
		 */
		$('.grid-field .col-listChildrenLink button').entwine({
			onclick: function(e) {
				let gridField = $(this).closest('.grid-field');
				let currState = gridField.getState();
				let toggleState = false;
				let pjaxTarget = $(this).attr('data-pjax-target');
				if ($(this).attr('aria-expanded') === 'false') {
					toggleState = true;
				}
				if (typeof currState['GridFieldNestedForm'] == 'undefined' || currState['GridFieldNestedForm'] == null) {
					currState['GridFieldNestedForm'] = {};
				}
				currState['GridFieldNestedForm'][$(this).attr('data-pjax-target')] = toggleState;
				gridField.setState('GridFieldNestedForm', currState['GridFieldNestedForm']);
				if (toggleState) {
					if (!$(this).closest('tr').next('.nested-gridfield').length) {
                        // add loading indicator until the nested gridfield is loaded
                        let colspan = gridField.find('.grid-field__title-row th').attr('colspan');
                        let loadingCell = $('<td />')
                            .addClass('ss-gridfield-item loading')
                            .attr('colspan', colspan);
                        $(this).closest('tr').after($('<tr class="nested-gridfield" />').append(loadingCell));

						let data = {};
						let stateInput = gridField.find('input.gridstate').first();
						data[stateInput.attr('name')] = JSON.stringify(currState);
						if (window.location.search) {
							let searchParams = window.location.search.replace('?', '').split('&');
							for (let i = 0; i < searchParams.length; i++) {
								let parts = searchParams[i].split('=');
								data[parts[0]] = parts[1];
							}
						}
						fetch($(this).attr('data-url'), {
							method: 'POST',
							body: JSON.stringify(data),
							headers: {
								'X-Pjax': pjaxTarget
							}
						})
							.then(response => response.json())
							.then(data => {
								if (data && data[pjaxTarget]) {
									gridField.find(`[data-pjax-fragment="${pjaxTarget}"]`).replaceWith(data[pjaxTarget]);
								}
							});
					}
					else {
						$(this).closest('tr').next('.nested-gridfield').show();
						fetch($(this).attr('data-toggle')+'1');
					}
					$(this).attr('aria-expanded', 'true');
					const icon = $(this).find('.nested-gridfield__toggle-icon');
					icon.removeClass('font-icon-right-dir');
					icon.addClass('font-icon-down-dir');
				}
				else {
					fetch($(this).attr('data-toggle')+'0');
					$(this).closest('tr').next('.nested-gridfield').hide();
					$(this).attr('aria-expanded', 'false');
					const icon = $(this).find('.nested-gridfield__toggle-icon');
					icon.removeClass('font-icon-down-dir');
					icon.addClass('font-icon-right-dir');
				}
				e.preventDefault();
				e.stopPropagation();
				return false;
			}
		});

		// move nested gridfields onto their own rows below this row, to make it look nicer
		$('.col-listChildrenLink > .grid-field.nested').entwine({
			onadd: function() {
				let nrOfColumns = $(this).closest('tr').children('td').length;
				let evenOrOdd = 'even';
				if ($(this).closest('tr').hasClass('odd')) {
					evenOrOdd = 'odd';
				}
				if ($(this).closest('.grid-field').hasClass('editable-gridfield')) {
					$(this).find('tr').removeClass('even').removeClass('odd').addClass(evenOrOdd);
				}

				if ($(this).closest('tr').next('tr.nested-gridfield').length) {
					$(this).closest('tr').next('tr.nested-gridfield').remove();
				}

				// add a new table row, with one table cell which spans all columns
				$(this).closest('tr').after('<tr class="nested-gridfield '+evenOrOdd+'"><td class="gridfield-holder" colspan="'+nrOfColumns+'"></td></tr>');
				// move this field into the newly created row
				$(this).appendTo($(this).closest('tr').next('tr').find('td').first());
				$(this).show();
				this._super();
			}
		});

		$('.ss-gridfield-orderable.has-nested > .grid-field__table > tbody, .ss-gridfield-orderable.nested > .grid-field__table > tbody').entwine({
			onadd: function() {
				this._super();
				let gridField = this.getGridField();
				if (gridField.data("url-movetoparent")) {
					let parentID = 0;
					let parentItem = gridField.closest('.nested-gridfield').prev('.ss-gridfield-item');
					if (parentItem && parentItem.length) {
						parentID = parentItem.attr('data-id');
					}
					this.sortable('option', 'connectWith', '.ss-gridfield-orderable tbody');
					this.sortable('option', 'start', function(e, ui) {
						if (ui.item.find('.col-listChildrenLink').length && ui.item.next('.ui-sortable-placeholder').next('.nested-gridfield').length) {
							if (ui.item.find('.col-listChildrenLink a').hasClass('font-icon-down-dir')) {
								ui.item.find('.col-listChildrenLink a').removeClass('font-icon-down-dir');
								ui.item.find('.col-listChildrenLink a').addClass('font-icon-right-dir');
							}
							ui.item.next('.ui-sortable-placeholder').next('.nested-gridfield').remove();
							let pjaxFragment = ui.item.find('.col-listChildrenLink a').attr('data-pjax-target');
							ui.item.find('.col-listChildrenLink').append(`<div class="nested-container" data-pjax-fragment="${pjaxFragment}" style="display:none;"></div>`);
						}
					});
					this.sortable('option', 'receive', function(e, ui) {
						preventReorderUpdate = true;
						while (updateTimeouts.length) {
							let timeout = updateTimeouts.shift();
							window.clearTimeout(timeout);
						}
						let childID = ui.item.attr('data-id');
						let parentIntoChild = $(e.target).closest('.grid-field[data-name*="-GridFieldNestedForm-'+childID+'"]').length;
						if (parentIntoChild) {
							// parent dragged into child, cancel sorting
							ui.sender.sortable("cancel");
							e.preventDefault();
							e.stopPropagation();
							window.setTimeout(function() {
								preventReorderUpdate = false;
							}, 500);
							return false;
						}
						let sortInput = ui.item.find('input.ss-orderable-hidden-sort');
						let sortName = sortInput.attr('name');
						let index = sortName.indexOf('[GridFieldEditableColumns]');
						sortInput.attr('name', gridField.attr('data-name')+sortName.substring(index));
						gridField.find('> .grid-field__table > tbody').rebuildSort();
						gridField.reload({
							url: gridField.data("url-movetoparent"),
							data: [
								{ name: "move[id]", value: childID},
								{ name: "move[parent]", value: parentID}
							]
						}, function() {
							preventReorderUpdate = false;
						});
					});
					let updateCallback = this.sortable('option', 'update');
					this.sortable('option', 'update', function(e, ui) {
						if (!preventReorderUpdate) {
							let timeout = window.setTimeout(function() {
								updateCallback(e, ui);
							}, 500);
							updateTimeouts.push(timeout);
						}
					});
				}
			}
		});
	});
})(jQuery);
