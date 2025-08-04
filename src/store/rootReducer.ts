import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contactsReducer from './slices/contactsSlice';
import messagesReducer from './slices/messagesSlice';
import keysReducer from './slices/keysSlice';
import contactRequestsReducer from './slices/contactRequestsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  contacts: contactsReducer,
  messages: messagesReducer,
  keys: keysReducer,
  contactRequests: contactRequestsReducer
});

export default rootReducer;
