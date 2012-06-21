var assert = require('assert')
, Model = require('../lib/model');

/**
* Complete examples
*/
suite('Example:', function() {
  var Person, Customer;

  Person = Model.extend({
    id: { type: 'integer', required: true },
    name: { type: 'string' },
    birthdate: { type: 'date' },
  });

  Customer = Person.extend({
    'contact.email': { email: true, required: true },
    'contact.phone': { type: 'string' },
    'contact.address': { type: 'string' }
  });

  test('Valid Person', function() {
    var p = {
      id: '5',
      name: 'n', // string types accept anything
      birthdate: '1980-10-1'
    }
    assert.strictEqual(Person.validate(p), null);
  });

  test('Person with missing id and invalid date', function() {
    var p = {
      id: '',
      name: 5464, // string types accept anything
      birthdate: 'invalid date'
    }
    var result = Person.validate(p);
    assert.equal(Object.keys(result).length, 2);
    assert.equal(result.id[0], Model.getError('required'));
    assert.equal(result.birthdate[0], Model.getError('type', 'date'));
  });

  test('Person with wrong id', function() {
    var p = {
      id: 'invalid id',
      birthdate: '10/10/2000'
    }
    var result = Person.validate(p);
    assert.equal(Object.keys(result).length, 1);
    assert.equal(result.id[0], Model.getError('type', 'integer'));
  });

  test('Valid customer', function() {
    var p = {
      id: 4,
      contact: {
        email: 'a@b.c'
      }
    }
    assert.strictEqual(Customer.validate(p), null);
  });

  test('Customer missing id and email', function() {
    var p = {}
    var result = Customer.validate(p);
    assert.equal(Object.keys(result).length, 2);
    assert.equal(result.id[0], Model.getError('required'));
    assert.equal(result['contact.email'][0], Model.getError('required'));
  });
});
