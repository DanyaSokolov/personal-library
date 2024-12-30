import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux"
import { apiGetUsers, apiAddUser, apiDeleteUser, setDeletingUserID } from '../../store/slices/userSlice';
import useAuthRedirect from '../../middleware/isAuth.jsx';
import { unwrapResult } from '@reduxjs/toolkit';

import {
    Input, Button, CloseButton, Pagination, Loader, Modal, ScrollArea, ActionIcon,
    TagsInput,
    rem,
    Paper,
    Avatar,
    Fieldset
} from '@mantine/core';
import styles from './users.module.scss';
import { IconSearch, IconSquareRoundedPlus, IconExclamationCircle, IconTrash, IconCaretRight, IconCaretRightFilled } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatch = useDispatch()

    const [search, setSearch] = useState('');

    const {
        users: {
            users, count, limit, usersNotFound, deletingID,
            connection: { isUsersFetch, isAddingFetch, isDeletingFetch }
        }
    } = useSelector((state) => state.users);

    const dispatchApiGetUsers = async (search, offset, limit) => {
        isAuthDispatch(apiGetUsers, { search, offset, limit })
    }

    const dispatchApiAddUser = async (form) => {
        await isAuthDispatch(apiAddUser, form)
        handleCloseModal()
        dispatchApiGetUsers(search, offset, limit)
    }

    const dispatchApiDeleteUser = async (ID_User) => {
        dispatch(setDeletingUserID(ID_User))
        await isAuthDispatch(apiDeleteUser, { ID_User })
        dispatchApiGetUsers(search, offset, limit)
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetUsers(search, offset, limit)
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
            case 'image':
                if (value && value.length > 200) newError.image = `Image must be less than 200 characters.`
                break;
            case 'phone':
                if (value && value.length > 100) newError.phone = `Phone must be less than 100 characters.`
                break;
            case 'email':
                if (value && value.length > 100) newError.email = `Email must be less than 100 characters.`
                break;
            case 'network':
                if (value && value.length > 100) newError.network = `Network must be less than 100 characters.`
                break;
            case 'username':
                if (value && value.length > 100) newError.username = `Username must be less than 100 characters.`
                break;
        }

        return newError;
    }

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name', 'email', 'image', 'phone', 'network', 'username'];

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
            const actionRes = await dispatchApiAddUser(formFormatted)
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

    const [openedNetworkModal, { open: openNetworkModal, close: closeNetworkModal }] = useDisclosure(false)
    const [networks, setNetworks] = useState([])

    const handleOpenNetworkModal = (networks) => {
        openNetworkModal()
        setNetworks(networks)
    }

    const handleCloseNetworkModal = () => {
        closeNetworkModal()
        setNetworks([])
    }

    const addNetwork = () => {
        let newErrors = { ...errors };

        if (!form.network) {
            newErrors.network = 'Network name must not be empty';
        }
        if (!form.username) {
            newErrors.username = 'Username must not be empty';
        }

    if (newErrors.network || newErrors.username) {
        setErrors(newErrors);
        notifications.show({
            color: "yellow",
            title: 'Invalid form',
            position: "bottom-center",
        });
        return;
    }

        const isDuplicate = form.networks?.some(
            (n) => n.Name_Social_Network === form.network
        );

        if(isDuplicate) {
            setErrors({
                ...errors,
                network: 'Network name must not repeat' 
            })
            notifications.show({
                color: "yellow",
                title: 'Invalid form', 
                position: "bottom-center",
            })
            return
        }

        const updatedNetworks = [
            ...(form.networks || []), 
            { Name_Social_Network: form.network, Username: form.username } 
        ];
        
        setForm({
            ...form,
            networks: updatedNetworks, 
            network: '', 
            username: ''
        });
    }

    return {
        isUsersFetch, users, page, setPage, pagesCount, offset, limit, dispatchApiGetUsers, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, usersNotFound, dispatchApiDeleteUser, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingID, openedNetworkModal, handleOpenNetworkModal, handleCloseNetworkModal,
        networks, addNetwork
    }

}

