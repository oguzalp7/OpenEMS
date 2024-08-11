// Convert date string to timestamp string
export const convertDateToTimestamp = (dateString) => {
    const dateObj = new Date(dateString);
    return Math.floor(dateObj.getTime() / 1000).toString();
};

export const reorderColumns = (data, order) => {
    return data.map(item => {
        let orderedItem = {};
        order.forEach(key => {
        // Check if the key exists in the item and is not null, undefined, or an empty string
        if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
            orderedItem[key] = item[key];
        }
        });
        return orderedItem;
    });
};

export const validateAndCombineContact = (data, phoneNumberKey, countryCodeKey) => {
    return data.map(item => {
        let newItem = { ...item };
        
        // Validate phone number and country code
        const phoneNumber = newItem[phoneNumberKey];
        const countryCode = newItem[countryCodeKey];

        if (phoneNumber && phoneNumber.length === 10 && countryCode && countryCode.length >= 2) {
        const formattedPhoneNumber = `(${countryCode}) ${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 6)} ${phoneNumber.slice(6, 8)} ${phoneNumber.slice(8, 10)}`;
        newItem.telefon = formattedPhoneNumber;
        } else {
        newItem.telefon = null;
        }
        
        // Remove the original phone number and country code columns
        delete newItem[phoneNumberKey];
        delete newItem[countryCodeKey];

        return newItem;
    });
};

export const renameColumn = (data, oldKey, newKey) => {
    return data.map(item => {
      let newItem = { ...item };
  
      // Check if the old key exists
      if (oldKey in newItem) {
        newItem[newKey] = newItem[oldKey];
        delete newItem[oldKey];
      }
  
      return newItem;
    });
  };

export const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
};


export const removeKeysFromObject = (obj, keysToRemove) => {
    const newObj = { ...obj };
    keysToRemove.forEach((key) => {
      delete newObj[key];
    });
    return newObj;
};
  
export const removeKeysFromArrayOfObjects = (array, keysToRemove) => {
    return array.map((obj) => removeKeysFromObject(obj, keysToRemove));
};


export const hideKeysInObject = (obj, keysToHide) => {
    const newObj = { ...obj };
    keysToHide.forEach((key) => {
      if (newObj.hasOwnProperty(key)) {
        newObj[key] = null;
      }
    });
    return newObj;
};
  
export const hideKeysInArrayOfObjects = (array, keysToHide) => {
    return array.map((obj) => hideKeysInObject(obj, keysToHide));
};
  
  
export const generateFormConfig = (schema) => {
  if(schema){
    return Object.keys(schema.properties).map((key) => {
      const field = schema.properties[key];
      let type;
  
      switch (field.type) {
        case 'string':
          type = field.format === 'date' ? 'date' : 'text';
          break;
        case 'integer':
          type = 'select'; // Assuming integers are foreign keys
          break;
        case 'boolean':
          type = 'checkbox';
          break;
        case 'number':
          type = 'number';
          break;
        default:
          type = 'text';
      }
  
      return {
        type,
        name: key,
        label: field.title || key,
        options: []
      };
    });
  }else{
    return {};
  }
  
};

export const alterFormConfigType = (formConfig, keys, targetType) => {
  /*
    * Function to alter the type of formConfig objects based on their name attribute.
    * @param {Array} formConfig - The form configuration array.
    * @param {Array} keys - The list of keys (names) to be altered.
    * @param {String} targetType - The target type to be set.
    * @returns {Array} - The updated form configuration array.
  */
  return formConfig.map((field) => {
    if (keys.includes(field.name)) {
      return { ...field, type: targetType };
    }
    return field;
  });
};


export const findFieldIndex = (formConfig, type, name) => {
  return formConfig.findIndex(field => field.type === type && field.name === name);
};


export const renameFormLabels = (formConfig, labelMapping) => {
  return formConfig.map((field) => {
    if (labelMapping[field.label]) {
      return {
        ...field,
        label: labelMapping[field.label],
      };
    }
    return field;
  });
};
  
export const updateFieldOptions = (formConfig, fieldName, options) => {
  return formConfig.map(field => {
    if (field.name === fieldName) {
      return {
        ...field,
        options: options
      };
    }
    return field;
  });
};


export const reorderFormConfig = (formConfig, order) => {
  const orderMap = new Map(order.map((name, index) => [name, index]));

  return formConfig.sort((a, b) => {
      const indexA = orderMap.get(a.name);
      const indexB = orderMap.get(b.name);

      if (indexA === undefined) return 1;
      if (indexB === undefined) return -1;

      return indexA - indexB;
  });
};
  
/**
 * Check if a field with the given name exists in the formConfig
 * @param {Array} formConfig - The configuration array of the form
 * @param {string} name - The name of the field to check
 * @return {boolean} - True if the field exists, false otherwise
 */
export const fieldExistsInFormConfig = (formConfig, name) => {
  return formConfig.some(field => field.name === name);
};
  
  
export const flattenDefaultValues = (defaultValues) => {
  const flattenedValues = { ...defaultValues };
  
  if (defaultValues.details) {
    Object.keys(defaultValues.details).forEach(key => {
      flattenedValues[key] = defaultValues.details[key];
    });
    delete flattenedValues.details;
  }

  return flattenedValues;
};
  

export const normalizeData = (data) => {
  // Determine the set of all keys in the data
  const allKeys = data.reduce((keys, obj) => {
    Object.keys(obj).forEach((key) => keys.add(key));
    return keys;
  }, new Set());

  // Convert the set to an array
  const allKeysArray = Array.from(allKeys);

  // Normalize each object in the data array
  return data.map((obj) => {
    const normalizedObj = {};
    allKeysArray.forEach((key) => {
      normalizedObj[key] = obj[key] !== undefined ? obj[key] : "-";
    });
    return normalizedObj;
  });
};

export const excludeItem = (data, key, value) => {
  return data.filter(item => item[key] !== value);
};