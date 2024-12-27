import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import handleError from "./error/error.js"

const initialState = {
    books: {
        books: [],
        limit: 12,
        count: 0,
        connection: {
            isBooksFetch: true,
            isBookAddingInfoFetch: true,
            isAddingFetch: false,
        },
        add_info: {
            authors: [],
            genres: [],
            sections: []
        },
        booksNotFound: false
    },
    authors: {
        authors: [],
        limit: 1,
        count: 0,
        connection: {
            isAuthorsFetch: true,
        },
        authorsNotFound: false
    },
    genres: {
        genres: [],
        limit: 1,
        count: 0,
        connection: {
            isGenresFetch: true,
        },
        genresNotFound: false
    },
    sections: {
        sections: [],
        limit: 1,
        count: 0,
        connection: {
            isSectionsFetch: true,
        },
        sectionsNotFound: false
    },
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
                switch (action.payload.status) {
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
            .addCase(apiGetBooks.rejected, (state, _) => {
                state.books.connection.isBooksFetch = false
            })
            .addCase(apiGetBookAddingInfo.pending, (state, _) => {
                state.books.connection.isBookAddingInfoFetch = true
            })
            .addCase(apiGetBookAddingInfo.fulfilled, (state, action) => {
                if (action.payload.status == "success") {
                    state.books.add_info = action.payload.data
                }
                state.books.connection.isBookAddingInfoFetch = false
            })
            .addCase(apiAddBook.pending, (state, _) => {
                state.books.connection.isAddingFetch = false
            })
            .addCase(apiAddBook.fulfilled, (state, _) => {
                state.books.connection.isAddingFetch = false
            })
            .addCase(apiAddBook.rejected, (state, _) => {
                state.books.connection.isAddingFetch = false
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

export const apiGetBookAddingInfo = createAsyncThunk(
    "auth/apiGetAuthors",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetBookAddingInfo()

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiAddBook = createAsyncThunk(
    "auth/apiAddBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.AddBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetAuthors = createAsyncThunk(
    "auth/apiGetAuthors",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetAuthors()

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetGenres = createAsyncThunk(
    "auth/apiGetGenres",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetGenres()

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetLibrarySections = createAsyncThunk(
    "auth/apiGetLibrarySections",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetLibrarySections()

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export default booksSlice.reducer