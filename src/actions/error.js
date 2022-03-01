{/* Ability to receive and clear errors as dispatch actions
Requires this in files where errors can be received:
const mapStateToProps = ({ errors }) => ({
  errors
});
*/}
export const RECEIVE_ERRORS = "RECEIVE_ERRORS";
export const RECEIVE_NOTIFICATIONS = "RECEIVE_NOTIFICATIONS";
export const CLEAR_ERRORS = "CLEAR_ERRORS";

export const receiveErrors = ({ message }) => ({
  type: RECEIVE_ERRORS,
  message
});

export const clearErrors = () => ({
  type: CLEAR_ERRORS
});

const receiveNotification = (message) => ({
  type: RECEIVE_NOTIFICATIONS,
  message
})

export const receiveNotifications = (title, message) => async dispatch => {
  return dispatch(receiveNotification({title, message}));
};
