import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true
})

export var authApi = { 

    Login(dataJson) {
        return instance.post("auth/login", dataJson)
    },

    Logout() {
        return instance.get("auth/logout")
    },

}

export var accountApi = { 

    IsUser() {
        return instance.get("account/user")
    }, 

    GetBooks(dataJson) {
        return instance.post("account/books/get", dataJson)
    }, 
}