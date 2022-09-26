package main

import (
	"testing"

	"github.com/kataras/iris/v12/httptest"
)

func TestApplication(t *testing.T) {
	app := newApplication()

	test := httptest.New(t, app, httptest.Debug(true))
	// Test ping handler.
	test.GET("/ping").Expect().Body().Equal("pong")

	// Test get /user handler when no users are stored to the database yet.
	test.GET("/user/foo").Expect().Status(httptest.StatusNotFound).JSON().
		Path("$.message").String().Equal("user not found")

	// Test authorized route with invalid credentials.
	test.POST("/admin").WithBasicAuth("foo", "invalid_password").Expect().Status(httptest.StatusUnauthorized)

	// Test authorized route with valid credentials and store the authenticated user.
	test.POST("/admin").WithBasicAuth("foo", "bar").WithJSON(map[string]interface{}{
		"value": "kataras",
	}).Expect().Status(httptest.StatusOK).JSON().Equal(map[string]interface{}{"status": "ok"})

	// Test get /user handler with the "foo" user added.
	test.GET("/user/foo").Expect().Status(httptest.StatusOK).JSON().
		Equal(map[string]interface{}{"user": "foo", "value": "kataras"})
}
