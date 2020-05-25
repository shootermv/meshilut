function GitHubAPI (loginParams, onSuccess, onFailure) {

  // Init API Object
  let apiRefferance = this;
  
  //'Basic ' + base64encode(username + ':' + password);
        
  fetch('https://api.github.com/repos/arielberg/meshilut/contents', {
    method: 'GET', 
    headers: new Headers({
      'Authorization': "Token "+loginParams.token
    })
  })
  .then(response => {
    if ( response.status != 200 ) {
      console.log(response);
      throw 'Bad Cradentials';
    }
    return response.json();
  })
  .then(e=>{
        console.log(e);
        this.main = e;
  })
    .then(r=>{
        onSuccess(apiRefferance);
    })
    .catch(exception=>{
        onFailure( exception );
    });
    
  
  /**
   * Add file to queue
   */
  this.addFile = async function( fileContent , filePath ) {
    debugger;
    let markdownFile;
    switch( fileContent.type ) {
        case 'image':
          markdownFile = await this.repo.git.contents.create(fileContent);

          return {
              path: filePath,   
              sha: markdownFile.sha,
              mode: "100644",
              type: "blob"
          };

        case 'blob':
        default:
          markdownFile = await this.repo.git.blobs.create(fileContent);
  
          return {
              path: filePath,   
              sha: markdownFile.sha,
              mode: "100644",
              type: "blob"
          };
      }
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
      }).then( tree => {
        return this.repo.git.commits.create({
          message: commitMessage,
          tree: tree.sha,
          parents: [this.main.object.sha] })
      }).then( commit => {
        this.main.update({sha: commit.sha});
      });
    });
  }
}