const Users = () => {

    const { isUsersFetch, users, page, setPage, pagesCount, offset, limit, dispatchApiGetUsers, form, setField, errors,
        handleSubmit, isAddingFetch, isDeletingFetch, usersNotFound, dispatchApiDeleteUser, search, setSearch,
        openedModal, openModal, handleCloseModal, deletingID, openedNetworkModal, handleOpenNetworkModal, handleCloseNetworkModal,
        networks, addNetwork } = useLocalState()

    return (
        <div className={styles.users}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedNetworkModal} onClose={handleCloseNetworkModal} title="Social networks">
                {networks?.map((n) =>
                    <Paper
                        classNames={{
                            root: styles.network,
                        }} key={n.Name_Social_Network} radius="md" p="xs">
                        <div>{n.Name_Social_Network} </div>
                        <div>{n.Username}</div>
                    </Paper>
                )}
            </Modal>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Add user">
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
                    <Input.Wrapper error={errors.image} className={styles.input_wrap} label="Image">
                        <Input
                            rightSection={errors.image &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.image}
                            onChange={e => setField('image', e.target.value)}
                            className={styles.input}
                            placeholder='Enter image'
                        />
                    </Input.Wrapper>
                    <Input.Wrapper error={errors.email} className={styles.input_wrap} label="Email">
                        <Input
                            rightSection={errors.email &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.email}
                            onChange={e => setField('email', e.target.value)}
                            className={styles.input}
                            placeholder='Enter email'
                        />
                    </Input.Wrapper>
                    <Input.Wrapper error={errors.phone} className={styles.input_wrap} label="Phone">
                        <Input
                            rightSection={errors.phone &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.phone}
                            onChange={e => setField('phone', e.target.value)}
                            className={styles.input}
                            placeholder='Enter phone'
                        />
                    </Input.Wrapper>
                    <Fieldset className={styles.input_wrap} legend="Social networks">
                        <Input.Wrapper error={errors.network} className={styles.input_wrap} label="Network name">
                            <Input
                                rightSection={errors.network &&
                                    <IconExclamationCircle
                                        style={{ width: rem(20), height: rem(20) }}
                                        color="var(--mantine-color-error)"
                                    />
                                }
                                value={form.network}
                                onChange={e => setField('network', e.target.value)}
                                className={styles.input}
                                placeholder='Enter network'
                            />
                        </Input.Wrapper>
                        <Input.Wrapper error={errors.username} className={styles.input_wrap} label="Username">
                            <Input
                                rightSection={errors.username &&
                                    <IconExclamationCircle
                                        style={{ width: rem(20), height: rem(20) }}
                                        color="var(--mantine-color-error)"
                                    />
                                }
                                value={form.username}
                                onChange={e => setField('username', e.target.value)}
                                className={styles.input}
                                placeholder='Enter username'
                            />
                        </Input.Wrapper>
                        <Button
                            onClick={addNetwork}
                            className={styles.btn_submit}
                            rightSection={
                                <IconSquareRoundedPlus size="1rem"
                                />
                            }
                            variant="light">Add
                        </Button>
                        {form.networks?.map((n) =>
                            <Paper
                                classNames={{
                                    root: styles.network,
                                }} key={n.Name_Social_Network} radius="md" p="xs">
                                <div>{n.Name_Social_Network} </div>
                                <div>{n.Username}</div>
                            </Paper>
                        )}
                    </Fieldset>
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
                    <Button onClick={() => { dispatchApiGetUsers(search, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Button onClick={openModal} rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } variant="light">Add user</Button>
            </div>
            {!usersNotFound ?
                !isUsersFetch ?
                    <>
                        {users?.map((s, i) =>
                            <Paper
                                classNames={{
                                    root: styles.card,
                                }} key={i} shadow="xs" radius="md" withBorder p="xl">
                                <div className={styles.cell}>
                                    <Avatar name={s.Name} src={s.Image} />
                                    {s.Name}
                                </div>
                                <div className={styles.cell}>
                                    {s.Email ? s.Email : "-"}
                                </div>
                                <div className={styles.cell}>
                                    {s.Phone ? s.Phone : "-"}
                                </div>
                                <div className={styles.cell}>
                                    <Button rightSection={
                                        <IconCaretRightFilled size="1rem"
                                        />
                                    } onClick={() => handleOpenNetworkModal(s.Networks)} variant="default">Social networks</Button>
                                </div>
                                <ActionIcon loading={deletingID === s.ID_User ? isDeletingFetch : false} onClick={() => dispatchApiDeleteUser(s.ID_User)} variant="light" color="red">
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
                <h3 className={styles.not_found}>Users not found</h3>
            }
        </div>
    );
}

export default Users;