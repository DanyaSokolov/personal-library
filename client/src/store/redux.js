import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice.js"
import booksSlice from "./slices/BooksSlice.js"
import userSlice from "./slices/userSlice.js"
import loansSlice from "./slices/loanSlice.js"
import statiscsSlice from "./slices/statisticsSlice.js"
 
export const store = configureStore({ 
     reducer: {
          auth: authSlice,
          books: booksSlice,  
          users: userSlice,
          loans: loansSlice,
          statistics: statiscsSlice, 
     },
     middleware: (getDefaultMiddleware) =>
     getDefaultMiddleware({
       serializableCheck: false,
     }),
})  
