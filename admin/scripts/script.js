/**
 * Load settings file (JSON). 
 * called from the page loader flow
 */
var loadSystemFile = function( variableName , filePath, onSuccess , onError ) {

  if ( localStorage.getItem(variableName) ) {
    window[variableName] = JSON.parse(localStorage.getItem(variableName));
    onSuccess();
    return;
  }

  window[variableName] = {};
  
  fetch(filePath)
    .then(function(response){
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response.json();
    }).then(function(json){
        window[variableName] = json;
        onSuccess();
      })
    .catch(function(error) {
      onError();
    });
}

/*
* Get system variable 
* all variables should be set using this functions
*/
var setGlobalVariable = function(variableName, variableValue){
  window[variableName] = variableValue;
}

/*
* Get system variable 
* all variables should be accessed using this functions
*/
var getGlobalVariable = function(variableName) {
  return window[variableName];
}

/**
 * Simplest router...
 * Create a page loading flow
 **/
let regexExpressions =  {};

function routeToCall(){

  let hash = window.location.hash;
 
  switch(true) {
    /** Page loader - init variables **/
    case !getGlobalVariable('logStore'):
      console.log('logStore');
      setGlobalVariable( 'logStore', {} );
      routeToCall();
    break;
    case !getGlobalVariable('gitApi'):
      console.log('gitApi');
      doLogin(document.getElementById('content'));
    break;
    case !getGlobalVariable('dataStore'):
      console.log('dataStore');
      loadSystemFile( 'dataStore', '../dataStore.json' , routeToCall, routeToCall );
    break;
    case !getGlobalVariable('contentTypes'):
      console.log('contentTypes');
      loadSystemFile( 'contentTypes', './contentTypes.json', function(){
        if( getGlobalVariable('contentTypes').length > 0 ) {
          var contentTypesSingle = '(' + getGlobalVariable('contentTypes').map(a=>a.name).join('|') +')';
          regexExpressions.singleItemEdit = new RegExp('#'+contentTypesSingle+'\\/(\\d+)',"g");
          regexExpressions.singleItemNew = new RegExp('#'+contentTypesSingle+'\\/new',"g");
          console.log(regexExpressions.singleItem);
        }
        routeToCall();
      }, routeToCall );
    break;
    /** Content Item management **/
    case regexExpressions.singleItemEdit.test(hash):
      console.log('post by id');
      itemId = hash.match(/#post\/(\d+)/)[1];
      document.getElementById('content').innerHTML = 'contentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItemcontentItem';
      '<contentItem id={itemId} />';
      // document.getElementById('content')
    
    break;
    case /#delete\/\d+/.test(hash):
      console.log('delete post');
      itemId = hash.match(/#delete\/(\d+)/)[1];
      contentItemForm(document.getElementById('content'), 'post',111);
      /*
        '<contentItem id={itemId} doDelete="true" />',
        document.getElementById('content')
        */
    break;
    case regexExpressions.singleItemNew.test(hash):
      console.log('post form');
      contentItemForm(document.getElementById('content'), 'post',111);
    break;
    case '#logout'==hash:
      localStorage.removeItem('token');
      localStorage.removeItem('secret');
      localStorage.removeItem('data');
      location = '';
    break;
    case '#posts'==hash:
    default:
      console.log('post list');
      contentList(document.getElementById('content'), 'posts');
    break;
  }
}

class Message  { 
  render() {
    return (
      '<div className={ "alert alert-" + this.props.type }>{ this.props.message }</div>'
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

    
    /*React.render(
      "<Message type='success' message='נשמר בהצלחה' />",
      document.getElementById('messages')
    );
    */

  } catch (err) {
      console.error(err);
      /*
      React.render(
        "<Message type='danger' message='שמירה נכשלה' />",
        document.getElementById('messages')
      );
      */
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
      /*
      React.render(
        "<Message type='success' message='נשמר בהצלחה' />",
        document.getElementById('messages')
      );
      */

  
  } catch (err) {
      console.error(err);
      /*
      React.render(
        "<Message type='danger' message='שמירה נכשלה' />",
        document.getElementById('messages')
      );
      */
  }
}