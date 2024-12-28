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
        booksNotFound: false,
    },
    info: {
        ID_Book: 0,
        name: '',
        authors: [],
        image: '',
        year_publish: 0,
        house_publish: '',
        pages: 0,
        source: '',
        date_receipt: 0,
        grade: 0,
        comment: '',
        last_status_change: 0,
        genre: '',
        status: '',
        description: '',
        section: '',
        connection: {
            isDeletingFetch: false,
            isBookFetch: true,
            isEditingFetch: false,
        },
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
            .addCase(apiDeleteBook.pending, (state, _) => {
                state.books.connection.isDeletingFetch = false
            })
            .addCase(apiDeleteBook.fulfilled, (state, _) => {
                state.books.connection.isDeletingFetch = false
            })
            .addCase(apiDeleteBook.rejected, (state, _) => {
                state.books.connection.isDeletingFetch = false
            })
            .addCase(apiGetBook.pending, (state, _) => {
                // state.info.connection.isBookFetch = true
            })
            .addCase(apiGetBook.fulfilled, (state, action) => {
                switch (action.payload.status) {
                    case "success":
                        state.info = action.payload.data
                        break
                }
             
                // state.info.connection.isBookFetch = false
            })
            .addCase(apiEditBook.pending, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
            .addCase(apiEditBook.fulfilled, (state, _) => { 
                // state.info.connection.isEditingFetch = false 
            })
            .addCase(apiEditBook.rejected, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
    }
})

export const apiGetBooks = createAsyncThunk(
    "books/apiGetBooks",
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
    "books/apiGetAuthors",
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
    "books/apiAddBook",
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

export const apiDeleteBook = createAsyncThunk(
    "books/apiDeleteBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.DeleteBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetBook = createAsyncThunk(
    "books/apiGetBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetBook(JSON.stringify(data))

            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiEditBook = createAsyncThunk(
    "books/apiEditBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.EditBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetAuthors = createAsyncThunk(
    "books/apiGetAuthors",
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
    "books/apiGetGenres",
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
    "books/apiGetLibrarySections",
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