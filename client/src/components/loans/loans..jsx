import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux"
import useAuthRedirect from '../../middleware/isAuth.jsx';

import {
    Input, Button, CloseButton, Select, Card, Image, Text, AspectRatio, Paper, Pagination, Loader,
    Avatar,
    Modal,
    ScrollArea,
    NumberInput,
    ThemeIcon,
    Rating
} from '@mantine/core';
import styles from './loans.module.scss';
import { IconSearch, IconFilterFilled, IconSquareRoundedPlus, IconCaretRightFilled, IconExclamationCircle, IconDots, IconCheck, IconArrowNarrowDown, IconArrowNarrowRight } from '@tabler/icons-react';
import ImageOff from '/image_off.png'
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { apiGetLoanInfo, apiGetLoans, apiReturnedLoan } from '../../store/slices/loanSlice.js';
import { useDisclosure } from '@mantine/hooks';
import { unwrapResult } from '@reduxjs/toolkit';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    const {
        loans: {
            loans, count, limit, loansNotFound,
            connection: { isLoansFetch }
        },
        loan_info: {
            ID_Book,
            date_loan,
            termin_loan,
            status,
            number_grade,
            date_return,
            connection: { isInfoFetch }
        }
    } = useSelector((state) => state.loans);
 
    console.log(loans)

    const parsedDateLoan = date_loan ? new Date(date_loan).getFullYear() + "-" + ('0' + (new Date(date_loan).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(date_loan).getDate()).slice(-2) : "-";
    const parsedTerminLoan = termin_loan ? new Date(termin_loan).getFullYear() + "-" + ('0' + (new Date(termin_loan).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(termin_loan).getDate()).slice(-2) : "-";
    const parsedDateReturn = date_return ? new Date(date_return).getFullYear() + "-" + ('0' + (new Date(date_return).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(date_return).getDate()).slice(-2) : "-";

    const dispatchApiGetLoans = async (search, filter, offset, limit) => {
        isAuthDispatch(apiGetLoans, { search, filter, offset, limit })
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetLoans(search, filter, offset, limit)
    }, [page, filter])

    const handleFilter = (value) => {
        setFilter(value)
        setPage(1)
    }

    const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false)

    const [form, setForm] = useState({})

    const handleCloseModal = () => {
        closeModal()
        setForm({})
        setErrors({})
    }

    const handleOpenModal = (ID_Book, Date_Loan) => {
        openModal()
        dispatchApiGetLoanInfo(ID_Book, Date_Loan)
    }

    const setField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });
    }

    const dispatchApiGetLoanInfo = async (ID_Book, Date_Loan) => {
        return isAuthDispatch(apiGetLoanInfo, { ID_Book, Date_Loan: new Date(Date_Loan) })
    }

    const dispatchApiReturnedLoan = async () => {
        console.log(ID_Book, new Date(date_loan),form.grade)
        return isAuthDispatch(apiReturnedLoan, { ID_Book, date_loan: new Date(date_loan), grade: form.grade })
    }
 
    const handleSubmit = async () => {  
 
        for (var v in form) {
            if (v === 'grade') {
                form[v] = Number(form[v])
            }
        }

            const actionRes = await dispatchApiReturnedLoan(form)
            const promiseRes = unwrapResult(actionRes)

            if (promiseRes.status === "success") {
                notifications.show({
                    color: "green",
                    title: 'Book returned',
                    position: "bottom-center",
                })
                handleCloseModal()
            }
    }

    return {
        isLoansFetch, loans, search, setSearch, filter, handleFilter, page, setPage, pagesCount, offset, limit,
        dispatchApiGetLoans, loansNotFound, openedModal, handleOpenModal, handleCloseModal, form, setField, isInfoFetch,
        handleSubmit, parsedDateLoan, parsedTerminLoan, parsedDateReturn, status, number_grade
    }

}

