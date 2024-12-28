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
			account.POST("/books/get/adding-info2", r.EditBook)
			account.DELETE("/books/delete", r.DeleteBook)
 
			account.GET("/authors/get", r.GetAuthors)
			account.GET("/genres/get", r.GetGenres)
			account.GET("/library-sections/get", r.GetLibrarySections)
		}
 
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.Login)
			auth.GET("/logout", r.Logout)
		}
	}

	return router
}

