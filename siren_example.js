/*jslint indent: 2, nomen: true, maxlen: 100 */
/*global require, applicationContext, Joi */

(function () {
  "use strict";
  var FoxxGenerator = require('foxx_generator').Generator,
    Joi = require('joi'),
    generator;

  generator = new FoxxGenerator('siren_example', {
    mediaType: 'application/vnd.siren+json',
    applicationContext: applicationContext,
  });

  /** Get the list of all ideas
   *
   * Some longer text.
   * Looooong.
   */
  generator.defineTransition('listIdeas');

  /** Show details for a particular item
   *
   * Some longer text.
   */
  generator.defineTransition('showDetail');

  /** Show related ideas of this idea
   *
   * Some longer text.
   */
  generator.defineTransition('relatedIdea', {
    to: 'many'
  });

  /** Add a related idea to this idea
   *
   * Some longer text.
   */
  generator.defineTransition('addRelatedIdea', {
    type: 'connect',
    as: 'relatedIdea',
    to: 'many'
  });

  /** Remove a related idea of this idea
   *
   * Some longer text.
   */
  generator.defineTransition('removeRelatedIdea', {
    type: 'disconnect',
    as: 'relatedIdea',
    to: 'many'
  });

  /** Add an idea
   *
   * Some longer text.
   */
  generator.defineTransition('addIdea', {
    type: 'connect',

    condition: function () {
      return true;
    },

    parameters: {
      description: Joi.string(),
      title: Joi.string()
    }
  });

  /** Add numbers
   *
   * Some longer text.
   */
  generator.defineTransition('addTwoNumbers', {
    parameters: {
      summands: Joi.array().includes(Joi.number())
    }
  });

  /** Modify the title of the entity
   *
   * Some longer text.
   */
  generator.defineTransition('changeTitle', {
    type: 'modify',

    parameters: {
      title: Joi.string()
    }
  });

  /** Get the title of an entity
   *
   * Some longer text.
   */
  generator.defineTransition('getTitle', {
    type: 'connect'
  });

  generator.addStartState({
    transitions: [
      { to: 'ideas', via: 'listIdeas' },
      { to: 'addition', via: 'addTwoNumbers' }
    ]
  });

  generator.addState('idea', {
    type: 'entity',
    parameterized: true,
    containedIn: 'ideas',

    attributes: {
      description: Joi.string().required(),
      title: Joi.string().required()
    },

    transitions: [
      { to: 'idea', via: 'relatedIdea' },
      { to: 'idea', via: 'addRelatedIdea' },
      { to: 'idea', via: 'removeRelatedIdea' },
      { to: 'idea', via: 'changeTitle' },
      { to: 'titleExtractor', via: 'getTitle' }
    ]
  });

  generator.addState('ideas', {
    type: 'repository',
    contains: 'idea',

    transitions: [
      { to: 'idea', via: 'addIdea' },
      { to: 'idea', via: 'showDetail' }
    ]
  });

  generator.addState('titleExtractor', {
    type: 'service',

    action: function (req, res) {
      var entity = req.params('entity');
      res.json({ title: entity.get('title') });
    }
  });

  generator.addState('addition', {
    type: 'service',

    action: function (req, res) {
      var addition = req.params('addition'),
        summands = addition.get('summands'),
        _ = require('underscore'),
        sum = _.reduce(summands, function (memo, num) { return memo + num; }, 0);

      res.json({
        sum: sum
      });
    },

    // verb: 'put',

    transitions: []
  });

  generator.generate();
}());
