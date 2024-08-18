package main

import (
	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
)

const initialRacers = `613	Ola
130	Per
193	Joakim
567	Kim Fredrik
195	Henrik
387	Bjørn
308	Emil
318	Knut
812	Hans
666	Nils`
const initialData = `130	812	666	318	195	613	193	567	387	308
130	812	666	318	195	613	193	567	308	387
130	812	666	318	195	613	193	567	308	387
130	812	666	318	195	613	193	567	308
812	130	666	318	195	613	193	567
812	308	130	666	318	195
812	613	193	567	130	308	318	666	195
812	613	193	130	567	318	308	666
812	195	130	613	193	567	318	308	666
812	195	130	613	193	567	318	666
812	308	130	195	613	193	567	318	666`

func main() {
	a := app.New()
	w := a.NewWindow("Hello")
	w.SetTitle("Crossracer")
	w.Resize(fyne.NewSize(1400, 800))

	racersField := createTextfield("Racers", 10, initialRacers)
	inputField := createTextfield("Input", 30, initialData)
	debugField := createTextfield("Debug", 30, "")
	outputField := createTextfield("Output", 30, "")

	content := container.NewVBox(
		container.NewHBox(createIcon().entity),
		racersField.container,
		container.NewGridWithColumns(3,
			inputField.container,
			debugField.container,
			outputField.container,
		),
		container.NewHBox(layout.NewSpacer(), createIcon().entity),
		// Racers,
		// INPUTS
		// Icon
	)
	w.SetContent(content)

	racers := parseRacers(racersField.entity.Text)
	ordering := findOrdering(inputField.entity.Text)
	output := updateOutput(*racers, ordering)
	debugField.entity.SetText(output.debug)
	outputField.entity.SetText(output.output)

	racersField.entity.OnChanged = func(newValue string) {
		racers = parseRacers(newValue)
		newOutput := updateOutput(*racers, ordering)
		debugField.entity.SetText(newOutput.debug)
		outputField.entity.SetText(newOutput.output)
	}
	inputField.entity.OnChanged = func(newValue string) {
		ordering = findOrdering(newValue)
		newOutput := updateOutput(*racers, ordering)
		debugField.entity.SetText(newOutput.debug)
		outputField.entity.SetText(newOutput.output)
	}

	w.ShowAndRun()
}
