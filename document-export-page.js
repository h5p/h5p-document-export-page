var H5P = H5P || {};

/**
 * Document Export Page module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage = (function ($, Mustache) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-document-export-page';

  /**
   * Initialize module.
   * @param {Object} params Behavior settings
   * @param {Number} id Content identification
   * @returns {Object} DocumentExportPage DocumentExportPage instance
   */
  function DocumentExportPage(params, id) {
    this.$ = $(this);
    this.id = id;

    this.inputArray = [];
    this.exportTitle = '';


    // Set default behavior.
    this.params = $.extend({}, {
      title: 'Document export',
      description: '',
      createDocumentButtonText: 'Create document',
      selectTextButtonText: 'Select all text',
      exportTextButtonText: 'Export text',
      helpTextLabel: 'Read more',
      helpText: 'Help text'
    }, params);
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  DocumentExportPage.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $('<div>', {
      'class': MAIN_CONTAINER
    }).appendTo($container);

    this.exportTitle = this.params.title;

    var documentExportTemplate =
        '<div class="export-header">' +
        ' <div class="export-title">{{title}}</div>' +
        ' <div role="button" tabindex="1" class="export-help-text">{{helpTextLabel}}</div>' +
        '</div>' +
        '<div class="export-description">{{description}}</div>' +
        '<div class="export-footer">' +
        ' <button class="export-document-button" tabindex="1">{{createDocumentButtonText}}</button>' +
        '</div>';

    /*global Mustache */
    self.$inner.append(Mustache.render(documentExportTemplate, self.params));

    self.createHelpTextButton();

    $('.export-document-button', self.$inner).click(function () {
      self.$inner.children().remove();
      var exportDocument = new H5P.DocumentExportPage.CreateDocument(self.params, self.exportTitle, self.inputArray);
      exportDocument.attach(self.$inner);
    });
  };

  /**
   * Create help text functionality for reading more about the task
   */
  DocumentExportPage.prototype.createHelpTextButton = function () {
    var self = this;

    if (this.params.helpText !== undefined && this.params.helpText.length) {
      $('.export-help-text', this.$inner).click(function () {
        var $helpTextDialog = new H5P.JoubelUI.createHelpTextDialog(self.params.title, self.params.helpText);
        $helpTextDialog.appendTo(self.$inner.parent().parent().parent());
      });
    } else {
      $('.export-help-text', this.$inner).remove();
    }
  };

  DocumentExportPage.prototype.getTitle = function () {
    return this.exportTitle;
  };

  DocumentExportPage.prototype.setTitle = function (title) {
    this.exportTitle = title;
    return this;
  };

  DocumentExportPage.prototype.updateOutputFields = function (inputs) {
    this.inputArray = inputs;
    return this;
  };

  return DocumentExportPage;
}(H5P.jQuery, Mustache));
