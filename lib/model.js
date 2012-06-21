(function () {

  function getProperty(object, key) {
    var dotLoc = key.indexOf('.');
    if (dotLoc === -1) 
      return object[key];
    else { 
      // nested property
      var head = key.substring(0, dotLoc)
      , tail = key.substring(dotLoc + 1)
      , nested = object[head];
      if (!nested)
        return undefined;
      return getProperty(nested, tail);
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

  /**
  * Main validation logic
  */
  function validate(target, model) {
    var validationErrors = {}
    , containsError = false
    , rulesMap = model.rulesMap
    , handlers = model.handlers
    , pKey, key;
    // The rulesMap object associates a property name with a set of rules
    for (pKey in rulesMap) {
      if (!(pKey in validationErrors))
        validationErrors[pKey] = [];
      var errors = validationErrors[pKey]
      , rules = rulesMap[pKey];
      for (var key in rules) {
        if (typeof handlers[key] !== "function")
          throw new Error("Rule '" + key + "' has no handler");
        var handler = handlers[key]
        , param = rules[key]
        , value = getProperty(target, pKey)
        , result = handler.call(model, value, param, target, pKey);        
        if (result) {
          containsError = true;
          errors.push(result);
        }
      }
    }
    if (containsError)
      return validationErrors;
    return null;
  }

  /**
  * Object that encapsulates validation logic associated with a particular 
  * model.
  */
  var Model = { rulesMap: {}, handlers: {} };

  Model.messages = {
    type: 'Expecting \'{param.name}\' instance',
    required: 'Required',
    email: 'Invalid email address',
    url: 'Invalid URL',
    date: 'Invalid date',
    dateISO: 'Invalid ISO date',
    number: 'Not a number',
    digits: 'Contains non-digit characters',
    creditcard: 'Invalid credit card number',
    equalTo: '{param} doesn\'t match with this',
    maxlength: 'Maximum length is {param}',
    minlength: 'Minimum length is {param}',
    max: 'Maximum value is {param}',
    min: 'Minimum value is {param}'
  };

  // Some of the following code was taken from the jquery validation plugin:
  // https://github.com/jzaefferer/jquery-validation/blob/master/jquery.validate.js
  Model.handlers = {

    fn: function(value, param, target, property) {
      return fn.call(this, value, target, property)
    },

    type: function(value, param) {
      if (!empty(value) && !(value instanceof param))
        return this.messages.type;
    },

    required: function(value) {
      if (empty(value))
        return this.messages.required;
    },

    minlength: function(value, param) {
      if (!empty(value) && getLength(value) < param)
        return this.messages.minlength;
    },

    maxlength: function(value, param) {
      if (!empty(value) && getLength(value) > param)
        return this.messages.maxlength;
    },

    min: function(value, param) {
      if (!empty(value) && value < param)
        return this.messages.min;
    },

    max: function(value, param) {
      if (!empty(value) && value > param)
        return this.messages.max;
    },

    email: function(value) {
      if (!empty(value) && !/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value))
        return this.messages.email;
    },

    url: function(value) {
      if (!empty(value) && !/^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value))
        return this.messages.url;
    },

    date: function(value) {
      if (!empty(value) && /Invalid|NaN/.test(new Date(value)))
        return this.messages.date;
    },

    dateISO: function(value) {
      if (!empty(value) && !/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value))
        return this.messages.dateISO;
    },

    number: function(value) {
      if (!empty(value) && !/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value))
        return this.messages.number;
    },

    digits: function(value) {
      if (!empty(value) && !/^\d+$/.test(value))
        return this.messages.digits;
    },

    creditcard: function(value) {
      if (empty(value))
        return;
      if (/[^0-9 \-]+/.test(value))
        return this.messages.creditcard;
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
        return this.messages.creditcard;
    },

    equalTo: function(value, param, target) {
      if (value !== getProperty(target, param))
        return this.messages.equalTo;
    }
  };

  /**
  * Creates another model that inherits rules/handlers from the
  * current model
  */
  Model.extend = function(rulesMap, handlers) {
    var rv, key;
    function M() {}
    M.prototype = this;
    function R() {}
    R.prototype = this.rulesMap;
    function H() {}
    H.prototype = this.handlers;
    function MS() {}
    MS.prototype = this.messages;
    rv = new M();
    rv.rulesMap = new R();
    rv.handlers = new H();
    rv.messages = new MS();
    for (key in rulesMap) 
      rv.rulesMap[key] = rulesMap[key];
    if (handlers) {
      for (key in handlers)
        rv.handlers[key] = handlers[key];
    }
    return rv;
  }

  /**
  * Validates a javascript object against this Model instance
  */
  Model.validate = function(target) {
    return validate(target, this);
  };

  var global = this;

  if (module)
    module.exports = Model;
  else
    global.Model = Model;

})();
