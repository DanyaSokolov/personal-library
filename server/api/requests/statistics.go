package requests

import (
	e "server-library/errors"
	"time"

	"github.com/gin-gonic/gin"
)

func GetTotalStatistics(c *gin.Context) {

	queryCounts, err := db.Query("SELECT COUNT(*), (SELECT COUNT(*) FROM book WHERE STATUS = 'Available'), (SELECT COUNT(*) FROM book WHERE STATUS = 'Loaned'), (SELECT COUNT(*) FROM book WHERE STATUS = 'Absent'), (SELECT COUNT(*) FROM loan WHERE STATUS = 'Borrowed'), (SELECT COUNT(*) FROM loan WHERE STATUS = 'Expired'), (SELECT COUNT(*) FROM loan WHERE STATUS = 'Returned') FROM user")

	if err != nil {
		e.Wrap("Something wrong with 'queryCounts' request", err, c)
	}
	defer queryCounts.Close()

	type Counts struct {
		Users         int64 `json:"users"`
		BookAvailable int64 `json:"book_available"`
		BookLoaned    int64 `json:"book_loaned"`
		BookAbsent    int64 `json:"book_absent"`
		LoanBorrowed  int64 `json:"loan_borrowed"`
		LoanExpired   int64 `json:"loan_expired"`
		LoanReturned  int64 `json:"loan_returned"`
	}

	var counts Counts

	for queryCounts.Next() {
		err := queryCounts.Scan(
			&counts.Users,
			&counts.BookAvailable,
			&counts.BookLoaned,
			&counts.BookAbsent,
			&counts.LoanBorrowed,
			&counts.LoanExpired,
			&counts.LoanReturned)
		if err != nil {
			e.Wrap("Cann not scan the 'queryCounts' response", err, c)
		}
	}

	queryBooksByGenre, err := db.Query("SELECT g.Name_Genre, COUNT(b.ID_Book) AS Book_Count FROM Book b JOIN Genre g ON b.Name_Genre = g.Name_Genre GROUP BY g.Name_Genre ORDER BY Book_Count DESC LIMIT 10")

	if err != nil {
		e.Wrap("Something wrong with 'queryBooksByGenre' request", err, c)
	}
	defer queryBooksByGenre.Close()

	type BookByGenre struct {
		Name  string `json:"name"`
		Value int64  `json:"value"`
	}

	booksByGenre := []BookByGenre{}

	for queryBooksByGenre.Next() {
		b := BookByGenre{}
		err := queryBooksByGenre.Scan(&b.Name, &b.Value)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooksByGenre' response", err, c)
		}
		booksByGenre = append(booksByGenre, b)
	}

	queryBooksByAuthor, err := db.Query("SELECT a.Name_Author, COUNT(b.ID_Book) AS Book_Count FROM Author_Book b JOIN Author a ON b.Name_Author = a.Name_Author GROUP BY a.Name_Author ORDER BY Book_Count DESC LIMIT 10")

	if err != nil {
		e.Wrap("Something wrong with 'queryBooksByAuthor' request", err, c)
	}
	defer queryBooksByGenre.Close()

	type BookByAuthor struct {
		Name  string `json:"name"`
		Value int64  `json:"value"`
	}

	booksByAuthor := []BookByAuthor{}

	for queryBooksByAuthor.Next() {
		b := BookByAuthor{}
		err := queryBooksByAuthor.Scan(&b.Name, &b.Value)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooksByAuthor' response", err, c)
		}
		booksByAuthor = append(booksByAuthor, b)
	}

	queryBooksBySection, err := db.Query("SELECT s.Name_Section, COUNT(b.ID_Book) AS Book_Count FROM Book b JOIN Library_Section s ON b.Name_Section = s.Name_Section GROUP BY s.Name_Section ORDER BY Book_Count DESC LIMIT 10")

	if err != nil {
		e.Wrap("Something wrong with 'queryBooksBySection' request", err, c)
	}
	defer queryBooksByGenre.Close()

	type BookBySection struct {
		Name  string `json:"name"`
		Value int64  `json:"value"`
	}

	booksBySection := []BookBySection{}

	for queryBooksBySection.Next() {
		b := BookBySection{}
		err := queryBooksBySection.Scan(&b.Name, &b.Value)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooksBySection' response", err, c)
		}
		booksBySection = append(booksBySection, b)
	}

	queryBooksByLoan, err := db.Query("SELECT b.Name, COUNT(b.ID_Book) AS Book_Count FROM Loan l JOIN Book b ON l.ID_Book = b.ID_Book GROUP BY b.Name ORDER BY Book_Count DESC LIMIT 10")

	if err != nil {
		e.Wrap("Something wrong with 'queryBooksByLoan' request", err, c)
	}
	defer queryBooksByGenre.Close()

	type BookByLoan struct {
		Name  string `json:"name"`
		Value int64  `json:"value"`
	}

	booksByLoan := []BookByLoan{}

	for queryBooksByLoan.Next() {
		b := BookByLoan{}
		err := queryBooksByLoan.Scan(&b.Name, &b.Value)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBooksByLoan' response", err, c)
		}
		booksByLoan = append(booksByLoan, b)
	}

	queryUsersByUser, err := db.Query("SELECT u.Name, COUNT(u.ID_User) AS User_Count FROM Loan l JOIN User u ON l.ID_User = u.ID_User GROUP BY u.Name ORDER BY User_Count DESC LIMIT 10")

	if err != nil {
		e.Wrap("Something wrong with 'queryUsersByUser' request", err, c)
	}
	defer queryBooksByGenre.Close()

	type UserByLoan struct {
		Name  string `json:"name"`
		Value int64  `json:"value"`
	}

	usersByLoan := []UserByLoan{}

	for queryUsersByUser.Next() {
		u := UserByLoan{}
		err := queryUsersByUser.Scan(&u.Name, &u.Value)
		if err != nil {
			e.Wrap("Cann not scan the 'queryUsersByUser' response", err, c)
		}
		usersByLoan = append(usersByLoan, u)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"counts":          counts,
			"books_by_genre":  booksByGenre,
			"book_by_author":  booksByAuthor,
			"book_by_section": booksBySection,
			"loans_by_book":   booksByLoan,
			"loans_by_users":  usersByLoan,
		},
	})
}

