import  { configureStore } from '@reduxjs/toolkit';

import themeReducer from '../slices/themeSlice';
import userReducer from '../slices/userSlice';

const store = configureStore({
    reducer: {
        themeInfo: themeReducer,
        userInfo: userReducer,
    }
})

export default store;  