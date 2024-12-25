package errors

import (
	"fmt"
	"github.com/gin-gonic/gin" 
)

func Wrap(msg string, err error, c *gin.Context) {
	var e string
	if err != nil {
		e = fmt.Sprintf("%s: %v", msg, err)
	} else {
		e = msg
	} 
	if(c != nil) {
		c.JSON(500, gin.H{"status": "error"})
	}
	panic(e)
}