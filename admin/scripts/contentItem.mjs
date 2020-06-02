import * as utils from './utils.js'; 

/**
 * Create a form for editing/adding content item
 * 
 * TODO: Refactor this file (create item functions, use more funcs etc')
 * TODO: Split to sub-functions
 * TODO: Support generic i18n
 * TODO: Show revisions
 * 
 */

export function contentItem ( contentType , ItemId ) {

  this.id = ItemId;
  this.type= contentType;
  this.files= [];
  
  this.seo = {};

  // TODO: Dynamic languages 
  this.en = {};

  let appSettings = utils.getGlobalVariable('appSettings');
  let siteUrl = appSettings['Site_Url'];
  let typeData = utils.getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
  

  this.getURL = returnAbsolutePath => {
      return ( returnAbsolutePath ? siteUrl: '' ) + typeData.urlPrefix + this.id;
  }

  this.set = function( field, value ) {
    let fieldParts = field.split('.');
    let refferer = this;
    fieldParts.forEach((fieldName, i ) => {
      if ( i+1 == fieldParts.length ) {
        refferer[fieldName] = value;
        return;
      }
      refferer = refferer[fieldName];
    });
    localStorage.setItem( this.type + '/' + this.id , JSON.stringify(this) );
  }

  /**
   * Render all files for this item
   */
  this.getRepositoryFiles = function(){
    /*** index.html ***/
    // TODO: Take laguages from settings...
    return renderPageHTML(this, ['', 'en'])
    .then(files => {
      /*** index.json ***/
      return files.concat([{
        "content":  JSON.stringify(this),
        "filePath": this.getURL(false)+'/index.json',
        "encoding": "utf-8" 
      }]);
    })
    /*** Add Attachments ***/
    .then( files => {
      if ( this.files.length == 0 )  return files;
      let attachments = Object.keys(this.files).map( fieldName => ({
          "content":  this.files[fieldName],
          "filePath": this[fieldName],
          "encoding": "base64" 
      }));
      return files.concat(attachments);
    })
  }
    
  /**
   * Render index pages using html templates
   * @param languages 
   */
  let renderPageHTML = async function( editItemObj, languages ) {
    return Promise.all([
      fetch('templates/base.html').then(result=> result.text()),
      fetch('templates/genericInner.html').then(result=> result.text()),
    ])
    .then( templates =>{
      return Promise.all( languages.map( language =>{
        let editedItem = editItemObj;
        if(language!='') {
          let translatedObject = { 
            id: editedItem.id, 
            files: editedItem.files 
          };
          typeData.fields.forEach( f => { 
            if( f.i18n === false ) {
              translatedObject[f.name] = editedItem[f.name]
            }
            else {
              translatedObject[f.name] = editedItem[language][f.name];
            }
          }); 
          editedItem = translatedObject;
        }

        let templateVars = {
            'item': editedItem,
            'site_url':siteUrl
        } ;
        templateVars.content = new Function("return `"+templates[1] +"`;").call(templateVars); 
         
        return {
          "content":  new Function("return `"+templates[0] +"`;").call(templateVars),
          "filePath": (language!=''?language+'/':'')+editItemObj.getURL(false)+'/index.html',
          "encoding": "utf-8" 
        }
      }));
    }) 
  }
}

/**
 * Load content and return promiss for onload 
 * 
 * @param contentType 
 * @param ItemId 
 */
export async function contentItemLoader ( contentType , ItemId ) {
  
  let contentObject =  new contentItem( contentType , ItemId );

  // Get content type data description and load defaults
  let typeData = utils.getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
  
  typeData.fields.forEach(field => {
    if ( field.defaultValue ) {
      contentObject[field.name] = field.defaultValue ;
    }
    else {
      contentObject[field.name] = '';
    }
  });
  
  if( localStorage[ contentObject.type + '/' + contentObject.id ] ) { // item is in editing process
    let cachedData = JSON.parse(localStorage[ contentObject.type + '/' + contentObject.id ]);
    let mergedObject = { ...contentObject, ...cachedData };
    return mergedObject;
  }
  else {
    // load item details
    return fetch(contentObject.getURL(true)+'/index.json')
            .then( res => { return res.json() })
            .then( loadedItemDetails => {
                // init to the default value
                let mergedObject = { ...contentObject, ...loadedItemDetails };
                return mergedObject;       
            });
  }
}


