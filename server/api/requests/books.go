package requests

import (
	"fmt"
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

	fmt.Println(int(data["limit"].(float64)))
	fmt.Println(int(data["offset"].(float64)))

	fmt.Println(query)
	fmt.Println(query)
	fmt.Println(query)
	fmt.Println(query)
	fmt.Println(query)
	fmt.Println(query)

	queryBooks, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryBooks' request", err, c)
	}
	defer queryBooks.Close()

	type Book struct {
		ID     int    `json:"ID_Book"`
		Name   string `json:"Name"`
		Image  string `json:"Image"`
		Status string `json:"Status"`
	}

	books := []Book{}

	for queryBooks.Next() {
		b := Book{}
		err := queryBooks.Scan(&b.ID, &b.Name, &b.Image, &b.Status)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooks' response", err, c)
		}
		fmt.Println(b)
		fmt.Println(b)
		fmt.Println(b)
		fmt.Println(b)
		fmt.Println(b)
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
