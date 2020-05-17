function GitHubAPI (loginParams, onSuccess, onFailure){

    this.github = new Octokat({ 'token': loginParams.token });
    // this.repo = github.repos('arielberg', 'meshilut').fetch();
    // this.main = repo.git.refs('heads/master').fetch();
    setGlobalVariable( 'gitApi', this );
    onSuccess();
    
    
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
}