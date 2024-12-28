import React, { useEffect, useState } from 'react';
import { apiGetBook } from '../../../store/slices/BooksSlice';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import useAuthRedirect from '../../../middleware/isAuth';

import ImageOff from '/image_off.png'
import { AspectRatio, Button, Divider, Image, Paper, Rating } from '@mantine/core';
import styles from './info.module.scss';

const useLocalState = () => {

    const { isAuthDispatch } = useAuthRedirect()

    const dispatchApiGetBook = async () => {
        isAuthDispatch(apiGetBook, { ID_Book: searchParamsBook_ID })
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
            name_Section,
        }
    } = useSelector((state) => state.books)

    const parsedYearPublish = year_publish ? new Date(year_publish).getFullYear() : "-";
    const parsedDateReceipt = date_receipt ? new Date(date_receipt).getFullYear() + "-" + ('0' + (new Date(date_receipt).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(date_receipt).getDate()).slice(-2) : "-";
    const parsedLastStatusChange = last_status_change ? new Date(last_status_change).getFullYear() + "-" + ('0' + (new Date(last_status_change).getMonth() + 1)).slice(-2) + "-" + ('0' + new Date(last_status_change).getDate()).slice(-2) : "-";

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
        name_Section,
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
        name_Section, } = useLocalState()

    return (
        <div className={styles.info}>
            <div className={styles.head}>
                <div className={styles.title}>
                    <h2 className={styles.name}>{name}</h2>
                    <div className={styles.status}>{status}, last change {parsedLastStatusChange}</div>
                </div>
                <div className={styles.actions}>
                    <Button color='red' variant='light'>Delete</Button>
                    <Button variant='light'>Edit</Button>
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
                    <div className={styles.rating}><div className={styles.title}>Grade</div><Rating defaultValue={2} size="lg" /></div>
                    <div className={styles.description}><div className={styles.title}>Description</div>{description ? description : "-"}</div>
                    <div className={styles.comment}><div className={styles.title}>Comment</div>{comment ? comment : "-"}</div>
                </Paper>
                <Paper className={styles.list_details} shadow="sm" withBorder  radius="lg">
                    <div className={styles.item}><div className={styles.key}>House publish</div><div className={styles.value}>{house_publish ? house_publish : "-"}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Year publish</div><div className={styles.valuee}>{parsedYearPublish}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Pages</div><div className={styles.valuee}>{pages ? pages : "-"}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Authors</div><div className={styles.valuee}>{authors?.join(", ") ? authors.join(", ") : "-"}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Genre</div><div className={styles.valuee}>{genre ? genre : "-"}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Section</div><div className={styles.value}>{name_Section ? name_Section : "-"}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Date receipt</div><div className={styles.value}>{parsedDateReceipt}</div></div>
                    <Divider className={styles.divider}/>
                    <div className={styles.item}><div className={styles.key}>Source</div><div className={styles.value}>{source ? source : "-"}</div></div>
                </Paper>
            </div>
        </div>
    );
};

export default BookInfo; 