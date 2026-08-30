import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import rootReducer from './rootReducer';
import { keyInitializerMiddleware } from '../middleware/keyInitializer';
export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(keyInitializerMiddleware),
});
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
