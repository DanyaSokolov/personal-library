import React, { useState } from 'react';
import { Input, Button, CloseButton, Select, Card, Image, Text, AspectRatio, Paper, Pagination } from '@mantine/core';
import { useDispatch, useSelector } from "react-redux"

import styles from './books.module.scss';
import { IconSearch, IconFilterFilled, IconSquareRoundedPlus, IconCaretRightFilled } from '@tabler/icons-react';

const useLocalState = () => {

    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('Avaliable');

    const dispatch = useDispatch()

    return { search, setSearch, filter, setFilter }

} 

const Books = () => {

    const books = [
        {
            Name: 'The Shining',
            Image: 'https://upload.wikimedia.org/wikipedia/ru/1/10/%D0%9E%D0%B1%D0%BB%D0%BE%D0%B6%D0%BA%D0%B0_%D0%BA%D0%BD%D0%B8%D0%B3%D0%B8_%22%D0%9D%D0%B0%D0%B2%D0%B0%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D1%8F%22%2C_%D0%9C%D0%B0%D0%BA%D1%81_%D0%A4%D1%80%D0%B0%D0%B9.jpg',
            Year_Publish: '1977-01-28',
            House_Publish: 'Doubleday',
            Pages: 447,
            Source: 'Donation',
            Date_Receipt: '2020-05-12',
            Number_Grade: 9,
            Comment: 'Horror classic',
            Date_Last_Status_Change: '2023-10-10',
            Name_Genre: 'Fiction',
            Status: 'available',
            Description: 'A haunted hotel thriller',
            Name_Section: 'Fiction Section',
            Number_Shelf: 1
        },
        {
            Name: 'Harry Potter and the Sorcerer\'s Stone ewfewfew ew few f ewf ew f ew',
            Image: 'https://imo10.labirint.ru/books/935400/cover.jpg/236-0',
            Year_Publish: '1997-06-26',
            House_Publish: 'Bloomsbury',
            Pages: 309,
            Source: 'Purchase',
            Date_Receipt: '2019-08-15',
            Number_Grade: 10,
            Comment: 'Magic and adventure',
            Date_Last_Status_Change: '2023-06-22',
            Name_Genre: 'Fantasy',
            Status: 'loaned',
            Description: 'The first book in the Harry Potter series',
            Name_Section: 'Children Section',
            Number_Shelf: 1
        },
        { 
            Name: '1984',
            Image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyjLHjIxokL8jk7WzpVg9dhu3JvnyuQbBQqw&s',
            Year_Publish: '1949-06-08',
            House_Publish: 'Secker & Warburg',
            Pages: 328,
            Source: 'Donation',
            Date_Receipt: '2018-11-05',
            Number_Grade: 8,
            Comment: 'Dystopian novel',
            Date_Last_Status_Change: '2022-12-15',
            Name_Genre: 'Science Fiction',
            Status: 'available',
            Description: 'A critique of totalitarianism',
            Name_Section: 'Science Section',
            Number_Shelf: 1
        },
        {
            Name: 'To Kill a Mockingbird',
            Image: 'https://fotoblik.ru/wp-content/uploads/2023/09/oblozhka-dlia-knigi-2-1.webp',
            Year_Publish: '1960-07-11',
            House_Publish: 'J.B. Lippincott & Co.',
            Pages: 281,
            Source: 'Gift',
            Date_Receipt: '2021-03-10',
            Number_Grade: 10,
            Comment: 'Classic literature',
            Date_Last_Status_Change: '2023-09-05',
            Name_Genre: 'Fiction',
            Status: 'available',
            Description: 'A novel about racial injustice',
            Name_Section: 'Classic Section',
            Number_Shelf: 2
        },
        {
            Name: 'The Hobbit',
            Image: 'https://imo10.labirint.ru/books/925680/cover.jpg/236-0',
            Year_Publish: '1937-09-21',
            House_Publish: 'George Allen & Unwin',
            Pages: 310,
            Source: 'Purchase',
            Date_Receipt: '2022-01-18',
            Number_Grade: 9,
            Comment: 'Fantasy adventure',
            Date_Last_Status_Change: '2023-07-20',
            Name_Genre: 'Fantasy',
            Status: 'absent',
            Description: 'A journey to reclaim treasure from a dragon',
            Name_Section: 'Fantasy Section',
            Number_Shelf: 3
        },
        {
            Name: 'Pride and Prejudice',
            Image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTINy5-amxjxKf6QHby1HiDxgxePhCQ8FacfQ&s',
            Year_Publish: '1813-01-28',
            House_Publish: 'T. Egerton',
            Pages: 279,
            Source: 'Donation', 
            Date_Receipt: '2020-11-30',
            Number_Grade: 9,
            Comment: 'Romantic classic',
            Date_Last_Status_Change: '2023-04-12',
            Name_Genre: 'Romance',
            Status: 'available', 
            Description: 'A romantic novel about manners and marriage',
            Name_Section: 'Romance Section',
            Number_Shelf: 2
        }
    ];


    const { search, setSearch, filter, setFilter } = useLocalState()

    return (
        <div className={styles.books}>
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
                    <Button variant="filled">Search</Button>
                </div>
                <Select
                    allowDeselect={false}
                    variant="filled"
                    value={filter}
                    onChange={setFilter} 
                    leftSection={<IconFilterFilled size="1rem" />}
                    data={['Avaliable', 'Loaned', 'Absent', 'All']}
                  
                />
                <Button rightSection={
                    <IconSquareRoundedPlus size="1rem"
                    />
                } variant="light">Add Book</Button>
            </div>
            <div className={styles.cards}>
                {books?.map((b, i) =>
                 <Paper className={styles.card_wrap} shadow="sm" radius="md" withBorder>
                <div style={{backgroundColor: b.Status === 'available' ? '#2BDD66' : b.Status === 'loaned' ? '#0063FF' : '#F21616'}} className={styles.my_indicator}></div>
                    <Card className={styles.card}>
                        <Card.Section>
                            <AspectRatio classNames={{
                            root: styles.ratio,
                        }} ratio={1 / 1.5} maw={300} mx="auto">
                            <Image
                                src={b.Image}
                                alt="No image"
                            />
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
            <Pagination className={styles.pagination} total={10} />
        </div>
    );
}

export default Books;