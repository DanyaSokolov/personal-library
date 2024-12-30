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
    genres: {
        genres: [],
        limit: 12,
        count: 0,
        connection: {
            isGenresFetch: true,
            isAddingFetch: false,
            isDeletingFetch: false,
        },
        deletingName: '',
        genresNotFound: false
    },
    authors: {
        authors: [],
        limit: 12,
        count: 0,
        connection: {
            isAuthorsFetch: true,
            isAddingFetch: false,
            isDeletingFetch: false,
        },
        deletingName: '',
        authorsNotFound: false
    },
    sections: {
        sections: [],
        limit: 12,
        count: 0,
        connection: {
            isSectionsFetch: true,
            isAddingFetch: false,
            isDeletingFetch: false,
        },
        deletingName: '',
        sectionsNotFound: false
    },
}

export const booksSlice = createSlice({
    name: "books",
    initialState,
    reducers: {
        setGrade: (state, action) => {
            state.info.grade = action.payload
        },
        setDeletingGenreName: (state, action) => {
            state.genres.deletingName = action.payload
        },
        setDeletingAuthorName: (state, action) => {
            state.authors.deletingName = action.payload
        },
        setDeletingSectionName: (state, action) => {
            state.sections.deletingName = action.payload
        },
    },
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
                // state.books.connection.isDeletingFetch = false
            })
            .addCase(apiDeleteBook.fulfilled, (state, _) => {
                // state.books.connection.isDeletingFetch = false
            })
            .addCase(apiDeleteBook.rejected, (state, _) => {
                // state.books.connection.isDeletingFetch = false
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
            .addCase(apiSetStatusAbsentBook.pending, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
            .addCase(apiSetStatusAbsentBook.fulfilled, (state, _) => { 
                // state.info.connection.isEditingFetch = false 
            })
            .addCase(apiSetStatusAbsentBook.rejected, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
            .addCase(apiSetGradeBook.pending, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
            .addCase(apiSetGradeBook.fulfilled, (state, _) => { 
                // state.info.connection.isEditingFetch = false 
            })
            .addCase(apiSetGradeBook.rejected, (state, _) => {
                // state.info.connection.isEditingFetch = false
            })
            .addCase(apiGetGenres.pending, (state, _) => { 
                state.genres.connection.isGenresFetch = true
                state.genres.genresNotFound = false
            }) 
            .addCase(apiGetGenres.fulfilled, (state, action) => { 
                switch (action.payload.status) {
                    case "no_genres":
                        state.genres.genresNotFound = true
                        break
                    case "success": 
                        state.genres.genres = action.payload.data.genres
                        state.genres.count = action.payload.data.count
                        break
                }
                state.genres.connection.isGenresFetch = false 
            })
            .addCase(apiGetGenres.rejected, (state, _) => {
                state.genres.connection.isGenresFetch = false
            })
            .addCase(apiAddGenre.pending, (state, _) => {
                state.genres.connection.isAddingFetch = true
            })
            .addCase(apiAddGenre.fulfilled, (state, _) => { 
                state.genres.connection.isAddingFetch = false 
            })
            .addCase(apiAddGenre.rejected, (state, _) => {
                state.genres.connection.isAddingFetch = false
            })
            .addCase(apiDeleteGenre.pending, (state, _) => {
                state.genres.connection.isDeletingFetch = true
            })
            .addCase(apiDeleteGenre.fulfilled, (state, _) => { 
                state.genres.connection.isDeletingFetch = false 
            })
            .addCase(apiDeleteGenre.rejected, (state, _) => {
                state.genres.connection.isDeletingFetch = false
            })
            .addCase(apiGetAuthors.pending, (state, _) => { 
                state.authors.connection.isAuthorsFetch = true
                state.authors.authorsNotFound = false
            }) 
            .addCase(apiGetAuthors.fulfilled, (state, action) => { 
                switch (action.payload.status) {
                    case "no_authors":
                        state.authors.authorsNotFound = true
                        break
                    case "success": 
                        state.authors.authors = action.payload.data.authors
                        state.authors.count = action.payload.data.count
                        break
                }
                state.authors.connection.isAuthorsFetch = false 
            })
            .addCase(apiGetAuthors.rejected, (state, _) => {
                state.authors.connection.isAuthorsFetch = false
            })
            .addCase(apiAddAuthor.pending, (state, _) => {
                state.authors.connection.isAddingFetch = true
            })
            .addCase(apiAddAuthor.fulfilled, (state, _) => { 
                state.authors.connection.isAddingFetch = false 
            }) 
            .addCase(apiAddAuthor.rejected, (state, _) => {
                state.authors.connection.isAddingFetch = false
            })
            .addCase(apiDeleteAuthor.pending, (state, _) => {
                state.authors.connection.isDeletingFetch = true
            })
            .addCase(apiDeleteAuthor.fulfilled, (state, _) => { 
                state.authors.connection.isDeletingFetch = false 
            })
            .addCase(apiDeleteAuthor.rejected, (state, _) => {
                state.authors.connection.isDeletingFetch = false
            })
            .addCase(apiGetSections.pending, (state, _) => { 
                state.sections.connection.isSectionsFetch = true
                state.sections.sectionsNotFound = false
            }) 
            .addCase(apiGetSections.fulfilled, (state, action) => { 
                switch (action.payload.status) {
                    case "no_sections":
                        state.sections.sectionsNotFound = true
                        break
                    case "success": 
                        state.sections.sections = action.payload.data.sections
                        state.sections.count = action.payload.data.count
                        break
                }
                state.sections.connection.isSectionsFetch = false 
            })
            .addCase(apiGetSections.rejected, (state, _) => {
                state.sections.connection.isSectionsFetch = false
            })
            .addCase(apiAddSection.pending, (state, _) => {
                state.sections.connection.isAddingFetch = true
            })
            .addCase(apiAddSection.fulfilled, (state, _) => { 
                state.sections.connection.isAddingFetch = false 
            }) 
            .addCase(apiAddSection.rejected, (state, _) => {
                state.sections.connection.isAddingFetch = false
            })
            .addCase(apiDeleteSection.pending, (state, _) => {
                state.sections.connection.isDeletingFetch = true
            })
            .addCase(apiDeleteSection.fulfilled, (state, _) => { 
                state.sections.connection.isDeletingFetch = false 
            })
            .addCase(apiDeleteSection.rejected, (state, _) => {
                state.sections.connection.isDeletingFetch = false
            })
    }
})

export const apiGetBooks = createAsyncThunk(
    "books/apiGetBooks",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetBooks(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetBookAddingInfo = createAsyncThunk(
    "books/apiGetBookAddingInfo",
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

export const apiSetStatusAbsentBook = createAsyncThunk(
    "books/apiSetStatusAbsentBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.SetStatusAbsentBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiSetStatusAvailableBook = createAsyncThunk(
    "books/apiSetStatusAvailableBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.SetStatusAvailableBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiSetGradeBook = createAsyncThunk(
    "books/apiSetGradeBook",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.SetGradeBook(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetGenres = createAsyncThunk(
    "books/apiGetGenres",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetGenres(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiAddGenre = createAsyncThunk(
    "books/apiAddGenre",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.AddGenre(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiDeleteGenre = createAsyncThunk(
    "books/apiDeleteGenre",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.DeleteGenre(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetAuthors = createAsyncThunk(
    "books/apiGetAuthors",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetAuthors(JSON.stringify(data))
 
            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiAddAuthor = createAsyncThunk(
    "books/apiAddAuthor",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.AddAuthor(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiDeleteAuthor = createAsyncThunk(
    "books/apiDeleteAuthor",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.DeleteAuthor(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetSections = createAsyncThunk(
    "books/apiGetSections",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetSections(JSON.stringify(data))
 
            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiAddSection = createAsyncThunk(
    "books/apiAddSection",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.AddSection(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiDeleteSection = createAsyncThunk(
    "books/apiDeleteSection",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.DeleteSection(JSON.stringify(data))

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const { setGrade, setDeletingGenreName, setDeletingAuthorName, setDeletingSectionName } = booksSlice.actions
export default booksSlice.reducer