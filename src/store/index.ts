import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import rootReducer from '../store/rootReducer';

export const store = configureStore({
	reducer: rootReducer,
});

import { keyInitializerMiddleware } from '../middleware/keyInitializer';

const storeWithMiddleware = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) => 
		getDefaultMiddleware().concat(keyInitializerMiddleware),
});

Object.assign(store, storeWithMiddleware);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
