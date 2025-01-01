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
        return instance.post("account/books/add", dataJSON)
    }, 

    EditBook(dataJSON) {
        return instance.post("account/books/edit", dataJSON)
    }, 

    SetStatusAbsentBook(dataJSON) {
        return instance.post("account/books/status/absent", dataJSON)
    }, 

    SetStatusAvailableBook(dataJSON) {
        return instance.post("account/books/status/available", dataJSON)
    }, 

    SetGradeBook(dataJSON) {
        return instance.post("account/books/grade", dataJSON)
    }, 

    DeleteBook(dataJSON) {
        return instance.delete("account/books/delete", {data: dataJSON})
    }, 

    GetBook(dataJSON) {
        return instance.post("account/books/info/get", dataJSON)
    }, 

    GetGenres(dataJSON) {
        return instance.post("account/genres/get", dataJSON) 
    }, 

    AddGenre(dataJSON) {
        return instance.post("account/genres/add", dataJSON)
    }, 

    DeleteGenre(dataJSON) {
        return instance.delete("account/genres/delete", {data: dataJSON})
    }, 

    GetAuthors(dataJSON) {
        return instance.post("account/authors/get", dataJSON) 
    }, 

    AddAuthor(dataJSON) {
        return instance.post("account/authors/add", dataJSON)
    }, 

    DeleteAuthor(dataJSON) {
        return instance.delete("account/authors/delete", {data: dataJSON})
    }, 

    GetSections(dataJSON) {
        return instance.post("account/sections/get", dataJSON) 
    }, 

    AddSection(dataJSON) {
        return instance.post("account/sections/add", dataJSON) 
    }, 

    DeleteSection(dataJSON) {
        return instance.delete("account/sections/delete", {data: dataJSON})
    }, 

    GetUsers(dataJSON) {
        return instance.post("account/users/get", dataJSON) 
    }, 

    AddUser(dataJSON) {
        return instance.post("account/users/add", dataJSON) 
    }, 

    DeleteUser(dataJSON) {
        return instance.delete("account/users/delete", {data: dataJSON})
    }, 

    GetLoanAddingInfo() {
        return instance.get("account/loans/get/adding-info")
    }, 

    CreateLoan(dataJSON) {
        return instance.post("account/loans/create", dataJSON)
    }, 

    GetLoans(dataJSON) {
        return instance.post("account/loans/get", dataJSON)
    }, 

    
    GetLoanInfo(dataJSON) {
        return instance.post("account/loans/get-info", dataJSON)
    }, 

    ReturnedLoan(dataJSON) {
        return instance.post("account/loans/returned", dataJSON)
    },  
}