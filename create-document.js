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
    var flatGoalsList = [];
    this.inputGoals.forEach(function (inputGoalPage) {
      inputGoalPage.forEach(function (inputGoal) {
        if (inputGoal.goalText().length && inputGoal.getTextualAnswer().length) {
          var goalText = '';
          if (inputGoal.getParent() !== undefined) {
            goalText += inputGoal.getParent().goalText() + ' - ';
          }
          goalText += inputGoal.goalText();
          flatGoalsList.push({text: goalText, answer: inputGoal.getTextualAnswer()});
        }
      });
    });

    var flatInputsList = [];
    this.inputFields.forEach(function (inputFieldPage) {
      inputFieldPage.forEach(function (inputField) {
        flatInputsList.push({description: inputField.description, value: inputField.value});
      });
    });

    var exportObject = {
      title: this.title,
      input_fields_list: flatInputsList,
      input_goals_list: flatGoalsList
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
      if (inputPage.length) {
        inputPage.forEach(function (inputInstance) {
          if (inputInstance) {
            // remove paragraph tags
            inputBlocksString +=
              '<p>' +
                inputInstance.description +
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
    var goalOutputArray = [];
    var goalsOutputString = '<div class="goals-output">';

    if (this.inputGoals === undefined) {
      return;
    }

    this.inputGoals.forEach(function (inputGoalPage) {
      inputGoalPage.forEach(function (inputGoalInstance) {
        if (inputGoalInstance !== undefined && inputGoalInstance.goalAnswer() > -1) {
          // Sort goals on answer
          var htmlString = '';
          if (goalOutputArray[inputGoalInstance.goalAnswer()] === undefined) {
            goalOutputArray[inputGoalInstance.goalAnswer()] = [];
            var answerStringTitle = '</br><p>' + inputGoalInstance.getTextualAnswer() + ':</p>';
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
    });

    goalOutputArray.forEach(function (goalOutput) {
      goalOutput.forEach(function (goalString) {
        goalsOutputString += goalString;
      });
    });

    goalsOutputString += '</div>';

    return goalsOutputString;
  };

  return CreateDocument;
}(H5P.jQuery, H5P.ExportPage));
