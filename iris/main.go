package main

import (
	"sync"

	"github.com/kataras/iris/v12"
	"github.com/kataras/iris/v12/middleware/basicauth"
	"github.com/kataras/iris/v12/x/errors"
)

var (
	db = make(map[string]string)
	mu sync.RWMutex // protects db.
)

func newApplication() *iris.Application {
	app := iris.New()

	// Ping test.
	app.Get("/ping", func(ctx iris.Context) {
		ctx.WriteString("pong")
	})

	// Get user value.
	app.Get("/user/{name}", func(ctx iris.Context) {
		user := ctx.Params().Get("name")

		mu.RLock()
		value, ok := db[user]
		mu.RUnlock()
		if !ok {
			errors.NotFound.Message(ctx, "user not found")
			return
		}

		ctx.JSON(iris.Map{"user": user, "value": value})
	})

	// Authorized group of routes (aka Party) using the basicauth middleware.
	// Same as:
	// authorized := app.Party("/")
	// authorized.Use(basicauth.Default(map[string]string{
	//	  "foo":  "bar",
	//	  "manu": "123",
	//}))
	authorized := app.Party("/", basicauth.Default(map[string]string{
		"foo":  "bar", // user:foo password:bar
		"manu": "123", // user:manu password:123
	}))

	/* Example curl for /admin with basicauth header
	   Zm9vOmJhcg== is base64("foo:bar")
		curl -X POST \
	  	http://localhost:8080/admin \
	  	-H 'authorization: Basic Zm9vOmJhcg==' \
	  	-H 'content-type: application/json' \
	  	-d '{"value":"bar"}'
	*/
	authorized.Post("/admin", func(ctx iris.Context) {
		// Parse request body as JSON.
		var json struct {
			Value string `json:"value"`
		}
		err := ctx.ReadJSON(&json)
		if err != nil {
			errors.InvalidArgument.Err(ctx, err)
			return
		}

		if json.Value == "" {
			// Need a validator? Check: https://github.com/kataras/iris/blob/master/_examples/request-body/read-json-struct-validation/main.go
			errors.InvalidArgument.Message(ctx, "value is required")
			return
		}

		// Get the authenticated username.
		// Same as: username, password, ok := ctx.Request().BasicAuth()
		user, _ := ctx.User().GetUsername()

		// Store the user.
		mu.Lock()
		db[user] = json.Value
		mu.Unlock()

		ctx.JSON(iris.Map{"status": "ok"})
	})

	return app
}

func main() {
	app := newApplication()
	// Listen and serve at: 0.0.0.0:8080.
	app.Listen(":8080")
}