/**
 * 
 * Render item edit form
 * 
 * @param parentElement - the element that the form will be appended to
 * @param contentType - type of content item
 * @param requestedItemId - item's Id
 * @param op - Operation (edit/sso/languagecode etc')
 */
export function contentItemForm ( contentType , editedItem , op ) {
  let wrapper = document.createElement('div');
  let typeData = utils.getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
    // Build node tabs
    let baseURL = '#' + contentType + '/' + editedItem.id + '/';
    let links = [{ 'op':'edit', 'label':'עריכה' }];
    if ( true ) { // TODO: check i18n support
      links.push({ 'op':'en', 'label':'תרגום' });
    }
    links.push({ 'op':'seo', 'label':'SEO' });

    switch ( op ) {
    case 'delete':
      wrapper.innerHTML = `
        <div>
          <h3>האם אתה בטוח שברצונך למחוק פריט זה?</h3>
          <div>
            <button id='approveDelete'>כן</button>
            <button className='cancel' onclick="location.href='#${ contentType }/all'">לא</button>
          </div>
        </div>`;
        wrapper.querySelector('#approveDelete').onclick = function(event){
        //TODO: Support delete
        alert('TODO: currently unsuported!')
      }
      break;
      case 'edit':
      case 'new':
      case 'en':  
      case 'seo':
        let dataObject = editedItem;
        // Set Fields By OP type
        let formFields =  JSON.parse(JSON.stringify(typeData.fields));
        switch( op ) {
          case 'edit':
            // Default fields 
            formFields.unshift({ name: "id", label: "מזהה", type: "id"});
          break;
          case 'en':            
            formFields = formFields
                          .filter( f=> f.type != 'file')
                          .filter( f=> f.i18n !== false );
            dataObject = editedItem['en'];
          break;
          case 'seo':
            formFields = utils.getGlobalVariable('SEOFields');
            dataObject = editedItem['seo'];
          break;
        }

        wrapper.innerHTML = `<h1>עריכת ${typeData.label}</h1>
        <ul class="nav nav-tabs">
          ${ links.map(field=>
            `<li class="nav-item">
              <a class="nav-link ${ field.op==op ? 'active' : '' }" href='${baseURL+field.op}'>${field.label}</a>
            </li>`).join('') }
        </ul>`;
        

        let form = document.createElement('form');
        
        wrapper.appendChild(form);
        formFields.forEach( function(field) {
              let fieldDiv = document.createElement('div');
              fieldDiv.classList.add('form-element');
              fieldDiv.classList.add(field.type);
              
              form.appendChild(fieldDiv);
              
              fieldDiv.innerHTML = `<label>${ field.label }</label>`;

              switch(field.type){
                case 'id': 
                  let idInput = document.createElement('input');
                  idInput.value = editedItem.id;
                  idInput.onkeyup = v => {
                      editedItem.set( 'id' , v.target.value );
                      urlPreview.innerText =  editedItem.getURL(true);
                  };
                  fieldDiv.appendChild(idInput);
                  let urlPreview = document.createElement('span');
                  urlPreview.className = 'siteUrlPreview'
                  urlPreview.innerText =  editedItem.getURL(true);
                  fieldDiv.appendChild(urlPreview);
                break;
                case 'wysiwyg':
                case 'textfield':
                  let textarea = document.createElement('textarea');
                  textarea.id='formitem_'+ field.name;
                  textarea.name= field.name;
                  textarea.className = field.type=='wysiwyg'?'wysiwyg_element':'';
                  textarea.placeholder= field.placeholder;
                  textarea.value = dataObject[field.name] ? dataObject[field.name] : '';
                  fieldDiv.appendChild(textarea);
                  textarea.onchange = function(event){
                    let textValue = typeof event == 'string' ? event :  event.target.value;
                    // fieldName with language prefix
                    let fieldName = ( op == 'edit'?'':(op+'.'))+ field.name;
                    editedItem.set( fieldName , textValue );
                  }
                break;
                case 'file':
                  fieldDiv.innerHTML += `<div class='preview'>
                    ${ editedItem[field.name]? `<img src="${ siteUrl +'/'+editedItem[field.name]}" />` : '' }
                  </div>`;
                  let fileUploader = document.createElement('input');
                  fieldDiv.appendChild(fileUploader);
                  fileUploader.id='formitem_'+ field.name;
                  fileUploader.name= field.name;
                  fileUploader.type="file";
                  fileUploader.onchange = function(event) {
                    editedItem.set( field.name , editedItem.getURL(false)+ '/'+field.name+'.'+this.files[0].name.split('.').pop());
                    var reader = new FileReader();
                    let previewElement = wrapper.querySelector('.preview');
                    previewElement.innerHTML = '';

                    reader.onload = function (evt) {
                      var contents = reader.result;
                      editedItem.files[field.name] =  contents.substr(contents.indexOf(',') + 1); 

                      // preview image
                      let image = document.createElement("img");
                      image.src = contents;
                      image.setAttribute('style','max-width:200px;max-heigth:200px;'); 
                      
                      previewElement.appendChild(image);
                    }
                    reader.readAsDataURL(this.files[0]);
                  }
                break;
              }            
        });
        let submitButtons = document.createElement('div');
        let cancelButton = document.createElement('button');
        cancelButton.innerText = 'בטל';
        cancelButton.className = 'cancel';
        cancelButton.onclick = function(){
          if( confirm('האם אתה בטוח?') ) {
            localStorage.removeItem(editedItem.type+'/'+requestedItemId);
            utils.gotoList(editedItem.type);
          }
        }
        let submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.innerText = 'שמור';

        /**
         * Submit item
         */
        submitButton.onclick = function() {
          editedItem.getRepositoryFiles()
          /*** Update Searchable List ***/ 
          .then( files => {
            return getUpdatedSearchFile('search/'+contentType+'.json').then( searchFiles => {
              return  files.concat(searchFiles);
            })
          })
          .then(files => {
            commitItem('Save '+ contentType +': ' + editedItem.id , files );
          })
          .then(res => {
            utils.gotoList( contentType );
          });          
        }

        submitButtons.appendChild(submitButton);
        submitButtons.appendChild(cancelButton);      
        form.appendChild(submitButtons);

        form.onsubmit = function(event){
          submitButtons.disabled = true; 
          event.preventDefault();
        }
      break;
      case 'rebuild':
        return getRepositoryFiles();
      break;    
  }

  /**
   * 
   * @param {*} filePath 
   */
  let getUpdatedSearchFile = function ( filePath ) {
    return fetch(filePath )
            .then( response => searchableJSONResponse.json() )
            .catch( exeption=> [] )
            .then( fileJson => {
              var indexedItem = {};
              indexedItem.id = editedItem.id;
              indexedItem.title = editedItem.title;
              indexedItem.body = getSearchableString();
              
              fileJson.push(indexedItem);

              return [{
                "content": JSON.stringify(fileJson),
                "filePath": filePath,
                "encoding": "utf-8"
              }];
            });
  }

  let getSearchableString = function() {
    return typeData.fields
            .filter(f => f.type != 'file')
            .filter(f=> ['id','name'].indexOf(f.name) )
            .filter(f=> editedItem[f.name] )
            .map(f => editedItem[f.name].replace(/(<([^>]+)>)/ig," "))
            .join(' ');
  }

  return wrapper;
}


