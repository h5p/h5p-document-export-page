/*global Mustache */
var H5P = H5P || {};
H5P.DocumentExportPage = H5P.DocumentExportPage || {};

/**
 * Create Document module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage.CreateDocument = (function ($, JoubelUI) {
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
    var exportString = this.getExportString();
    var $joubelExportPage = JoubelUI.createExportPage(this.params.title,
      exportString,
      this.params.selectAllTextLabel,
      this.params.exportTextLabel);
    $joubelExportPage.prependTo($container);
  };

  /**
   * Generate complete html string for export
   * @returns {string} exportString Html string for export
   */
  CreateDocument.prototype.getExportString = function () {
    var self = this;
    var exportString = self.getInputBlocksString();

    return exportString;
  };

  /**
   * Generates html string for input fields
   * @returns {string} inputBlocksString Html string from input fields
   */
  CreateDocument.prototype.getInputBlocksString = function () {
    var self = this;
    var inputBlocksString = '';

    this.inputFields.forEach(function (inputPage) {
      if (inputPage.length) {
        inputPage.forEach(function (inputInstance) {
          inputBlocksString += Mustache.render(self.inputBlockTemplate, {description: inputInstance});
        });
      }
    });

    return inputBlocksString;
  };

  return CreateDocument;
}(H5P.jQuery, H5P.JoubelUI));
