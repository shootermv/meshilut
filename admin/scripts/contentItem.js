/**
 * Create a form for editing/adding content item
 * 
 * TODO: Split to sub-functions
 * TODO: Support generic i18n
 * 
 * @param {*} contentType 
 * @param {*} editId 
 */
let editedItem = {};
let itemFiles = []; 

function contentItemForm ( parentElement, contentType , editId , op ) {

  // Get content type data description
  this.typeData = getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );
  
  /** load edit item if needed (item is kept between tabs) */
  if ( editedItem.id != editId || editedItem.type != contentType ) {
    editedItem = {};
    itemFiles = [];
    if ( editId != 'new' ) {
      editedItem = dataStore[contentType].find( p => p.id == editId );
    }
    // init to the default value
    this.typeData.fields.forEach(function(field){
      if ( field.defaultValue && !editedItem[field.name]){
        editedItem[field.name] = field.defaultValue ;
      }
    });

    editedItem.type = contentType;
    editedItem.id = editId;
  }
  
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
      let formFields = this.typeData.fields;
      switch( op ) {
        case 'en':
          formFields = JSON.parse(JSON.stringify(formFields.filter( f=>f.i18n!==false )));
          formFields.forEach( f => f.name = op+'_'+f.name );
        break;
        case 'seo':
          formFields = getGlobalVariable('SEOFields');
        break;
      }

      parentElement.innerHTML = `<h1>עריכת ${this.typeData.label}</h1>
      <ul class="nav nav-tabs">
        ${ links.map(field=>
          `<li class="nav-item">
            <a class="nav-link ${ field.op==op ? 'active' : '' }" href='${baseURL+field.op}'>${field.label}</a>
          </li>`).join('') }
      </ul>`;
      if( editedItem.id !='new') {
        parentElement.innerHTML +=  `<div><span>מזהה:</span><span>${ editedItem.id }</span></div>`;
      }

      let form = document.createElement('form');
      parentElement.appendChild(form);
      formFields.forEach( function(field) {
            let fieldDiv = document.createElement('div');
            form.appendChild(fieldDiv);
            
            fieldDiv.innerHTML = `<label>${ field.label }</label>`;

            switch(field.type){
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
                  let fileList = this.files;
                  fileList[field.name] = field.name+'.'+fileList[0].name.split('.').pop();

                  var reader = new FileReader();
                  let previewElement = this.parentElement.querySelector('.preview');

                  reader.onload = function (evt) {
                    // preview image
                    let image = document.createElement("img");
                    image.src = reader.result;
                    image.setAttribute('style','max-width:200px;max-heigth:200px;');
                    
                    previewElement.innerHTML = '';
                    previewElement.appendChild(image);
                    editedItem[field.name] = reader.result;
                  }
                  reader.readAsDataURL(fileList[0]);
                  var r = new FileReader();
                  r.onload = function(e) { 
                    var contents = e.target.result;
                    console.log();
                    let files = [
                      {
                        "content":  window.btoa(window.atob((contents.replace(/^(.+,)/, '')))),
                        "filePath": 'test/image.jpeg',
                        "type": 'image',
                        "encoding": false 
                      },
                    ];
                    let APIconnect = getGlobalVariable('gitApi');
                    APIconnect.commitChanges('test image', files);
                  };
                  r.readAsDataURL(fileList[0]);
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
        let APIconnect = getGlobalVariable('gitApi');
        let itemDir =  contentType+'/'+editId+'/';
        
        let files = [
          {
            "content":  JSON.stringify(editedItem),
            "filePath": itemDir+'index.json',
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
          fetch('templates/base.html').then(baseResult=>{
            return baseResult.text();
          })
          .then( baseTeplateText =>{
            let templateVars = {
              'content': pageHTML    
            } 
            return new Function("return `"+baseTeplateText +"`;").call(templateVars); 
          }).then(fullPageHtml => {
            files.push({
              "content":  fullPageHtml,
              "filePath": itemDir+'index.html',
              "encoding": "utf-8" 
            }, )
            APIconnect.commitChanges('Save post: ' + editId, files);
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
  this.typeData = getGlobalVariable('contentTypes').find(ty=>ty.name==contentType);
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
      <h1>${ this.typeData.labelPlural }</h1>
      ${ innerHTML }
    </div>`;
}