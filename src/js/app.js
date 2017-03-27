/* global jQuery, window */
(function($, window, document, undefined) {

  var View = (function() {
    
    var singleton;

    function instance(root) {

      function createSection() {
        return $('<section></section>');
      }

      function createContent() {
        var label = 'Currently selected:';
        return $( '<div><h1>' + label + '</h1><h2></h2></div>' );
      }

      function createTooltip(label) {
        return $( '<div><span>' + label + '</span></div>' );
      }

      return {
        
        render: function(model) {

          var tooltipSection;
          var contentSection;

          if (!model) throw 'Invalid data model object has been passed!';

          tooltipSection = createSection().append(createTooltip());
          contentSection = createSection().append(createContent());

          model.tooltips.reduce(function(container, tooltip) {
            var tooltipElement = createTooltip(tooltip);
            $(container).append(tooltipElement);
            return container;
          }, tooltipSection);

          $(root)
            .append(tooltipSection)
            .append(contentSection);
        },

      };

    };

    return {

      create: function(root) {
        if (!singleton) {
          singleton = instance(root); 
        }
        return singleton;
      }

    };

  });


  var Orchestrator = (function(View) {
    
    var DEFAULT_TOOLTIPS = ['Opt1', 'Opt2', 'Opt3'];
    var store = {};

    function init(root) {
      initStore();
      initView(root);
    }

    function initView(root) {
      var view = View.create(root);
      view.render(store);
    }

    function initStore() {
      var options = getOptionsFromURLHash() || getDefaultOptions();
      store = {
        tooltips: options
      };
    }

    function getOptionsFromURLHash() {
      if (window.location.hash && typeof window.location.hash.split === 'function') {
        return window.location.hash.split('|');
      }
      return false;
    }

    function getDefaultOptions() {
      return DEFAULT_TOOLTIPS;
    }

    return {
      init: init,
    }

  })(View);

  window.addEventListener('load', function() {

    var root = document.querySelector('#root');
    Orchestrator.init(root);

  });

})(jQuery, window, document);
