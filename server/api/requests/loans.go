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
		ID_Book int64     `json:"ID_Book"`
		User    string    `json:"user"`
		Termin  time.Time `json:"termin"`
	}

	var l Loan

	err := c.BindJSON(&l)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	queryIDUser, err := db.Query("SELECT ID_User from User WHERE Name = ?", l.User)

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

	_, err = db.Exec("Update Book SET Status = 'Loaned' WHERE ID_Book = ?", l.ID_Book)

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

	queryCheckTermin, err := db.Query("SELECT Date_Loan, ID_Book, Termin_Loan, Status FROM Loan")

	if err != nil {
		e.Wrap("Something wrong with 'queryCheckTermin' request", err, c)
	}
	defer queryCheckTermin.Close()

	type Termin struct {
		ID_Book    int64      `json:"ID_Book"`
		DateLoan   time.Time  `json:"Date_Loan"`
		TerminLoan *time.Time `json:"Termin_Loan"`
		Status     string     `json:"Status"`
	}

	termins := []Termin{}

	for queryCheckTermin.Next() {
		t := Termin{}
		err := queryCheckTermin.Scan(&t.DateLoan, &t.ID_Book, &t.TerminLoan, &t.Status)
		if err != nil {
			e.Wrap("Cann not scan the 'queryCheckTermin' response", err, c)
		}
		termins = append(termins, t)
	}

	for _, t := range termins {
		if t.TerminLoan != nil && time.Now().After(*t.TerminLoan) && t.Status == "Borrowed" {
			_, err = db.Exec("Update Loan SET Status = 'Expired' WHERE ID_Book = ? AND Date_Loan = ?", t.ID_Book, t.DateLoan)

			if err != nil {
				e.Wrap("Something wrong with 'execChangeStatusExpired' request", err, c)
			}
		} else if t.TerminLoan != nil && !time.Now().After(*t.TerminLoan) && t.Status == "Expired" {
			_, err = db.Exec("Update Loan SET Status = 'Borrowed' WHERE ID_Book = ? AND Date_Loan = ?", t.ID_Book, t.DateLoan)

			if err != nil {
				e.Wrap("Something wrong with 'execChangeStatusBorrowed' request", err, c)
			}
		}
	}

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM Loan JOIN Book ON Loan.ID_Book = Book.ID_Book LEFT JOIN User ON Loan.ID_User = User.ID_User "
	} else {
		query += "SELECT count(*) FROM Loan JOIN Book ON Loan.ID_Book = Book.ID_Book LEFT JOIN User ON Loan.ID_User = User.ID_User WHERE Book.Name LIKE ? "
		args = append(args, "%"+data["search"].(string)+"%")
	}

	if data["filter"].(string) != "" && data["filter"].(string) != "All" {
		if data["search"].(string) != "" {
			query += "AND Loan.Status = "
		} else {
			query += "WHERE Loan.Status = "
		}
		switch data["filter"].(string) {
		case "Borrowed":
			query += "'Borrowed' "
		case "Expired":
			query += "'Expired' "
		case "Returned":
			query += "'Returned' "
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
		c.JSON(200, gin.H{"status": "no_loans"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "Loan.ID_Book, Date_Loan, Book.Name, User.Name, Book.Image, User.Image, Loan.Status", 1)

	queryLoans, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryLoans' request", err, c)
	}
	defer queryLoans.Close()

	type Loan struct {
		ID_Book   int64     `json:"ID_Book"`
		DateLoan  time.Time `json:"Date_Loan"`
		NameBook  string    `json:"Name_Book"`
		NameUser  *string    `json:"Name_User"`
		ImageBook *string    `json:"Image_Book"`
		ImageUser *string    `json:"Image_User"`
		Status    string    `json:"Status"`
	}

	loans := []Loan{}

	for queryLoans.Next() {
		l := Loan{}
		err := queryLoans.Scan(&l.ID_Book, &l.DateLoan, &l.NameBook, &l.NameUser, &l.ImageBook, &l.ImageUser, &l.Status)
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

func GetLoanInfo(c *gin.Context) {

	type Data struct {
		ID_Book  int64     `json:"ID_Book"`
		DateLoan time.Time `json:"Date_Loan"`
	}

	var d Data

	err := c.BindJSON(&d)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	queryLoan, err := db.Query("SELECT Date_Loan, ID_Book, Termin_Loan, Status, Number_Grade, Date_Return FROM Loan WHERE ID_Book = ? AND Date_Loan = ?", d.ID_Book, d.DateLoan)

	if err != nil {
		e.Wrap("Something wrong with 'queryLoan' request", err, c)
	}
	defer queryLoan.Close()

	type Loan struct {
		ID_Book     int64      `json:"ID_Book"`
		DateLoan    time.Time  `json:"date_loan"`
		TerminLoan  *time.Time `json:"termin_loan"`
		Status      string     `json:"status"`
		NumberGrade *int64     `json:"number_grade"`
		DateReturn  *time.Time `json:"date_return"`
	}

	var l Loan

	for queryLoan.Next() {
		err := queryLoan.Scan(
			&l.DateLoan,
			&l.ID_Book,
			&l.TerminLoan,
			&l.Status,
			&l.NumberGrade,
			&l.DateReturn)
		if err != nil {
			e.Wrap("Cann not scan the 'queryLoan' response", err, c)
		}
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data":   l,
	})

}

func ReturnedLoan(c *gin.Context) {

	type Loan struct {
		ID_Book  int64     `json:"ID_Book"`
		DateLoan time.Time `json:"date_loan"`
		Grade    int64     `json:"grade"`
	}

	var l Loan

	err := c.BindJSON(&l)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	_, err = db.Exec("UPDATE Loan SET Status = 'Returned', Number_Grade = ?, Date_Return = ? WHERE ID_Book = ? AND Date_Loan = ?", NullInt(l.Grade), time.Now().UTC(), l.ID_Book, l.DateLoan)

	if err != nil {
		e.Wrap("Something wrong with 'execUpdateLoan' request", err, c)
	}

	_, err = db.Exec("Update Book SET Status = 'Available' WHERE ID_Book = ?", l.ID_Book)

	if err != nil {
		e.Wrap("Something wrong with 'execUpdateBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}
