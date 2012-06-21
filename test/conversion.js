var assert = require('assert')
, inspect = require('util').inspect
, Model = require('../lib/model');

/**
* Test conversion done by the default registered types.
*
* Each fixture contains up to 4 items:
*
* 0 - the type
* 1 - a set of input values
* 2 - a set of expected output values
* 3 - (optional) comparer function
*
*/
suite('Conversion:', function() {
  var fixtures = {
    booleanType:['boolean',['true','false'],[true,false]],
    stringType:['string',[7,'str2'], ['7','str2']],
    numberType:['number',['1.5','7e2'],[1.5,7e2]],
    integerType:['integer',['1','10','4'],[1,10,4]],
    dateType: ['date', [
        2332234423, //number of seconds since epoch 
        'October 13, 1975 11:13:00', 
        '07/08/2000',
        '2012-06-20', 
        '2012-06-20 07:33:00'
        ], [
        new Date(2332234423),
        new Date('October 13, 1975 11:13:00'),
        new Date('07/08/2000'),
        new Date('2012-06-20'),
        new Date('2012-06-20 07:33:00')
        ], function(d1, d2){return d1.getTime() === d2.getTime();}],
  };

  for (key in fixtures) {
    var model = Model.extend({
      'a.b.c': {
        type: fixtures[key][0]
      }
    })
    , input = fixtures[key][1]
    , output = fixtures[key][2]
    , comparer = fixtures[key][3];
    (function(model, input, output, comparer) {
      test(key + ', expecting: \n' + inspect(output), function() {
        for (var i = 0; i < input.length; i++) {
          var obj ={a:{b:{c:input[i]}}}
          model.validate(obj, true);
          if (typeof comparer === "function")
            assert.ok(comparer(obj.a.b.c, output[i]));
          else
            assert.strictEqual(obj.a.b.c, output[i]);
        }
      });
    })(model, input, output, comparer);
  }
});
