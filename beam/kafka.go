package main

import (
	"context"
	"flag"
	"reflect"
	"time"

	"github.com/apache/beam/sdks/v2/go/pkg/beam"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/core/graph/window"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/io/pubsubio"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/io/xlang/kafkaio"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/log"
	"github.com/apache/beam/sdks/v2/go/pkg/beam/x/beamx"
)

var (
	bootstrapServers = flag.String(
		"bootstrap_servers",
		"",
		"URL of Kafka cluster bootstrap servers accessible by runner.",
	)
	expansionAddr = flag.String(
		"expansion_addr",
		"",
		"Address of Expansion Service",
	)
	topic = flag.String(
		"topic",
		"kafka_taxirides_realtime",
		"Kafka topic to write to and read from.",
	)
)

func init() {
	beam.RegisterType(reflect.TypeOf((*LogFn)(nil)).Elem())
}

type LogFn struct{}

func (fn *LogFn) ProcessElement(ctx context.Context, elm []byte) {
	log.Infof(ctx, "Ride info: %v", string(elm))
}

func (fn *LogFn) FinishBundle() {
	time.Sleep(2 * time.Second)
}

func KVFn(elm []byte) ([]byte, []byte) {
	return []byte(""), elm
}

func Kafka() {
	flag.Parse()

	// hook & validate
	beam.Init()
	ctx := context.Background()
	if *expansionAddr == "" {
		log.Fatal(ctx, "No expansion address provided")
	}

	// assemble
	pipeline := beam.NewPipeline()
	scope := pipeline.Root()
	data := pubsubio.Read(
		scope, "pubsub-public-data", "taxirides-realtime", nil,
	)
	KVData := beam.ParDo(scope, KVFn, data)
	windowed := beam.WindowInto(
		scope, window.NewFixedWindows(15*time.Second), KVData,
	)
	kafkaio.Write(scope, *expansionAddr, *bootstrapServers, *topic, windowed)

	// kafka consumer to log elements received
	read := kafkaio.Read(
		scope, *expansionAddr, *bootstrapServers, []string{*topic},
	)
	vals := beam.DropKey(scope, read)
	beam.ParDo0(scope, &LogFn{}, vals)

	if err := beamx.Run(ctx, pipeline); err != nil {
		log.Fatalf(ctx, "Failed to execute job: %v", err)
	}
}