func GetLineChart(c *gin.Context) {

	type Data struct {
		DatesRange []time.Time `json:"range"`
	}

	var data Data

	err := c.BindJSON(&data)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	var from time.Time
	var to time.Time

	for i, t := range data.DatesRange {
		if i == 0 {
			from = t
		} else {
			to = t
		}
	}

	queryCounts, err := db.Query("WITH RECURSIVE months AS (SELECT DATE_FORMAT(?, '%Y-%m-01') AS Month UNION ALL SELECT DATE_SUB(Month, INTERVAL 1 MONTH) FROM months WHERE Month > DATE_FORMAT(?, '%Y-%m-01')) SELECT m.Month, COALESCE(COUNT(DISTINCT b.ID_Book), 0) AS Books_Received, COALESCE(COUNT(DISTINCT l.ID_Book), 0) AS Books_Loaned FROM months m LEFT JOIN Book b ON DATE_FORMAT(b.Date_Receipt, '%Y-%m') = DATE_FORMAT(m.Month, '%Y-%m') LEFT JOIN Loan l ON DATE_FORMAT(l.Date_Loan, '%Y-%m') = DATE_FORMAT(m.Month, '%Y-%m') GROUP BY m.Month ORDER BY m.Month;", to, from)

	if err != nil {
		e.Wrap("Something wrong with 'queryCounts' request", err, c)
	}
	defer queryCounts.Close()

	type Count struct {
		Date        time.Time `json:"date"`
		Books       int64     `json:"books_recieved"`
		BooksLoaned int64     `json:"books_loaned"`
	}

	counts := []Count{}

	for queryCounts.Next() {
		var monthStr string
		count := Count{}
		err := queryCounts.Scan(
			&monthStr,
			&count.Books,
			&count.BooksLoaned)
		if err != nil {
			e.Wrap("Cann not scan the 'queryCounts' response", err, c)
		}
		count.Date, err = time.Parse("2006-01-02", monthStr)
		if err != nil {
			e.Wrap("Cannot parse 'Month' as time.Time", err, c)
			return
		}
		counts = append(counts, count)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"counts": counts,
	})
}
