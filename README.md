# General 

This project is based upon [this tutorial](https://scalac.io/user-authentication-keycloak-1/) from [scalac.io](https://www.scalac.io). Furthermore does this Readme **not** provide information about how to set up a running Keycloak instance. Check out the official docs to get all the information you need to get up and running. Preferable via Docker - the quick and easy way! For your convenience is the `docker-compose.yml` file, that I use locally attached with which you can fire up a Keycloak 6.0.1. instance via `docker-compose up`.  

# Server config 

1. Create a new realm (in this demo `React_Demo`)
2. Create a new user (in this demo `john`). Be sure to be in the newly created realm!
	2.1. After creating the new user switch to its `Credentials` tab and set a password 
	2.2. To validate if the newly created user works as intended open `localhost:8080/auth/realms/React_Demo/account` and log in
	2.3. Update the email, first and last name and hit `save` 
3. Create a client in the Keycloak admin dashboard. A **client** is a (web) service that is allowed to authenticate or is already authenticated via a prior call. To do so open the _clients_ tab and hit the _create_ button. Fill out the _client id_ (in this demo it will be `my-react-client`). As we're going to create a React app on port `3000` we also fill the _root url_ with `http://localhost:3000`. The _client protocol_ stays untouched on `openid-connect` - now just hit `save` which brings you to the details page. 
	3.1 The first important setting is the _access type_ which can have three possible settings: 
		- `Bearer-only`: this is for services that rely solely on the bearer token included in the request and never initiate login on their own. It’s typically used for securing the back-end
	    - `Confidential`: clients of this type need to provide a secret in order to initiate the login process
	    - `Public`: since we have no real way of hiding the secret in a JS-based browser app, this is what we need to stick with
	3.2. 