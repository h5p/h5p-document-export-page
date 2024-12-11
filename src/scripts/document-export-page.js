/**
 * Document Export Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage = (function ($, EventDispatcher) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-document-export-page h5p-theme';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} DocumentExportPage DocumentExportPage instance
   */
  function DocumentExportPage(params, id, extras) {
    EventDispatcher.call(this);
    this.id = id;
    this.extras = extras;

    this.inputArray = [];
    this.exportTitle = '';
    this.requiredInputsAreFilled = true;

    // Set default behavior.
    this.params = $.extend({
      title: this.getTitle(),
      a11yFriendlyTitle: this.getTitle(false),
      description: '',
      createDocumentLabel: 'Proceed',
      submitTextLabel: 'Submit',
      submitSuccessTextLabel: 'Your report was submitted successfully!',
      selectAllTextLabel: 'Select',
      exportTextLabel: 'Export',
      requiresInputErrorMessage: 'The following pages contain required input fields that need to be filled: @pages',
      helpTextLabel: 'Read more',
      helpText: 'Help text'
    }, params);
  }

  DocumentExportPage.prototype = Object.create(EventDispatcher.prototype);
  DocumentExportPage.prototype.constructor = DocumentExportPage;

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  DocumentExportPage.prototype.attach = function ($container) {
    var self = this;

    self.$wrapper = $container;

    self.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    });

    self.$pageTitle = $('<div>', {
      'class': 'page-header',
      role: 'heading',
      tabindex: -1,
      'aria-label': self.params.a11yFriendlyTitle,
      append: $('<div>', {
        class: 'page-title',
        html: self.params.title
      }),
      appendTo: self.$inner
    });

    if (self.params.helpText !== undefined && self.params.helpText.length !== 0) {
      self.$helpButton = $('<button>', {
        'class': 'page-help-text',
        'aria-label': self.params.helpTextLabel,
        click: function () {
          self.trigger('open-help-dialog', {
            title: self.params.title,
            helpText: self.params.helpText
          });
        },
        appendTo: self.$pageTitle
      });
      H5P.Tooltip(self.$helpButton[0]);
    }

    $('<div>', {
      class: 'export-description',
      html: self.params.description,
      appendTo: self.$inner
    });

    $('<div>', {
      class: 'export-error-message',
      role: 'alert',
      'aria-live': 'assertive',
      html: self.params.requiresInputErrorMessage,
      appendTo: self.$inner
    });

    self.$exportDocumentButton = $('<div>', {
      class: 'joubel-simple-rounded-button export-document-button h5p-theme-primary-cta',
      role: 'button',
      tabindex: '0',
      title: self.params.createDocumentLabel,
      append: $('<span>', {
        class: 'joubel-simple-rounded-button-text',
        html: self.params.createDocumentLabel
      })
    });

    $('<div>', {
      class: 'export-footer',
      append: self.$exportDocumentButton,
      appendTo: self.$inner
    });

    this.$inner.prependTo($container);

    self.initDocumentExportButton();
  };

  /**
   * Setup button for creating a document from stored input array
   */
  DocumentExportPage.prototype.initDocumentExportButton = function () {
    var self = this;
    H5P.DocumentationTool.handleButtonClick(self.$exportDocumentButton, function () {
      // Check if all required input fields are filled
      if (self.isRequiredInputsFilled()) {
        var exportDocument = new H5P.DocumentExportPage.CreateDocument(self.params, self.exportTitle, self.submitEnabled, self.inputArray, self.inputGoals);
        exportDocument.attach(self.$wrapper.parent().parent());
        exportDocument.on('export-page-closed', function () {
          self.trigger('export-page-closed');

          // Set focus back on button
          self.$exportDocumentButton.focus();
          self.parent.$mainContent.removeAttr("aria-live");
        });
        self.parent.$mainContent.attr("aria-live", "polite");
        self.trigger('export-page-opened');

        exportDocument.on('submitted', function (event) {
          self.trigger('submitted', event.data);
        });
      }
    });
  };

  /**
   * Get page title
   * @param {boolean} turncatedTitle turncate title flag
   * @returns {String} page title
   */
  DocumentExportPage.prototype.getTitle = function (turncatedTitle = true) {
    const pageTitle = (this.extras && this.extras.metadata && this.extras.metadata.title) ? this.extras.metadata.title : 'Document Export';
    return turncatedTitle ? H5P.createTitle(pageTitle) : pageTitle;
  };

  DocumentExportPage.prototype.setExportTitle = function (title) {
    this.exportTitle = title;
    return this;
  };

  DocumentExportPage.prototype.setSumbitEnabled = function (submitEnabled) {
    this.submitEnabled = submitEnabled;
    return this;
  };

  DocumentExportPage.prototype.updateOutputFields = function (inputs) {
    this.inputArray = inputs;
    return this;
  };

  DocumentExportPage.prototype.updateExportableGoals = function (newGoals) {
    this.inputGoals = newGoals;
    return this;
  };

  DocumentExportPage.prototype.isRequiredInputsFilled = function () {
    return this.requiredInputsAreFilled;
  };

  /**
   * Update the message for required fields.
   * @param {object[]} pageTitles Page titles.
   */
  DocumentExportPage.prototype.updateRequiredInputsFilled = function (pageTitles) {
    const requiredInputsAreFilled = pageTitles && pageTitles.length === 0;
    this.$inner.toggleClass('required-inputs-not-filled', !requiredInputsAreFilled);

    // Update message text
    let message = this.params.requiresInputErrorMessage;
    if (!pageTitles || pageTitles.length === 0) {
      message = message.replace('@pages', '-');
    }
    else {
      let list = '<ul>';
      pageTitles.forEach(function (title) {
        list += '<li>' + title + '</li>';
      });
      list += '</ul>';
      message = message.replace('@pages', list);
    }

    this.$inner.find('.export-error-message').html(message);
    this.requiredInputsAreFilled = requiredInputsAreFilled;

    return this;
  };

  /**
   * Sets focus on the page
   */
  DocumentExportPage.prototype.focus = function () {
    this.$pageTitle.focus();
  };

  return DocumentExportPage;
}(H5P.jQuery, H5P.EventDispatcher));

export default H5P.DocumentExportPage;