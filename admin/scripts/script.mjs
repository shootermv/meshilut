import {loadSystemFile, getGlobalVariable, setGlobalVariable } from './utils.js'; 
import { commitFiles, contentItemForm, contentList , contentItemLoader} from './contentItem.mjs'; 
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
      loadSystemFile( 'appSettings', './appSettings.json' , routeToCall );
    break;
    /** Page loader - init variables **/
    case !getGlobalVariable('translations'):
      loadSystemFile( 'translations', './translations.json' , translatePage );
    break;
    case !getGlobalVariable('logStore'):
      setGlobalVariable( 'logStore', {} );
    case !getGlobalVariable('gitApi'):
      doLogin(document.getElementById('content'));
    break;
    case !getGlobalVariable('SEOFields'):
      loadSystemFile( 'SEOFields', './SEOFields.json' , routeToCall );
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
                <a class="nav-link" href="#${contentType.name}/all">כל ${contentType.labelDefinedPlural}</a>
              </li>
              <li>
                <a class="nav-link" href="#${contentType.name}/new">הוסף ${contentType.label} חדש</a>
              </li>
              <hr/>
            `);
          });
        }
        routeToCall();
      });
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
      
      /** Start form */
      contentItemLoader( contentType, id )
      .then(contentItem => {
        document.getElementById('content').innerHTML = '';
        document.getElementById('content').appendChild( contentItemForm(contentType ,contentItem , op) );
      })
      // TODO: Change it to use generic hook system (support plugins)
      .then( response => {  
        Array.prototype.forEach.call( document.getElementsByClassName('wysiwyg_element') , function (wysiwyg) {
          var suneditor = SUNEDITOR.create( wysiwyg.id , {
            buttonList: [
                ['undo', 'redo'],
                ['align', 'horizontalRule', 'list', 'table', 'fontSize']
            ],
          });
          suneditor.onChange =  wysiwyg.onchange;
        });        
      });

    break;
    case '#translate'==hash:
      translationInterface(document.getElementById('content'));
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

/** Translation interface for 'static' string in pages */
function translationInterface(parentElement) {
  let translations = getGlobalVariable('translationsKeys');
  console.log(translations);
  
  parentElement.innerHTML = 'aaa!';

}

/* update page with translated strings */
function translatePage( items ) {
  let appSettings = getGlobalVariable('appSettings'); 
  let translations = getGlobalVariable('translations');

  translations.forEach(translateItem=>{
    var element = document.getElementById('t_'+translateItem.key);
    if( element && translateItem.t[appSettings.Admin_Lanaguage]) {
  //    element.innerText = translations.t[appSettings.Admin_Lanaguage];
    }
  })
  routeToCall();
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
    .then( searchItems=>{
      return Promise.all(
        searchItems
          .map( searchItem => { 
            return contentItemLoader('post', searchItem.id)
                    .then( fetchedItem => fetchedItem.getRepositoryFiles() )
          })
      )       
    })
    .then( files =>{
      files = [].concat.apply([], files);
      commitFiles('Rebuild Posts', files)
    }).then(res=> {
      parentElement.innerHTML = 'Done!';
    });
  
 
  parentElement.innerHTML = 'Rebuilding.... Please Wait';
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