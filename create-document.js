var H5P = H5P || {};
H5P.DocumentExportPage = H5P.DocumentExportPage || {};

/**
 * Create Document module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage.CreateDocument = (function ($) {
  // CSS Classes:
  var MAIN_CONTAINER = 'h5p-create-document';
  var EXPORTABLE_AREA_CONTAINER = 'exportable-area';
  var FOOTER_CONTAINER = 'exportable-footer';

  // CSS subclasses:
  var COPY_BUTTON = 'exportable-copy-button';
  var EXPORT_BUTTON = 'exportable-export-button';

  /**
   * Initialize module.
   * @param {Array} inputFields Array of input strings that should be exported
   * @returns {Object} CreateDocument CreateDocument instance
   */
  function CreateDocument(params, title, inputFields) {
    this.inputFields = inputFields;

    this.params = params;
    this.title = title;

    this.exportedDocumentTemplate =
      '<p>{{{heading}}}</p>';

    this.inputBlockTemplate =
      '<p>{{{description}}}</p>';
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  CreateDocument.prototype.attach = function ($container) {
    var self = this;
    this.$inner = $container.addClass(MAIN_CONTAINER);

    self.$exportableArea = $('<div>', {
      'class': EXPORTABLE_AREA_CONTAINER
    }).appendTo(self.$inner);

    var $footer = $('<div>', {
      'class': FOOTER_CONTAINER
    }).appendTo(self.$inner);

    $('<button>', {
      'text': self.params.selectTextButtonText,
      'class': COPY_BUTTON
    }).click(function () {
      self.selectText(self.$exportableArea);
    }).appendTo($footer);

    $('<button>', {
      'text': self.params.exportTextButtonText,
      'class': EXPORT_BUTTON
    }).click(function () {
      self.saveText(self.$exportableArea.html());
    }).appendTo($footer);

    this.updatePage();
  };

  CreateDocument.prototype.selectText = function ($container) {
    var doc = document;
    var text = $container.get(0);
    var range;
    var selection;

    if (doc.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  CreateDocument.prototype.updatePage = function () {
    var self = this;
    self.$exportableArea.children().remove();
    self.$exportableArea.append(Mustache.render(self.exportedDocumentTemplate, {title: self.title}));
    self.createInputBlocks();
  };

  CreateDocument.prototype.createInputBlocks = function () {
    var self = this;

    this.inputFields.forEach(function (inputPage) {
      if (inputPage.length) {
        inputPage.forEach(function (inputInstance) {
          self.$exportableArea.append(Mustache.render(self.inputBlockTemplate, {description: inputInstance}))
        });
      }
    });
  };

  CreateDocument.prototype.saveText = function (html) {
    // Save it as a file:
    var blob = new Blob([this.createDocContent(html)], {
      type: "application/msword;charset=utf-8"
    });
    saveAs(blob, 'exported-text.doc');
  };

  CreateDocument.prototype.createDocContent = function (html) {
    var html = html;

    // Create HTML:
    // me + ta and other hacks to avoid that new relic injects script...
    html = '<ht' + 'ml><he' + 'ad><me' + 'ta charset="UTF-8"></me' + 'ta></he' + 'ad><bo' + 'dy><p><a href="' + document.URL + '">' + document.URL + '</a></p>' + html + '</bo' + 'dy></ht' + 'ml>';

    return html;
  };

  return CreateDocument;
})(H5P.jQuery);
