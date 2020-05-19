/**
 * Create a form for editing/adding content item
 * @param {*} contentType 
 * @param {*} editId 
 */
var editedItem = {};

function contentItemForm ( parentElement, contentType , editId , op ) {

  // Get content type data description
  this.typeData = getGlobalVariable('contentTypes').find ( ty => ty.name==contentType );

  /** load edit item if needed (item is kept between tabs) */
  debugger;
  if ( editedItem.id != editId || editedItem.type != contentType ) {
    editedItem = {};
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

  let InnerHTML =  `
  <h1>עריכת ${this.typeData.label}</h1>
  <ul class="nav nav-tabs">
    ${ links.map(field=>
      `<li class="nav-item">
        <a class="nav-link ${ field.op==op ? 'active' : '' }" href='${baseURL+field.op}'>${field.label}</a>
      </li>`).join('') }
  </ul><form >`;
  let wysiwygs = [];

  switch ( op ) {
   case 'delete':
    InnerHTML+= `
      <div>
        <h3>האם אתה בטוח שברצונך למחוק פריט זה?</h3>
        <div>
          <button>כן</button>
          <button className='cancel' onclick="location.href='#${ contentType }/all'">לא</button>
        </div>
      </div>`;
  break;
  case 'edit':
  case 'new':
  case 'en':  
    InnerHTML+=`${  editedItem.Id  ? `<div><span>מזהה:</span><span>${ editedItem.Id }</span></div>`: "" }
        ${this.typeData.fields.map(function(field){
          let fieldHTML = `<div>`;
          fieldHTML += `<label>${ field.label }</label>`;
          if (op == 'en' && field.i18n===false ) return '';
          switch(field.type){
            case 'wysiwyg':
              wysiwygs.push( 'formitem_'+ field.name );
            case 'textfield':
              fieldHTML += `<textarea id='formitem_${ field.name }' name='${ field.name }' placeholder='${ field.placeholder }' >${ editedItem[field.name] ? editedItem[field.name] : '' }</textarea>`;
            break;
            case 'file':
              fieldHTML += `<div class='preview'></div><input id='formitem_${ field.name }' name="${ field.name }" type="file" />`;
            break;
          }
          fieldHTML += `</div>`;
          return fieldHTML;
        }).join('')} 
        <input type="submit" value="שמור" />
        <input type="button" class='cancel' value="בטל" />`;
    break;
    case 'seo':
      InnerHTML+=`<input type='text' />`;
    break;
    default:
  }  
  InnerHTML+=`</form>`;



  parentElement.innerHTML = InnerHTML;
  
  this.typeData.fields.forEach(field => {
    if ( field.type == 'wysiwyg' ) {
      SUNEDITOR.create('formitem_'+field.name , {
        buttonList: [
            ['undo', 'redo'],
            ['align', 'horizontalRule', 'list', 'table', 'fontSize']
        ],
      });
    }
    if ( field.type == 'file' ) {
      document.getElementById('formitem_'+field.name).onchange = function(event) {
        let fileList = this.files;
        let image = document.createElement("img");
        image.src = window.URL.createObjectURL(fileList[0]);
        image.setAttribute('style','max-width:200px;max-heigth:200px;');
        let previewElement = this.parentElement.querySelector('.preview');
        previewElement.innerHTML = '';
        previewElement.appendChild(image);

        var reader = new FileReader();
        reader.readAsText(fileList[0], "UTF-8");
        reader.onload = function (evt) {
           // evt.target.result;
        }
     }
    }
  });
  parentElement.querySelector('form').onsubmit = function(event){
    event.preventDefault();
  }
}
  
function contentList(parentElement, contentType) {
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