import {contentItemForm, contentList} from './contentItem.js'; 
import {doLogin} from './login.mjs'; 

/**
 * Load settings file (JSON). 
 * called from the page loader flow
 */

var loadSystemFile = function( variableName , filePath, onSuccess , onError ) {

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
      onError();
    });
}

/*
* Get system variable 
* all variables should be set using this functions
*/
export var setGlobalVariable = function(variableName, variableValue){
  window[variableName] = variableValue;
}

/*
* Get system variable 
* all variables should be accessed using this functions
*/
export var getGlobalVariable = function(variableName) {
  return window[variableName];
}

var setLocalStorage = function(property, obj) {
  localStorage.setItem(property, JSON.stringify(obj));
}

export var getLocalStorage = function(property) {
  return JSON.parse( localStorage.getItem(property) );
}

/**
 * Simplest router...
 * Create a page loading flow
 **/
let regexExpressions =  {};

export function routeToCall(){

  let hash = window.location.hash;
 
  switch(true) {
    /** Page loader - init variables **/
    case !getGlobalVariable('appSettings'):
      loadSystemFile( 'appSettings', './appSettings.json' , routeToCall, routeToCall );
    break;
    case !getGlobalVariable('logStore'):
      setGlobalVariable( 'logStore', {} );
    case !getGlobalVariable('gitApi'):
      doLogin(document.getElementById('content'));
    break;
    case !getGlobalVariable('SEOFields'):
      loadSystemFile( 'SEOFields', './SEOFields.json' , routeToCall, routeToCall );
    break;
    case !getGlobalVariable('contentTypes'):
      loadSystemFile( 'contentTypes', './contentTypes.json', function(){
        if( getGlobalVariable('contentTypes').length > 0 ) {
          let contentTypesSingle = '(' + getGlobalVariable('contentTypes').map(a=>a.name).join('|') +')';
          regexExpressions.itemManagment = new RegExp('#'+contentTypesSingle+'\\/((\\d+)|new|all)',"i");
             
          getGlobalVariable('contentTypes').reverse().forEach(contentType => {
            document.getElementById('sidebarLinks').insertAdjacentHTML('afterbegin',  `
              <li><h3>${contentType.labelPlural}</h3></li>
              <li>
                <a class="nav-link" href="#${contentType.name}/all">כל ה${contentType.labelPlural}</a>
              </li>
              <li>
                <a class="nav-link" href="#${contentType.name}/new">הוסף ${contentType.label} חדש</a>
              </li>
              <hr/>
            `);
          });
        }
        routeToCall();
      }, routeToCall );
    break;
    /** Content Item management **/
    case regexExpressions.itemManagment.test(hash):
      hash = hash.replace('#','');
      let params = hash.split('/');
      let contentType = params.shift();

      // If List is requested
      if( params[0] == 'all') {
        contentList(document.getElementById('content'), contentType );
        return;
      }
      // Else if Item form is requested
      let id  = params.shift();
      let op = ( params.length > 0 )? params[0] : 'edit';

      contentItemForm(document.getElementById('content'), contentType ,id , op);
    break;
    case '#logout'==hash:
      localStorage.removeItem('token');
      localStorage.removeItem('secret');
      localStorage.removeItem('data');
      location = '';
    break;
    default:
      document.getElementById('content').innerHTML = 'error';
      let contentTypes = getGlobalVariable('contentTypes');
      location.hash = contentTypes.reverse()[0].name + '/all';      
    break;
  }
}

class Message  { 
  render() {
    return (
      '<div className={ "alert alert-" + this.props.type }>{ this.props.message }</div>'
    )
  }
}

window.onload = function(e) { 
  routeToCall();
}


window.onhashchange = function(){
  routeToCall();
};