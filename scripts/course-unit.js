H5P.MiniCourse.CourseUnit = (function ($, EventDispatcher) {

  function CourseUnit(options, contentId, index, $popupContainer) {
    var self = this;
    EventDispatcher.call(self);

    var instance;
    var enabled = false;

    var $unitPopup = $('<div>', {
      'class': 'h5p-mini-course-unit-popup'
    });

    var libraryMeta = H5P.libraryFromString(options.action.library);

    console.log(options);

    var $unitPanel = $('<div>', {
      'class': 'h5p-mini-course-unit-panel locked'
    });

    var $unitPanelInner = $('<div>', {
      'class': 'h5p-mini-course-unit-panel-inner h5p-font-icon-enabled ' + libraryMeta.machineName.toLowerCase().replace('.', '-')
    }).appendTo($unitPanel);

    var $unitHeader = $('<div>', {
      'class': 'h5p-mini-course-unit-header',
      html: options.header
    }).appendTo($unitPanelInner);

    var $unitIntro = $('<div>', {
      'class': 'h5p-mini-course-unit-intro',
      html: options.intro
    }).appendTo($unitPanelInner);

    var $beginButton = H5P.JoubelUI.createButton({
      'class': 'h5p-mini-course-unit-begin',
      html:  'Locked', // TODO - translate
      disabled: 'disabled',
      click: function () {
        self.show();
      }
    }).appendTo($unitPanelInner);

    self.appendTo = function ($container) {
      $unitPanel.appendTo($container);
    };

    self.hasScore = function () {
      return (options.maxScore !== 0);
    };

    self.getMaxScore = function () {
      return options.maxScore ? options.maxScore : 0;
    };

    self.enable = function () {
      enabled = true;
      $unitPanel.removeClass('locked').addClass('enabled');
      $beginButton.html('Begin').removeAttr('disabled'); // TODO - translate

      setTimeout(function () {
        $beginButton.focus();
      },1);
    };

    self.show = function () {
      if (!enabled) {
        return;
      }

      if (instance === undefined) {
        instance = H5P.newRunnable(options.action, contentId);

        instance.on('xAPI', function (event) {
          var stmt = event.data.statement;
          var isParent = (stmt.context.contextActivities.parent === undefined);

          if (isParent && stmt.result !== undefined && stmt.result.completion === true) {
            setTimeout(function () {
              self.hide(event.getScore());
            }, 2000);
          }
        });

        var $h5pContent = $('<div>', {
          'class': 'h5p-sub-content'
        }).appendTo($unitPopup);

        instance.attach($h5pContent);
        $unitPopup.prepend('<div class="header">' + options.header + '<a href="javascript:void(0)" class="quit-lesson">Quit lesson</a></div>');

        $unitPopup.find('.quit-lesson').click(function () {
          if (self.hasScore()) {
            var confirmDialog = new H5P.ConfirmationDialog({headerText: 'Are you sure?', dialogText: 'If quiting this lesson, no score will be given.'});
            confirmDialog.appendTo($unitPopup.get(0));
            confirmDialog.on('confirmed', function () {
              self.hide();
            });
            confirmDialog.show();
          }
          else {
            self.hide();
          }
        });
      }

      // Attach popup to body:
      //$('body').append($unitPopupBg);
      //$popupContainer.append($unitPopupBg);

      // Hide if ESC is pressed
      $('body').on('keyup.h5p-escape', function (event) {
        if (event.keyCode == 27) {
          $unitPopup.find('.quit-lesson').click();
        }
      });

      setTimeout(function () {
        $unitPopup.addClass('visible');
      }, 200);

      self.trigger('open-popup', {
        popup: $unitPopup,
        unit: self
      });

      instance.trigger('resize');
    };

    self.setWidth = function (width) {
      $unitPanel.css({width: width + '%'});
    };

    self.hide = function (score) {
      $('body').off('keyup.h5p-escape');

      self.trigger('closing-popup');
      $unitPopup.removeClass('visible');

      setTimeout(function () {
        $unitPopup.detach();
        self.trigger('finished', {index: index, score: score});
      }, 1000);
    };

    self.done = function () {
      $beginButton.html('Done').attr('disabled', 'disabled');
      $unitPanel.removeClass('enabled').addClass('done');
    };

    self.reset = function () {
      if (instance && instance.resetTask) {
        instance.resetTask();
      }
      $beginButton.html('Locked');
      $unitPanel.removeClass('done').addClass('locked');
    };
  }

  // Inheritance
  CourseUnit.prototype = Object.create(EventDispatcher.prototype);
  CourseUnit.prototype.constructor = CourseUnit;

  return CourseUnit;

})(H5P.jQuery, H5P.EventDispatcher);
