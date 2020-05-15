class contentItem extends React.Component {
    constructor(props) {
      super(props); 
  
      this.isNew = true;
      if ( props.id ) {
        let postData = JSON.parse(JSON.stringify(dataStore.posts.find(p=>p.id == props.id)));
        Object.assign(props, postData);
        this.state = props;
        this.isNew = false;
      }
      else {
        this.state = {title: '', body: '' , id: (dataStore.posts[0].id + 1)};
      }
      
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }
  
    handleSubmit(event) {    
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
      location.href = '#posts';
    }
  
    handleChange(event) {
      this.state[event.target.name] =  event.target.value;
    }
  
    handleFileChange(event) {
      this.state[event.target.name] =  event.target.value;
    }
  
    render() {
      if ( this.state.doDelete ) {
        return (
          <div>
            <h1>האם אתה בטוח?</h1>
            <div>
              <button>כן</button>
              <button className='cancel' onclick="console.log('aaaa');location.href='#posts'">לא</button>
            </div>
          </div>
        )
      }
      else {
        return (
          <form className="postForm" onSubmit={this.handleSubmit}>
            <div><span>מזהה:</span><span>{this.state.id}</span></div>
            <div><label>כותרת:</label><textarea name="title" onChange={this.handleChange} placeholder="כותרת הפוסט"  >{this.state.title}</textarea></div>  
            <div><label>תוכן:</label><textarea name="body" onChange={this.handleChange} placeholder="גוף הפוסט" >{this.state.body}</textarea></div>  
            <div><label>תמונה:</label><input name="name" type="file" onchange={this.handleChange}  /></div>
            <input type="submit" value="שמור" />
          </form>
        )
      }
    }
  }
  
class itemList extends React.Component { 
  render() {
    return (
      <div>
        <h1>פוסטים</h1>
        <table>
          <tr>
            <th>כותרת</th>
          </tr>
          { dataStore.posts.map((post) => {     
            return (<tr>
              <td>{post.id}</td>
              <td>{post.title}</td>
              <td>{post.body}</td>
              <td><a href={'#post/'+post.id}>ערוך</a></td>
              <td><a href={'#delete/'+post.id}>מחק</a></td>
            </tr>) 
          })}        
        </table>
      </div>
    )
  }
}