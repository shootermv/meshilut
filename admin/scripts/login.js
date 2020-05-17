/**
 * Handle login ( using GIT credentials )
 * Currently only GitHub is supported.
 */
function doLogin( parentComponent ) {
  
  this.error = "";

  /**
   * When secret exists. Creates the GitAPI Object
   */
  this.createAPIObject = function() {
    gitApiName = getGlobalVariable('appSettings');
    gitApiName['API_Gate'](
      localStorage.getItem('secret'),
      function(){
        document.getElementById('pageWrapper').classList.remove('hideLeftBar');
        routeToCall();
      },
      function(errorMessage){
        this.loginError = errorMessage;
      }
    );
  };

 
  // User already submitted his credentials
  if (  localStorage.getItem('secret' ) ) {

    createAPIObject();

  }
  // User has not submitted his credentials
  else {
    
    // create login form
    parentComponent.innerHTML = "<form className='loginForm'>"+
                                "<h3>התנועה למשילות - כניסה לממשק ניהול</h3>"+
                                "<div><label>שם:</label><input name='name' type='text' placeholder='שם משתמש' /></div>"+
                                "<div><label>סיסמא:</label><input name='token' type='text' placeholder='סיסמא' /></div>"+
                                "<input type='submit' value='היכנס' />"+
                              "</form>";
                              
    // form callback
    parentComponent.children[0].onsubmit = function(event) {  
      event.preventDefault();
      localStorage.setItem( 'secret', event.target.elements );
      createAPIObject();

    }
  }
}