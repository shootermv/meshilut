class Post extends React.Component {
  constructor(props) {
    super(props); 
    this.state = {title: '', body: '' , id: 1};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.title);
    event.preventDefault();
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

React.render(
  <Post/>,
  document.getElementById('content')
);


/**
 * Simplest router...
 *
function routeToCall(hash){
  var elem = document.createElement('div');
  switch(hash) {
    case '#posts':
      ['2','3','4'].forEach(function(i){
        var span = document.createElement('span');
        span.innerHTML = i;
        elem.appendChild(span);
      })
    break;
    case '#newPost':
      var post = new Post();
      elem.appendChild(post.formElement);
    break;
  }
  document.getElementById('content').innerHTML = '';
  document.getElementById('content').appendChild(elem);
}

class Post {
  constructor() { 
    this.formElement = document.createElement("form");
    this.formElement.id = 'postForm';
    
    var idDiv = document.createElement("div");
    var idLabel = document.createElement("span");
    idLabel.innerText = "מזהה: ";
    var idVal = document.createElement("span");
    idVal .innerText = '';
    
    var bodyDiv = document.createElement("div");
    var bodyLabel = document.createElement("label");
    bodyLabel.innerText = "תוכן";
    var bodyInput = document.createElement("textarea");

    var nameDiv = document.createElement("div");
    var nameLabel = document.createElement("label");
    nameLabel.innerText = "כותרת";
    var nameInput = document.createElement("input");
    nameInput.setAttribute("placeholder", 'הכנס את כותרת הפוסט');

    var bodyDiv = document.createElement("div");
    var bodyLabel = document.createElement("label");
    bodyLabel.innerText = "תוכן";
    var bodyInput = document.createElement("textarea");
    bodyInput.setAttribute("placeholder", 'הכנס את תוכן הפוסט');

    this.formElement.appendChild(idDiv);
    idDiv.appendChild(idLabel);
    idDiv.appendChild(idVal);

    this.formElement.appendChild(nameDiv);
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(nameInput);

    this.formElement.appendChild(bodyDiv);
    bodyDiv.appendChild(bodyLabel);
    bodyDiv.appendChild(bodyInput);

    var submitButton = document.createElement("button");
    submitButton.innerText = 'שמור';
    submitButton.onclick = function(){
      alert(this.title);
    }
    bodyDiv.appendChild(submitButton);
  }
  constructor(postId) { 
  }
}

async function createCommit() {
  try {
      //  TODO: Use ssh key for meshilut repo only
      //        Delete this token!!!
      const token = '80c23f7254088a09c86baa715667907b15c0a7e9';
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
      debugger;
      console.error(err);
      console.log(err);
  }
}
*/