import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import { notifications } from '@mantine/notifications';
import handleError from "./error/error.js"

const initialState = {
    books: {
        books: [],
        limit: 1,
        count: 0,
        connection: {
            isBooksFetch: true,
        },
        booksNotFound: false
    },
    // ID: '',
    // name: '',
    // image: '',
    // status: '',
}

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(apiGetBooks.pending, (state, _) => {
                state.books.connection.isBooksFetch = true
                state.books.booksNotFound = false
            })
            .addCase(apiGetBooks.fulfilled, (state, action) => {
                switch(action.payload.status) {
                    case "no_books":
                        state.books.booksNotFound = true
                        break
                    case "success":
                        state.books.books = action.payload.data.books
                        state.books.count = action.payload.data.count
                        break
                }
                state.books.connection.isBooksFetch = false
            })
    }
})

export const apiGetBooks = createAsyncThunk(
    "auth/apiGetBooks",
    async (data, { dispatch, rejectWithValue }) => {
        try { 
            const res = await accountApi.GetBooks(JSON.stringify(data))

            console.log(res.data)
            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export default booksSlice.reducer