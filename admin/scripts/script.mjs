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
  let translations = getGlobalVariable('translations');
  let appSettings = getGlobalVariable('appSettings');
  
  let fields = translations.filter(translationItem=>translationItem.ui==1)
                           .map( translationItem => `
                              <h3>${translationItem.description} (${translationItem.key})</h3>
                              ${ appSettings.Lanugages.map(langkey=> `<div class='langItem ${langkey}'>
                                <label>${ appSettings.LanugageLabels[langkey] }</label>
                                <textarea id='${ translationItem.key + '_' + langkey }'>${ translationItem.t[langkey] }</textarea>
                              </div>`).join('') }                        
                            `).join('<hr/>');
  let submit = document.createElement('button');
  submit.innerText = 'Submit';
  submit.onclick = ()=>{
    translations.forEach(translationItem=>{
      if ( translationItem.ui != 1 ) return;
      appSettings.Lanugages.forEach(langkey=> {
        translationItem.t[langkey] = document.getElementById(translationItem.key+'_'+langkey).value;
      })
    });
    let languages = ['','en'];
    
    let wrapperPath = 'templates/base.html';
    fetch( wrapperPath )
      .then(res=>res.text())
      .then( pageWrapper => {

        return languages.map(languageCode=>{
          let linksPrefix = languageCode + (languageCode==''?'':'/');
          let templates = {
            'front.page.html':'index.html',
            'about.page.html':'about/index.html',
            'news.page.html':'in-the-news/index.html',
            'papers.page.html':'position-papers/index.html',
            'articles.page.html':'posts/index.html',
            'media.page.html':'media/index.html',
            'contact.page.html':'contact-us/index.html',
            'donations.page.html':'donations/index.html'
          };

          let strings = {};        
          translations.forEach(item => strings[item.key] = item.t[languageCode==''?'he':languageCode] );
         
          let templateVars = {
              'strings': strings,
              'pageTitle': 'Front Page',
              'site_url': appSettings['Site_Url'],
              'direction':'rtl',
              'linksPrefix': linksPrefix
          };

          return Promise.all(
            Object.keys(templates)
            .map( templateFile => 
            {
              return fetch('templates/' + templateFile )
                    .then( res => res.text() )
                    .then( template => 
                      {              
                        templateVars.content = new Function("return `" + template + "`;").call(templateVars); 

                        return ({
                          "content":  new Function("return `" + pageWrapper + "`;").call(templateVars),
                          "filePath": linksPrefix + templates[ templateFile ],
                          "encoding": "utf-8" 
                        })
                      })
            })
          )        
        })
      })
      .then( filesResponses => Promise.all(filesResponses))
      .then( filesResponses =>{ 
        return filesResponses.reduce((filesResponses, val) => filesResponses.concat(val), []);
      })
      .then( renderedFiles =>{     
        commitFiles('Rerender pages after translation change' , renderedFiles );
          //location.reload();
      })
  }

  parentElement.innerHTML = '<div id="translaitonInterface">'+fields+'</div>';
  parentElement.appendChild(submit);
}

/* update page with translated strings */
function translatePage( items ) {
  let appSettings = getGlobalVariable('appSettings'); 
  let translations = getGlobalVariable('translations');

  translations.forEach(translateItem=>{
    var element = document.getElementById('t_'+translateItem.key);
    if( element && translateItem.t[appSettings.Admin_Lanaguage]) {
      element.innerText = translateItem.t[appSettings.Admin_Lanaguage];
    }
  })
  routeToCall();
}

/**
 * Rebuild items HTML pages from items Json.
 */
function rebuildHTML(parentElement) {
  let typeData = getGlobalVariable('contentTypes');
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

window.onload = function(e) { 
  routeToCall();
}


window.onhashchange = function(){
  routeToCall();
};