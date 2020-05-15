var loadBaseFile = function( variableName , filePath ) {
  
  if ( localStorage.getItem(variableName) ) {
    window[variableName] = JSON.parse(localStorage.getItem(variableName));
    routeToCall();
    return;
  }

  window[variableName] = {}
  
  

  fetch(filePath)
    .then(function(res){
      if (!response.ok) {
          throw Error(response.statusText);
      }
      return response;
    }).then(function(res){
        window[variableName] = JSON.parse(jsonResponse);
        routeToCall();
      })
    .catch(function(error) {
      routeToCall();
    });
}

var setGlobalVariable = function(variableName, variableValue){
  window[variableName] = variableValue;
}

var getGlobalVariable = function(variableName){
  return window[variableName];
}

/**
 * Simplest router...
 **/
function routeToCall(){

  let hash = window.location.hash;
  let itemId;

  switch(true) {
    case !getGlobalVariable('logStore'):
      setGlobalVariable( 'logStore', {} );
      routeToCall();
    break;
    case !getGlobalVariable('gitApi'):
      React.render(
        <LoginComponent />,
        document.getElementById('content')
      );
    break;
    case !getGlobalVariable('dataStore'):
      loadBaseFile( 'dataStore', '../dataStore.json' );
      routeToCall();
    break;
    case !getGlobalVariable('contentTypes'):
      loadBaseFile( 'contentTypes', '../contentTypes.json' );
      routeToCall();
    break;
    case /#post\/\d+/.test(hash):
      itemId = hash.match(/#post\/(\d+)/)[1];
      React.render(
        <contentItem id={itemId} />,
        document.getElementById('content')
      );
    break;
    case /#delete\/\d+/.test(hash):
      itemId = hash.match(/#delete\/(\d+)/)[1];
      React.render(
        <contentItem id={itemId} doDelete="true" />,
        document.getElementById('content')
      );
    break;
    case '#newPost'==hash:
      React.render(
        <contentItem />,
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
        <itemList />,
        document.getElementById('content')
      );
    break;
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

window.onload = function(e) { 
  routeToCall();
}


window.onhashchange = function(){
  routeToCall();
};

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