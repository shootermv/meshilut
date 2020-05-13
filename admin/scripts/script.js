let dataStore;
let messages = [];
let token = '';

class LoginComponent extends React.Component {
  constructor(props) {
    super(props); 
    
    if (  localStorage.getItem('token' ) && localStorage.getItem('data' ) ) {
      dataStore = JSON.parse(localStorage.getItem('data' ));
      token = localStorage.getItem('token' );
      document.getElementById('pageWrapper').classList.remove('hideLeftBar');
      location.href = '#posts';
    }
  }

  handleSubmit(event) {    
    event.preventDefault();
    token = event.target.elements.token.value;
    fetch('../data.json').then(function(res){
      try {
        if (res.ok) {
          res.json().then(function(jsonResponse){
            dataStore =  jsonResponse;
            localStorage.setItem('token', token );
            localStorage.setItem('data', JSON.stringify(dataStore));
            location.href = '#posts';
            document.getElementById('pageWrapper').classList.remove('hideLeftBar');
          });
        } else { 
          throw new Error(res);
        }
      }
      catch (err) {
        console.log(err.message);
      }
    });
   
  }

  render() {
    return (
      <form className='loginForm' onSubmit={this.handleSubmit}>
        <h3>התנועה למשילות - כניסה לממשק ניהול</h3>
        <div><label>שם:</label><input name="name" type="text" placeholder="שם משתמש" /></div>
        <div><label>סיסמא:</label><input name="token" type="text" placeholder="סיסמא" /></div>
        <input type="submit" value="היכנס" />
      </form>
    )
  }
}

class Post extends React.Component {
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
          <div><label>תמונה:</label><input name="name" type="text" placeholder="שם משתמש" /></div>
          <input type="submit" value="שמור" />
        </form>
      )
    }
  }
}

class PostsList extends React.Component { 
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

class Message extends React.Component { 
  constructor(props) {
    super(props); 
  }
  render() {
    return (
      <div className={ "alert alert-" + this.props.type }>{ this.props.message }</div>
    )
  }
}

window.onload = function(e){ 
  React.render(
    <LoginComponent/>,
    document.getElementById('content')
  );
}


window.onhashchange = function(){
  if ( dataStore ) {
    routeToCall(window.location.hash);
  }
};

/**
 * Simplest router...
 **/
function routeToCall(hash){
  let itemId;
  switch(true) {
    case /#post\/\d+/.test(hash):
      itemId = hash.match(/#post\/(\d+)/)[1];
      React.render(
        <Post id={itemId} />,
        document.getElementById('content')
      );
    break;
    case /#delete\/\d+/.test(hash):
      itemId = hash.match(/#delete\/(\d+)/)[1];
      React.render(
        <Post id={itemId} doDelete="true" />,
        document.getElementById('content')
      );
    break;
    case '#newPost'==hash:
      React.render(
        <Post/>,
        document.getElementById('content')
      );
    break;
    case '#logout'==hash:
      localStorage.removeItem('token');
      localStorage.removeItem('data');
      location = '';
    break;
    case '#posts'==hash:
    default:
      React.render(
        <PostsList/>,
        document.getElementById('content')
      );
    break;
  }
  
}

async function updateData() {
  try {
    const github = new Octokat({'token': token }); 
    let repo = await github.repos('arielberg', 'meshilut').fetch();
    let main = await repo.git.refs('heads/master').fetch();
    let treeItems = [];


    let markdownFile = await repo.git.blobs.create({
        "content": JSON.stringify(dataStore),
        "encoding": "utf-8"
    });

    treeItems.push({
      path: 'data.json',   
      sha: markdownFile.sha,
      mode: "100644",
      type: "blob"
    });

    let tree = await repo.git.trees.create({
      tree: treeItems,
      base_tree: main.object.sha
    });

    let commit = await repo.git.commits.create({
      message: `Created via Web 1`,
      tree: tree.sha,
      parents: [main.object.sha]});

    main.update({sha: commit.sha})

    
    React.render(
      <Message type='success' message='נשמר בהצלחה' />,
      document.getElementById('messages')
    );

  } catch (err) {
      console.error(err);
      React.render(
        <Message type='danger' message='שמירה נכשלה' />,
        document.getElementById('messages')
      );
  }
}

async function createCommit() {
  try {
  
      const github = new Octokat({ 'token': token });
      
      let repo = await github.repos('arielberg', 'meshilut').fetch();
      let main = await repo.git.refs('heads/master').fetch();
      let treeItems = [];
  
  
      let markdownFile = await repo.git.blobs.create({
          "content": "תוכן הפוסט",
          "encoding": "utf-8"
      });

      treeItems.push({
        path: 'te.tete',   
        sha: markdownFile.sha,
        mode: "100644",
        type: "blob"
      });
  
      let tree = await repo.git.trees.create({
        tree: treeItems,
        base_tree: main.object.sha
      });
    
      let commit = await repo.git.commits.create({
        message: `Created via Web 1`,
        tree: tree.sha,
        parents: [main.object.sha]});
  
      main.update({sha: commit.sha})
  
      React.render(
        <Message type='success' message='נשמר בהצלחה' />,
        document.getElementById('messages')
      );

  
  } catch (err) {
      console.error(err);
      React.render(
        <Message type='danger' message='שמירה נכשלה' />,
        document.getElementById('messages')
      );
  }
}