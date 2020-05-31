import {loadSystemFile, getLocalStorage, setLocalStorage, getGlobalVariable, setGlobalVariable } from './utils.js'; 
import {contentItemForm, contentList} from './contentItem.mjs'; 
import {doLogin} from './login.mjs'; 


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
    case '#admin/rebuildHTML'==hash:
      rebuildHTML(document.getElementById('content'));
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
      //location.hash = contentTypes.reverse()[0].name + '/all';      
    break;
  }
}

/**
 * Rebuild items HTML pages from items Json.
 */
function rebuildHTML(parentElement) {
  let typeData = getGlobalVariable('contentTypes');
  console.log(typeData);  
  let appSettings = getGlobalVariable('appSettings');
  let siteUrl = appSettings['Site_Url'];
  let parent = document.createElement('div');
  /* */
  fetch('../search/post.json')
    .then(response=>{
      return response.json();
    })
    .then(searchItems=>{
      searchItems.forEach(searchItem=>{
        if ( searchItem.id=='3091' ) {
          var item = contentItemForm ( parent, 'post'  , searchItem.id , 'rebuild' );
        }       
      })
    });
 
  parentElement.innerHTML = 'aaaaaaa';
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