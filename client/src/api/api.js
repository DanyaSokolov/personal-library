import axios from 'axios';

const instance = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true
})

export var authApi = { 

    Login(dataJSON) {
        return instance.post("auth/login", dataJSON)
    },

    Logout() {
        return instance.get("auth/logout")
    },

}

export var accountApi = { 

    IsUser() {
        return instance.get("account/user")
    }, 

    GetBooks(dataJSON) {
        return instance.post("account/books/get", dataJSON)
    }, 

    GetBookAddingInfo() {
        return instance.get("account/books/get/adding-info")
    }, 

    AddBook(dataJSON) {
        console.log(dataJSON)
        return instance.post("account/books/add", dataJSON)
    }, 

    EditBook(dataJSON) {
        console.log(dataJSON)
        return instance.post("account/books/get/adding-info2", dataJSON)
    }, 

    DeleteBook(dataJSON) {
        return instance.delete("account/books/delete", {data: dataJSON})
    }, 

    GetBook(dataJSON) {
        return instance.post("account/books/info/get", dataJSON)
    }, 

    GetAuthors() {
        return instance.get("account/authors/get")
    }, 

    GetGenres() {
        return instance.get("account/authors/get")
    }, 

    GetLibrarySections() {
        return instance.get("account/library-sections/get")
    }, 
}