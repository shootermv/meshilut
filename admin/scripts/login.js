/**
 * Handle login ( using GIT credentials )
 * Currently only GitHub is supported.
 */
function doLogin( parentComponent ) {

  /**
   * When secret exists. Creates the GitAPI Object
   */
  this.createAPIObject = function() {
    gitApiName = getGlobalVariable('appSettings');

    // invoke API class
    window[gitApiName['API_Gate']](
      getLocalStorage( 'secret'),
      function(){
        document.getElementById('pageWrapper').classList.remove('hideLeftBar');
        routeToCall();
      },
      function(errorMessage){
        localStorage.removeItem('secret');
        loadLoginForm(errorMessage);
      }
    );
  };

  /**
   * Render the login form. should be called if secret not exists and re-render on 
   * error
   * @param {*} errorMessage 
   */
  let loadLoginForm = function( errorMessage ) {
    // create login form
    parentComponent.innerHTML = `<form className='loginForm'>
                                  <h3>התנועה למשילות - כניסה לממשק ניהול</h3>
                                  ${ errorMessage ? `<div class="alert alert-danger" role="alert">${errorMessage}</div>` : '' }
                                  <div><label>שם:</label><input name='name' type='text' placeholder='שם משתמש' /></div>
                                  <div><label>סיסמא:</label><input name='token' type='text' placeholder='סיסמא' /></div>
                                  <input type='submit' value='היכנס' />
                                </form>`;
                              
    // form callback
    parentComponent.children[0].onsubmit = function(event) {  
      event.preventDefault();
      setLocalStorage( 'secret', {'token':event.target.token.value });
      createAPIObject();
    }
  }

  // User already submitted his credentials
  if (  localStorage.getItem('secret' ) ) {

    createAPIObject();

  }
  // User has not submitted his credentials
  else {
    loadLoginForm();
  }
}