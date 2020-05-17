/**
 * Create a form for editing/adding content item
 * @param {*} contentType 
 * @param {*} editId 
 */
function contentItemForm ( parentElement, contentType , editId , op ) {
  
  // is new item
  this.isNew = true;
  this.typeData = getGlobalVariable('contentTypes').find(ty=>ty.name==contentType);
  this.item = {};
  if ( editId ) {
    this.item = dataStore[contentType].find(p=>p.id == editId);
    this.isNew = false;
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
  
   
  if ( op == 'delete' ) {
    parentElement.innerHTML = `
      <div>
        <h1>האם אתה בטוח?</h1>
        <div>
          <button>כן</button>
          <button className='cancel' onclick="location.href='#posts'">לא</button>
        </div>
      </div>`;
  }
  else {
    parentElement.innerHTML = `
      <h1>עריכת ${this.typeData.label}</h1>
      <form className="postForm" onSubmit={this.handleSubmit}>
        <div><span>מזהה:</span><span>${editId}</span></div>
        <div><label>כותרת:</label><textarea name="title" placeholder="כותרת הפוסט"  >${item.title}</textarea></div>  
        <div><label>תוכן:</label><textarea id='sample' name="body" placeholder="גוף הפוסט" >${item.body}</textarea></div>  
        
        <div><label>תמונה:</label><input name="name" type="file" onchange={this.handleChange}  /></div>
        <input type="submit" value="שמור" />
      </form>
      
      `;
      
      SUNEDITOR.create('sample', {
        buttonList: [
            ['undo', 'redo', 'removeFormat'],
            ['align', 'fontSize', 'hiliteColor'],
            ['horizontalRule', 'image', 'template']
        ],
      });
  }
}
  
function contentList(parentElement, contentType) {
  let dataStore = getGlobalVariable('dataStore');
  if( dataStore[contentType] == null ) { dataStore[contentType] = []; }
  this.typeData = getGlobalVariable('contentTypes').find(ty=>ty.name==contentType);
  parentElement.innerHTML = `<div>
      <h1>${ this.typeData.labelPlural }</h1>
      <table>
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
            <td>${item.body}</td>
            <td><a href=${'#post/'+item.id}>ערוך</a></td>
            <td><a href=${'#post/'+item.id+'/delete'}>מחק</a></td>
          </tr>` ).join("")}        
      </table>
    </div>`;
}