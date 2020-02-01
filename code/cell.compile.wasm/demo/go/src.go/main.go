// https://tutorialedge.net/golang/go-webassembly-tutorial/#registering-functions

package main

import (
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

func registerCallbacks() {
	js.Global().Set("add", js.FuncOf(add))
	js.Global().Set("subtract", js.FuncOf(subtract))
}

func main() {
	c := make(chan struct{}, 0)

	println("Go WebAssembly Initialized")
	registerCallbacks()

	<-c
}
