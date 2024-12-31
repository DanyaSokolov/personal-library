package requests

import (
	e "server-library/errors"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func GetLoanAddingInfo(c *gin.Context) {

	queryUsers, err := db.Query("SELECT Name from User")

	if err != nil {
		e.Wrap("Something wrong with 'queryUsers' request", err, c)
	}
	defer queryUsers.Close()

	users := []string{}

	for queryUsers.Next() {
		var u string
		err := queryUsers.Scan(&u)
		if err != nil {
			e.Wrap("Cann not scan the 'queryUsers' response", err, c)
		}
		users = append(users, u)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"users": users,
		},
	})

}

func CreateLoan(c *gin.Context) {

	type Loan struct {
		ID_Book int64  `json:"ID_Book"`
		User    string `json:"user"`
		Termin  time.Time  `json:"termin"`
	}

	var l Loan

	err := c.BindJSON(&l)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	queryIDUser, err := db.Query("SELECT Name from User")

	if err != nil {
		e.Wrap("Something wrong with 'queryIDUser' request", err, c)
	}
	defer queryIDUser.Close()

	var ID_User string

	for queryIDUser.Next() {
		err := queryIDUser.Scan(&ID_User)
		if err != nil {
			e.Wrap("Cann not scan the 'queryIDUser' response", err, c)
		}
	}

	ID_UserConverted, err := strconv.Atoi(ID_User)

	_, err = db.Exec("INSERT INTO Loan (ID_Book, Date_Loan, ID_User, Termin_Loan, Status) VALUES(?, ?, ?, ?, ?)",
		NullInt(l.ID_Book), 
		time.Now().UTC(),
		NullInt(int64(ID_UserConverted)), 
		NullTime(l.Termin), 
		"Borrowed",
	)

	if err != nil {
		e.Wrap("Something wrong with 'execCreateLoan' request", err, c)
	}

	_, err = db.Exec("Update Book SET Status = 'Loaned'")

	if err != nil {
		e.Wrap("Something wrong with 'execSetStatusLoanedBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func GetLoans(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM Loan "
	} else {
		query += "SELECT count(*) FROM Loan WHERE Book.Name LIKE ? "
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
		c.JSON(200, gin.H{"status": "no_loans"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "Book.Name, User.Name, Book.Image, User.Image, Loan.Status INNER JOIN Book ON Loan.ID_Book = Book.ID-Book INNER JOIN User ON Loan.ID_User = User_ID_User", 1)

	queryLoans, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryLoans' request", err, c)
	}
	defer queryLoans.Close()

	type Loan struct {
		NameBook string   `json:"Name_Book"`
		NameUser    string  `json:"Name_User"`
		ImageBook   string `json:"Image_Book"`
		ImageUser   string `json:"Image_User"`
		Status  string  `json:"Status"`
	}

	loans := []Loan{}

	for queryLoans.Next() {
		l := Loan{}
		err := queryLoans.Scan(&l.NameBook, &l.NameUser, &l.ImageBook, &l.ImageUser, &l.Status)
		if err != nil {
			e.Wrap("Cann not scan the 'queryLoans' response", err, c)
		}
		loans = append(loans, l)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"loans": loans,
			"count": count,
		},
	})
}