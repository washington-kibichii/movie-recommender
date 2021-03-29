import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import rootReducer from "./reducers";

const persistConfig = {
  key: "root",
  storage,
};

const initialState = {};
const middleware = [thunk];
const persistedReducer = persistReducer(persistConfig, rootReducer);

// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
  const store = createStore(
    persistedReducer,
    initialState,
    compose(applyMiddleware(...middleware))
  );
  let persistor = persistStore(store);
  return { store, persistor };
};
