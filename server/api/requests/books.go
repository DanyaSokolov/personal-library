package requests

import (
	e "server-library/errors"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func GetBooks(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM book "
	} else {
		query += "SELECT count(*) FROM book WHERE Name LIKE ? "
		args = append(args, "%"+data["search"].(string)+"%")
	}

	if data["filter"].(string) != "" && data["filter"].(string) != "All" {
		if data["search"].(string) != "" {
			query += "AND Status = "
		} else {
			query += "WHERE Status = "
		}
		switch data["filter"].(string) {
		case "Available":
			query += "'available' "
		case "Loaned":
			query += "'loaned' "
		case "Absent":
			query += "'absent' "
		}
	}

	queryCount, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryCount' request", err, c)
	}
	defer queryCount.Close()

	for queryCount.Next() {
		queryCount.Scan(&count)
	}

	if count == 0 {
		c.JSON(200, gin.H{"status": "no_books"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "ID_Book, Name, Image, Status", 1)

	queryBooks, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryBooks' request", err, c)
	}
	defer queryBooks.Close()

	type Book struct {
		ID     int            `json:"ID_Book"`
		Name   string         `json:"Name"`
		Image  *string 		  `json:"Image"`
		Status string         `json:"Status"`
	}

	books := []Book{}

	for queryBooks.Next() {
		b := Book{}
		err := queryBooks.Scan(&b.ID, &b.Name, &b.Image, &b.Status)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooks' response", err, c)
		}
		books = append(books, b)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"books": books,
			"count": count,
		},
	})
}

func GetBookAddingInfo(c *gin.Context) {

	queryGenres, err := db.Query("SELECT * from genre")

	if err != nil {
		e.Wrap("Something wrong with 'queryGenres' request", err, c)
	}
	defer queryGenres.Close()

	genres := []string{}

	for queryGenres.Next() {
		var genre string
		err := queryGenres.Scan(&genre)
		if err != nil {
			e.Wrap("Cann not scan the 'queryGenres' response", err, c)
		}
		genres = append(genres, genre)
	}

	queryAuthors, err := db.Query("SELECT * from author")

	if err != nil {
		e.Wrap("Something wrong with 'queryAuthors' request", err, c)
	}
	defer queryAuthors.Close()

	authors := []string{}

	for queryAuthors.Next() {
		var author string
		err := queryAuthors.Scan(&author)
		if err != nil {
			e.Wrap("Cann not scan the 'queryAuthors' response", err, c)
		}
		authors = append(authors, author)
	}

	queryLibrarySections, err := db.Query("SELECT Name_Section from Library_Section")

	if err != nil {
		e.Wrap("Something wrong with 'queryLibrarySections' request", err, c)
	}
	defer queryLibrarySections.Close()

	sections := []string{}

	for queryLibrarySections.Next() {
		var section string
		err := queryLibrarySections.Scan(&section)
		if err != nil {
			e.Wrap("Cann not scan the 'queryLibrarySections' response", err, c)
		}
		sections = append(sections, section)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"genres":   genres,
			"authors":  authors,
			"sections": sections,
		},
	})

}

func AddBook(c *gin.Context) {

	type Book struct {
		Name         string    `json:"name"`
		YearPublish  time.Time `json:"year_publish"`
		DateReceipt  time.Time `json:"date_receipt"`
		Authors      []string  `json:"author"`
		Image        string    `json:"image"`
		HousePublish string    `json:"house_publish"`
		Pages        int64     `json:"pages"`
		Genre        string    `json:"genre"`
		Section      string    `json:"section"`
		Grade        int64     `json:"grade"`
		Comment      string    `json:"comment"`
		Description  string    `json:"description"`
		Source       string    `json:"source"`
	}

	var b Book

	err := c.BindJSON(&b)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	var yearPublish interface{}
	if NullTime(b.YearPublish).Valid {
		yearPublish = NullTime(b.YearPublish).Time.Year()
	} else {
		yearPublish = NullTime(b.YearPublish)
	}

	queryAddBook, err := db.Exec("INSERT INTO book (Name, Image, Year_Publish, House_Publish, Pages, Source, Date_Receipt, Number_Grade, Comment, Date_Last_Status_Change, Name_Genre, Status, Description, Name_Section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		b.Name,
		NullString(b.Image),
		yearPublish,
		NullString(b.HousePublish),
		NullInt(b.Pages),
		NullString(b.Source),
		NullTime(b.DateReceipt),
		NullInt(b.Grade),
		NullString(b.Comment),
		time.Now().UTC(),
		NullString(b.Genre),
		"available",
		NullString(b.Description),
		NullString(b.Section),
	)

	if err != nil {
		e.Wrap("Something wrong with 'queryAddBook' request", err, c)
	}

	ID_Book, err := queryAddBook.LastInsertId()

	if len(b.Authors) != 0 {
		for i := 0; i < len(b.Authors); i++ {
			_, err = db.Exec("INSERT INTO Author_Book (ID_Book, Name_Author) VALUES (?, ?)", ID_Book, b.Authors[i])
		}
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func GetGenres(c *gin.Context) {

	queryGenres, err := db.Query("SELECT * from genre")

	if err != nil {
		e.Wrap("Something wrong with 'queryGenres' request", err, c)
	}
	defer queryGenres.Close()

	genres := []string{}

	for queryGenres.Next() {
		var genre string
		err := queryGenres.Scan(&genre)
		if err != nil {
			e.Wrap("Cann not scan the 'queryGenres' response", err, c)
		}
		genres = append(genres, genre)
	}

	if len(genres) == 0 {
		c.JSON(200, gin.H{"status": "no_genres"})
		return
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"genres": genres,
		},
	})
}

func GetAuthors(c *gin.Context) {

	queryAuthors, err := db.Query("SELECT * from author")

	if err != nil {
		e.Wrap("Something wrong with 'queryAuthors' request", err, c)
	}
	defer queryAuthors.Close()

	authors := []string{}

	for queryAuthors.Next() {
		var author string
		err := queryAuthors.Scan(&author)
		if err != nil {
			e.Wrap("Cann not scan the 'queryAuthors' response", err, c)
		}
		authors = append(authors, author)
	}

	if len(authors) == 0 {
		c.JSON(200, gin.H{"status": "no_authors"})
		return
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"authors": authors,
		},
	})
}

func GetLibrarySections(c *gin.Context) {

	queryLibrarySections, err := db.Query("SELECT * from Library_Section")

	if err != nil {
		e.Wrap("Something wrong with 'queryLibrarySections' request", err, c)
	}
	defer queryLibrarySections.Close()

	sections := []string{}

	for queryLibrarySections.Next() {
		var section string
		err := queryLibrarySections.Scan(&section)
		if err != nil {
			e.Wrap("Cann not scan the 'queryLibrarySections' response", err, c)
		}
		sections = append(sections, section)
	}

	if len(sections) == 0 {
		c.JSON(200, gin.H{"status": "no_sections"})
		return
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"sections": sections,
		},
	})
}
