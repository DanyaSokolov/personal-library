import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux"
import { apiGetBooks, apiGetBookAddingInfo, apiAddBook } from '../../store/slices/BooksSlice';
import useAuthRedirect from '../../middleware/isAuth.jsx';

import {
    Input, Button, CloseButton, Select, Card, Image, Text, AspectRatio, Paper, Pagination, Loader, Modal, Group,
    Collapse, Box, NumberInput, rem, Autocomplete, MultiSelect, ScrollArea 
} from '@mantine/core';
import styles from './books.module.scss';
import { IconSearch, IconFilterFilled, IconSquareRoundedPlus, IconCaretRightFilled, IconExclamationCircle } from '@tabler/icons-react';
import ImageOff from '/image_off.png'
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput, DatesProvider, YearPickerInput } from '@mantine/dates';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect() 

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Available');

    const {
        books: {
            books, count, limit, booksNotFound,
            add_info: { authors, genres, sections },
            connection: { isBooksFetch }
        }
    } = useSelector((state) => state.books);

    const dispatchApiGetBooks = async (search, filter, offset, limit) => {
        isAuthDispatch(apiGetBooks, { search, filter, offset, limit })
    }

    const [page, setPage] = useState(1)

    let pagesCount = Math.ceil(count / limit)

    const offset = (+page - 1) * limit

    let pages = 0;
    for (let i = 1; i <= pagesCount; i++) {
        pages++;
    }

    useEffect(() => {
        dispatchApiGetBooks(search, filter, offset, limit)
    }, [page, filter])

    const handleFilter = (value) => {
        setFilter(value)
        setPage(1)
    }

    const [openedModal, { open, close: closeModal }] = useDisclosure(false)
    const [openedCollapse, { close: closeCollapse, toggle: toggleCollapse }] = useDisclosure(false);

    const [form, setForm] = useState({})
    const [errors, setErrors] = useState({})

    const handleCloseModal = () => {
        closeModal()
        closeCollapse()
        setForm({})
    }

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
            case 'author':
                if (value && value.length > 100) newError.author = `Author must be less than 100 characters.`
                break;
            case 'image':
                if (value && value.length > 200) newError.image = `Image must be less than 200 characters.`
                break;
            case 'year_publish':
                if (value && value.length > 4) newError.year_publish = `Year publish must be less than 4 characters.`
                break;
            case 'house_publish':
                if (value && value.length > 100) newError.house_publish = `House publish must be less than 100 characters.`
                break;
            case "comment":
                if (value && value.length > 300) newError.comment = `Comment must be less than 300 characters.`
                break;
            case "description":
                if (value && value.length > 600) newError.description = `Description must be less than 600 characters.`
                break;
            case "source":
                if (value && value.length > 100) newError.source = `Source must be less than 100 characters.`
                break;
        }

        return newError;
    }

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name', 'author', 'image', 'year_publish', 'house_publish'];

        fields.forEach(field => {
            const fieldErrors = validateField(field, form[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const dispatchApiAddBook = async () => {
        isAuthDispatch(apiAddBook, form)
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
            
           const actionRes = await dispatchApiAddBook(form)
        //    const promiseRes = unwrapResult(actionRes) 

        //     switch (promiseRes.status) { 
        //         case "incorrect_name": 
        //             setErrors({name: 'Incorrect name'})
        //             notifications.show({
        //                 color: "red",
        //                 title: 'Incorrect name',
        //                 position: "bottom-center",
        //             })
        //             break
        //         case "incorrect_password": 
        //         setErrors({password: 'Inorrect password'})
        //             notifications.show({
        //                 color: "red",
        //                 title: 'Incorrect password',
        //                 position: "bottom-center",
        //             })
        //             break
        //         case "success": 
        //             await dispatchApiIsUser()
        //             navigate("/") 
        //     }
        } 
    }

    const dispatchApiGetBookAddingInfo = async () => {
        isAuthDispatch(apiGetBookAddingInfo)
    }

    var [ ininFormAddingInfo, setIninFormAddingInfo] = useState({})

    const loadModal = async () => {
        await dispatchApiGetBookAddingInfo()
        setIninFormAddingInfo({authors: authors, genres: genres, sections: sections})
    }

    useEffect(() => {
        loadModal()
    }, [])

    return {
        isBooksFetch, books, search, setSearch, filter, handleFilter, page, setPage, pagesCount, offset, limit,
        dispatchApiGetBooks, booksNotFound, openedCollapse, toggleCollapse, form, setField, errors, handleSubmit,
        openedModal, handleCloseModal, open, ininFormAddingInfo
    }

}

const Books = () => {

    const { isBooksFetch, books, search, setSearch, filter, handleFilter, page, setPage, pagesCount, offset, limit,
        dispatchApiGetBooks, booksNotFound, openedCollapse, toggleCollapse, form, setField, errors, handleSubmit,
        openedModal, handleCloseModal, open, ininFormAddingInfo } = useLocalState()

    return (
        <div className={styles.books}>
            <Modal
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Add book">
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
                    <Input.Wrapper error={errors.author} className={styles.input_wrap} label="Name Author">
                    <MultiSelect
                       placeholder="Enter name author"
                       data={ininFormAddingInfo.authors}
                       limit={5}
                       value={form.author}
                       onChange={value => setField('author', value)}
                       className={styles.input}
                        searchable
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
                            placeholder='Enter image URL' />
                    </Input.Wrapper>
                    <DatesProvider settings={{ timezone: 'UTC' }}>
                    <YearPickerInput 
                        allowDeselect={true}
                        classNames={{
                            input: styles.input_date, 
                        }} 
                        value={form.year_publish}
                        onChange={value => setField('year_publish', value)}
                        label="Year publish"
                        placeholder="Enter year publish"
                    />
                    </DatesProvider>
                    <Input.Wrapper error={errors.house_publish} className={styles.input_wrap} label="House publish">
                        <Input
                            rightSection={errors.house_publish &&
                                <IconExclamationCircle
                                    style={{ width: rem(20), height: rem(20) }}
                                    color="var(--mantine-color-error)"
                                />
                            }
                            value={form.house_publish}
                            onChange={e => setField('house_publish', e.target.value)}
                            className={styles.input}
                            placeholder='Enter house publish' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Pages">
                        <NumberInput
                        allowDecimal={false}
                            value={form.pages}
                            onChange={value => setField('pages', value)}
                            min={0} className={styles.input} placeholder='Enter pages' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Name genre">
                        <Autocomplete
                            placeholder="Enter name genre"
                            data={ininFormAddingInfo.genres}
                            limit={5}
                            value={form.genre}
                            onChange={value => setField('genre', value)}
                            className={styles.input}
                        />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Name section">
                        <Autocomplete
                            placeholder="Enter name section"
                            data={ininFormAddingInfo.sections}
                            limit={5}
                            value={form.section}
                            onChange={value => setField('section', value)}
                            className={styles.input}
                        />
                    </Input.Wrapper>

                    <Box >
                        <Group justify="center">
                            <Button variant='transparent' onClick={toggleCollapse}>More</Button>
                        </Group>

                        <Collapse in={openedCollapse}>
                        <DatesProvider settings={{ timezone: 'UTC' }}>
                            <DatePickerInput
                                classNames={{
                                    input: styles.input_date,
                                }}
                                allowDeselect={true}
                                value={form.date_receipt}
                                onChange={value => setField('date_receipt', value)}
                                label="Date receipt"
                                placeholder="Enter date receipt"
                            />
                            </DatesProvider>
                            <Input.Wrapper className={styles.input_wrap} label="Number grade">
                                <NumberInput
                                allowDecimal={false}
                                    value={form.grade}
                                    onChange={value => setField('grade', value)}
                                    min={1} max={5} className={styles.input} placeholder='Enter number grade' />
                            </Input.Wrapper>
                            <Input.Wrapper error={errors.comment} className={styles.input_wrap} label="Comment">
                                <Input
                                    rightSection={errors.comment &&
                                        <IconExclamationCircle
                                            style={{ width: rem(20), height: rem(20) }}
                                            color="var(--mantine-color-error)"
                                        />
                                    }
                                    value={form.comment}
                                    onChange={e => setField('comment', e.target.value)}
                                    className={styles.input} placeholder='Enter comment' />
                            </Input.Wrapper>
                            <Input.Wrapper error={errors.description} className={styles.input_wrap} label="Description">
                                <Input
                                    rightSection={errors.description &&
                                        <IconExclamationCircle
                                            style={{ width: rem(20), height: rem(20) }}
                                            color="var(--mantine-color-error)"
                                        />
                                    }
                                    value={form.description}
                                    onChange={e => setField('description', e.target.value)}
                                    className={styles.input} placeholder='Enter description' />
                            </Input.Wrapper>
                            <Input.Wrapper error={errors.source} className={styles.input_wrap} label="Source">
                                <Input
                                    rightSection={errors.source &&
                                        <IconExclamationCircle
                                            style={{ width: rem(20), height: rem(20) }}
                                            color="var(--mantine-color-error)"
                                        />
                                    }
                                    value={form.source}
                                    onChange={e => setField('source', e.target.value)}
                                    className={styles.input} placeholder='Enter source' />
                            </Input.Wrapper>
                        </Collapse>
                    </Box>

                    <Button
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
                    <Button onClick={() => { dispatchApiGetBooks(search, filter, offset, limit); setPage(1) }} variant="filled">Search</Button>
                </div>
                <Select
                    allowDeselect={false}
                    variant="filled"
                    value={filter}
                    onChange={(v) => handleFilter(v)}
                    leftSection={<IconFilterFilled size="1rem" />}
                    data={['Available', 'Loaned', 'Absent', 'All']}

                />
                <Button rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } onClick={open} variant="light">Add Book</Button>
            </div>
            {!booksNotFound ?
                !isBooksFetch ?
                    <>
                        <div className={styles.cards}>
                            {books?.map((b, i) =>
                                <Paper className={styles.card_wrap} shadow="sm" radius="md" withBorder>
                                    <div style={{ backgroundColor: b.Status === 'available' ? '#2BDD66' : b.Status === 'loaned' ? '#0063FF' : '#F21616' }} className={styles.my_indicator}></div>
                                    <Card className={styles.card}>
                                        <Card.Section>
                                            <AspectRatio classNames={{
                                                root: styles.ratio,
                                            }} ratio={1 / 1.5} maw={300} mx="auto">
                                                {b.Image ?
                                                    <Image src={b.Image} />
                                                    :
                                                    <Image src={ImageOff} />}
                                            </AspectRatio>
                                        </Card.Section>

                                        <Text className={styles.name} fw={500}>{b.Name}</Text>
                                        <Button
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
                <h3 className={styles.not_found}>Books not found</h3>
            }
        </div>
    );
}

export default Books;