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
    case !getGlobalVariable('appSettings'):
      setGlobalVariable( 'appSettings',  {
        'API_Gate':GitHubAPI
      });
      routeToCall();
    break;
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
          let contentTypesSingle = '(' + getGlobalVariable('contentTypes').map(a=>a.name).join('|') +')';
          regexExpressions.itemManagment = new RegExp('#'+contentTypesSingle+'\\/((\\d+)|new|all)',"i");
             
          getGlobalVariable('contentTypes').reverse().forEach(contentType => {
            document.getElementById('sidebarLinks').insertAdjacentHTML('afterbegin',  `
              <li><h3>${contentType.labelPlural}</h3></li>
              <li>
                <a class="nav-link" href="#${contentType.name}/all">כל ה${contentType.labelPlural}</a>
              </li>
              <li>
                <a class="nav-link" href="#${contentType.name}/new">הוסף ${contentType.label} חדש</a>
              </li>
              <hr/>
            `);
          });
        }
        routeToCall();
      }, routeToCall );
    break;
    /** Content Item management **/
    case regexExpressions.itemManagment.test(hash):
      console.log('Content Item');
      hash = hash.replace('#','');
      let params = hash.split('/');
      let contentType = params.shift();
      let op = 'new';
      let id = '';
      if (/^\d+$/.test(params[0])) {
        id = params[0];
        op = 'edit';
      }
      if (params[1] =='delete') {
        op = 'delete';
      }
      if( params[0] == 'all') {
        contentList(document.getElementById('content'), contentType );
        return;
      }
      contentItemForm(document.getElementById('content'), contentType ,id , op);
    break;
    case '#logout'==hash:
      localStorage.removeItem('token');
      localStorage.removeItem('secret');
      localStorage.removeItem('data');
      location = '';
    break;
    default:
      document.getElementById('content').innerHTML = 'error';
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