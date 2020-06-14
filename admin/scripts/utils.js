
/*
* Get system variable 
* all variables should be set using this functions
*/
export let setGlobalVariable = function(variableName, variableValue){
    window[variableName] = variableValue;
}
  
/*
 * Get system variable 
 * all variables should be accessed using this functions
 */
export let getGlobalVariable = function(variableName) {
    return window[variableName];
}
  
/**
 * 
 * @param {*} property 
 * @param {*} obj 
 */
export let setLocalStorage = function(property, obj) {
    localStorage.setItem(property, JSON.stringify(obj));
}

/**
 * 
 * @param {*} property 
 */
export let getLocalStorage = function(property) {
    return JSON.parse( localStorage.getItem(property) );
}

/**
 * Load settings file (JSON). 
 * called from the page loader flow
 */
export let loadSystemFile = function( variableName , filePath, onSuccess ) {

    if ( localStorage.getItem(variableName) ) {
      window[variableName] = JSON.parse(localStorage.getItem(variableName));
      onSuccess();
      return;
    }
  
    window[variableName] = {};
    
    fetch(filePath)
      .then(function(response){
        if (!response.ok) {
          throw Error(response.statusText);
        }
        return response.json();
      }).then(function(json){
          window[variableName] = json;
          onSuccess();
        })
      .catch(function(error) {
        console.error( 'Error Loading system file', error , variableName , filePath );
      });
  }
/**
 * Get translation string by string key
 */
export let t = function( translationKey, language ) {
  let translations = getGlobalVariable('translations');
  return translations.find(t=>t.key == translationKey ).t[ language==''?'he': language ]
}

 /**
 * Close edit page (navigate to content type list)
 */
export let gotoList = function( typeName ) {
  location = '#'+ typeName+'/all';
  location.reload();
}

export let successMessage = function( message , opData ) {
  console.log(message);
  console.log(opData);
}


export let errorHandler = function( error ) {
  
}