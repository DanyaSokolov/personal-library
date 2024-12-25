package requests

import (
	e "server-library/errors"
	"server-library/constants"
	"encoding/json"
	"io"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/dgrijalva/jwt-go/v4"
)


func GetUser(c *gin.Context) {

	type User struct {
		Name      string `json:"name"`
	}

	var user User

	jsonFile, err := os.Open("../credentials.json")
	if err != nil {
		e.Wrap("Can not open fle", err, c)
	}
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	json.Unmarshal(byteValue, &user) 

	c.JSON(200, gin.H{
		"status": "success",
		"data": user,
	})
}

func Login(c *gin.Context) {

	var data map[string]interface{}

	c.BindJSON(&data)

	type User struct {
		Name      string `json:"name"`
		Password   string `json:"password"`
	}

	var user User

	jsonFile, err := os.Open("../credentials.json")
	if err != nil {
		e.Wrap("Can not open fle", err, c)
	}
	defer jsonFile.Close()

	byteValue, _ := io.ReadAll(jsonFile)

	json.Unmarshal(byteValue, &user) 

	if user.Name != data["name"].(string) {
		c.JSON(200, gin.H{"status": "incorrect_name"})
		return
	}

	if user.Password != data["password"].(string) {
		c.JSON(200, gin.H{"status": "incorrect_password"})
		return
	}

	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.StandardClaims{
		Issuer: user.Name,
	})

	token, err := claims.SignedString([]byte(constants.SecretKey))
	if err != nil {
		e.Wrap("Can not get token", err, c)
	}

	if data["remember"].(bool) == true { 
		c.SetCookie("jwt", token, 3600, "/", "localhost", false, true)
	} else {
		c.SetCookie("jwt", token, 900, "/", "localhost", false, true) 
	}

	c.JSON(200, gin.H{"status": "success"})
}

func Logout(c *gin.Context) {

	c.SetCookie("jwt", "", 0, "/", "localhost", false, true)

	_, err := c.Cookie("jwt")

	if err != nil {
		e.Wrap("Can not get cookie", err, c)
	}

	c.JSON(200, gin.H{"status": "success"})
}