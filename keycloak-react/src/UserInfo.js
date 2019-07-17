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
