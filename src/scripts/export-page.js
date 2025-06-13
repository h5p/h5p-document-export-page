import { saveAs } from "file-saver";
import {HeadingLevel, Paragraph, Document, TextRun, Packer} from "docx";

/**
 * Class responsible for creating an export page
 */
H5P.DocumentExportPage.ExportPage = (function ($, EventDispatcher) {

  function ExportPage(header, $body, enableSubmit, submitTextLabel, submitSuccessTextLabel, selectAllTextLabel, exportTextLabel, templateContent) {
    EventDispatcher.call(this);
    var self = this;

    self.templateContent = templateContent;
    self.header = header;

    // Standard labels:
    var standardSelectAllTextLabel = selectAllTextLabel || 'Select';
    var standardExportTextLabel = exportTextLabel || 'Export';
    var standardSubmitTextLabel = submitTextLabel || 'Submit';
    var announceExportPageTextLabel = 'You are on the export page';
    self.standardSubmitSuccessTextLabel = submitSuccessTextLabel || 'Your report was submitted successfully!';

    var exportPageTemplate =
      '<div class="joubel-create-document" role="dialog" title="' + announceExportPageTextLabel + '">' +
      ' <div class="joubel-exportable-header">' +
      '   <div class="joubel-exportable-header-inner" role="toolbar">' +
      '     <div class="joubel-exportable-header-text" tabindex="-1">' +
      '       <span>' + header + '</span>' +
      '     </div>' +
      '     <div class="header-buttons"><button class="joubel-export-page-close" title="Exit" aria-label="Exit" tabindex="3"></button>' +
      '     <button class="joubel-exportable-copy-button" title ="' + standardSelectAllTextLabel + '" tabindex="2">' +
      '       <span>' + standardSelectAllTextLabel + '</span>' +
      '     </button>' +
      '     <button class="joubel-exportable-export-button" title="' + standardExportTextLabel + '" tabindex="1">' +
      '       <span>' + standardExportTextLabel + '</span>' +
      '     </button>' +
            (enableSubmit ?
              '     <button class="joubel-exportable-submit-button h5p-theme-show-results" title="' + standardSubmitTextLabel + '" tabindex="1">' +
      '       <span>' + standardSubmitTextLabel + '</span>' +
      '     </button></div>'
              : '') +
      '   </div>' +
      ' </div>' +
      ' <div class="joubel-exportable-body">' +
      '   <div class="joubel-exportable-area" tabindex="0"></div>' +
      ' </div>' +
      '</div>';

    this.$inner = $(exportPageTemplate);
    this.$exportableBody = this.$inner.find('.joubel-exportable-body');
    this.$submitButton = this.$inner.find('.joubel-exportable-submit-button');
    this.$exportButton = this.$inner.find('.joubel-exportable-export-button');
    this.$exportCloseButton = this.$inner.find('.joubel-export-page-close');
    this.$exportCopyButton = this.$inner.find('.joubel-exportable-copy-button');

    // Replace newlines with html line breaks
    var $bodyReplacedLineBreaks = $body.replace(/(?:\r\n|\r|\n)/g, '<br />');

    // Append body to exportable area
    self.$exportableArea = $('.joubel-exportable-area', self.$inner).append($bodyReplacedLineBreaks);

    self.initExitExportPageButton();
    self.initSubmitButton();
    self.initExportButton();
    self.initSelectAllTextButton();

    // Initialize resize listener for responsive design
    this.initResizeFunctionality();
  }

  // Setting up inheritance
  ExportPage.prototype = Object.create(EventDispatcher.prototype);
  ExportPage.prototype.constructor = ExportPage;

  /**
   * Return reference to main DOM element
   * @return {H5P.jQuery}
   */
  ExportPage.prototype.getElement = function () {
    return this.$inner;
  };

  /**
   * Initialize exit export page button
   */
   ExportPage.prototype.initExitExportPageButton = function () {
    var self = this;

    self.$exportCloseButton.on('click', function () {
      // Remove export page.
      self.$inner.remove();
      self.trigger('closed');
    });
  };

  /**
   * Sets focus on page
   */
  ExportPage.prototype.focus = function () {
    this.$submitButton ? this.$submitButton.focus() : this.$exportButton.focus();
  };

  /**
   * Initialize Submit button interactions
   */
  ExportPage.prototype.initSubmitButton = function () {
    var self = this;
    // Submit document button event
    self.$submitButton.on('click', function () {

      self.$submitButton.attr('disabled','disabled');
      self.$submitButton.addClass('joubel-exportable-button-disabled');

      // Trigger a submit event so the report can be saved via xAPI at the
      // documentation tool level
      self.trigger('submitted');

      self.$successDiv = $('<div/>', {
        text: self.standardSubmitSuccessTextLabel,
        'class': 'joubel-exportable-success-message'
      });

      self.$exportableBody.prepend(self.$successDiv);

      self.$exportableBody.addClass('joubel-has-success');
    });
  };

  /**
   * Initialize export button interactions
   */
  ExportPage.prototype.initExportButton = function () {
    var self = this;
    // Export document button event
    self.$exportButton.on('click', function () {
      self.saveText();
    });
  };


  /**
   * Initialize select all text button interactions
   */
  ExportPage.prototype.initSelectAllTextButton = function () {
    var self = this;
    // Select all text button event
    self.$exportCopyButton.on('click', function () {
      self.selectText(self.$exportableArea);
    });
  };

  /**
   * Initializes listener for resize and performs initial resize when rendered
   */
  ExportPage.prototype.initResizeFunctionality = function () {
    var self = this;

    // Listen for window resize
    $(window).resize(function () {
      self.resize();
    });

    // Initialize responsive view when view is rendered
    setTimeout(function () {
      self.resize();
    }, 0);
  };

  /**
   * Select all text in container
   * @param {jQuery} $container Container containing selected text
   */
  ExportPage.prototype.selectText = function ($container) {
    var doc = document;
    var text = $container.get(0);
    var range;
    var selection;

    if (doc.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToElementText(text);
      range.select();
    }
    else if (window.getSelection) {
      selection = window.getSelection();
      range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  /**
   * Save html string to file
   * @param {string} html html string
   */
  ExportPage.prototype.saveText = function () {
    const page = this.generateDocxObject();

    // Generate document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: page
        }
      ]
    });

    Packer.toBlob(doc).then((blob) => {
      // saveAs from FileSaver will download the file
      saveAs(blob, "exported-text.docx");
    });
  };

  /**
   * Create doc content from html
   * @param {string} html Html content
   * @returns {string} html embedded content
   */
  ExportPage.prototype.createDocContent = function (html) {
    // Create HTML:
    // me + ta and other hacks to avoid that new relic injects script...
    return '<ht' + 'ml><he' + 'ad><me' + 'ta charset="UTF-8"></me' + 'ta></he' + 'ad><bo' + 'dy>' + html + '</bo' + 'dy></ht' + 'ml>';
  };

  /**
   * Responsive resize function
   */
  ExportPage.prototype.resize = function () {
    var self = this;
    var $innerTmp = self.$inner.clone()
      .css('position', 'absolute')
      .removeClass('responsive')
      .removeClass('no-title')
      .appendTo(self.$inner.parent());

    // Determine if view should be responsive
    var $headerInner = $('.joubel-exportable-header-inner', $innerTmp);
    var leftMargin = parseInt($('.joubel-exportable-header-text', $headerInner).css('font-size'), 10);
    var rightMargin = parseInt($('.joubel-export-page-close', $headerInner).css('font-size'), 10);

    var dynamicRemoveLabelsThreshold = this.calculateHeaderThreshold($innerTmp, (leftMargin + rightMargin));
    var headerWidth = $headerInner.width();

    if (headerWidth <= dynamicRemoveLabelsThreshold) {
      self.$inner.addClass('responsive');
      $innerTmp.addClass('responsive');

      if (self.$successDiv) {
        self.$successDiv.addClass('joubel-narrow-view');
      }
    }
    else {
      self.$inner.removeClass('responsive');
      $innerTmp.remove();

      if (self.$successDiv) {
        self.$successDiv.removeClass('joubel-narrow-view');
      }
      return;
    }


    // Determine if view should have no title
    headerWidth = $headerInner.width();
    var dynamicRemoveTitleThreshold = this.calculateHeaderThreshold($innerTmp, (leftMargin + rightMargin));

    if (headerWidth <= dynamicRemoveTitleThreshold) {
      self.$inner.addClass('no-title');
    }
    else {
      self.$inner.removeClass('no-title');
    }

    $innerTmp.remove();
  };

  /**
   * Calculates width of header elements
   */
  ExportPage.prototype.calculateHeaderThreshold = function ($container, margin) {
    var staticPadding = 1;

    if (margin === undefined || isNaN(margin)) {
      margin = 0;
    }

    // Calculate elements width
    var $submitButtonTmp = $('.joubel-exportable-submit-button', $container);
    var $exportButtonTmp = $('.joubel-exportable-export-button', $container);
    var $selectTextButtonTmp = $('.joubel-exportable-copy-button', $container);
    var $removeDialogButtonTmp = $('.joubel-export-page-close', $container);
    var $titleTmp = $('.joubel-exportable-header-text', $container);

    let buttonWidth = $submitButtonTmp.length ? $submitButtonTmp.outerWidth() : 0;
    buttonWidth += $selectTextButtonTmp.length ? $selectTextButtonTmp.outerWidth() : 0;
    buttonWidth += $exportButtonTmp.length ? $exportButtonTmp.outerWidth() : 0;

    var dynamicThreshold = buttonWidth +
      $removeDialogButtonTmp.outerWidth() +
      $titleTmp.outerWidth();

    return dynamicThreshold + margin + staticPadding;
  };

  /**
   * Create Docx paragraphs based on the data
   * @returns {Array} page
   */
  ExportPage.prototype.generateDocxObject = function () {
    const self = this;
    let page = [], index = 0;

    // Add title to the document
    page[index] = new Paragraph({
      text: self.header,
      heading: HeadingLevel.HEADING_1
    });
    index++;
    // create docx paragraphs if we have standard page data
    if (self.templateContent.flatInputList) {
      self.templateContent.flatInputList.forEach(function (content) {
        page[index] = new Paragraph({
          text: content.title,
          heading: HeadingLevel.HEADING_1
        });
        index++;
        if (content.inputArray) {
          content.inputArray.forEach(function (field) {
            const fieldDescription = htmlToText(field.description).split("\n").map(line=>new TextRun({break: 1,text: line.replace(/(\r\t|\t|\r)/gm, ""), bold: true, size: 28}));
            const fieldValue = field.value.split("\n").map(line=>new TextRun({break: 1,text: line.replace(/(\r\t|\t|\r)/gm, ""), size: 28}));
            const standardPage = [...fieldDescription, ...fieldValue]
            page[index] = new Paragraph({
              children: standardPage
            });
            index++;
          });
        }
      });
    }

    if (self.templateContent.goalsTitle) {
      page[index] = new Paragraph({
        text: self.templateContent.goalsTitle,
        heading: HeadingLevel.HEADING_1
      });
      index++;
    }
    // create docx paragraphs if we have goal list
    if (self.templateContent.sortedGoalsList) {
      self.templateContent.sortedGoalsList.forEach(function (content) {
        if (content.goalArray.length > 0) {
          page[index] = new Paragraph({
            children: [new TextRun({break: 1,text: content.label+":", size: 28, bold: 1})]
          });
          index++;
          content.goalArray.forEach(function (goal) {
            page[index] = new Paragraph({
              children: [new TextRun({text: goal.text, size: 28})],
              bullet: {
                level: 0
              }
            });
            index++;
          });
        }
      });
    }
    return page;
  };

  /**
   * Strips a string of html tags, but keeps the expected whitespace etc.
   * 
   * @param {String} html String with html tags
   * @returns {String} string without html tags
   */
  function htmlToText(html){
    let newString = html;

    //keep html brakes and tabs
    newString = newString.replace(/<\/td>/g, '\t');
    newString = newString.replace(/<\/table>/g, '\n');
    newString = newString.replace(/<\/tr>/g, '\n');
    newString = newString.replace(/<\/p><p>/g, '\n\n');
    newString = newString.replace(/<\/p>/g, '\n\n');
    newString = newString.replace(/<p>/g, '\n');
    newString = newString.replace(/<\/div>/g, '\n');
    newString = newString.replace(/<\/h.?>/g, '\n\n');
    newString = newString.replace(/<ol>|<ul>/g, '\n');
    newString = newString.replace(/<\/li>/g, '\n');
    newString = newString.replace(/<br>/g, '\n');
    newString = newString.replace(/<br( )*\/>/g, '\n');

    //parse html into text
    var dom = (new DOMParser()).parseFromString('<!doctype html><body>' + newString, 'text/html');

    // Strip leading and trailing newlines
    newString = dom.body.textContent.replace(/^\s*|\s*$/g, '');

    return newString;
  }

  return ExportPage;
}(H5P.jQuery, H5P.EventDispatcher));
