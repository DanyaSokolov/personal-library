package middleware

import (
	e "server-library/errors"
	"server-library/constants"
	"encoding/json"
	"io"
	"os"

	"github.com/dgrijalva/jwt-go/v4"   
	"github.com/gin-gonic/gin"
) 

func IsUser() gin.HandlerFunc { 
	return func(c *gin.Context) {

		cookie, err := c.Cookie("jwt")
		if err != nil {
			c.JSON(200, gin.H{"status": "not_authorized"})
			c.Abort()
			return
		}
 
		token, err := jwt.ParseWithClaims(cookie, &jwt.StandardClaims{}, func(t *jwt.Token) (interface{}, error) {
			return []byte(constants.SecretKey), nil
		}) 
 
		if err != nil {
			c.JSON(200, gin.H{"status": "not_authorized"})
			c.Abort()
			return
		}  

		claims := token.Claims.(*jwt.StandardClaims)

		name := claims.Issuer

		type User struct {
			Name      string `json:"name"`
			Password   string `json:"password"`
		}
	
		var user User
	
		jsonFile, err := os.Open("../credentials.json")
		if err != nil {
			c.JSON(500, gin.H{"status": "error"})
			c.Abort()
			e.Wrap("Can not open file", err, c)
		}
		defer jsonFile.Close()
	
		byteValue, _ := io.ReadAll(jsonFile)
	
		json.Unmarshal(byteValue, &user) 

		if name != user.Name {
			c.JSON(500, gin.H{"status": "error"})
			c.Abort()
			e.Wrap("Names don`t match", err, c)
		}

		c.Next() 
	}
}

