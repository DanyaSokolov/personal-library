import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { apiGetSections, apiAddSection, apiDeleteSection, setDeletingSectionName } from '../../../store/slices/BooksSlice';
import useAuthRedirect from '../../../middleware/isAuth.jsx';
import { unwrapResult } from '@reduxjs/toolkit';

import {
    Input, Button, CloseButton, Pagination, Loader, Modal, ScrollArea, ActionIcon,
    TagsInput,
    rem,
    Paper
} from '@mantine/core';
import styles from './sections.module.scss';
import { IconSearch, IconSquareRoundedPlus, IconExclamationCircle, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatch = useDispatch()

    const [search, setSearch] = useState('');

    const {
        sections: {
            sections, count, limit, sectionsNotFound, deletingName,
            connection: { isSectionsFetch, isAddingFetch, isDeletingFetch }
        }
    } = useSelector((state) => state.books);

    const dispatchApiGetSections = async (search, offset, limit) => {
        isAuthDispatch(apiGetSections, { search, offset, limit })
    }

    const dispatchApiAddSection = async (form) => {
        await isAuthDispatch(apiAddSection, form)
        handleCloseModal()
        dispatchApiGetSections(search, offset, limit)
    }

    const dispatchApiDeleteSection = async (name) => {
        dispatch(setDeletingSectionName(name))
        await isAuthDispatch(apiDeleteSection, { name })
        dispatchApiGetSections(search, offset, limit)
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetSections(search, offset, limit)
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
            case 'room':
                if (value && value.length > 100) newError.name = `Name must be less than 10 characters.`
                break;
            case 'shelf':
                if (value && value.some(v => !/^\d+$/.test(v))) {
                    newError.shelf = 'All shelf values must be numbers';
                }
                break;
        }

        return newError;
    }

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name', 'name', 'shelf'];

        fields.forEach(field => {
            const fieldErrors = validateField(field, form[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const handleSubmit = async () => {

        const formErrors = validateForm()

        let formFormatted = form

        for (var v in form) {
            if (v === 'shelf') {
                let shelfs = []
                form[v].forEach((_, i) => {
                    shelfs.push(Number(form[v][i]))
                })
                formFormatted = {
                    ...formFormatted,
                    shelf: shelfs
                }
            }
        }

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors)
            notifications.show({
                color: "yellow",
                title: 'Invalid form',
                position: "bottom-center",
            })
        } else {
            const actionRes = await dispatchApiAddSection(formFormatted)
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
        isSectionsFetch, sections, page, setPage, pagesCount, offset, limit, dispatchApiGetSections, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, sectionsNotFound, dispatchApiDeleteSection, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingName
    }

}

const Sections = () => {

    const { isSectionsFetch, sections, page, setPage, pagesCount, offset, limit, dispatchApiGetSections, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, sectionsNotFound, dispatchApiDeleteSection, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingName } = useLocalState()

    return (
        <div className={styles.sections}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Add section">
                <form className={styles.form}>
                    <Input.Wrapper withAsterisk error={errors.name} className={styles.input_wrap} label="Name">
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
                    <Input.Wrapper error={errors.room} className={styles.input_wrap} label="Room">
                        <Input
                            rightSection={errors.room &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.room}
                            onChange={e => setField('room', e.target.value)}
                            className={styles.input}
                            placeholder='Enter room'
                        />
                    </Input.Wrapper>
                    <Input.Wrapper error={errors.shelf} className={styles.input_wrap} label="Shelf">
                        <TagsInput
                            rightSection={errors.shelf &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.shelf}
                            onChange={value => setField('shelf', value)}
                            className={styles.input}
                            placeholder="Enter number shelf" />
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
                    <Button onClick={() => { dispatchApiGetSections(search, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Button onClick={openModal} rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } variant="light">Add section</Button>
            </div>
            {!sectionsNotFound ?
                !isSectionsFetch ?
                    <>
                        {sections?.map((s, i) =>
                            <Paper
                                classNames={{
                                    root: styles.card,
                                }} key={i} shadow="sm" radius="md" withBorder p="xl">
                                <div className={styles.cell}>
                                    {s.Name_Section}
                                </div>
                                <div className={styles.cell}>
                                    {s.Room ? s.Room : "-"}
                                </div>
                                <div className={styles.cell}>
                                    {s.Shelfs?.join(", ") ? s.Shelfs?.join(", ") : "-"}
                                </div>
                                <ActionIcon loading={deletingName === s.Name_Section ? isDeletingFetch : false} onClick={() => dispatchApiDeleteSection(s.Name_Section)} variant="light" color="red">
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
                <h3 className={styles.not_found}>Sections not found</h3>
            }
        </div>
    );
}

export default Sections;