import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice.js"
import booksSlice from "./slices/BooksSlice.js"
 
export const store = configureStore({ 
     reducer: {
          auth: authSlice,
          books: booksSlice, 
     },
     middleware: (getDefaultMiddleware) =>
     getDefaultMiddleware({
       serializableCheck: false,
     }),
})  
