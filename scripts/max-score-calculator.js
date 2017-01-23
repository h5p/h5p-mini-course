H5P.MiniCourse.MaxScoreCalculator = (function () {
  function MaxScoreCalculator(options) {
    var self = this;

    console.log(options);

    var lookup = {};

    self.calculate = function () {
      var maxScore = 0;
      options.forEach(function (element) {
        var library = H5P.libraryFromString(element.action.library);
        var impl = lookup[library.machineName];

        if (impl) {
          maxScore += impl(element.action.params);
        }
      });

      return maxScore;
    };

    lookup['H5P.SingleChoiceSet'] = function (params) {
      return params.choices.length;
    }

    lookup['H5P.QuestionSet'] = function (options) {
      return 0;
    }

    lookup['H5P.Image'] =
    lookup['H5P.Text'] = function () {
      console.log('ZERRRRRO');
      return 0;
    };

  }

  return MaxScoreCalculator;
})();
