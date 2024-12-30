import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { apiGetGenres, apiAddGenre, apiDeleteGenre, setDeletingGenreName } from '../../../store/slices/BooksSlice';
import useAuthRedirect from '../../../middleware/isAuth.jsx';
import { unwrapResult } from '@reduxjs/toolkit';

import {
    Input, Button, CloseButton, Pagination, Loader, Modal, ScrollArea, ActionIcon,
    rem,
    Paper
} from '@mantine/core';
import styles from './genres.module.scss';
import { IconSearch, IconSquareRoundedPlus, IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatch = useDispatch()

    const [search, setSearch] = useState('');

    const {
        genres: {
            genres, count, limit, genresNotFound, deletingName,
            connection: { isGenresFetch, isAddingFetch, isDeletingFetch }
        }
    } = useSelector((state) => state.books);

    const dispatchApiGetGenres = async (search, offset, limit) => {
        isAuthDispatch(apiGetGenres, { search, offset, limit })
    }

    const dispatchApiAddGenre = async () => {
        await isAuthDispatch(apiAddGenre, form)
        handleCloseModal()
        dispatchApiGetGenres(search, offset, limit)
    }

    const dispatchApiDeleteGenre = async (name) => {
        dispatch(setDeletingGenreName(name))
        await isAuthDispatch(apiDeleteGenre, { name })
        dispatchApiGetGenres(search, offset, limit)
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetGenres(search, offset, limit)
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
            const actionRes = await dispatchApiAddGenre(form)
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
        isGenresFetch, genres, page, setPage, pagesCount, offset, limit, dispatchApiGetGenres, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, genresNotFound, dispatchApiDeleteGenre, search, setSearch, offset, limit,
        openedModal, openModal, handleCloseModal, deletingName
    }

}

const Genres = () => {

    const { isGenresFetch, genres, page, setPage, pagesCount, form, setField, errors, dispatchApiGetGenres, offset, limit,
        handleSubmit, isAddingFetch, isDeletingFetch, genresNotFound, dispatchApiDeleteGenre, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingName } = useLocalState()

    return (
        <div className={styles.genres}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Add genre">
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
                    <Button onClick={() => { dispatchApiGetGenres(search, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Button onClick={openModal} rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } variant="light">Add genre</Button>
            </div>
            {!genresNotFound ?
                !isGenresFetch ?
                    <>
                        {genres?.map((g, i) =>
                            <Paper
                                classNames={{
                                    root: styles.card,
                                }} key={i} shadow="sm" radius="md" withBorder p="xl">
                                <div className={styles.cell}>
                                    {g}
                                </div>
                                <ActionIcon loading={deletingName === g ? isDeletingFetch : false} onClick={() => dispatchApiDeleteGenre(g)} variant="light" color="red">
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
                <h3 className={styles.not_found}>Genres not found</h3>
            }
        </div>
    );
}

export default Genres;