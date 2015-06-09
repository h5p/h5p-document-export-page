/*global Mustache */
var H5P = H5P || {};
H5P.DocumentExportPage = H5P.DocumentExportPage || {};

/**
 * Create Document module
 * @external {jQuery} $ H5P.jQuery
 */
H5P.DocumentExportPage.CreateDocument = (function ($, ExportPage) {
  /**
   * Initialize module.
   * @param {Array} inputFields Array of input strings that should be exported
   * @returns {Object} CreateDocument CreateDocument instance
   */
  function CreateDocument(params, title, inputFields, inputGoals) {
    this.$ = $(this);
    this.inputFields = inputFields;
    this.inputGoals = inputGoals;

    this.params = params;
    this.title = title;
  }

  /**
   * Attach function called by H5P framework to insert H5P content into page.
   *
   * @param {jQuery} $container The container which will be appended to.
   */
  CreateDocument.prototype.attach = function ($container) {
    var exportString = this.getExportString();
    exportString += this.createGoalsOutput();
    var exportObject = this.getExportObject();
    var $exportPage = new ExportPage(this.params.title,
      exportString,
      this.params.selectAllTextLabel,
      this.params.exportTextLabel,
      'H5P.DocumentExportPage-1.0',
      'exportTemplate.docx',
      exportObject
      );
    $exportPage.prependTo($container);
  };

  /**
   * Generate export object that will be applied to the export template
   * @returns {Object} exportObject Exportable content for filling template
   */
  CreateDocument.prototype.getExportObject = function () {
    var sortedGoalsList = [];

    this.inputGoals.inputArray.forEach(function (inputGoalPage) {
      inputGoalPage.forEach(function (inputGoal) {
        if (!sortedGoalsList[inputGoal.goalAnswer()]) {
          sortedGoalsList[inputGoal.goalAnswer()] = {label: inputGoal.getTextualAnswer(), goalArray: []};
        }
        if (inputGoal.goalText().length && inputGoal.getTextualAnswer().length) {
          var goalText = '';
          if (inputGoal.getParent() !== undefined) {
            goalText += inputGoal.getParent().goalText() + ' - ';
          }
          goalText += inputGoal.goalText();
          sortedGoalsList[inputGoal.goalAnswer()].goalArray.push(goalText);
        }
      });
    });

    var flatInputsList = [];
    this.inputFields.forEach(function (inputFieldPage) {
      if (inputFieldPage.inputArray && inputFieldPage.inputArray.length) {
        var standardPage = {title: '', inputArray: []};
        if (inputFieldPage.title) {
          standardPage.title = inputFieldPage.title;
        }
        inputFieldPage.inputArray.forEach(function (inputField) {
          standardPage.inputArray.push({description: inputField.description, value: inputField.value});
        });
        flatInputsList.push(standardPage);
      }
    });

    var exportObject = {
      title: this.title,
      goalsTitle: this.inputGoals.title,
      flatInputList: flatInputsList,
      sortedGoalsList: sortedGoalsList
    };

    return exportObject;
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
    var inputBlocksString = '<div class="textfields-output">';

    this.inputFields.forEach(function (inputPage) {
      if (inputPage.inputArray && inputPage.inputArray.length && inputPage.title.length) {
        inputBlocksString +=
          '<h2>' + inputPage.title + '</h2>';
      }
      if (inputPage.inputArray && inputPage.inputArray.length) {
        inputPage.inputArray.forEach(function (inputInstance) {
          if (inputInstance) {
            // remove paragraph tags
            inputBlocksString +=
              '<p>' +
                '<strong>' + inputInstance.description + '</strong>' +
                '\n' +
                inputInstance.value +
              '</p>';
          }
        });
      }
    });

    inputBlocksString += '</div>';

    return inputBlocksString;
  };

  /**
   * Generates html string for all goals
   * @returns {string} goalsOutputString Html string from all goals
   */
  CreateDocument.prototype.createGoalsOutput = function () {

    var goalsOutputString = '<div class="goals-output">';

    if (this.inputGoals === undefined) {
      return;
    }

    if (this.inputGoals.inputArray && this.inputGoals.inputArray.length && this.inputGoals.title.length) {
      goalsOutputString +=
        '<h2>' + this.inputGoals.title + '</h2>';
    }

    if (!this.inputGoals.inputArray) {
      return;
    }

    this.inputGoals.inputArray.forEach(function (inputGoalPage) {
      var goalOutputArray = [];

      inputGoalPage.forEach(function (inputGoalInstance) {
        if (inputGoalInstance !== undefined && inputGoalInstance.goalAnswer() > -1) {
          // Sort goals on answer
          var htmlString = '';
          if (goalOutputArray[inputGoalInstance.goalAnswer()] === undefined) {
            goalOutputArray[inputGoalInstance.goalAnswer()] = [];
            var answerStringTitle = '<p><strong>' + inputGoalInstance.getTextualAnswer() + ':</strong></p>';
            goalOutputArray[inputGoalInstance.goalAnswer()].push(answerStringTitle);
          }
          if (inputGoalInstance.getParent() !== undefined) {
            var parentGoal = inputGoalInstance.getParent().goalText();
            htmlString += '<p>' + parentGoal + ' - ' + inputGoalInstance.text + '</p>';
          } else {
            htmlString += '<p>' + inputGoalInstance.text + '</p>';
          }
          goalOutputArray[inputGoalInstance.goalAnswer()].push(htmlString);
        }
      });

      goalOutputArray.forEach(function (goalOutput) {
        goalOutput.forEach(function (goalString) {
          goalsOutputString += goalString;
        });
      });
    });

    goalsOutputString += '</div>';

    return goalsOutputString;
  };

  return CreateDocument;
}(H5P.jQuery, H5P.ExportPage));
