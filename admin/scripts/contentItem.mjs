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

export function contentItemForm ( parentElement, contentType , requestedItemId , op ) {
  
  let editedItem = {  
    id:requestedItemId,
    type: contentType,
    files:[]
  };

  // Get content type data description and load defaults
  let typeData = utils.getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
  typeData.fields.forEach(function(field){
    if ( field.defaultValue ) {
      editedItem[field.name] = field.defaultValue ;
    }
    else {
      editedItem[field.name] = '';
    }
  });

  let appSettings = utils.getGlobalVariable('appSettings');
  let siteUrl = appSettings['Site_Url'];

  let getItemURL = function( absoluteURL ){
    return (absoluteURL?siteUrl: '' ) + typeData.urlPrefix + editedItem.id;
  };

  let loadItem = function( onSuccess ) {

    if( localStorage[editedItem.type+'/'+requestedItemId] ) { // item is in editing process
      onSuccess();
    }
    else {
      // load item details
      fetch(getItemURL(true)+'/index.json').then(res=>{ return res.json() })
      .then( loadedItemDetails => {
        // init to the default value
        typeData.fields.forEach(function(field){
          if  ( loadedItemDetails[field.name] ) {
            editedItem[field.name] = loadedItemDetails[field.name];
          }
        });        
      })
      .finally(onSuccess);
    }
  }

  let renderForm = function() {
    // Build node tabs
    let baseURL = '#' + contentType + '/' + ( requestedItemId ? requestedItemId : 'new' ) + '/';
    let links = [{ 'op':'edit', 'label':'עריכה' }];
    if ( true ) { // TODO: check i18n support
      links.push({ 'op':'en', 'label':'תרגום' });
    }
    links.push({ 'op':'seo', 'label':'SEO' });

    switch ( op ) {
    case 'delete':
      parentElement.innerHTML = `
        <div>
          <h3>האם אתה בטוח שברצונך למחוק פריט זה?</h3>
          <div>
            <button id='approveDelete'>כן</button>
            <button className='cancel' onclick="location.href='#${ contentType }/all'">לא</button>
          </div>
        </div>`;
      parentElement.querySelector('#approveDelete').onclick = function(event){
        //TODO: Support delete
        alert('TODO: currently unsuported!')
      }
      break;
      case 'edit':
      case 'new':
      case 'en':  
      case 'seo':
        // Set Fields By OP type
        let formFields =  JSON.parse(JSON.stringify(typeData.fields));
        switch( op ) {
          case 'edit':
            formFields.unshift({name: "id", label: "מזהה", type: "id"});
          break;
          case 'en':
            formFields = formFields.filter( f=>f.i18n!==false );
            formFields.forEach( f => f.name = op+'_'+f.name );
          break;
          case 'seo':
            formFields = utils.getGlobalVariable('SEOFields');
          break;
        }

        parentElement.innerHTML = `<h1>עריכת ${typeData.label}</h1>
        <ul class="nav nav-tabs">
          ${ links.map(field=>
            `<li class="nav-item">
              <a class="nav-link ${ field.op==op ? 'active' : '' }" href='${baseURL+field.op}'>${field.label}</a>
            </li>`).join('') }
        </ul>`;
        

        let form = document.createElement('form');
        
        parentElement.appendChild(form);
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
                      editedItem.id = v.target.value;
                      urlPreview.innerText =  getItemURL(true);
                  };
                  fieldDiv.appendChild(idInput);
                  let urlPreview = document.createElement('span');
                  urlPreview.className = 'siteUrlPreview'
                  urlPreview.innerText =  getItemURL(true);
                  fieldDiv.appendChild(urlPreview);
                break;
                case 'wysiwyg':
                case 'textfield':
                  let textarea = document.createElement('textarea');
                  textarea.id='formitem_'+ field.name;
                  textarea.name= field.name;
                  textarea.placeholder= field.placeholder;
                  textarea.value = editedItem[field.name] ? editedItem[field.name] : '';
                  fieldDiv.appendChild(textarea);
                  fieldDiv.onchange = function(event){
                    editedItem[field.name] = event.target.value;
                  }

                  if ( field.type == 'wysiwyg' ) {
                    var suneditor = SUNEDITOR.create('formitem_'+ field.name , {
                      buttonList: [
                          ['undo', 'redo'],
                          ['align', 'horizontalRule', 'list', 'table', 'fontSize']
                      ],
                    });
                    suneditor.onChange = function(htmlValue){
                      editedItem[field.name] = htmlValue;
                    }
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

                    editedItem[field.name] = getItemURL(false)+ '/'+field.name+'.'+this.files[0].name.split('.').pop();
                    var reader = new FileReader();
                    let previewElement = this.parentElement.querySelector('.preview');
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
            gotoItemsList();
          }
        }
        let submitButton = document.createElement('button');
        submitButton.className = 'submit';
        submitButton.innerText = 'שמור';

        /**
         * Submit item
         */
        submitButton.onclick = commitItem;
        submitButtons.appendChild(submitButton);
        submitButtons.appendChild(cancelButton);      
        form.appendChild(submitButtons);

        form.onsubmit = function(event){
          submitButtons.disabled = true; 
          event.preventDefault();
        }
      break;
      case 'rebuild':
        commitItem();
        console.log('aaaaa');
      break;
    }
    
  }

  /**
   * Close edit page (navigate to content type list)
   */
  let gotoItemsList = function() {
    location.hash = contentType+'/all';
  }
  
  /**
   * Commit changes to the git repository
   */
  let commitItem = function(){
    // Object JSON file 
    /*** index.json ***/
    let files = [
      {
        "content":  JSON.stringify(editedItem),
        "filePath": getItemURL(false)+'/index.json',
        "encoding": "utf-8" 
      },
    ];

    /*** index.html ***/
    // TODO: Take laguages from settings...
    renderPageHTML(['', 'en'])
    .then(htmlFiles=>{ 
      return files.concat(htmlFiles); 
    })
    /*** Add Attachments ***/
    .then( files => {
      if ( editedItem.files.length == 0 )  return files;
      let attachments = Object.keys(editedItem.files).map( fieldName => ({
          "content":  editedItem.files[fieldName],
          "filePath": editedItem[fieldName],
          "encoding": "base64" 
      }));
      return files.concat(attachments);
    })
    /*** Update Searchable List ***/ 
    .then( files => {
      return getUpdatedSearchFile('search/'+contentType+'.json').then( searchFiles => {
        return  files.concat(searchFiles);
      })
    })
    
    /*** invoke API  ***/
    .then( files =>{
      console.log(files);
      let APIconnect = utils.getGlobalVariable('gitApi');
      return APIconnect.commitChanges('Save '+ contentType +': ' + editedItem.id , files)            
    })
    .then( res=>{
      gotoItemsList();
    });
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

  let renderPageHTML = async function( languages ) {
    return Promise.all([
      fetch('templates/base.html').then(result=> result.text()),
      fetch('templates/genericInner.html').then(result=> result.text()),
    ])
    .then( templates =>{
      return Promise.all( languages.map( language =>{
        if(language!='') {
          let translatedObject = { 
            id:editedItem.id, 
            files: editedItem.files 
          };
          typeData.fields.forEach( f => { 
            if( f.i18n === false ) {
              translatedObject[f.name] = editedItem[f.name]
            }
            else {
              translatedObject[f.name] = editedItem[language+'_'+f.name]
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
          "filePath": (language!=''?language+'/':'')+getItemURL(false)+'/index.html',
          "encoding": "utf-8" 
        }
      }));
    }) 
  }

  // load item & render form
  loadItem(renderForm);
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
