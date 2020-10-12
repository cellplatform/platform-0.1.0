// https://tutorialedge.net/golang/go-webassembly-tutorial/#registering-functions

package main

import (
	"encoding/json"
	"syscall/js"
)

func add(this js.Value, i []js.Value) interface{} {
	res := int(0)
	index := 0
	for _, value := range i {
		res = res + value.Int()
		index++
	}
	return res
}

func subtract(this js.Value, i []js.Value) interface{} {
	res := int(i[0].Int())
	index := 0
	for _, value := range i {
		if index > 0 {
			res = res - value.Int()
		}
		index++
	}
	return res
}

func obj(this js.Value, input []js.Value) interface{} {

	// println(input[0].String())
	// bytes := []byte(input[0].String())
	// type Item struct {
	// 	msg string
	// }

	// var items []Item
	// json.Unmarshal(bytes, &items)

	// println(">>", string(items[0]))

	// z, _ := json.Marshal(items)
	// return string(z)

	type Box struct {
		Width  int
		Height int
		Color  string
		Open   bool
	}

	// Create an instance of the Box struct.
	box := Box{
		Width:  10,
		Height: 20,
		Color:  input[0].String(),
		Open:   false,
	}

	// Create JSON from the instance data.
	b, _ := json.Marshal(box)
	return string(b)
}

func registerCallbacks() {
	js.Global().Set("add", js.FuncOf(add))
	js.Global().Set("subtract", js.FuncOf(subtract))
	js.Global().Set("obj", js.FuncOf(obj))
}

func main() {
	c := make(chan struct{}, 0)

	println("Go WebAssembly Initialized")
	registerCallbacks()

	<-c
}
