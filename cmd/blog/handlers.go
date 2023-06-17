package main

import (
	"database/sql"
	"html/template"
	"log"
	"errors"
	"net/http"
	"strconv"

	"encoding/base64"
	"encoding/json"
	"io"
	"os"
	"strings"
	"fmt"
	"time"

	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
)

type indexPageData struct {
	Title         string
	FeaturedPosts []postListData
	RecentPosts   []postListData
}

type adminPageData struct {
	Title       string
}

type postListData struct {
	PostID      int    `db:"post_id"`
	Title       string `db:"title"`
	Subtitle    string `db:"subtitle"`
	Author      string `db:"author"`
	AuthorUrl   string `db:"author_url"`
	PublishDate string `db:"publish_date"`
	ImageUrl    string `db:"image_url"`
	Label       int    `db:"note"`
}

type postData struct {
	Title       string `db:"title"`
	Subtitle    string `db:"subtitle"`
	ImageUrl    string `db:"image_url"`
	Content     string `db:"content"`
}

type createPostRequest struct {
	Title      string `json:"title"`  
	Subtitle   string `json:"subtitle"`
	AuthorName string `json:"author_name"`
	AuthorImg  string `json:"author_img"`
	AuthorImgName string `json:"author_img_name"`
	Date          string `json:"date"`
	PostImg       string `json:"hero_img"`
	PostImgName   string `json:"hero_img_name"`
	Content       string `json:"content"`
} 

type loginPageData struct {
	Title       string
}

type User struct {
	Id        string `db:"user_id"`
	Email     string `json:"email" db:"email"`
	Password  string `json:"password" db:"password"`
}

const authCookieName = "authCookie"

func index(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		featuredPost, err := featuredPosts(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500) 
			log.Println(err)
			return 
		}
		recentPost, err := recentPosts(db)
		if err != nil {
			http.Error(w, "Internal Server Error", 500) 
			log.Println(err)
			return 
		}

		ts, err := template.ParseFiles("pages/index.html") 
		if err != nil {
			http.Error(w, "Internal Server Error", 500) 
			log.Println(err)
			return 
		}

		data := indexPageData{
			Title:         "Escape",
			FeaturedPosts: featuredPost,
			RecentPosts:   recentPost,
		}

		err = ts.Execute(w, data) 
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func featuredPosts(db *sqlx.DB) ([]postListData, error) {
	const query = `
		SELECT
		    post_id,
			title,
			subtitle,
			author,
			author_url,
			publish_date,
			image_url,
			note
		FROM
			post
		WHERE featured = 1
	` 

	var posts []postListData 

	err := db.Select(&posts, query)
	if err != nil {                 
		return nil, err
	}

	return posts, nil
}

func recentPosts(db *sqlx.DB) ([]postListData, error) {
	const query = `
		SELECT
			post_id,
			title,
			subtitle,
			author,
			author_url,
			publish_date,
			image_url,
			note
		FROM
			post
		WHERE featured = 0
	`

	var posts []postListData 

	err := db.Select(&posts, query) 
	if err != nil {                 
		return nil, err
	}

	return posts, nil
}

func post(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		postIDStr := mux.Vars(r)["postID"] // Получаем postID в виде строки из параметров урла

		postID, err := strconv.Atoi(postIDStr) // Конвертируем строку orderID в число
		if err != nil {
			http.Error(w, "Invalid post id", 403)
			log.Println(err)
			return
		}

		post, err := postByID(db, postID)
		if err != nil {
			if err == sql.ErrNoRows {
				// sql.ErrNoRows возвращается, когда в запросе к базе не было ничего найдено
				// В таком случае мы возвращем 404 (not found) и пишем в тело, что ордер не найден
				http.Error(w, "Post not found", 404)
				log.Println(err)
				return
			}

			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		ts, err := template.ParseFiles("pages/post.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		err = ts.Execute(w, post)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err)
			return
		}

		log.Println("Request completed successfully")
	}
}

func postByID(db *sqlx.DB, postID int) (postData, error) {
	const query = `
		SELECT
			title,
			subtitle,
			image_url,
			content
		FROM
			` + "`post`" +
		`WHERE
			post_id = ?
	`
	// В SQL-запросе добавились параметры, как в шаблоне. ? означает параметр, который мы передаем в запрос ниже

	var post postData

	// Обязательно нужно передать в параметрах orderID
	err := db.Get(&post, query, postID)
	if err != nil {
		return postData{}, err
	}

	return post, nil
}

func login() func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		ts, err := template.ParseFiles("pages/login-admin.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500) 
			log.Println(err.Error())
			return
		}

		data := loginPageData {
			Title:         "Log In",
		}

		err = ts.Execute(w, data) 
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("Request completed successfully")
	}
}

