var dataStore;
class Post extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {title: '', body: '' , id: 1};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {    
    event.preventDefault();
    dataStore.posts.push( this.state );
    updateData();
  }

  handleChange(event) {
    this.state[event.target.name] =  event.target.value;
  }

  render() {
    return (
      <form className="postForm" onSubmit={this.handleSubmit}>
        <div><span>מזהה:</span><span>{this.state.id}</span></div>
        <div><label>כותרת</label><input name="title" onChange={this.handleChange} type="text" placeholder="כותרת הפוסט" value={this.state.name} /></div>
        <div><label>תוכן</label><textarea name="body" onChange={this.handleChange} placeholder="גוף הפוסט" /></div>
        <input type="submit" value="שמור" />
      </form>
    )
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
              <td>{post}</td>
            </tr>) 
          })}        
        </table>
      </div>
    )
  }
}


class message extends React.Component {
}

window.onload = function(e){ 
  fetch('data.json').then(function(res){
    try {
      if (res.ok) {
        res.json().then(function(jsonResponse){
          dataStore = jsonResponse;
          routeToCall(window.location.hash);
        });
      } else {
        throw new Error(res)
      }
    }
    catch (err) {
      console.log(err.message)
    }
  });
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
  switch(hash) {
    case '#posts':
      React.render(
        <PostsList/>,
        document.getElementById('content')
      );
    break;
    case '#newPost':
      React.render(
        <Post/>,
        document.getElementById('content')
      );
    break;
  }
  
}

//  TODO: Use ssh key for meshilut repo only
//        Delete this token!!!
const token = 'e36bcb738e1acab2a1114c2b391a734bb6db4c35';

async function updateData() {
  const github = new Octokat({ 'token': token }); 
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

  console.log('Posted');
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
  
      console.log('Posted');

  
  } catch (err) {
      console.error(err);
  }
}