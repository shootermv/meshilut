async function GitHubAPI (loginParams, onSuccess, onFailure){
    this.files = [];
    
    this.addFile = async function ( ){
      let file = await repo.git.blobs.create({
        "content": "תוכן הפוסט",
        "encoding": "utf-8"});
      files.push(file );
    }

    try {
      this.github = new Octokat({ 'token': loginParams.token });
      this.repo = await github.repos('arielberg', 'meshilut').fetch();
      this.main = await repo.git.refs('heads/master').fetch();
      setGlobalVariable( 'gitApi', this );
      onSuccess();
    }
    catch( exception ) {
      if( exception.message.match(/\"message\": \"(.*)\"/).length > 0 ){
        onFailure(exception.message.match(/\"message\": \"(.*)\"/)[1]);
        return;
      }
      onFailure( exception );
    }
    
    
    this.commitChanges =  async function() {
        try {
              
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

    /*** */
    
    this.updateData = async function() {
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

}