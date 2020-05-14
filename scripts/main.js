var cssFiles = [    "/css/style.css",
                    "/css/main.css",
                    "/css/index.css",
                    "/css/font-awesome.min.css",
                    "/css/font-awesome.all.min.css",
                    "/css/bootstrap.min.css",
                    "https://fonts.googleapis.com/css?family=Varela+Round%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CHeebo%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CAmatic+SC%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CPT+Sans%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CRoboto%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic%7CMontserrat%3A100%2C100italic%2C200%2C200italic%2C300%2C300italic%2C400%2C400italic%2C500%2C500italic%2C600%2C600italic%2C700%2C700italic%2C800%2C800italic%2C900%2C900italic&amp;subset=hebrew&amp;ver=5.3"];

cssFiles.forEach(cssFile=>{
    var link = document.createElement( "link" );
    link.href = cssFile;
    link.type = "text/css";
    link.rel = "stylesheet";
    link.media = "screen,print";
    document.getElementsByTagName( "head" )[0].appendChild( link );
});

class PostList extends React.Component {
    constructor(props) {
        super(props); 
    }

    render() {
        
        return (
            <ul>
                <li>asd</li>
                <li>asd</li>
                { this.props.items.map(function(post){
                    return <li><a href={'post/'+post.id}>{post.title}</a></li>;
                })}
            </ul>
        )
    }
}

// favIcon
var link = document.createElement( "link" );
link.setAttribute('rel','icon');
link.setAttribute('sizes','16x16');
link.href = "/favicon.ico";
document.getElementsByTagName( "head" )[0].appendChild( link );

let dataStore;
let getDataList = function(category , callback) {
    
    if ( localStorage.getItem('data') ) {
        dataStore =  localStorage.getItem('data');
        callback( dataStore[category] );
    }
    else {
        fetch('../data.json').then(function(res){
            try {
              if (res.ok) {
                res.json().then(function(jsonResponse){
                    dataStore =  jsonResponse;
                    //localStorage.setItem('data', JSON.stringify(dataStore));
                    callback( dataStore[category] );
                });
              } 
            }
            catch (err) {
                return {error:err.message};
            }
        });
    }
}