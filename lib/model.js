(function () {

  /**
   * Gets a nested property
   */
  function getProperty(object, key) {
    var dotLoc = key.indexOf('.');
    if (dotLoc === -1) 
      return object[key];
    else { 
      var head = key.substring(0, dotLoc)
      , tail = key.substring(dotLoc + 1)
      , nested = object[head];
      if (!nested)
        return undefined;
      return getProperty(nested, tail);
    }
  }

  /**
   * Sets a nested property
   */
  function setProperty(object, key, value) {
    var dotLoc = key.indexOf('.');
    if (dotLoc === -1) 
      object[key] = value;
    else { 
      var head = key.substring(0, dotLoc)
      , tail = key.substring(dotLoc + 1)
      , nested = object[head];
      if (!nested)
        nested = {};
      return setProperty(nested, tail, value);
    }
  }

  function getLength(obj) {
    return obj.length;
  }

  function empty(obj) {
    return(obj === null || 
      obj === undefined ||
      (typeof obj === "string" && obj.trim() === ''));
  }

  function extend(obj) {
    function F() {}
    F.prototype = obj;
    return new F();
  }

  /**
  * Main validation logic
  */
  function validate(target, model, ensureTypes) {
    var validationErrors = {}
    , containsError = false
    , rulesMap = model.rulesMap
    , pKey;
    for (pKey in rulesMap) {
      var errors = validateProperty(pKey, rulesMap[pKey], target, model,
          ensureTypes);
      if (errors) {
        validationErrors[pKey] = errors;
        containsError = true;
      }
    }
    if (containsError)
      return validationErrors;
    return null;
  }

  function validateProperty(pKey, rules, target, model, ensureTypes) {
    var errors = []
    , key;
    for (key in rules) {
      var handler = model.handlers[key];
      if (typeof handler !== "function")
        throw new Error("Rule '" + key + "' has no handler");
      var param = rules[key]
      , value = getProperty(target, pKey)
      , result = handler.call(model, value, param, target, pKey);
      if (result) {
        errors.push(result);
      } else if (ensureTypes && key === 'type') {
        var conversor = model.types[param]
        , v = conversor.call(model, value);
        if (v !== null)
          setProperty(target, pKey, v);
      }
    }
    if (errors.length !== 0)
      return errors;
    return null;
  }

  /**
  * Object that encapsulates validation logic associated with a particular 
  * model.
  */
  var Model = { rulesMap: {}, handlers: {} };

  Model.messages = {
    type: 'Expecting {param}',
    required: 'Required',
    pattern: 'Doesn\'t match the expected pattern',
    email: 'Invalid email address',
    url: 'Invalid URL',
    number: 'Not a number',
    digits: 'Contains non-digit characters',
    creditcard: 'Invalid credit card number',
    equalTo: '{param} doesn\'t match with this',
    maxlength: 'Maximum length is {param}',
    minlength: 'Minimum length is {param}',
    max: 'Maximum value is {param}',
    min: 'Minimum value is {param}'
  };


  var t = /^true$/i
  , f = /^false$/i;
  /**
   * Type conversors. Should return the converted type, or null if
   * the conversion fails.
   */
  Model.types = {

    string: function(value) {
      if (value && typeof value.toString === 'function')
        return value.toString();
      return null;
    },

    number: function(value) {
      var n = Number(value); 
      if (!(value instanceof Array) && !isNaN(n))
        return n;
      return null;
    },

    integer: function(value) {
      var n = this.types.number(value);
      if (n !== null && n % 1 === 0)
        return n;
      return null;      
    },

    'boolean': function(value) {
      if (t.test(value.toString()))
        return true;
      else if (f.test(value.toString()))
        return false;
      return null;
    },

    array: function(value) {
      if (value instanceof Array)
        return value;
      return null;
    },

    date: function(value) {
      var d = new Date(value);
      if (!/Invalid|NaN/.test(d.toString()))
        return d;
      return null;
    }

  };

  Model.getError = function(ruleName, param, value, target, property) {
    var p = '';
    if (param && typeof param.toString === "function")
      p = param.toString();
    return this.messages[ruleName].replace('{param}', p);
  }

  // Some of the following code was taken from the jquery validation plugin:
  // https://github.com/jzaefferer/jquery-validation/blob/master/jquery.validate.js
  Model.handlers = {

    type: function(value, param, target, property) {
      var conversor = this.types[param];
      if (typeof conversor !== 'function')
        throw new Error('Type \'' + param +'\' is not registered');
      if (!empty(value) && conversor.call(this, value) === null)
        return this.getError('type', param, value, target, property);
    },

    required: function(value, param, target, property) {
      if (empty(value))
        return this.getError('required', param, value, target, property);
    },

    pattern: function(value, param, target, property) {
      if (!empty(value) && !param.test(value))
        return this.getError('pattern', param, value, target, property);
    },

    minlength: function(value, param, target, property) {
      if (!empty(value) && getLength(value) < param)
        return this.getError('minlength', param, value, target, property);
    },

    maxlength: function(value, param, target, property) {
      if (!empty(value) && getLength(value) > param)
        return this.getError('maxlength', param, value, target, property);
    },

    min: function(value, param, target, property) {
      if (!empty(value) && value < param)
        return this.getError('min', param, value, target, property);
    },

    max: function(value, param, target, property) {
      if (!empty(value) && value > param)
        return this.getError('max', param, value, target, property);
    },

    email: function(value, param, target, property) {
      if (!empty(value) && !/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value))
        return this.getError('email', param, value, target, property);
    },

    url: function(value, param, target, property) {
      if (!empty(value) && !/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value))
        return this.getError('url', param, value, target, property);
    },
   
    creditcard: function(value, param, target, property) {
      if (empty(value))
        return;
      if (/[^0-9 \-]+/.test(value))
        return this.getError('creditcard', param, value, target, property);
      var nCheck = 0
      , nDigit = 0
      , bEven = false;
      value = value.replace(/\D/g, '');
      for (var n = value.length - 1; n >= 0; n--) {
        var cDigit = value.charAt(n);
        nDigit = parseInt(cDigit, 10);
        if (bEven)
          if ((nDigit *= 2) > 9)
            nDigit -= 9;
          nCheck += nDigit;
          bEven = !bEven;
      }
      if ((nCheck % 10) !== 0)
        return this.getError('creditcard', param, value, target, property);
    },

    equalTo: function(value, param, target, property) {
      if (value !== getProperty(target, param))
        return this.getError('equalTo', param, value, target, property);
    }
  };

  /**
  * Creates another model that inherits rules/handlers from the
  * current model
  */
  Model.extend = function(rulesMap, options) {
    var rv, key;
    rv = extend(this);
    rv.rulesMap = extend(this.rulesMap);
    rv.handlers = extend(this.handlers);
    rv.messages = extend(this.messages);
    rv.types = extend(this.types);
    for (key in rulesMap) 
      rv.rulesMap[key] = rulesMap[key];
    if (options) {
      if (options.handlers) {
        for (key in options.handlers)
          rv.handlers[key] = options.handlers[key];
      }
      if (options.messages) {
        for (key in options.messages)
          rv.messages[key] = options.messages[key];
      }
      if (options.types) {
        for (key in options.types)
          rv.types[key] = options.types[key];
      }
      if (typeof options.getError === "function") {
        rv.getError = options.getError;
      }
    }
    return rv;
  }

  /**
  * Validates a javascript object against this Model instance
  */
  Model.validate = function(target, ensureTypes) {
    return validate(target, this, ensureTypes);
  };

  /**
  * Validates a single property
  */
  Model.validateProperty = function(property, target, ensureTypes) {
    return validateProperty(property, this.rulesMap[property], target, this, 
        ensureTypes);
  };

  var global = this;

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Model;
    }
    exports.Model = Model;
  } else {
    global['Model'] = Model;
  }

  if (typeof define === 'function' && define.amd) {
    define('model.js', function() {
      return Model;
    });
  }

})();
