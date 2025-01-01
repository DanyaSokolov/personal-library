package api

import (
	r "server-library/api/requests"
	m "server-library/middleware"

	"github.com/gin-contrib/cors" 
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	router := gin.Default()
 
	router.Use(cors.New(cors.Config{ 
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"PUT", "DELETE", "POST", "GET"},
		AllowHeaders:     []string{"Origin", "Content-Type"},
		ExposeHeaders:    []string{"Content-Type", "Content-Disposition", "Content-Transfer-Encoding",
		"Content-Control", "Content-Length", "Expires"},
		AllowCredentials: true,
	})) 
 
	return router
}

func Router(router *gin.Engine) *gin.Engine {

	api := router.Group("/api")
	{
		account := api.Group("/account").Use(m.IsUser())
		{
			account.GET("/user", r.GetUser)
			
			account.POST("/books/get", r.GetBooks)
			account.GET("/books/get/adding-info", r.GetBookAddingInfo)
			account.POST("/books/add", r.AddBook)
			account.POST("/books/info/get", r.GetBookInfo)
			account.POST("/books/edit", r.EditBook)
			account.POST("/books/status/absent", r.SetStatusAbsentBook)
			account.POST("/books/status/available", r.SetStatusAvailableBook)
			account.POST("/books/grade", r.SetGradeBook)
			account.DELETE("/books/delete", r.DeleteBook)

			account.POST("/genres/get", r.GetGenres)
			account.POST("/genres/add", r.AddGenre)
			account.DELETE("/genres/delete", r.DeleteGenre)
 
			account.POST("/authors/get", r.GetAuthors)
			account.POST("/authors/add", r.AddAuthor)
			account.DELETE("/authors/delete", r.DeleteAuhtor)

			account.POST("/sections/get", r.GetSections)
			account.POST("/sections/add", r.AddSection)
			account.DELETE("/sections/delete", r.DeleteSection)

			account.POST("/users/get", r.GetUsers)
			account.POST("/users/add", r.AddUser)
			account.DELETE("/users/delete", r.DeleteUser)

			account.GET("/loans/get/adding-info", r.GetLoanAddingInfo)
			account.POST("/loans/create", r.CreateLoan)
			account.POST("/loans/get", r.GetLoans)
			account.POST("/loans/get-info", r.GetLoanInfo) 
			account.POST("/loans/returned", r.ReturnedLoan)
		}
 
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.Login)
			auth.GET("/logout", r.Logout) 
		}
	}

	return router
}

