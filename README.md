# General

This project is based upon [this tutorial](https://scalac.io/user-authentication-keycloak-1/) from [scalac.io](https://www.scalac.io). Furthermore does this Readme **not** provide information about how to set up a running Keycloak instance. Check out the official docs to get all the information you need to get up and running. Preferable via Docker - the quick and easy way! For your convenience is the `docker-compose.yml` file, that I use locally attached with which you can fire up a Keycloak 6.0.1. instance via `docker-compose up`.

# Server config

1. Create a new realm (in this demo `React_Demo`)
2. Create a new user (in this demo `john`). Be sure to be in the newly created realm!

   2.1. After creating the new user switch to its `Credentials` tab and set a password

   2.2. To validate if the newly created user works as intended open `localhost:8080/auth/realms/React_Demo/account` and log in

   2.3. Update the email, first and last name and hit `save`

3. Create a client in the Keycloak admin dashboard. A **client** is a (web) service that is allowed to authenticate or is already authenticated via a prior call. To do so open the _clients_ tab and hit the _create_ button. Fill out the _client id_ (in this demo it will be `my-react-client`). As we're going to create a React app on port `3000` we also fill the _root url_ with `http://localhost:3000`. The _client protocol_ stays untouched on `openid-connect` - now just hit `save` which brings you to the details page.

   3.1 The first important setting is the _access type_ which can have three possible settings: - `Bearer-only`: this is for services that rely solely on the bearer token included in the request and never initiate login on their own. It’s typically used for securing the back-end - `Confidential`: clients of this type need to provide a secret in order to initiate the login process - `Public`: since we have no real way of hiding the secret in a JS-based browser app, this is what we need to stick with

   3.2. Next comes Valid Redirect URIs – this is the URI pattern (one or more) which the browser can redirect to after completing the login process. For developing purposes you can leave this blank. But as we chose `public` in the last step you should restrict this in a real app!

   3.3. The last of the important options is Web Origins, which governs CORS requests. Again, for dev purposes the default value is fine.
   3.4. One last thing we’ll need is the client configuration to use with our app. Go to the Installation tab and select Keycloak OIDC JSON as the format. Download the generated JSON and keep it - you'll need this later on in the process.

# Creating the web app

We’re going to create a simple React-based app that allows the user to navigate between two components: one public and one that requires logging in.

To start with the app just hit `create-react-app keycloak-react` on you CLI. In case you haven't `create-react-app`installed you can do this via `npm install -g create-react-app`. After the init process for the project is done adjust the dependencies of it and run `npm install`:

```json
"dependencies": {
  ...
  "react-router-dom": "^5.0.1",
  "keycloak-js": "6.0.1"
}
```

_Please note: instead of downloading the Keycloak JavaScript adapter, it’s possible to include it directly from your Keycloak server (it’s hosted at /auth/js/keycloak.js), which has the added benefit of not having to worry about mismatched versions. However, React doesn’t play nice with remote URL imports, so it’s easier to do it this way._

To kickstart things of replace the content of `App.js` with this sceleton:

```javascript
import React, { Component } from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import Welcome from "./Welcome";
import Secured from "./Secured";
import "./App.css";

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="container">
          <ul>
            <li>
              <Link to="/">public component</Link>
            </li>
            <li>
              <Link to="/secured">secured component</Link>
            </li>
          </ul>
          <Route exact path="/" component={Welcome} />
          <Route path="/secured" component={Secured} />
        </div>
      </BrowserRouter>
    );
  }
}
export default App;
```

As you can surely see this is nothing more than a router between two pages. Create the first one `src/Welcome.js`:

```javascript
import React, { Component } from "react";

class Welcome extends Component {
  render() {
    return (
      <div className="Welcome">
        <p>This is your public-facing component.</p>
      </div>
    );
  }
}
export default Welcome;
```

This is just a generic text component saying what it is. To create a more fancy page create `Secured.js` with the following content:

```javascript
import React, { Component } from "react";
import Keycloak from "keycloak-js";

class Secured extends Component {
  constructor(props) {
    super(props);
    this.state = { keycloak: null, authenticated: false };
  }

  componentDidMount() {
    const keycloak = Keycloak("/keycloak.json");
    keycloak
      .init({ onLoad: "login-required" })
      .success(authenticated => {
        this.setState({ keycloak: keycloak, authenticated: authenticated });
      })
      .error(() => {
        this.setState({ keycloak: keycloak, authenticated: false });
      });
  }

  render() {
    if (this.state.keycloak) {
      if (this.state.authenticated)
        return (
          <div>
            <p>
              This is a Keycloak-secured component of your application. You
              shouldn't be able to see this unless you've authenticated with
              Keycloak.
            </p>
          </div>
        );
      else return <div>Unable to authenticate!</div>;
    }
    return <div>Initializing Keycloak...</div>;
  }
}
export default Secured;
```

As you can see there is a declaration of a `keycloak` object as soon as the component did mount. To get this to work either copy your downloaded `keycloak.json` into the `public` folder or paste the json as implementation into the code.

`login-required` is one of two possible values to be passed as an onLoadparameter. This will authenticate the client if the user has already logged into Keycloak, or redirect the browser to the login page if he hasn’t. The other option is `check-sso`: this will only authenticate the client if the user has already logged in, otherwise the client will remain unauthenticated without automatic redirection.

As a test, open a new incognito window and try going through the login process again, but use 127.0.0.1 instead of localhost. Since the redirect URI pattern, we specified in the admin panel earlier only included the latter and not the former, you should get an error on the login page.

Let’s expand our app a little bit by adding the **logout functionality** and some **user data** extraction. We’ll start with the latter – add the following as `src/UserInfo.js`:

```javascript
import React, { Component } from "react";

class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      id: ""
    };
    this.props.keycloak
      .loadUserProfile()
      .success(profile => {
        this.setState({
          username: profile.username,
          email: profile.email,
          id: profile.sub
        });
      })
      .error(function() {
        alert("Failed to load user profile");
      });
  }

  render() {
    return (
      <div className="UserInfo">
        <p>Username: {this.state.username}</p>
        <p>Email: {this.state.email}</p>
      </div>
    );
  }
}
export default UserInfo;
```

This component accepts a Keycloak instance from its parent, then uses the loadUserInfo method to extract the user’s data.

Now for the logout button, place the following in `src/Logout.js`:

```javascript
import React, { Component } from "react";
import { withRouter } from "react-router-dom";

class Logout extends Component {
  logout() {
    this.props.history.push("/");
    this.props.keycloak.logout();
  }

  render() {
    return <button onClick={() => this.logout()}>Logout</button>;
  }
}
export default withRouter(Logout);
```

Similarly, this accepts a Keycloak instance from the parent, then uses its logout method. Note that it has to be called last – otherwise it would redirect you to the login form again. Adjust your `Secured.js:render()` method to show the following (be sure to remember the import of your components):

```javascript
render() {
    if(this.state.keycloak) {
      if(this.state.authenticated) return (
        <div>
          <p>This is a Keycloak-secured component of your application. You shouldn't be able
          to see this unless you've authenticated with Keycloak.</p>
          <UserInfo keycloak={this.state.keycloak} />
          <Logout keycloak={this.state.keycloak} />
        </div>
      ); else return (<div>Unable to authenticate!</div>)
    }
    return (
      <div>Initializing Keycloak...</div>
    );
  }
```

Thats it - the React frontend is now secured via a Keycloak backend and the user can login and logout via Keycloak.
