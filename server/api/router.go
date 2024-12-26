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
		}
 
		auth := api.Group("/auth")
		{
			auth.POST("/login", r.Login)
			auth.GET("/logout", r.Logout)
		}
	}

	return router
}

