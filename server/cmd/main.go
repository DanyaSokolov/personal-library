package main

import (
	"server-library/api"
	"server-library/constants"
)

const SecretKey = "secret"

func main() {
	router := api.SetupRouter()
  
	api.Router(router) 
 
	router.Run(constants.Port)
}