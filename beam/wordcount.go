package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/apache/beam/sdks/v2/go/pkg/beam"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/io/textio"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/transforms/stats"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/x/beamx"

	_ "github.com/apache/beam/sdks/v2/go/pkg/beam/io/filesystem/gcs"
	_ "github.com/apache/beam/sdks/v2/go/pkg/beam/io/filesystem/local"
)

var (
	empty      = beam.NewCounter("extract", "emptyLines")
	smallWords = beam.NewCounter("extract", "smallWords")
	lineLen    = beam.NewDistribution("extract", "lineLenDistro")

	input = flag.String(
		"input",
		"gs://apache-beam-samples/shakespeare/kinglear.txt",
		"File(s) to read.",
	)
	output          = flag.String("output", "", "Output file (required).")
	smallWordLength = flag.Int("small_word_length", 9, "min. length (9)")

	wordRE = regexp.MustCompile(`[a-zA-Z]+('[a-z])?`)
)

// LIFECYCLE METHODS
func init() {
	beam.RegisterFunction(FormatFn)
}

func FormatFn(word string, count int) string {
	return fmt.Sprintf("%s: %v", word, count)
}

type ExtractFn struct {
	SmallWordLength int `json:"smallWordLength"`
}

func (fn *ExtractFn) ProcessElement(
	ctx context.Context,
	line string,
	emit func(string),
) {
	lineLen.Update(ctx, int64(len(line)))
	if len(strings.TrimSpace(line)) == 0 {
		empty.Inc(ctx, 1)
	}
	for _, word := range wordRE.FindAllString(line, -1) {
		if len(word) < fn.SmallWordLength {
			smallWords.Inc(ctx, 1)
		}
		emit(word)
	}
}

// composite PTransform (enforced during pipeline construction)
func CountWords(scope beam.Scope, lines beam.PCollection) beam.PCollection {
	scope = scope.Scope("CountWords")

	words := beam.ParDo(
		scope,
		&ExtractFn{SmallWordLength: *smallWordLength},
		lines,
	)
	counts := stats.Count(scope, words)
	return counts
}

func WordCount() {
	flag.Parse()

	// hook & validate
	beam.Init()
	if *output == "" {
		log.Fatal("No output provided")
	}

	// assemble
	pipeline := beam.NewPipeline()
	scope := pipeline.Root()
	lines := textio.Read(scope, *input)
	counts := CountWords(scope, lines)
	formatted := beam.ParDo(scope, FormatFn, counts)
	textio.Write(scope, *output, formatted)

	// Run the pipeline on the direct runner.
	// direct.Execute(context.Background(), pipeline)
	err := beamx.Run(context.Background(), pipeline)
	if err != nil {
		log.Fatalf("Failed to execute job: %v", err)
	}
}
