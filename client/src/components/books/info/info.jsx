import React, { useEffect, useState } from 'react';
import { apiDeleteBook, apiEditBook, apiGetBook, apiGetBookAddingInfo, apiSetGradeBook, apiSetStatusAbsentBook, apiSetStatusAvailableBook, setGrade } from '../../../store/slices/BooksSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthRedirect from '../../../middleware/isAuth';

import ImageOff from '/image_off.png'
import { Button, Divider, Image, Loader, Modal, Paper, Rating, ScrollArea, Input, MultiSelect, NumberInput, Autocomplete, Box, Collapse, Group, rem } from '@mantine/core';
import styles from './info.module.scss';
import { IconEdit, IconExclamationCircle, IconMinus, IconPlus, IconSquareRoundedPlus, IconTrash, IconUserShare } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { DatePickerInput, DatesProvider, YearPickerInput } from '@mantine/dates';
import { unwrapResult } from '@reduxjs/toolkit';
import { notifications } from '@mantine/notifications';
import { apiCreateLoan, apiGetLoanAddingInfo } from '../../../store/slices/loanSlice';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatch = useDispatch()

    const dispatchApiGetBook = async () => {
        isAuthDispatch(apiGetBook, { ID_Book: searchParamsBook_ID })
    }

    const dispatchApiSetStatusAbsentBook = async () => {
        await isAuthDispatch(apiSetStatusAbsentBook, { ID_Book: searchParamsBook_ID })
        navigate('/')
    }

    const dispatchApiSetStatusAvailableBook = async () => {
        await isAuthDispatch(apiSetStatusAvailableBook, { ID_Book: searchParamsBook_ID })
        navigate('/')
    }

    const dispatchApiSetGradeBook = async (grade) => {
        return isAuthDispatch(apiSetGradeBook, { ID_Book: searchParamsBook_ID, grade })
    }

    const handleGrade = async (grade) => {
        await dispatchApiSetGradeBook(grade)
        dispatch(setGrade(grade))
    }

    const navigate = useNavigate()

    const dispatchApiDeleteBook = async () => {
        await isAuthDispatch(apiDeleteBook, { ID_Book: searchParamsBook_ID })
        navigate('/')
    }

    const [searchParams, _] = useSearchParams()

    let searchParamsBook_ID = Number(searchParams.get("id"))

    useEffect(() => {
        dispatchApiGetBook()
    }, [])

    const {
        info: {
            ID_Book,
            name,
            authors,
            image,
            year_publish,
            house_publish,
            pages,
            source,
            date_receipt,
            grade,
            comment,
            last_status_change,
            genre,
            status,
            description,
            section,
            // connection: { isDeletingFetch }
        },
        books: {
            add_info: { authors: authorsInfo, genres: genresInfo, sections: sectionsInfo },
            connection: { isBookAddingInfoFetch }
        }
    } = useSelector((state) => state.books)

    const parsedYearPublish = year_publish ? new Date(year_publish).getFullYear() : "-";
    const parsedDateReceipt = date_receipt ? new Date(date_receipt).getFullYear() + "-" + ('0' + (new Date(date_receipt).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(date_receipt).getDate()).slice(-2) : "-";
    const parsedLastStatusChange = last_status_change ? new Date(last_status_change).getFullYear() + "-" + ('0' + (new Date(last_status_change).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(last_status_change).getDate()).slice(-2) : "-";

    const [openedModal, { open: openModal, close: closeModal }] = useDisclosure(false)
    const [openedCollapse, { close: closeCollapse, toggle: toggleCollapse }] = useDisclosure(false);

    const [form, setForm] = useState({ grade: grade })
    const [errors, setErrors] = useState({})

    const handleCloseModal = () => {
        closeModal()
        closeCollapse()
        setForm({})
        setErrors({})
    }

    const handleOpenModal = async () => {
        openModal()
        setForm({
            ID_Book: ID_Book,
            name: name,
            author: authors ? authors : [],
            image: image,
            year_publish: year_publish ? new Date(year_publish) : null,
            house_publish, house_publish,
            pages: pages,
            source: source,
            date_receipt: date_receipt ? new Date(date_receipt) : null,
            grade, grade,
            comment, comment,
            last_status_change: last_status_change,
            genre: genre,
            status: status,
            description: description,
            section: section,
        })
        dispatchApiGetBookAddingInfo()
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
                if (value && !isValidUrl(value)) newError.image = `The image must be a url address.`
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

    const isValidUrl = (str) => {
        try {
            return !!new URL(str);
        }
        catch (_) {
            return false;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        const fields = ['name', 'author', 'image', 'year_publish', 'house_publish'];

        fields.forEach(field => {
            const fieldErrors = validateField(field, form[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const dispatchApiEditBook = async () => {
        return isAuthDispatch(apiEditBook, form)
    }

    const handleSubmit = async () => {

        const formErrors = validateForm()

        for (var v in form) {
            if (v === 'pages' || v === 'grade') {
                form[v] = Number(form[v])
            }
            if (v === 'genre' && form[v] && !(genresInfo.includes(form[v]))) {
                Object.assign(formErrors, { genre: 'Incorrect name genre' })
            }
            if (v === 'section' && form[v] && !(sectionsInfo.includes(form[v]))) {
                Object.assign(formErrors, { section: 'Incorrect name section' })
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
            console.log(form)
            const actionRes = await dispatchApiEditBook(form)
            const promiseRes = unwrapResult(actionRes)

            if (promiseRes.status === "success") {
                notifications.show({
                    color: "green",
                    title: 'Book successfully edited',
                    position: "bottom-center",
                })
                handleCloseModal()
                dispatchApiGetBook()
            }
        }
    }

    const dispatchApiGetBookAddingInfo = async () => {
        isAuthDispatch(apiGetBookAddingInfo)
    }

    const {
        create_info: {
            users,
            connection: { isLoanAddingInfoFetch }
        },
    } = useSelector((state) => state.loans)

    const dispatchApiGetLoanAddingInfo = async () => {
        return isAuthDispatch(apiGetLoanAddingInfo)
    }

    const [openedModalLoan, { open: openModalLoan, close: closeModalLoan }] = useDisclosure(false)

    const [formLoan, setFormLoan] = useState({ grade: grade })
    const [errorsLoan, setErrorsLoan] = useState({})

    const setFieldLoan = (field, value) => {
        setFormLoan({
            ...formLoan,
            [field]: value
        });

        const fieldErrors = validateFieldLoan(field, value);

        setErrorsLoan({
            ...errorsLoan,
            [field]: fieldErrors[field]
        });
    }

    const validateFieldLoan = (field, value) => {
        const newError = {};

        switch (field) {
            case 'user':
                if (!value) newError.user = 'Please enter user';
                break;
        }

        return newError;
    }

    const validateFormLoan = () => {
        const newErrors = {};

        const fields = ['user'];

        fields.forEach(field => {
            const fieldErrors = validateFieldLoan(field, formLoan[field]);
            Object.assign(newErrors, fieldErrors);
        });

        return newErrors;
    }

    const handleCloseModalLoan = () => {
        closeModalLoan()
        setFormLoan({})
        setErrorsLoan({})
    }

    const handleOpenModalLoan = async () => {
        await dispatchApiGetLoanAddingInfo()
        openModalLoan() 
        setFormLoan({
            ID_Book: ID_Book ? ID_Book : null,
        })
    }

    const dispatchApiCreateLoan = async () => {
        return isAuthDispatch(apiCreateLoan ,formLoan)
    }

    const handleSubmitLoan = async () => {

        const formErrors = validateFormLoan()

        for (var v in formLoan) {
            if (v === 'user' && formLoan[v] && !(users.includes(formLoan[v]))) {
                Object.assign(formErrors, { user: 'Incorrect name user' });
            }
        }

        if (Object.keys(formErrors).length > 0) {
            setErrorsLoan(formErrors)
            notifications.show({
                color: "yellow",
                title: 'Invalid form',
                position: "bottom-center",
            })
        } else {
            console.log(formLoan)
            const actionRes = await dispatchApiCreateLoan()
            const promiseRes = unwrapResult(actionRes)

            if (promiseRes.status === "success") {
                notifications.show({
                    color: "green",
                    title: 'Loan successfully created',
                    position: "bottom-center",
                })
                handleCloseModalLoan()
                dispatchApiGetBook()
            } 
        }
    }

    return {
        ID_Book,
        name,
        authors,
        image,
        parsedYearPublish,
        house_publish,
        pages,
        source,
        parsedDateReceipt,
        grade,
        comment,
        parsedLastStatusChange,
        genre,
        status,
        description,
        section,
        dispatchApiDeleteBook,
        // isDeletingFetch
        openedCollapse, toggleCollapse, form, setField, errors, handleSubmit,
        openedModal, handleCloseModal, handleOpenModal, isBookAddingInfoFetch, authorsInfo, genresInfo, sectionsInfo,
        dispatchApiSetStatusAbsentBook, dispatchApiSetStatusAvailableBook, handleGrade,
        openedModalLoan, formLoan, errorsLoan, handleCloseModalLoan, handleOpenModalLoan, isLoanAddingInfoFetch, users,
        setFieldLoan, handleSubmitLoan
    }
}

const BookInfo = () => {

    const {
        ID_Book,
        name,
        authors,
        image,
        parsedYearPublish,
        house_publish,
        pages,
        source,
        parsedDateReceipt,
        grade,
        comment,
        parsedLastStatusChange,
        genre,
        status,
        description,
        section,
        dispatchApiDeleteBook,
        // isDeletingFetch
        openedCollapse, toggleCollapse, form, setField, errors, handleSubmit,
        openedModal, handleCloseModal, handleOpenModal, isBookAddingInfoFetch, authorsInfo, genresInfo, sectionsInfo,
        handleGrade, dispatchApiSetStatusAbsentBook, dispatchApiSetStatusAvailableBook,
        openedModalLoan, formLoan, errorsLoan, handleCloseModalLoan, handleOpenModalLoan, isLoanAddingInfoFetch, users,
        setFieldLoan, handleSubmitLoan
    } = useLocalState()

    return (
        <div className={styles.info}>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title_form,
                }}
                className={styles.modal} opened={openedModalLoan} onClose={handleCloseModalLoan} title="Create loan">
                {!isLoanAddingInfoFetch ?
                    <form className={styles.formLoan}> 
                        <Input.Wrapper withAsterisk error={errorsLoan.user} className={styles.input_wrap} label="User">
                            <Autocomplete
                                rightSection={errorsLoan.user &&
                                    <IconExclamationCircle
                                        style={{ width: rem(20), height: rem(20) }}
                                        color="var(--mantine-color-error)"
                                    />
                                }
                                placeholder="Enter user"
                                data={users}
                                limit={5}
                                value={formLoan.user} 
                                onChange={(value) => (setFieldLoan('user', value))}
                                className={styles.input}
                            />
                        </Input.Wrapper>
                        <DatesProvider settings={{ timezone: 'UTC' }}>
                            <DatePickerInput
                            minDate={new Date()}
                                classNames={{
                                    input: styles.input_date,
                                }}
                                allowDeselect={true}
                                value={formLoan.termin}
                                onChange={value => { setFieldLoan('termin', value)}}
                                label="Termin" 
                                placeholder="Enter termin"
                            />
                        </DatesProvider>

                        <Button
                            onClick={handleSubmitLoan}
                            className={styles.btn_submit}
                            rightSection={
                                <IconSquareRoundedPlus size="1rem"
                                />
                            }
                            variant="filled">Create
                        </Button>
                    </form>
                    :
                    <Loader
                        classNames={{
                            root: styles.loader,
                        }} color="blue" />
                }
            </Modal>
            <Modal
                radius="lg"
                scrollAreaComponent={ScrollArea.Autosize}
                classNames={{
                    title: styles.title_form,
                }}
                className={styles.modal} opened={openedModal} onClose={handleCloseModal} title="Edit book">
                {!isBookAddingInfoFetch ?
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
                                data={authorsInfo}
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
                        <Input.Wrapper error={errors.genre} className={styles.input_wrap} label="Name genre">
                            <Autocomplete
                                rightSection={errors.genre &&
                                    <IconExclamationCircle
                                        style={{ width: rem(20), height: rem(20) }}
                                        color="var(--mantine-color-error)"
                                    />
                                }
                                placeholder="Enter name genre"
                                data={genresInfo}
                                limit={5}
                                value={form.genre}
                                onChange={value => setField('genre', value)}
                                className={styles.input}
                            />
                        </Input.Wrapper>
                        <Input.Wrapper error={errors.section} className={styles.input_wrap} label="Name section">
                            <Autocomplete
                                rightSection={errors.section &&
                                    <IconExclamationCircle
                                        style={{ width: rem(20), height: rem(20) }}
                                        color="var(--mantine-color-error)"
                                    />
                                }
                                placeholder="Enter name section"
                                data={sectionsInfo}
                                limit={5}
                                value={form.section}
                                onChange={value => setField('section', value)}
                                className={styles.input}
                            />
                        </Input.Wrapper>

                        <Box>
                            <Group justify="center">
                                <Button variant='transparent' onClick={toggleCollapse}>{openedCollapse ? "Less" : "More"}</Button>
                            </Group>

                            <Collapse in={openedCollapse}>
                                <DatesProvider settings={{ timezone: 'UTC' }}>
                                    <DatePickerInput
                                        classNames={{
                                            input: styles.input_date,
                                        }}
                                        allowDeselect={true}
                                        value={form.date_receipt}
                                        onChange={value => { setField('date_receipt', value) }}
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
                                <IconEdit size="1rem"
                                />
                            }
                            variant="filled">Edit
                        </Button>
                    </form>
                    :
                    <Loader
                        classNames={{
                            root: styles.loader,
                        }} color="blue" />
                }
            </Modal>
            <div className={styles.head}>
                <div className={styles.title}>
                    <h2 className={styles.name}>{name}</h2>
                    <div className={styles.status}><div style={{ backgroundColor: status === 'Available' ? '#40c057' : status === 'Loaned' ? '#228be6' : '#868e96' }} className={styles.indicator}></div>{status}, last change {parsedLastStatusChange}</div>
                </div>
                <div className={styles.actions}>
                    {status === 'Available' ?
                        <>
                            <Button rightSection={
                                <IconTrash size="1rem" />
                            }
                                // loading={isDeletingFetch}
                                onClick={() => dispatchApiDeleteBook()} color='red' variant='light'>Delete</Button>
                            <Button rightSection={
                                <IconMinus size="1rem" />
                            }
                                onClick={dispatchApiSetStatusAbsentBook} color='grey' variant='light'>Absent</Button>
                            <Button rightSection={
                                <IconEdit size="1rem" />
                            }
                                onClick={handleOpenModal} variant='light'>Edit</Button>
                            <Button
                                onClick={handleOpenModalLoan} rightSection={
                                    <IconUserShare size="1rem" />
                                } variant='outline'>Loan</Button>
                        </>
                        :
                        status === 'Absent'
                            ?
                            <>
                                <Button rightSection={
                                    <IconTrash size="1rem" />
                                }
                                    // loading={isDeletingFetch}
                                    onClick={() => dispatchApiDeleteBook()} color='red' variant='light'>Delete</Button>
                                <Button rightSection={
                                    <IconPlus size="1rem" />
                                }
                                    onClick={dispatchApiSetStatusAvailableBook} color='green' variant='light'>Available</Button>
                                <Button rightSection={
                                    <IconEdit size="1rem" />
                                }
                                    onClick={handleOpenModal} variant='light'>Edit</Button>
                            </>
                            :
                            <>
                             <Button rightSection={
                                    <IconTrash size="1rem" />
                                }
                                    // loading={isDeletingFetch}
                                    onClick={() => dispatchApiDeleteBook()} color='red' variant='light'>Delete</Button>
                                <Button rightSection={
                                    <IconEdit size="1rem" />
                                }
                                    onClick={handleOpenModal} variant='light'>Edit</Button>
                            </>
                    }
                </div>
            </div>
            <div className={styles.content}>
                <Paper className={styles.image_wrap} shadow="sm" withBorder radius="lg">
                    {image ?
                        <Image className={styles.image} src={image} />
                        :
                        <Image className={styles.image} src={ImageOff} />}
                </Paper>
                <Paper className={styles.main} shadow="sm" radius="lg">
                    <div className={styles.rating}><div className={styles.title}>Grade</div><Rating fractions={2} onChange={(g) => handleGrade(g * 2)} value={grade / 2} size="lg" /></div>
                    <div className={styles.description}><div className={styles.title}>Description</div>{description ? description : "-"}</div>
                    <div className={styles.comment}><div className={styles.title}>Comment</div>{comment ? comment : "-"}</div>
                </Paper>
                <Paper className={styles.list_details} shadow="sm" withBorder radius="lg">
                    <div className={styles.item}><div className={styles.key}>House publish</div><div className={styles.value}>{house_publish ? house_publish : "-"}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Year publish</div><div className={styles.valuee}>{parsedYearPublish}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Pages</div><div className={styles.valuee}>{pages ? pages : "-"}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Authors</div><div className={styles.valuee}>{authors?.join(", ") ? authors.join(", ") : "-"}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Genre</div><div className={styles.valuee}>{genre ? genre : "-"}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Section</div><div className={styles.value}>{section ? section : "-"}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Date receipt</div><div className={styles.value}>{parsedDateReceipt}</div></div>
                    <Divider className={styles.divider} />
                    <div className={styles.item}><div className={styles.key}>Source</div><div className={styles.value}>{source ? source : "-"}</div></div>
                </Paper>
            </div>
        </div>
    );
};

export default BookInfo; 