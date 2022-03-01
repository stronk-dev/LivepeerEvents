import * as React from "react";
import { connect } from "react-redux";
import {
  getVisitorStats
} from "./actions/user";
import { login } from "./actions/session";

const mapStateToProps = (state) => {
  return {
    session: state.session,
    userstate: state.userstate,
    errors: state.errors
  }
};

const mapDispatchToProps = dispatch => ({
  getVisitorStats: () => dispatch(getVisitorStats()),
  login: () => dispatch(login())
});


class Startup extends React.Component {
  componentDidMount() {
    this.props.login();
    this.props.getVisitorStats();
  }
  render() {
    return this.props.children;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Startup);