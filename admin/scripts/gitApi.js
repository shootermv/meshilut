function GitHubAPI (loginParams, onSuccess, onFailure) {
  
  this.treeItems = [];

  // Init API Object
  let apiRefferance = this;

  this.github = new Octokat({ 'token': loginParams.token });

  this.github.repos('arielberg', 'meshilut').fetch().then(e=>{
    this.repo = e;
    return e.git.refs('heads/master').fetch();
  }).then(e=>{
    this.main = e;
  }).then(r=>{
    onSuccess(apiRefferance);
  }).catch(exception=>{
    if( exception.message.match(/\"message\": \"(.*)\"/).length > 0 ){
      onFailure(exception.message.match(/\"message\": \"(.*)\"/)[1]);
      return;
    }
    onFailure( exception );
  });
    
  
  /**
   * Add file to queue
   */
  this.addFile = async function( fileContent , filePath ) {
    
    let markdownFile = await repo.git.blobs.create({
      "content": fileContent,
      "encoding": "utf-8"
    });
    this.treeItems.push({
      path: filePath,   
      sha: markdownFile.sha,
      mode: "100644",
      type: "blob"
    });
  }

  this.commitChanges = async function( commitMessage ) {
    try {        
        let tree = await repo.git.trees.create({
          tree: this.treeItems,
          base_tree: main.object.sha
        });
    
        let commit = await repo.git.commits.create({
        message: commitMessage,
        tree: tree.sha,
        parents: [main.object.sha]});
    
        main.update({sha: commit.sha})
    } 
    catch (err) {
      console.error(err);
    }
  }
}