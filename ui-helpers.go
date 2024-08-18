package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

type EntityWrapper[TEntitiy any] struct {
	entity    TEntitiy
	container *fyne.Container
}

func createIcon() *EntityWrapper[*canvas.Image] {
	img := canvas.NewImageFromFile("Icon.png")
	img.FillMode = canvas.ImageFillStretch
	img.SetMinSize(fyne.NewSize(112, 69))

	return &EntityWrapper[*canvas.Image]{
		entity:    img,
		container: nil,
	}
}

func createTextfield(text string, rowcount int, initialContent string) *EntityWrapper[*widget.Entry] {
	label := widget.NewLabel(text)

	input := widget.NewEntry()
	input.MultiLine = true
	input.SetMinRowsVisible(rowcount)
	input.SetText(initialContent)

	wrapper := container.NewVBox(label, input)

	return &EntityWrapper[*widget.Entry]{
		entity:    input,
		container: wrapper,
	}
}
