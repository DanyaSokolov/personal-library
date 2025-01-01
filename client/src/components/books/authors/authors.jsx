import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { apiGetAuthors, apiAddAuthor, apiDeleteAuthor, setDeletingAuthorName } from '../../../store/slices/BooksSlice';
import useAuthRedirect from '../../../middleware/isAuth.jsx';
import { unwrapResult } from '@reduxjs/toolkit';

import {
    Input, Button, CloseButton, Pagination, Loader, Modal, ScrollArea, ActionIcon,
    Paper
} from '@mantine/core';
import styles from './authors.module.scss';
import { IconSearch, IconSquareRoundedPlus, IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatch = useDispatch()

    const [search, setSearch] = useState('');

    const {
        authors: {
            authors, count, limit, authorsNotFound, deletingName,
            connection: { isAuthorsFetch, isAddingFetch, isDeletingFetch }
        }
    } = useSelector((state) => state.books);

    const dispatchApiGetAuthors = async (search, offset, limit) => {
        isAuthDispatch(apiGetAuthors, { search, offset, limit })
    }

    const dispatchApiAddAuthor = async () => {
        await isAuthDispatch(apiAddAuthor, form)
        handleCloseModal()
        dispatchApiGetAuthors(search, offset, limit)
    }

    const dispatchApiDeleteAuthor = async (name) => {
        dispatch(setDeletingAuthorName(name))
        await isAuthDispatch(apiDeleteAuthor, { name })
        dispatchApiGetAuthors(search, offset, limit)
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetAuthors(search, offset, limit)
    }, [page])

    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})

    const setField = (field, value) => {
        setForm({
            ...form,
            [field]: value
        });

        const fieldErrors = validateField(field, value);

        setErrors({
            ...errors,
            [field]: fieldErrors[field]
        });
    }

    const validateField = (field, value) => {
        const newError = {};

        switch (field) {
            case 'name':
                if (value == undefined || value == '') newError.name = 'Please enter name'
                else if (value && value.length > 100) newError.name = `Name must be less than 100 characters.`
                break;
        }

        return newError;
    }

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name'];

        fields.forEach(field => {
            const fieldErrors = validateField(field, form[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const handleSubmit = async () => {

        const formErrors = validateForm()

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors)
            notifications.show({
                color: "yellow",
                title: 'Invalid form',
                position: "bottom-center",
            })
        } else {
            const actionRes = await dispatchApiAddAuthor(form)
            const promiseRes = unwrapResult(actionRes)

            if (promiseRes.status === "success") {
                notifications.show({
                    color: "green",
                    title: 'Genre successfully added',
                    position: "bottom-center",
                })
            }
        }
    }

    const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false)

    const handleCloseModal = () => {
        closeModal()
        setForm({})
        setErrors({})
    }

    return {
        isAuthorsFetch, authors, page, setPage, pagesCount, offset, limit, dispatchApiGetAuthors, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, authorsNotFound, dispatchApiDeleteAuthor, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingName
    }

}

const Authors = () => {

    const { isAuthorsFetch, authors, page, setPage, pagesCount, offset, limit, dispatchApiGetAuthors, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, authorsNotFound, dispatchApiDeleteAuthor, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingName } = useLocalState()

    return (
        <div className={styles.authors}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Add author">
                <form className={styles.form}>
                    <Input.Wrapper error={errors.name} className={styles.input_wrap} label="Name">
                        <Input
                            rightSection={errors.name &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.name}
                            onChange={e => setField('name', e.target.value)}
                            className={styles.input}
                            placeholder='Enter name'
                        />
                    </Input.Wrapper>
                    <Button
                        loading={isAddingFetch}
                        onClick={handleSubmit}
                        className={styles.btn_submit}
                        rightSection={
                            <IconSquareRoundedPlus size="1rem"
                            />
                        }
                        variant="filled">Add
                    </Button>
                </form>
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
                    <Button onClick={() => { dispatchApiGetAuthors(search, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Button onClick={openModal} rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } variant="light">Add author</Button>
            </div>
            {!authorsNotFound ?
                !isAuthorsFetch ?
                    <>
                        {authors?.map((a, i) =>
                            <Paper
                                classNames={{
                                    root: styles.card,
                                }} key={i} shadow="xs" radius="md" withBorder p="xl">
                                <div className={styles.cell}>
                                    {a}
                                </div>
                                <ActionIcon loading={deletingName === a ? isDeletingFetch : false} onClick={() => dispatchApiDeleteAuthor(a)} variant="light" color="red">
                                    <IconTrash style={{ width: '70%', height: '70%' }} stroke={1.5} />
                                </ActionIcon>
                            </Paper>
                        )}
                        <Pagination total={pagesCount} value={page} onChange={setPage} className={styles.pagination} />
                    </>
                    :
                    <Loader
                        classNames={{
                            root: styles.loader,
                        }} color="blue" />
                :
                <h3 className={styles.not_found}>Authors not found</h3>
            }
        </div>
    );
}

export default Authors;