const Loans = () => {

    const { isLoansFetch, loans, search, setSearch, filter, handleFilter, page, setPage, pagesCount, offset, limit,
        dispatchApiGetLoans, loansNotFound, openedModal, handleOpenModal, handleCloseModal, form, setField, isInfoFetch,
        handleSubmit, parsedDateLoan, parsedTerminLoan, parsedDateReturn, status, number_grade } = useLocalState()

    return (
        <div className={styles.loans}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title_form,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Loan info">
                {/* {!isInfoFetch ? */}
                {status === 'Borrowed'  ?
                    <>
                       <Paper
                    classNames={{
                        root: styles.cell,
                    }} radius="md" p="xs">
                    <div>{parsedDateLoan}</div>
                    <IconArrowNarrowRight ></IconArrowNarrowRight>
                    <div>{parsedTerminLoan}</div> 
                </Paper>
                    </>
                    :
                    status === 'Expired' 
                    ?
                    <>
                      <Paper
                    classNames={{
                        root: styles.cell,
                    }} radius="md" p="xs">
                    <div>{parsedDateLoan}</div>
                    <IconArrowNarrowRight ></IconArrowNarrowRight>
                    <div style={{color: '#fa5252'}}>{parsedTerminLoan}</div> 
                </Paper>
                <div className={styles.arrow_bottom}>
                </div>
                    </>
                    :
                    status === 'Returned' 
                    &&
                    <>
                     <Paper
                    classNames={{
                        root: styles.cell,
                    }} radius="md" p="xs">
                    <div>{parsedDateLoan}</div>
                    <IconArrowNarrowRight ></IconArrowNarrowRight>
                    <div>{parsedDateReturn}</div> 
                </Paper> 
                <Rating className={styles.rating} readOnly fractions={2} value={number_grade / 2} size="lg" />
                    </>
                }
                {status !== 'Returned'
                &&
                <form className={styles.formLoan}>
                    <Input.Wrapper className={styles.input_wrap} label="Grade - optional">
                        <NumberInput
                            allowDecimal={false}
                            value={form.grade}
                            onChange={value => setField('grade', value)}
                            min={0} max={10} className={styles.input} placeholder='Enter grade' />
                    </Input.Wrapper>
                    <Button
                       rightSection={ 
                        <IconCheck  size="1rem"/> 
                    }
                            onClick={handleSubmit} 
                            className={styles.btn_submit}
                            variant="filled">Returned
                        </Button>
                </form>
                }
                {/* :
                    <Loader
                        classNames={{
                            root: styles.loader,
                        }} color="blue" /> */}
                {/* } */}
            </Modal>
            <div className={styles.navigation}>
                <div className={styles.search}>
                    <Input
                        placeholder="I`m looking for.."
                        leftSection={<IconSearch size="1rem" />}
                        value={search}
                        onChange={(event) => setSearch(event.currentTarget.value)}
                        rightSectionPointerEvents="all"
                        rightSection={
                            <CloseButton
                                aria-label="Clear search"
                                onClick={() => setSearch('')}
                                style={{ display: search ? undefined : 'none' }}
                            />
                        }
                        classNames={{
                            input: styles.search_input,
                        }}
                    />
                    <Button onClick={() => { dispatchApiGetLoans(search, filter, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Select
                    allowDeselect={false}
                    variant="filled"
                    value={filter}
                    onChange={(v) => handleFilter(v)}
                    leftSection={<IconFilterFilled size="1rem" />}
                    data={['Borrowed', 'Expired', 'Returned', 'All']}
                />
            </div>
            {!loansNotFound ?
                !isLoansFetch ?
                    <>
                        <div className={styles.cards}>
                            {loans?.map((b, i) =>
                                <Paper className={styles.card_wrap} shadow="sm" radius="md" withBorder>
                                    <div style={{ backgroundColor: b.Status === 'Borrowed' ? '#228be6' : b.Status === 'Expired' && '#fa5252' }} className={styles.indicator}></div>
                                    <Card className={styles.card}>
                                        <div className={styles.user}>

                                            <Avatar name={b.Name_User ?? b.Name_User} src={b.Image_User && b.Image_User} />

                                            <Text className={styles.name} fw={500}>{b.Name_User ? b.Name_User : "Unknown"}</Text>
                                        </div>
                                        <div className={styles.user}> 


                                            {b.Image_Book ?
                                                <Image className={styles.image} src={b.Image_Book} />
                                                :
                                                <Image className={styles.image} src={ImageOff} />}


                                            <Text className={styles.name} fw={500}>{b.Name_Book}</Text>
                                        </div>
                                        <Button
                                            onClick={() => handleOpenModal(b.ID_Book, b.Date_Loan)}
                                            rightSection={
                                                <IconCaretRightFilled size="1rem" />
                                            }>
                                            More info
                                        </Button>
                                    </Card>
                                </Paper>
                            )}
                        </div>
                        <Pagination total={pagesCount} value={page} onChange={setPage} className={styles.pagination} />
                    </>
                    :
                    <Loader
                        classNames={{
                            root: styles.loader,
                        }} color="blue" />
                :
                <h3 className={styles.not_found}>Loans not found</h3>
            }
        </div>
    );
}

export default Loans;