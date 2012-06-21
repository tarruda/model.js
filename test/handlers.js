var assert = require('assert')
, Model = require('../lib/model');

/**
* This suite tests the builtin handlers validation against a single property.
*
* Each fixture contains 3 items:
*
* 0 - map used to create model definition
* 1 - a set of correct values
* 2 - a set of incorrect values
*/
suite('Handler', function() {
  var key
  , fixtures = {
    required: [{p:{required: true}}, ['req1'], [null, undefined, '']],
    minlength: [{p:{minlength: 4 }}, ['abcd'], ['abc']],
    maxlength: [{p:{maxlength: 6 }}, ['abcdef'],['abcdefg']],
    min: [{p:{min: 11 }}, [10], [11]],
    max: [{p:{max: 6 }}, [6], [7]],
  };

  for (key in fixtures) {
    var model = Model.extend(fixtures[key][0])
    , correct = fixtures[key][1]
    , incorrect = fixtures[key][2]
    , result, i
    test("'" + key + "'" + 'with incorrect values', function() {
      for (i = 0; i < incorrect.length; i++) {
        result = model.validate({p:incorrect[i]});
        assert.equal(1, result.p.length);
        assert.equal(result.p[0], model.messages[key]);
      };
    });
    test("'" + key + "'" + 'with correct values', function() {
      for (i = 0; i < correct.length; i++) {
        assert.equal(model.validate({p:correct[i]}), null);
      };
    });
  }
});
