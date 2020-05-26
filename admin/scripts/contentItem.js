/**
 * Create a form for editing/adding content item
 * 
 * TODO: Split to sub-functions
 * TODO: Support generic i18n
 * TODO: Show revisions
 */

let editedItem = {};
let itemFiles = []; 

function contentItemForm ( parentElement, contentType , editId , op ) {
  
  // Get content type data description
  let typeData = getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
  let appSettings = getGlobalVariable('appSettings');
  let siteUrl = appSettings['Site_Url'];
  /** load edit item if needed (item is kept between tabs) */
  if ( editedItem.id != editId || editedItem.type != contentType ) {
    editedItem = {};
    itemFiles = [];
    if ( editId != 'new' ) {
      editedItem = dataStore[contentType].find( p => p.id == editId );
    }
    // init to the default value
    typeData.fields.forEach(function(field){
      if ( field.defaultValue && !editedItem[field.name]){
        editedItem[field.name] = field.defaultValue ;
      }
    });

    editedItem.type = contentType;
    editedItem.id = editId;
  }
  let getItemURL = function( absoluteURL ){
    return (absoluteURL?siteUrl: '' ) + typeData.urlPrefix + editedItem.id;
  };

  this.handleSubmit = function(event) {    
    event.preventDefault();
    let postData =  this.state;
    if ( this.isNew ) {
      dataStore[contentType].push( postData );
    }
    else {
      let post =  dataStore[contentType].find(p=>p.id==postData.id);
      Object.assign(post, postData);
    }
    updateData();
    location.href = '#';
  }
  
  this.addFile = function(event) {
    this.state[event.target.name] =  event.target.value;
  }

  // Build node tabs
  let baseURL = '#' + contentType + '/' + ( editId ? editId : 'new' ) + '/';
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
          formFields = getGlobalVariable('SEOFields');
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
                    editedItem.id = siteUrl+v.target.value;
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
                fieldDiv.innerHTML += `<div class='preview'></div>`;
                let fileUploader = document.createElement('input');
                fieldDiv.appendChild(fileUploader);
                fileUploader.id='formitem_'+ field.name;
                fileUploader.name= field.name;
                fileUploader.type="file";
                fileUploader.onchange = function(event) {

                  editedItem[field.name] = field.name+'.'+this.files[0].name.split('.').pop();
                  var reader = new FileReader();
                  let previewElement = this.parentElement.querySelector('.preview');
                  previewElement.innerHTML = '';

                  reader.onload = function (evt) {
                    var contents = reader.result;
                    itemFiles[field.name] =  contents.substr(contents.indexOf(',') + 1); 

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
          alert('ok');
        }
      }
      let submitButton = document.createElement('button');
      submitButton.className = 'submit';
      submitButton.innerText = 'שמור';

      /**
       * Submit item
       */
      submitButton.onclick = function(){
              
        // Object JSON file 
        let files = [
          {
            "content":  JSON.stringify(editedItem),
            "filePath": getItemURL(false)+'index.json',
            "encoding": "utf-8" 
          },
        ];
        // Use template for item page
        fetch('templates/post.html')
          .then(result=>{
            return result.text();
          })
          .then( teplateText =>{
            let templateVars = {
              'item': editedItem    
            } 
            return new Function("return `"+teplateText +"`;").call(templateVars); 
          }) 
          .then(pageHTML=>{   
            // wrap with page       
            return fetch('templates/base.html').then(baseResult=>{
              return baseResult.text();
            }).then( baseTeplateText =>{
                  let templateVars = {
                    'content': pageHTML    
                  } 
                  return new Function("return `"+baseTeplateText +"`;").call(templateVars); 
                }).then(fullPageHtml => {
                  files.push({
                    "content":  fullPageHtml,
                    "filePath": getItemURL(false)+'index.html',
                    "encoding": "utf-8" 
                  });
                  return true;
                
            });          
        }).then( status=>{ // prepare commit 
          Object.keys(itemFiles).forEach(fieldName => {
            files.push({
              "content":  itemFiles[fieldName],
              "filePath": getItemURL(false)+editedItem[fieldName],
              "encoding": "base64" 
            });
          })
          let APIconnect = getGlobalVariable('gitApi');
          APIconnect.commitChanges('Save '+ contentType +': ' + editId, files)
                    .then(res=>{
                      console.log('done',res);
                    });
        });
      }
      submitButtons.appendChild(submitButton);
      submitButtons.appendChild(cancelButton);      
      form.appendChild(submitButtons);

      form.onsubmit = function(event){
        event.preventDefault();
      }
    break;
  }
}

/**
 * Display List of items (For the 'all' callback)
 * TODO: Add pager
 */
function contentList( parentElement, contentType ) {
  let dataStore = getGlobalVariable('dataStore');
  if( dataStore[contentType] == null ) { dataStore[contentType] = []; }
  let typeData = getGlobalVariable('contentTypes').find(ty=>ty.name==contentType);
  let innerHTML = '';
  if ( dataStore[contentType].length == 0 ) {
    innerHTML = `אין פריטים`;
  }
  else {
    innerHTML = `<table>
        <tr>
          <th>#</th>
          <th>כותרת</th>
          <th></th>
          <th>לינקים</th>
        </tr>
        ${ dataStore[contentType].map((item) => 
          `<tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td><a href=${'#post/'+item.id}>ערוך</a></td>
            <td><a href=${'#post/'+item.id+'/delete'}>מחק</a></td>
          </tr>` ).join("")}        
      </table>`;
  }
  parentElement.innerHTML = `<div>
      <h1>${ typeData.labelPlural }</h1>
      ${ innerHTML }
    </div>`;
}