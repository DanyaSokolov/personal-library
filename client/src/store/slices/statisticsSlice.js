import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { accountApi } from "../../api/api.js"
import handleError from "./error/error.js"

const initialState = {
    total: {
        counts: {
            users: 0,
            book_available: 0,
            book_loaned: 0,
            book_absent: 0,
            loan_borrowed: 0,
            loan_expired: 0,
            loan_returned: 0,
        },
        books_by_genre: [],
        book_by_author: [],
        book_by_section: [],
        loans_by_book: [],
        loans_by_users: [],
    },
    range: [],
    connection: {
        isTotalFetch: true,
        isRangeFetch: true,
    }
}

export const statisticsSlice = createSlice({
    name: "statistics",
    initialState,
    reducers: {
    },
    extraReducers(builder) {
        builder
            .addCase(apiGetTotalStatistics.pending, (state, _) => {
                state.connection.isTotalFetch = true
            })
            .addCase(apiGetTotalStatistics.fulfilled, (state, action) => {
                if (action.payload.status == "success") {
                    Object.assign(state.total, action.payload.data)
                }
                state.connection.isTotalFetch = false
            })
            .addCase(apiGetLineChart.pending, (state, _) => {
                state.connection.isRangeFetch = true
            })
            .addCase(apiGetLineChart.fulfilled, (state, action) => {
                if (action.payload.status == "success") {
                    state.range = action.payload.counts 
                }
                state.connection.isRangeFetch = false 
            })
    }
})

export const apiGetTotalStatistics = createAsyncThunk(
    "statistics/apiGetTotalStatistics",
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetTotalStatistics()

            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export const apiGetLineChart = createAsyncThunk(
    "statistics/apiGetLineChart",
    async (data, { dispatch, rejectWithValue }) => {
        try {
            const res = await accountApi.GetLineChart(JSON.stringify(data))

            console.log(res.data)

            return res.data
        } catch (err) {
            handleError(dispatch, err)
            return rejectWithValue(err.message)
        }
    }
)

export default statisticsSlice.reducer