func loginUser(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		var user User
		err = json.Unmarshal(reqData, &user)

		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		if registeredUser(db, &user) {
			http.SetCookie(w, &http.Cookie{
				Name:    authCookieName,
				Value:   fmt.Sprint(user.Id),
				Path:    "/",
				Expires: time.Now().AddDate(0, 0, 1),
			})
			w.WriteHeader(http.StatusOK)
		} else {
			http.Error(w, "Incorrect password or email", 401)
		}
	}
}

func registeredUser(db *sqlx.DB, user *User) bool {
	const query = `
		SELECT
			*
		FROM
			` + "`user`" +
		`WHERE
			email = ?
	`

	var users []User
	err := db.Select(&users, query, user.Email)
	if err != nil {
		return false
	}

	if len(users) == 0 {
		return false
	}
	if users[0].Password != user.Password {
		return false
	}
	user.Id = users[0].Id
	return true
}

func authByCookie(db *sqlx.DB, w http.ResponseWriter, r *http.Request) error {
	// Получаем куку или реагируем на её отсутствие
	cookie, err := r.Cookie(authCookieName)
	if err != nil {
		if err == http.ErrNoCookie {
			http.Error(w, "You are not logged in", 401)
			log.Println(err)
			return err
		}
		http.Error(w, "Internal Server Error", 500)
		log.Println(err)
		return err
	}
	
 
	//Достаём userIDStr из куки
	userID, _ := strconv.Atoi(cookie.Value)

	var IDs []int
	const query = `
		SELECT
			user_id
		FROM
			` + "`user`" +
		`WHERE
			user_id = ?
	`

	err = db.Select(&IDs, query, userID)
	if err != nil {
		http.Error(w, "No authcookie passed", 401)
		return errors.New("Incorrect user id")
	}

	if len(IDs) == 0 {
		http.Error(w, "No authcookie passed", 401)
		return errors.New("Incorrect user id")
	}

	return nil
}

func logOut(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:    authCookieName,
		Path:    "/",
		Expires: time.Now().AddDate(0, 0, -1),
	})
	w.WriteHeader(http.StatusOK)
}
 
func admin(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		err := authByCookie(db, w, r)
		if err != nil {
			return
		}
		
		ts, err := template.ParseFiles("pages/admin.html")
		if err != nil {
			http.Error(w, "Internal Server Error", 500) 
			log.Println(err.Error())
			return
		}

		data := adminPageData {
			Title:         "Escape author",
		}

		err = ts.Execute(w, data) 
		if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
		}

		log.Println("Request completed successfully")
	}
}

func createPost(db *sqlx.DB) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		reqData, err := io.ReadAll(r.Body) // Прочитали тело запроса с reqData в виде массива байт
       	if err != nil {
			http.Error(w, "Internal Server Error", 500)
			log.Println(err.Error())
			return
       	}
		
       	var req createPostRequest  // Заранее объявили переменную  createPostRequest
		err = json.Unmarshal(reqData, &req) // Отдали reqData и req на парсинг библиотеке json
       	if err != nil {
			http.Error(w, "Internal Server Error", 500)
       	}
		log.Println(req)

		b64data := req.AuthorImg[strings.IndexByte(req.AuthorImg, ',')+1:]
		authorImg, err := base64.StdEncoding.DecodeString(b64data)
		if err != nil {
			http.Error(w, "img", 500)
			log.Println(err.Error())
			return
		}

		fileAuthor, err := os.Create("static/images/" + req.AuthorImgName) 
		// создаем файл с именем переданным от фронта в папке static/img
		_, err = fileAuthor.Write(authorImg) // Записываем контент картинки в файл		

		b64data = req.PostImg[strings.IndexByte(req.PostImg, ',')+1:]
		postImg, err := base64.StdEncoding.DecodeString(b64data)
		if err != nil {
			http.Error(w, "img", 500)
			log.Println(err.Error())
			return
		}

		filePost, err := os.Create("static/images/" + req.PostImgName) 
		// создаем файл с именем переданным от фронта в папке static/img
		_, err = filePost.Write(postImg) // Записываем контент картинки в файл	
		
		err = savePost(db, req)
		if err != nil {
			http.Error(w, "bd", 500)
			log.Println(err.Error())
			return
		}
	}
}

func savePost(db *sqlx.DB, req createPostRequest) error {
	const query = `
		INSERT INTO
			post
		(
			title,
			subtitle,
			author,
			author_url,
			publish_date,
			image_url,
			featured,
			content
		)
		VALUES
		(
			?, 
			?,
			?,
			CONCAT('static/images/', ?),
			?,
			CONCAT('static/images/', ?),
			?,
			?
		)
	`
 
	_, err := db.Exec(query, req.Title, req.Subtitle, req.AuthorName, req.AuthorImgName, req.Date, req.PostImgName, 0, req.Content) // Сами данные передаются через аргументы к ф-ии Exec
	return err
 }
 