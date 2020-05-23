function GitHubAPI (loginParams, onSuccess, onFailure) {

  // Init API Object
  let apiRefferance = this;

  this.github = new Octokat({ 'token': loginParams.token });

  this.github.repos('arielberg', 'meshilut').fetch()
    .then(e=>{
        this.repo = e;
        return e.git.refs('heads/master').fetch();
    })
    .then(e=>{
        this.main = e;
    })
    .then(r=>{
        onSuccess(apiRefferance);
    })
    .catch(exception=>{
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
    
    let markdownFile = await this.repo.git.blobs.create(fileContent);

   return {
      path: filePath,   
      sha: markdownFile.sha,
      mode: "100644",
      type: "blob"
    };
  }

  this.commitChanges = function( commitMessage, files ) {
     
    let treeItems = [];   

    // builf files
    Promise.all(
      files.map( fileDate => {
        let filePath = fileDate.filePath;
        delete fileDate.filePath;
        return this.addFile(fileDate, filePath);
      })
    )
    // call commit
    .then( filesTree =>{
      this.repo.git.trees.create({
        tree: filesTree,
        base_tree: this.main.object.sha
      }).then(tree=>{
        return this.repo.git.commits.create({
          message: commitMessage,
          tree: tree.sha,
          parents: [this.main.object.sha]})
      }).then(commit=>{
        this.main.update({sha: commit.sha});
      });
    });
  }
}