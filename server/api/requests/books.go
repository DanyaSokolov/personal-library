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
			query += "'Available' "
		case "Loaned":
			query += "'Loaned' "
		case "Absent":
			query += "'Absent' "
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
		ID_Book int64   `json:"ID_Book"`
		Name    string  `json:"Name"`
		Image   *string `json:"Image"`
		Status  string  `json:"Status"`
	}

	books := []Book{}

	for queryBooks.Next() {
		b := Book{}
		err := queryBooks.Scan(&b.ID_Book, &b.Name, &b.Image, &b.Status)
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

	queryAddBook, err := db.Exec("INSERT INTO book (Name, Image, Year_Publish, House_Publish, Pages, Source, Date_Receipt, Number_Grade, Comment, Date_Last_Status_Change, Name_Genre, Status, Description, Name_Section) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
	NullString(b.Name),
		NullString(b.Image),
		NullTime(b.YearPublish),
		NullString(b.HousePublish),
		NullInt(b.Pages),
		NullString(b.Source),
		NullTime(b.DateReceipt),
		NullInt(b.Grade),
		NullString(b.Comment),
		time.Now().UTC(),
		NullString(b.Genre),
		"Available",
		NullString(b.Description),
		NullString(b.Section),
	)

	if err != nil {
		e.Wrap("Something wrong with 'execAddBook' request", err, c)
	}

	ID_Book, err := queryAddBook.LastInsertId() 

	if len(b.Authors) != 0 {
		for i := 0; i < len(b.Authors); i++ {
			_, err = db.Exec("INSERT INTO Author_Book (ID_Book, Name_Author) VALUES (?, ?)", ID_Book, b.Authors[i])
			if err != nil {
				e.Wrap("Something wrong with 'ecexInsertAuthors' request", err, c)
			}
		}
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func GetBookInfo(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	queryBook, err := db.Query("SELECT ID_Book, Name, Year_Publish, Date_Receipt, Status, Date_Last_Status_Change, Image, House_Publish, Pages, Name_Genre, Name_Section, Number_Grade, Comment, Description, Source from book WHERE ID_Book = ?", int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'queryBook' request", err, c)
	}
	defer queryBook.Close()

	type Book struct {
		ID_Book          int64      `json:"ID_Book"`
		Name             string     `json:"name"`
		YearPublish      *time.Time `json:"year_publish"`
		DateReceipt      *time.Time `json:"date_receipt"`
		Authors          []string   `json:"authors"`
		Image            *string    `json:"image"`
		HousePublish     *string    `json:"house_publish"`
		Pages            *int64     `json:"pages"`
		Genre            *string    `json:"genre"`
		Section          *string    `json:"section"`
		Status           *string    `json:"status"`
		LastStatusChange *time.Time `json:"last_status_change"`
		Grade            *int64     `json:"grade"`
		Comment          *string    `json:"comment"`
		Description      *string    `json:"description"`
		Source           *string    `json:"source"`
	}

	var b Book

	for queryBook.Next() {
		err := queryBook.Scan(
			&b.ID_Book,
			&b.Name,
			&b.YearPublish,
			&b.DateReceipt,
			&b.Status,
			&b.LastStatusChange,
			&b.Image,
			&b.HousePublish,
			&b.Pages,
			&b.Genre,
			&b.Section,
			&b.Grade,
			&b.Comment,
			&b.Description,
			&b.Source)
		if err != nil {
			e.Wrap("Cann not scan the 'queryBook' response", err, c)
		}
	}

	queryAuthors, err := db.Query("SELECT Name_Author from Author_Book WHERE ID_Book = ?", int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'queryAuthors' request", err, c)
	}
	defer queryBook.Close()

	for queryAuthors.Next() {
		var a string
		err := queryAuthors.Scan(&a)
		if err != nil {
			e.Wrap("Cann not scan the 'queryAuthors' response", err, c)
		}
		b.Authors = append(b.Authors, a)
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data":   b,
	})
}

func EditBook(c *gin.Context) {

	type Book struct {
		ID_Book      int64     `json:"ID_Book"`
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

	_, err = db.Exec("UPDATE book set Name = ?, Image = ?, Year_Publish = ?, House_Publish = ?, Pages = ?, Source = ?, Date_Receipt = ?, Number_Grade = ?, Comment = ?, Name_Genre = ?, Description = ?, Name_Section = ? WHERE ID_Book = ?",
		NullString(b.Name),
		NullString(b.Image),
		NullTime(b.YearPublish),
		NullString(b.HousePublish),
		NullInt(b.Pages),
		NullString(b.Source),
		NullTime(b.DateReceipt),
		NullInt(b.Grade),
		NullString(b.Comment),
		NullString(b.Genre),
		NullString(b.Description),
		NullString(b.Section),
		NullInt(b.ID_Book),
	)

	if err != nil {
		e.Wrap("Something wrong with 'execUpdateBook' request", err, c)
	}

	_, err = db.Exec("DELETE FROM Author_Book WHERE ID_Book = ?", b.ID_Book)
	if err != nil {
		e.Wrap("Something wrong with 'ecexDeleteAuthors' request", err, c)
	}

	if len(b.Authors) != 0 {
		for i := 0; i < len(b.Authors); i++ {
			_, err = db.Exec("INSERT INTO Author_Book (ID_Book, Name_Author) VALUES (?, ?)", b.ID_Book, b.Authors[i])
			if err != nil {
				e.Wrap("Something wrong with 'ecexInsertAuthors' request", err, c)
			}
		}
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func DeleteBook(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("DELETE FROM book WHERE ID_Book = ?", int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'execDeleteBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func SetGradeBook(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("UPDATE book set Number_Grade = ? WHERE ID_Book = ?", int64(data["grade"].(float64)), int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'execSetGradeBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func SetStatusAbsentBook(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("UPDATE book set status = 'Absent', Date_Last_Status_Change = ? WHERE ID_Book = ?", time.Now().UTC(), int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'execSetStatusAbsentBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func SetStatusAvailableBook(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("UPDATE book set status = 'Available', Date_Last_Status_Change = ? WHERE ID_Book = ?", time.Now().UTC(), int64(data["ID_Book"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'execSetStatusAvailableBook' request", err, c)
	}

	c.JSON(200, gin.H{
		"status": "success",
	})
}

func GetGenres(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM genre "
	} else {
		query += "SELECT count(*) FROM genre WHERE Name_Genre LIKE ? "
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
		c.JSON(200, gin.H{"status": "no_genres"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "Name_Genre", 1)

	queryGenres, err := db.Query(query, args...)

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

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"genres": genres,
			"count":  count,
		},
	})
}

func DeleteGenre(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("DELETE from genre WHERE Name_Genre = ?", data["name"].(string))

	if err != nil {
		e.Wrap("Something wrong with 'execDelete' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func AddGenre(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("INSERT INTO genre VALUES (?)", NullString(data["name"].(string)))

	if err != nil {
		e.Wrap("Something wrong with 'execAdd' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func GetAuthors(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM Author "
	} else {
		query += "SELECT count(*) FROM Author WHERE Name_Author LIKE ? "
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
		c.JSON(200, gin.H{"status": "no_authors"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "Name_Author", 1)

	queryAuthors, err := db.Query(query, args...)

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

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"authors": authors,
			"count":   count,
		},
	})
}

func DeleteAuhtor(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("DELETE from Author WHERE Name_Author = ?", data["name"].(string))

	if err != nil {
		e.Wrap("Something wrong with 'execDelete' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func AddAuthor(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("INSERT INTO Author VALUES (?)", NullString(data["name"].(string)))

	if err != nil {
		e.Wrap("Something wrong with 'execAdd' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func GetSections(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM Library_Section "
	} else {
		query += "SELECT count(*) FROM Library_Section WHERE Name_Section LIKE ? "
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
		c.JSON(200, gin.H{"status": "no_sections"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "Name_Section, Room", 1)

	querySections, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'querySections' request", err, c)
	}
	defer querySections.Close()

	type Section struct {
		NameSection string  `json:"Name_Section"`
		Room        *string `json:"Room"`
		Shelfs      []int64 `json:"Shelfs"`
	}

	sections := []Section{}

	for querySections.Next() {
		var s Section
		err := querySections.Scan(&s.NameSection, &s.Room)
		if err != nil {
			e.Wrap("Cann not scan the 'querySections' response", err, c)
		}
		sections = append(sections, s)
	}

	for i := 0; i < len(sections); i++ {
		queryShelfs, err := db.Query("SELECT Number_Shelf FROM Shelf WHERE Name_Section = ?", sections[i].NameSection)

		if err != nil {
			e.Wrap("Something wrong with 'queryShelfs' request", err, c)
		}
		defer queryShelfs.Close()

		shelfs := []int64{}

		for queryShelfs.Next() {
			var s int64
			err := queryShelfs.Scan(&s)
			if err != nil {
				e.Wrap("Cann not scan the 'queryShelfs' response", err, c)
			}
			shelfs = append(shelfs, s)
		}

		sections[i].Shelfs = shelfs
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"sections": sections,
			"count":    count,
		},
	})
}

func DeleteSection(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("DELETE from Library_Section WHERE Name_Section = ?", data["name"].(string))

	if err != nil {
		e.Wrap("Something wrong with 'execDelete' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func AddSection(c *gin.Context) {

	type Section struct {
		Name   string  `json:"name"`
		Room   string  `json:"room"`
		Shelfs []int64 `json:"shelf"`
	}

	var s Section

	err := c.BindJSON(&s)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	_, err = db.Exec("INSERT INTO Library_section VALUES (?, ?)", NullString(s.Name), NullString(s.Room))
	if err != nil {
		e.Wrap("Something wrong with 'execAdd' request", err, c)
	}

	if len(s.Shelfs) != 0 {
		for i := 0; i < len(s.Shelfs); i++ {
			_, err = db.Exec("INSERT INTO Shelf (Name_Section, Number_Shelf) VALUES (?, ?)", NullString(s.Name), NullInt(s.Shelfs[i]))
			if err != nil {
				e.Wrap("Something wrong with 'ecexInsertShelfs' request", err, c)
			}
		}
	}

	c.JSON(200, gin.H{"status": "success"})
}

func GetUsers(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	var count int

	query := ""

	args := []interface{}{}

	if data["search"].(string) == "" {
		query += "SELECT count(*) FROM User "
	} else {
		query += "SELECT count(*) FROM User WHERE Name LIKE ? "
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
		c.JSON(200, gin.H{"status": "no_users"})
		return
	}

	query += "LIMIT ? OFFSET ?"
	args = append(args, int(data["limit"].(float64)), int(data["offset"].(float64)))

	query = strings.Replace(query, "count(*)", "ID_User, Name, Email, Phone, Image", 1)

	queryUsers, err := db.Query(query, args...)

	if err != nil {
		e.Wrap("Something wrong with 'queryUsers' request", err, c)
	}
	defer queryUsers.Close()

	type Network struct {
		Network  string `json:"Name_Social_Network"`
		Username string `json:"Username"`
	}

	type User struct {
		ID_User  int64     `json:"ID_User"`
		Name     string    `json:"Name"`
		Email    *string   `json:"Email"`
		Phone    *string   `json:"Phone"`
		Image    *string   `json:"Image"`
		Networks []Network `json:"Networks"`
	}

	users := []User{}

	for queryUsers.Next() {
		var u User
		err := queryUsers.Scan(&u.ID_User, &u.Name, &u.Email, &u.Phone, &u.Image)
		if err != nil {
			e.Wrap("Cann not scan the 'queryUsers' response", err, c)
		}
		users = append(users, u)
	}

	for i := 0; i < len(users); i++ {
		queryNetworks, err := db.Query("SELECT Name_Social_Network, Username FROM Social_Network WHERE ID_User = ?", users[i].ID_User)

		if err != nil {
			e.Wrap("Something wrong with 'queryNetworks' request", err, c)
		}
		defer queryNetworks.Close()

		networks := []Network{}

		for queryNetworks.Next() {
			var n Network
			err := queryNetworks.Scan(&n.Network, &n.Username)
			if err != nil {
				e.Wrap("Cann not scan the 'queryNetworks' response", err, c)
			}
			networks = append(networks, n)
		}

		users[i].Networks = networks
	}

	c.JSON(200, gin.H{
		"status": "success",
		"data": gin.H{
			"users": users,
			"count":    count,
		},
	})
}

func DeleteUser(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	_, err := db.Exec("DELETE from User WHERE ID_User = ?", int64(data["ID_User"].(float64)))

	if err != nil {
		e.Wrap("Something wrong with 'execDelete' request", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}

func AddUser(c *gin.Context) {

	type Network struct {
		Network  string `json:"Name_Social_Network"`
		Username string `json:"Username"`
	}

	type User struct {
		Name     string    `json:"name"`
		Email    string   `json:"email"`
		Phone    string   `json:"phone"`
		Image    string   `json:"image"`
		Networks []Network `json:"networks"`
	}

	var u User

	err := c.BindJSON(&u)
	if err != nil {
		e.Wrap("Can not bind data", err, c)
	}

	execAddUser, err := db.Exec("INSERT INTO User (Name, Email, Phone, Image) VALUES (?, ?, ?, ?)", NullString(u.Name), NullString(u.Email), NullString(u.Phone), NullString(u.Image))
	if err != nil {
		e.Wrap("Something wrong with 'execAdd' request", err, c)
	}

	ID_User, err := execAddUser.LastInsertId()  

	if len(u.Networks) != 0 { 
		for i := 0; i < len(u.Networks); i++ {
			_, err = db.Exec("INSERT INTO Social_Network (ID_User, Name_Social_Network, Username) VALUES (?, ?, ?)", ID_User, NullString(u.Networks[i].Network), NullString(u.Networks[i].Username))
			if err != nil {
				e.Wrap("Something wrong with 'ecexInsertNetworks' request", err, c)
			}
		}
	}

	c.JSON(200, gin.H{"status": "success"})
}
