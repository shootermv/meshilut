/**
 * Create a form for editing/adding content item
 * @param {*} contentType 
 * @param {*} editId 
 */
function contentItemForm ( parentElement, contentType , editId , op ) {
  
  // is new item
  this.isNew = true;

  if ( editId ) {
   // Object.assign(props, ...dataStore.posts.find(p=>p.id == props.id));
    this.isNew = false;
  }
   
  this.handleSubmit = function(event) {    
    event.preventDefault();
    let postData =  this.state;
    if ( this.isNew ) {
      dataStore.posts.push( postData );
    }
    else {
      let post =  dataStore.posts.find(p=>p.id==postData.id);
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
          <button className='cancel' onclick="console.log('aaaa');location.href='#posts'">לא</button>
        </div>
      </div>`;
  }
  else {
    parentElement.innerHTML = `
      <form className="postForm" onSubmit={this.handleSubmit}>
        <div><span>מזהה:</span><span>${editId}</span></div>
        <div><label>כותרת:</label><textarea name="title" onChange={this.handleChange} placeholder="כותרת הפוסט"  >{this.state.title}</textarea></div>  
        <div><label>תוכן:</label><textarea name="body" onChange={this.handleChange} placeholder="גוף הפוסט" >{this.state.body}</textarea></div>  
        <div><label>תמונה:</label><input name="name" type="file" onchange={this.handleChange}  /></div>
        <input type="submit" value="שמור" />
      </form>
      `;
  }
}
  
function contentList(parentElement) {
  let dataStore = getGlobalVariable('dataStore');
  console.log(dataStore);
  parentElement.innerHTML = `<div>
      <h1>פוסטים</h1>
      <table>
        <tr>
          <th>כותרת</th>
          <th>כותרת</th>
          <th>כותרת</th>
          <th>כותרת</th>
        </tr>
        ${ dataStore.posts.map((item) => 
          `<tr>
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.body}</td>
            <td><a href=${'#post/'+item.id}>ערוך</a></td>
            <td><a href=${'#delete/'+item.id}>מחק</a></td>
          </tr>` )}        
      </table>
    </div>`;
}