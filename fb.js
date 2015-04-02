window.fbAsyncInit = function() {
  FB.init({
    appId      : '1572405616357300',
    xfbml      : true,
    version    : 'v2.3',
    status     : false
  });

  /*      <script type="text/javascript" src="js/app.js">
  <script>
*/

  // Place following code after FB.init call.

  function onLogin(response) {
    if (response.status == 'connected') {
      //      FB.api('/me?fields=first_name', function(data) {
      //        var welcomeBlock = document.getElementById('fb-welcome');
      //        welcomeBlock.innerHTML = 'Hello, ' + data.first_name + '!';
      //      });
      //
      FB.api('/me/permissions', function(data) {
        console.log(data);
      });

      FB.api('/me?fields=birthday', function(data) {
        console.log(data);
        var welcomeBlock = document.getElementById('fb-welcome');
        welcomeBlock.innerHTML = 'Hello, ' + data.birthday + '!';
      });

    }
  }

  FB.getLoginStatus(function(response) {
    // Check login status on load, and if the user is
    // already logged in, go directly to the welcome message.
    if (response.status == 'connected') {
      onLogin(response);
    } else {
      // Otherwise, show Login dialog first.
      FB.login(function(response) {
        onLogin(response);
      }, {scope: 'user_friends, email, user_birthday'});
    }
  });

  // ADD ADDITIONAL FACEBOOK CODE HERE
};

(function(d, s, id){
  var js, fjs = d.getElementsByTagName(s)[0];
  console.log(js, fjs);
  if (d.getElementById(id)) {return;}
  js = d.createElement(s); js.id = id;
//  js.src = "//connect.facebook.net/en_US/sdk.js";
  js.src = "//connect.facebook.net/en_US/sdk/debug.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



// https://developers.facebook.com/docs/javascript/reference/FB.ui/
// SHARE ON WALL
//FB.ui(
//  {
//    method: 'share',
//    href: 'https://daysoftheyear.com',
//  },
//  function(response) {
//    if (response && !response.error_code) {
//      alert('Posting completed.');
//    } else {
//      alert('Error while posting.');
//    }
//  }
//);


//The Share Dialog allows someone to post a link or Open Graph story to their profile.
//The Login Dialog allows someone to use Facebook Login to grant permissions to an app.
//The Add Page Tab Dialog allows someone to add an app to a tab on a Facebook Page which they admin.
//The Friends Dialog allows someone to send a friend request to another person on Facebook.
//The Requests Dialog allows someone to send a request to one or more of their friends from a game.
//The Send Dialog allows someone to send a Facebook Message to one or more of their friends.

// REVOKE PERMISSIONS
//      FB.api('/me/permissions', 'delete', function(data) {
//        console.log(data);
//        var welcomeBlock = document.getElementById('fb-welcome');
//        welcomeBlock.innerHTML = 'Hello, ' + data.birthday + '!';
//      });
