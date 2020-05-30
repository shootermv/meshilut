require('./contentItem.mjs');

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "meshilut"
});

function onSuccess(items) {
    let recordById = {};
    items.forEach(item=>recordById[item.ID] = item);
    let postsById = {};
    Object.keys(recordById).forEach(recordId => {
        postName = recordById[recordId].post_title;
        if (! postName ) postName = '---';
        postParent = recordById[recordId].post_parent;
        content = recordById[recordId].post_content;
       
        if ( Object.keys(postsById).indexOf(postParent) == -1 ) { // new post
            let newPost = {
                id: recordId,
                name: postName,
                body: content
            };
            postsById[recordId] = newPost;
            
        }
        else { //Post Revision
            postsById[postParent].title = postName
            postsById[postParent].body = content
        }
    });

    Object.keys(postsById).forEach(postId=>{
    
        fs = require('fs');
        fs.mkdir('post/'+postId, { recursive: true }, (err) => {
            if (err) throw err;
        });
        
        fs.writeFile('post/'+postId+'/index.json', JSON.stringify(postsById[postId]), function (err) {
            if (err) throw err;
            console.log('Saved!');
          });
    });



       /*
       

        if postParent in postsById:
            print ('inn ')
            postsById[postParent].body=content
            postsById[postParent].save()
            print ('out ')
            '''
            LogEntry.objects.log_action(
                user_id = 1,
                content_type_id = ContentType.objects.get_for_model(postsById[postParent]).pk,
                object_id       = postsById[postParent].pk,
                object_repr = force_unicode(model),
                action_flag = CHANGE,
                change_message='change by WP'
            )
            '''
        else:
            postsById[recordId] = Post.objects.create(title=postName, body=content)
            print (postsById[recordId])
    console.log('aa----');
    */
}

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM wp4c_posts where post_type IN ('post','revision') LIMIT 10", function (err, result, fields) {
    if (err) throw err;
    onSuccess(result);
  });
});

