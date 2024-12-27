package requests

import (
	"database/sql"
	"server-library/database"
	"time"
)

func NullString(s string) sql.NullString {
    if len(s) == 0 {
        return sql.NullString{}
    }
    return sql.NullString{
         String: s,
         Valid: true,
    }
}

func NullInt(i int64) sql.NullInt64 {
    if i == 0 {
        return sql.NullInt64{}
    }
    return sql.NullInt64{
         Int64: i,
         Valid: true,
    }
}

func NullTime(t time.Time) sql.NullTime {
    if t.IsZero() {
        return sql.NullTime{}
    }
    return sql.NullTime{
        Time:  t,
        Valid: true,
    }
}

var db = database.Connection
