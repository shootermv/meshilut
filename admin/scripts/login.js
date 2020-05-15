class LoginComponent extends React.Component {
    constructor(props) {
      super(props); 
      this.loginError = "";
      if (  localStorage.getItem('secret' ) ) {
        this.checklogin();
      }
    }
  
    checklogin() {
        gitApi = new gitAPI(
          localStorage.getItem('secret'),
          function(){
            document.getElementById('pageWrapper').classList.remove('hideLeftBar');
            routeToCall();
          },
          function(errorMessage){
            this.loginError = errorMessage;
          }
        );
    }

    handleSubmit(event) {    
      event.preventDefault();
      localStorage.setItem( 'secret', event.target.elements );
      this.checklogin();
    }
  
    render() {
      return (
        <form className='loginForm' onSubmit={this.handleSubmit}>
          <h3>התנועה למשילות - כניסה לממשק ניהול</h3>
          <div><label>שם:</label><input name="name" type="text" placeholder="שם משתמש" /></div>
          <div><label>סיסמא:</label><input name="token" type="text" placeholder="סיסמא" /></div>
          <input type="submit" value="היכנס" />
        </form>
      )
    }
}