import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux"
import { apiGetBooks } from '../../store/slices/BooksSlice';
import useAuthRedirect from '../../middleware/isAuth.jsx';

import { Input, Button, CloseButton, Select, Card, Image, Text, AspectRatio, Paper, Pagination, Loader, Modal, Group, Collapse, Box, NumberInput } from '@mantine/core';
import styles from './books.module.scss';
import { IconSearch, IconFilterFilled, IconSquareRoundedPlus, IconCaretRightFilled } from '@tabler/icons-react';
import ImageOff from '/image_off.png'
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput, YearPickerInput } from '@mantine/dates';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Available');

    const {
        books: {
            books, count, limit, booksNotFound,
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

    return { isBooksFetch, books, search, setSearch, filter, handleFilter, page, setPage, pagesCount, offset, limit, dispatchApiGetBooks, booksNotFound }

}

const Books = () => {

    const { isBooksFetch, books, search, setSearch, filter, handleFilter, page, setPage, pagesCount, dispatchApiGetBooks, offset, limit, booksNotFound } = useLocalState()

    const [openedModal, { open, close: closeModal }] = useDisclosure(false);

    const [openedCollapse, { toggle: toggleCollapse }] = useDisclosure(false);

    const [value, setValue] = useState(new Date());

    return (
        <div className={styles.books}>
            <Modal
             classNames={{
                title: styles.title,
            }}
             className={styles.modal} opened={openedModal} onClose={closeModal} title="Add book">
                <form className={styles.form}>
                    <Input.Wrapper className={styles.input_wrap} label="Name">
                        <Input className={styles.input} placeholder='Enter name' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Name Author">
                        <Input className={styles.input} placeholder='Enter name author' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Image">
                        <Input className={styles.input} placeholder='Enter image' />
                    </Input.Wrapper>
                    <YearPickerInput
                        label="Year publish"
                        placeholder="Enter year publish"
                        value={value}
                        onChange={setValue}
                    />
                    <Input.Wrapper className={styles.input_wrap} label="House publish">
                        <Input className={styles.input} placeholder='Enter house publish' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Pages">
                        <NumberInput min={0} className={styles.input} placeholder='Enter pages' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Name genre">
                        <Input className={styles.input} placeholder='Enter name genre' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Name section">
                        <Input className={styles.input} placeholder='Enter name section' />
                    </Input.Wrapper>

                    <Box >
                        <Group justify="center">
                            <Button variant='transparent' onClick={toggleCollapse}>More</Button>
                        </Group>

                        <Collapse in={openedCollapse}>
                            <DatePickerInput
                                label="Date receipt"
                                placeholder="Enter date receipt"
                                value={value}
                                onChange={setValue}
                            />
                    <Input.Wrapper className={styles.input_wrap} label="Number grade">
                        <NumberInput NumberInput min={1} max={5} className={styles.input} placeholder='Enter number grade' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Comment">
                        <Input className={styles.input} placeholder='Enter comment' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Description">
                        <Input className={styles.input} placeholder='Enter description' />
                    </Input.Wrapper>
                    <Input.Wrapper className={styles.input_wrap} label="Source">
                        <Input className={styles.input} placeholder='Enter source' />
                    </Input.Wrapper>
                        </Collapse>
                    </Box>

                    <Button
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