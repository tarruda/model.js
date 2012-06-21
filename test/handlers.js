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
suite('Handlers:', function() {
  var key
  , fixtures = {
    booleanType:[{p:{type: 'boolean'}}, [true,'false'], ['t',1,4.3,{}]],
    // anything can go in a string type
    stringType:[{p:{type: 'string'}},[7,'str2'], []],
    numberType:[{p:{type: 'number'}},[1.7,5,'12e-1'],['str',/abc/,{},[]]],
    integerType:[{p:{type: 'integer'}},[1,'10',4],['s',4.3,10e-5]],
    arrayType: [{p:{type: 'array'}},[[1],['a','b']],[1,'str',/abc/,{},]],
    dateType: [{p:{type: 'date'}}, [
        2332234423, //number of seconds since epoch 
        new Date(),
        'October 13, 1975 11:13:00', 
        '07/08/2000',
        '2012-06-20', 
        '2012-06-20 07:33:00'
        ], ['invalid']],
    required: [{p:{required: true}},['req1',0], [null, undefined, '']],
    minlength: [{p:{minlength: 4}}, ['abcd'], ['abc']],
    maxlength: [{p:{maxlength: 6}}, ['abcdef',[2,3,4,5,6]],['abcdefg']],
    min: [{p:{min: 11}}, [11], [10]],
    max: [{p:{max: 6}}, [6], [7]],
    email: [{p:{email: true}}, ['abc@def.com'], ['not an email']],
    url: [{p:{url: true}}, ['http://www.google.com'], ['www.google.com']],
    // from http://www.ihwy.com/labs/jquery-validate-credit-card-extension.aspx
    creditcard: [{p:{creditcard: true}}, ['370000000000002'], ['5424180832']]
  };

  for (key in fixtures) {
    (function(rulesMap, correct, incorrect) {
      var error = {}
      , model = Model.extend(rulesMap, {
        getError: function() {
          return error;
        }
      });
      for (var handlerKey in model.rulesMap.p)
        break; // The first key is the handler name
      test("'" + key + "'" + ' with correct values', function() {
        for (var i = 0; i < correct.length; i++) {
          // the 'validate' method returns null when there are
          // no errors.
          assert.strictEqual(model.validate({p:correct[i]}), null);
        };
      });
      test("'" + key + "'" + ' with incorrect values', function() {
        for (var i = 0; i < incorrect.length; i++) {
          var result = model.validate({p:incorrect[i]});
          assert.notStrictEqual(null, result);
          assert.strictEqual(result.p.length, 1);
          assert.strictEqual(result.p[0], error);
        };
      });
    })(fixtures[key][0], fixtures[key][1], fixtures[key][2]);
  }
});
