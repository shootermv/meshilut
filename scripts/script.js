async function createCommit() {
    try {
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
document.addEventListener("DOMContentLoaded", function(event) { 
   
});