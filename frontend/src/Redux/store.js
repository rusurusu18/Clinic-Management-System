import {configureStore} from '@reduxjs/toolkit';


export const store = configureStore({
    reducer:{
        auth:authReducer,
    },
    middleware:(getDefaultMiddleware) => 
        getDefaultMiddleware({
           serializableCheck: {
        ignoredActions: [
          'auth/register/fulfilled',
          'auth/login/fulfilled',
          'auth/refreshToken/fulfilled',
          'auth/fetchProfile/fulfilled',
          'auth/updateProfile/fulfilled',
        ],
      },
    }),
  devTools: import.meta.env.VITE_NODE_ENV !== 'production',
});

export default store;