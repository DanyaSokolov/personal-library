import React, { useEffect, useState } from 'react';
import styles from './statistics.module.scss';
import { AreaChart, PieChart } from '@mantine/charts';
import { Button, Paper, rem } from '@mantine/core';
import { DatesProvider, MonthPickerInput } from '@mantine/dates';
import useAuthRedirect from '../../middleware/isAuth';
import { apiGetLineChart, apiGetTotalStatistics } from '../../store/slices/statisticsSlice';
import { useSelector } from 'react-redux';
import { IconExclamationCircle, IconReload, IconRestore } from '@tabler/icons-react';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const [form, setForm] = useState({
        range: [new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]
    })
    const [errors, setErrors] = useState({})

    const setField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });
    }

    const handleSubmit = async () => {
        if (form.range[0] === null || form.range[1] === null) {
            setErrors(() => ({ 
                ...errors,
                range: true
            }));
        }  else {
            setErrors(() => ({
                ...errors, 
                range: null 
            })); 
            dispatchApiGetLineChart() 
        }  
    }

    const dispatchApiGetTotalStatistics = async () => {
        return isAuthDispatch(apiGetTotalStatistics)
    }

    const dispatchApiGetLineChart = async () => {
        return isAuthDispatch(apiGetLineChart, form)
    }

    useEffect(() => {
        dispatchApiGetTotalStatistics()
        dispatchApiGetLineChart()
    }, [])

    const {
        total: {
            counts: {
                users,
                book_available,
                book_loaned,
                book_absent,
                loan_borrowed,
                loan_expired,
                loan_returned,
            },
            books_by_genre,
            book_by_author,
            book_by_section,
            loans_by_book,
            loans_by_users,
        },
        range
    } = useSelector((state) => state.statistics)

    const colors = ["green", "red", "blue", "orange", "yellow", "grape", "violet", "violet", "cyan", "pink"]

    function addColors(array) {
        return array.map((item, index) => ({
            ...item,
            color: colors[index % colors.length]
        }));
    }

    const updated_books_by_genre = addColors(books_by_genre);
    const updated_book_by_author = addColors(book_by_author);
    const updated_book_by_section = addColors(book_by_section);
    const updated_loans_by_book = addColors(loans_by_book);
    const updated_loans_by_users = addColors(loans_by_users);

    const formattedRange = range.map(item => ({
        ...item,
        date: item.date.split("T")[0]
    }));

    const transformedRange = formattedRange.map(({ date, books_recieved, books_loaned }) => ({
        date,
        booksReceived: books_recieved,
        booksLoaned: books_loaned
    })); 

    console.log(errors) 

    return {
        users, book_available,
        book_loaned,
        book_absent,
        loan_borrowed,
        loan_expired,
        loan_returned, updated_books_by_genre, updated_book_by_author, updated_book_by_section, updated_loans_by_book, updated_loans_by_users,
        form, setField, handleSubmit, transformedRange, setForm, errors
    }
}

const Statistics = () => {

    const { users, book_available,
        book_loaned,
        book_absent,
        loan_borrowed,
        loan_expired,
        loan_returned, updated_books_by_genre, updated_book_by_author, updated_book_by_section, updated_loans_by_book, updated_loans_by_users,
        form, setField, handleSubmit, transformedRange, setForm, errors } = useLocalState()

    return (
        <div className={styles.statistics}>
            <div className={styles.counts}>
                <Paper className={styles.count} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Books</b></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#40c057' }} className={styles.indicator}></div><span className={styles.text}>Available<b>{book_available}</b></span></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#228be6' }} className={styles.indicator}></div><span className={styles.text}>Loaned <b>{book_loaned}</b></span></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#868e96' }} className={styles.indicator}></div><span className={styles.text}>Absent <b>{book_absent}</b></span></div>
                </Paper>
                <Paper className={styles.count} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Loans</b></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#228be6' }} className={styles.indicator}></div><span className={styles.text}>Borrowed <b>{loan_borrowed}</b></span></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#fa5252' }} className={styles.indicator}></div><span className={styles.text}>Expired <b>{loan_expired}</b></span></div>
                    <div className={styles.indicator_wrap}><div style={{ backgroundColor: '#40c057' }} className={styles.indicator}></div><span className={styles.text}>Returned <b>{loan_returned}</b></span></div>
                </Paper>
                <Paper className={styles.count} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Users</b></div>
                    <span className={styles.text}><b>{users}</b></span>
                </Paper>
            </div>
            <div className={styles.pies}>
                <Paper className={styles.pie} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Books by genres</b></div>
                    <PieChart data={updated_books_by_genre} withTooltip tooltipDataSource="segment" mx="auto" />
                </Paper>
                <Paper className={styles.pie} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Books by authors</b></div>
                    <PieChart data={updated_book_by_author} withTooltip tooltipDataSource="segment" mx="auto" />
                </Paper>
                <Paper className={styles.pie} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Books by sections</b></div>
                    <PieChart data={updated_book_by_section} withTooltip tooltipDataSource="segment" mx="auto" />
                </Paper>
            </div>
            <div className={styles.pies}>
                <Paper className={styles.pie} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Books by loans</b></div>
                    <PieChart data={updated_loans_by_book} withTooltip tooltipDataSource="segment" mx="auto" />
                </Paper>
                <Paper className={styles.pie} shadow="xs" withBorder radius="md">
                    <div className={styles.title}><b>Users by loans</b></div>
                    <PieChart data={updated_loans_by_users} withTooltip tooltipDataSource="segment" mx="auto" />
                </Paper>
            </div>
            <Paper className={styles.area} shadow="xs" withBorder radius="md">
                <div className={styles.title}><b>Books and loans by months</b></div>
                <div>
                    <AreaChart
                        h="25rem"
                        data={transformedRange} 
                        dataKey="date"
                        series={[
                            { name: 'booksReceived', color: 'indigo.6' },
                            { name: 'booksLoaned', color: 'blue.6' },
                        ]}

                    />
                </div>
                <form className={styles.form}>
                    <DatesProvider settings={{ timezone: 'UTC' }}>
                        <MonthPickerInput 
                          allowDeselect={false}
                            type="range"
                            placeholder="Pick dates range"
                            onChange={(r) => setField("range", r)}
                            value={form.range}
                            classNames={{
                                input: styles.input_date,
                            }}
                            rightSection={errors.range &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            error={errors.range} 
                        />
                    </DatesProvider>
                    <Button rightSection={
                        <IconReload size="1rem" />} variant="light" className={styles.btn_submit} onClick={handleSubmit}>Reload</Button>
                    <Button rightSection={
                        <IconRestore size="1rem" />} color="gray" variant="light" className={styles.btn_submit} onClick={() => setForm({
                            range: [new Date(new Date().setFullYear(new Date().getFullYear() - 1)), new Date()]
                        })}>Reset</Button>
                </form>
            </Paper>
        </div>
    );
}

export default Statistics; 