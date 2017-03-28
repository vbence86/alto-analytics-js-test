/* global jQuery, window */
(function($, window, document, undefined) {

  var Constants = {
    TOOLTIP_ON: 'on',
    TOOLTIP_ALL: 'All',
    EVENT_CLICK: 'click'
  };

  var Signal = (function() {

    function Signal() {
      this.events = {};
    }

    Signal.prototype.addEventListener = function(type, listener) {
      if (!this.events[type]) {
        this.events[type] = [];
      }
      this.events[type].push(listener);
      return this;
    };
    
    Signal.prototype.dispatch = function(type, event) {
      if (!this.events[type]) {
        return;
      }
      for (var i in this.events[type]) {
        if (typeof this.events[type][i] === 'function') {
          this.events[type][i](event);
        }
      }
    };

    return Signal;

  })();

  var View = {};
  View.Tooltip = function(config) {

    var selected; 
    var $elm;
    var signal = new Signal();
    signal.addEventListener(Constants.EVENT_CLICK, config.click);

    function isNotUnselectingTheLastTooltip() {
      return !selected || config.parent.getSelectedTooltips().length !== 1;
    }

    return {

      render: function() {
        $elm = $('<div><span>' + this.getLabel() + '</span></div>');
        $elm.click(this.handleClick.bind(this));
        if (config.selectedByDefault) {
          this.select();
        }
        return $elm;
      },

      handleClick: function() {
        if (config.label === Constants.TOOLTIP_ALL) {
          config.parent.unselectAll();
        } else {
          config.parent.unselectByLabel(Constants.TOOLTIP_ALL);
        }
        if (isNotUnselectingTheLastTooltip()) {
          this.toggle();
        }
        signal.dispatch(Constants.EVENT_CLICK, config.label);
      },

      toggle: function() {
        selected = !selected;
        $elm.toggleClass(Constants.TOOLTIP_ON);
      },

      select: function() {
        selected = true;
        $elm.addClass(Constants.TOOLTIP_ON);
      },

      unselect: function() {
        selected = false;
        $elm.removeClass(Constants.TOOLTIP_ON);
      },

      isSelected: function() {
        return selected;
      },

      getLabel: function() {
        return config.label;
      }

    }

  };

  View.Toggle = function() {

    var $elm;
    var tooltips = [];
    var signal = new Signal();

    return {

      render: function(model) {

        $elm = $('<section></section>');
        model.tooltips.reduce(function(container, label) {

          var tooltip = new View.Tooltip({
            parent: this,
            label: label,
            selectedByDefault: label === Constants.TOOLTIP_ALL,
            click: function() {
              signal.dispatch(Constants.EVENT_CLICK);
            } 
          });

          tooltips.push(tooltip)
          container.append(tooltip.render());
          return container;

        }.bind(this), $elm);

        return $elm;

      },

      unselectByLabel: function(label) {
        tooltips.forEach(function(tooltip) {
          if (tooltip.getLabel() === label) {
            tooltip.unselect();
          }
        });
      },

      unselectAll: function() {
        tooltips.forEach(function(tooltip) {
          tooltip.unselect();
        });
      },

      click: function(callback) {
        signal.addEventListener(Constants.EVENT_CLICK, callback);
      },

      getSelectedTooltips: function() {
        return tooltips.filter(function(tooltip) {
          return tooltip.isSelected();
        });
      }

    }

  };

  View.Content = function() {

    var $elm;

    return {

      render: function(model) {
        var label = model.content.header;
        $elm = $('<section></section>');
        $elm.append($('<div><h1>' + label + '</h1><h2></h2></div>'));
        return $elm;
      },

      update: function(text) {
        $elm.find('h2').text(text);
      },

      updateByToggle: function(toggleView) {
        var text = toggleView.getSelectedTooltips()
          .map(function(tooltip) {
            return tooltip.getLabel();
          })
          .join(', ');
        this.update(text);
      }

    }

  };

  View.App = function() {
    
    return {
      
      render: function(root, model) {

        var contentView = new View.Content();
        var toggleView = new View.Toggle();
        
        toggleView.click(function() {
          contentView.updateByToggle(toggleView);
        });

        $(root)
          .append(toggleView.render(model))
          .append(contentView.render(model));

        contentView.updateByToggle(toggleView);
      },

    };

  };

  var Orchestrator = (function() {
    
    function run(config) {
      if (!config) throw 'Invalid was given configuration to start the application!';

      var root = config.root || document.body;
      var store = config.store;

      var view = new View.App();
      view.render(root, store);
    }

    return {
      run: run
    }

  })();

  function getTooltips() {
    var fixedTooltips = ['All'];
    var dynamicTooltips = getTooltipsFromURLHash() || getDefaultTooltips();
    return fixedTooltips.concat(dynamicTooltips);
  }

  function getTooltipsFromURLHash() {
    var tooltips;
    if (window.location.hash && typeof window.location.hash.split === 'function') {
      tooltips = window.location.hash.substring(1).split('|');
      if (tooltips.length < 3) return false;
      return tooltips;
    }
    return false;
  }

  function getDefaultTooltips() {
    return ['Opt1', 'Opt2', 'Opt3'];
  }

  window.addEventListener('load', function() {

    var root = document.querySelector('#root');
    var store = {
      tooltips: getTooltips(),
      content: {
        header: 'Currently selected:'
      }
    };
    
    Orchestrator.run({
      root: root,
      store: store
    });

  });

})(jQuery, window, document);
