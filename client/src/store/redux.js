import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice.js"
import booksSlice from "./slices/BooksSlice.js"
import userSlice from "./slices/userSlice.js"
import loansSlice from "./slices/loanSlice.js"
 
export const store = configureStore({ 
     reducer: {
          auth: authSlice,
          books: booksSlice,  
          users: userSlice,
          loans: loansSlice,
     },
     middleware: (getDefaultMiddleware) =>
     getDefaultMiddleware({
       serializableCheck: false,
     }),
})  
