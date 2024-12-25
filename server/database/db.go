package database

import (
	_ "github.com/go-sql-driver/mysql"
	"database/sql"

	e "server-library/errors"
) 

var Connection = ConnectDB()

func ConnectDB() *sql.DB {
	db, err := sql.Open("mysql", "root:root@tcp(127.0.0.1:3306)/my_library")
	if err != nil {
		panic("Can not connect to db")
	}
	err = db.Ping()
	if err != nil {
		e.Wrap("Bad ping", err, nil)
	} 
	return db
}
  