/**
 * invoke API 
 * Commit changes to the git repository
 */
let commitItem = function( commitMessage , files ){
  
  let APIconnect = utils.getGlobalVariable('gitApi');
  return APIconnect.commitChanges( commitMessage, files);
}


/**
 * Display List of items (For the 'all' callback)
 * TODO: Add pager
 */
export function contentList( parentElement, contentType ) {

  let typeData = utils.getGlobalVariable('contentTypes').find(ty=>ty.name==contentType);
  let pageTitle  =  typeData.labelPlural;
  
  let appSettings = utils.getGlobalVariable('appSettings');
  let siteUrl = appSettings['Site_Url'];

  fetch(siteUrl+'/search/'+contentType+'.json')
    .then(response=>{
      return response.json();
    })
    .then(items=>{
      if(items.length==0) {throw 'empty';}
      parentElement.innerHTML = `
                  <div>
                    <h1>${pageTitle}</h1>
                    <table>
                      <tr>
                        <th>#</th>
                        <th>כותרת</th>
                        <th></th>
                        <th>לינקים</th>
                      </tr>
                      ${ items.map((item) => 
                        `<tr>
                          <td>${item.id}</td>
                          <td>${item.title}</td>
                          <td><a href=${'#post/'+item.id}>ערוך</a></td>
                          <td><a href=${'#post/'+item.id+'/delete'}>מחק</a></td>
                        </tr>` ).join("")}        
                    </table>
                  </div>`;
      
    })
    .catch( exeption=>{
      parentElement.innerHTML = `<div>
      <h1>${pageTitle}</h1>
      לא קיימים פריטים מסוג זה.
      </div>`;
    });
}
