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
    stringType: [{p:{type: String}}, ['str','str2'], [1,4.3,/abc/,{}]],
    numberType: [{p:{type: Number}}, [1,5,10e10], ['str',/abc/,{},[]]],
    arrayType: [{p:{type: Array}}, [[1],[5,10e10]], [1,'str',/abc/,{},]],
    objectType: [{p:{type: Object}}, [1,'as',true,[1,2],{n:'a'}],[]],
    required: [{p:{required: true}}, ['req1'], [null, undefined, '']],
    minlength: [{p:{minlength: 4}}, ['abcd'], ['abc']],
    maxlength: [{p:{maxlength: 6}}, ['abcdef'],['abcdefg']],
    min: [{p:{min: 11}}, [11], [10]],
    max: [{p:{max: 6}}, [6], [7]],
    email: [{p:{email: true}}, ['abc@def.com'], ['not an email']],
    url: [{p:{url: true}}, ['http://www.google.com'], ['www.google.com']],
    date: [{p:{date: true}}, ['October 13, 1975 11:13:00'], ['invalid']],
    dateISO: [{p:{dateISO: true}}, ['2012-06-20'], ['20/06/2012']],
    number: [{p:{number: true}}, ['23.2','232'], ['abc','2332.2.2']],
    digits: [{p:{digits: true}}, ['2463672'], ['43563d35']],
    // from http://www.ihwy.com/labs/jquery-validate-credit-card-extension.aspx
    creditcard: [{p:{creditcard: true}}, ['370000000000002'], ['5424180832']]
  };

  for (key in fixtures) {
    (function(model, correct, incorrect) {
      for (var handlerKey in model.rulesMap.p)
        break; // The first key is the handler name
      test("'" + key + "'" + ' with correct values', function() {
        for (var i = 0; i < correct.length; i++) {
          // the 'validate' method returns null when there are
          // no errors.
          assert.equal(model.validate({p:correct[i]}), null);
        };
      });
      test("'" + key + "'" + ' with incorrect values', function() {
        for (var i = 0; i < incorrect.length; i++) {
          var result = model.validate({p:incorrect[i]});
          assert.equal(1, result.p.length);
          assert.equal(result.p[0], model.messages[handlerKey]);
        };
      });
    })(Model.extend(fixtures[key][0]), fixtures[key][1], fixtures[key][2]);
  }
});
