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

  generator.defineTransition('listIdeas', {
    description: 'Get the list of all ideas'
  });

  generator.defineTransition('showDetail', {
    description: 'Show details for a particular item'
  });

  generator.defineTransition('relatedIdea', {
    description: 'Show related ideas of this idea',
    to: 'many'
  });

  generator.defineTransition('addRelatedIdea', {
    semantics: 'link',
    as: 'relatedIdea',
    description: 'Add a related idea to this idea',
    to: 'many'
  });

  generator.defineTransition('removeRelatedIdea', {
    semantics: 'unlink',
    as: 'relatedIdea',
    description: 'Remove a related idea of this idea',
    to: 'many'
  });

  generator.defineTransition('addIdea', {
    semantics: 'link',
    description: 'Add an idea',

    condition: function () {
      return true;
    },

    parameters: {
      description: Joi.string(),
      title: Joi.string()
    }
  });

  generator.defineTransition('addTwoNumbers', {
    description: 'Add numbers',

    parameters: {
      summands: Joi.array().includes(Joi.number())
    }
  });

  generator.defineTransition('changeTitle', {
    semantics: 'modify',
    description: 'Modify the title of the entity',

    parameters: {
      title: Joi.string()
    }
  });

  generator.defineTransition('getTitle', {
    semantics: 'link',
    description: 'Get the title of an entity'
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

    attributes: {
      description: { type: 'string', required: true },
      title: { type: 'string', required: true }
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
