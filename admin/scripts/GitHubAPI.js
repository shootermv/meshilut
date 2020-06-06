function GitHubAPI (loginParams, onSuccess, onFailure) {

  // Init API Object
  let apiRefferance = this;
  
  // doLogin: 
  // TODO:
  // 1. Refactor this class
  // 2. Error handeling

  let octo = new Octokat({ 'token': loginParams.token });
  let repo = octo.repos('arielberg', 'meshilut');

  repo.fetch()
    .then(e=>{
        repo = e;
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


  
  function createBlob( path, content, encoding ) {
    return repo.git.blobs
        .create({ content: content, encoding: encoding, })
        .then(createdBlob => {
            console.log('blob created for '+ path);
            return { path: path,   
                     sha: createdBlob.sha,
                     mode: "100644",
                     type: "blob" }
        });
  }

  this.getFile = async function( path ) {
    return repo.contents(path).read();
  }

  /**
   * Todo: better support blob for binary files 
   */
  this.commitChanges = async function( commitMessage, files ) {

    return repo.git
        .refs('heads/master').fetch()
        .then(main=> {
         
          // build files
          return  Promise.all(
                    files.map( fileData => {
                      return createBlob( fileData.filePath, fileData.content , fileData.encoding);
                    })
                  )
                 // call commit
                .then( filesTree =>{
                  console.log('commit start - build tree');
                    repo.git.trees.create({
                      tree: filesTree,
                      base_tree: main.object.sha
                    }).then( tree => {
                      return repo.git.commits.create({
                        message: commitMessage,
                        tree: tree.sha,
                        parents: [this.main.object.sha] })
                    }).then( commit => {
                      console.log('tree has been added');
                      return this.main.update({sha: commit.sha});
                    });
                  });
       })
  }
}