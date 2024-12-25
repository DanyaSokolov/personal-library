package requests

import (
	e "server-library/errors"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetBooks(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) != "" {
		query += "SELECT count(*) FROM books "
	} else {
		query += "SELECT count(*) FROM books WHERE name LIKE ? "
		args = append(args, "%"+data["search"].(string)+"%")
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

	if data["filter"].(string) != "" {
		query += "AND status = "
		switch data["filter"].(string) {
		case "avaliable":
			query += "avaliable "
		case "loned":
			query += "loaned "
		case "absent":
			query += "absent "
		}
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "id, name, image", 1)

	queryBooks, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryBooks' request", err, c)
	}
	defer queryBooks.Close()

	type Book struct {
		Id    int    `json:"id"`
		Name  string `json:"name"`
		Image string `json:"image"`
	}

	books := []Book{}

	for queryBooks.Next() {
		b := Book{}
		err := queryBooks.Scan(&b.Id, &b.Name, &b.Image)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooks' response", err, c)
		}
		books = append(books, b)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"books": books,
			"count":    count,
		},
	})
}
