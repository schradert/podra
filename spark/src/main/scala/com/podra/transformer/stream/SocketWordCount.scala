package com.podra.transformer.stream

import java.util.Locale
import java.time.Instant

import org.apache.flink.streaming.api.scala._
import org.scalactic.TypeCheckedTripleEquals._
import org.apache.flink.streaming.api.functions.source.SourceFunction
import org.apache.flink.streaming.api.functions.sink.SinkFunction
import org.apache.flink.api.common.JobExecutionResult
import org.apache.flink.streaming.api.functions.co.RichCoFlatMapFunction
import org.apache.flink.configuration.Configuration
import org.apache.flink.api.common.state.ValueState
import org.apache.flink.api.common.state.ValueStateDescriptor
import org.apache.flink.util.Collector
import com.podra.Utils
import org.apache.flink.api.common.functions.FilterFunction
import org.apache.flink.api.common.eventtime.WatermarkStrategy
import java.time.Duration
import scala.concurrent.duration._
import org.apache.flink.api.common.eventtime.SerializableTimestampAssigner
import org.apache.flink.streaming.api.functions.KeyedProcessFunction
import org.apache.flink.streaming.api.windowing.assigners.TumblingEventTimeWindows
import org.apache.flink.streaming.api.windowing.time.Time
import org.apache.flink.streaming.api.scala.function.ProcessWindowFunction
import org.apache.flink.streaming.api.windowing.windows.TimeWindow

/** Usage:
  * {{{
  *   SocketTextStreamWordCount <hostname> <port>
  * }}}
  */
object SocketWordCount {

    /** We allow terminating early with a 'return' here because essential
      * arguments must be defined on the command line.
      * @param args
      */
    @SuppressWarnings(Array("org.wartremover.warts.Return"))
    def main(args: Array[String]): Unit = {
        if (args.length === 2) {
            System.err.println("USAGE:\nSocketWordCount <hostname> <port>")
            return
        }

        // extract arguments
        val hostname = args(0)
        val port = args(1).toInt

        // create environment
        val env = StreamExecutionEnvironment.getExecutionEnvironment

        // Create names & ages streams by mapping inputs to objects
        val text = env.socketTextStream(hostname, port)
        
        @annotation.nowarn("msg=unused")
        val counts = text
            .flatMap {
                _   .toLowerCase(Locale.US).split("\\W+")
                    .filter { _.nonEmpty }
            }
            .map((_, 1))
            .keyBy(_._1)
            .sum(1)
        print(counts)

        val l = List(1, 2, 3).map((_, 1))
        println(l)

        val result = env.execute("SocketTextStreamWordCount")
        println(result)

    }
}

final case class TaxiRide(
    rideId: Long, 
    taxiId: Long, 
    driverId: Long, 
    isStart: Boolean,
    eventTime: Instant,
    startLon: Float,
    startLat: Float,
    endLon: Float,
    endLat: Float,
    passengerCnt: Short,
)
final case class TaxiFare(
    rideId: Long, 
    taxiId: Long, 
    driverId: Long, 
    startTime: Instant, 
    paymentType: String, 
    tip: Float, 
    tolls: Float, 
    totalFare: Float,
)
final case class RideAndFare(
    ride: TaxiRide,
    fare: TaxiFare
)

object EnrichRideFare {

    class JobEnrich(
        rideSource: SourceFunction[TaxiRide],
        fareSource: SourceFunction[TaxiFare],
        sink: SinkFunction[RideAndFare]
    ) {
        @throws[Exception]
        @annotation.nowarn("msg=unused")
        def execute(): JobExecutionResult = {
            val env = StreamExecutionEnvironment.getExecutionEnvironment

            val rides = env
                .addSource(rideSource)
                .filter(_.isStart)
                .keyBy(_.rideId)
            
            val fares = env
                .addSource(fareSource)
                .keyBy(_.rideId)
            
            Utils.discard {
                rides
                    .connect(fares)
                    .flatMap(new EnrichFunction)
                    .addSink(sink)
            }

            env.execute()
        }
    }

    @SuppressWarnings(Array("org.wartremover.warts.Var"))
    class EnrichFunction() extends RichCoFlatMapFunction[
        TaxiRide, TaxiFare, RideAndFare
    ] {

        private var rideState: ValueState[TaxiRide] = openRideState(None)
        private var fareState: ValueState[TaxiFare] = openFareState(None)

        private def openRideState(
            parameters: Option[Configuration],
        ): ValueState[TaxiRide] = {
            print(parameters)
            getRuntimeContext.getState(
                new ValueStateDescriptor[TaxiRide](
                    "saved ride", classOf[TaxiRide]
                )
            )
        }

        private def openFareState(
            parameters: Option[Configuration],
        ): ValueState[TaxiFare] = {
            print(parameters)
            getRuntimeContext.getState(
                new ValueStateDescriptor[TaxiFare](
                    "saved fare", classOf[TaxiFare]
                )
            )
        }

        override def open(parameters: Configuration): Unit = {
            rideState = openRideState(Some(parameters))
            fareState = openFareState(Some(parameters))
        }

        override def flatMap1(ride: TaxiRide, out: Collector[RideAndFare]): Unit = {
            Option(fareState.value) match {
                case Some(fare) => {
                    fareState.clear()
                    out.collect(new RideAndFare(ride, fare))
                }
                case None => rideState.update(ride)
            }
        }

        override def flatMap2(fare: TaxiFare, out: Collector[RideAndFare]): Unit = {
            Option(rideState.value) match {
                case Some(ride) => {
                    rideState.clear()
                    out.collect(new RideAndFare(ride, fare))
                }
                case None => fareState.update(fare)
            }
        }
    }
}

object FilterLongRides {
    
    class JobFilter(
        source: SourceFunction[TaxiRide],
        sink: SinkFunction[Long]
    ) {
        @throws[Exception]
        @annotation.nowarn("msg=unused")
        def execute(): JobExecutionResult = {
            val env = StreamExecutionEnvironment.getExecutionEnvironment

            val watermarkStrategy = WatermarkStrategy
                .forBoundedOutOfOrderness[TaxiRide](Duration.ofSeconds(60))
                .withTimestampAssigner(
                    new SerializableTimestampAssigner[TaxiRide] {
                        override def extractTimestamp(
                            ride: TaxiRide,
                            streamRecordTimestamp: Long
                        ): Long = ride.eventTime.toEpochMilli
                    }
                )

            Utils.discard {
                env
                    .addSource(source)
                    .assignTimestampsAndWatermarks(watermarkStrategy)
                    .keyBy(_.rideId)
                    .process(new AlertFunction)
                    .addSink(sink)
            }

            env.execute()
        }
    }

    @SuppressWarnings(Array("org.wartremover.warts.Var"))
    class AlertFunction extends KeyedProcessFunction[Long, TaxiRide, Long] {
        
        private var rideState: ValueState[TaxiRide] = openRideState(None)

        private def openRideState(
            parameters: Option[Configuration],
        ): ValueState[TaxiRide] = {
            print(parameters)
            getRuntimeContext.getState(
                new ValueStateDescriptor[TaxiRide](
                    "ride event", classOf[TaxiRide]
                )
            )
        }

        override def open(parameters: Configuration): Unit = {
            rideState = openRideState(Some(parameters))
        }

        override def processElement(
            ride: TaxiRide,
            ctx: KeyedProcessFunction[Long, TaxiRide, Long]#Context,
            out: Collector[Long]
        ): Unit = {
            Option(rideState.value) match {
                case Some(firstRideEvent) => {
                    if (ride.isStart && rideTooLong(ride, firstRideEvent)) {
                        out.collect(ride.rideId)
                    } else {
                        // first ride was START, so there's a timer unless fired
                        ctx.timerService.deleteEventTimeTimer(
                            getTimerTime(firstRideEvent)
                        )
                        // if ride has gone too long but timer didn't fire...
                        if (rideTooLong(firstRideEvent, ride)) {
                            out.collect(ride.rideId)
                        }
                    }

                    // both events seen so clear state (can leak if missing)
                    rideState.clear()
                }
                case None => {
                    // remember the first event
                    rideState.update(ride)

                    if (ride.isStart) {

                        // timer for rides that've gone too long (ie no END)
                        ctx.timerService.registerEventTimeTimer(
                            getTimerTime(ride)
                        )
                    }
                }
            }
        }

        override def onTimer(
            timestamp: Long, 
            ctx: KeyedProcessFunction[Long, TaxiRide, Long]#OnTimerContext, 
            out: Collector[Long]
        ): Unit = {
            // timer only fires if ride was too long
            out.collect(rideState.value.rideId)
            // prevents duplicate alerts, but will leak state if END comes
            rideState.clear()
        }

        private def rideTooLong(
            startEvent: TaxiRide,
            endEvent: TaxiRide,
        ): Boolean = {
            Duration
                .between(startEvent.eventTime, endEvent.eventTime)
                .compareTo(Duration.ofHours(2)) > 0
        }

        private def getTimerTime(ride: TaxiRide): Long = {
            ride.eventTime.toEpochMilli + 2.hours.toMillis
        }
    }
}

object CleanseRideOutsideNYC {

    class JobCleanse(
        source: SourceFunction[TaxiRide],
        sink: SinkFunction[TaxiRide]
    ) {
        @throws[Exception]
        @annotation.nowarn("msg=unused")
        def execute(): JobExecutionResult = {
            val env = StreamExecutionEnvironment.getExecutionEnvironment

            Utils.discard {
                env
                    .addSource(source)
                    .filter(new NYCFilter)
                    .addSink(sink)
            }

            env.execute()
        }
    }

    class NYCFilter extends FilterFunction[TaxiRide] {
        override def filter(ride: TaxiRide): Boolean = {
            true
        }
    }
}

object HighestHourlyTips {
    class JobHourlyTips(
        source: SourceFunction[TaxiFare],
        sink: SinkFunction[(Long, Long, Float)]
    ) {
        @throws[Exception]
        @annotation.nowarn("msg=unused")
        def execute(): JobExecutionResult = {
            val env = StreamExecutionEnvironment.getExecutionEnvironment

            // fare streams are in order so MONOTONOUS
            val watermarkStrategy = WatermarkStrategy
                .forMonotonousTimestamps[TaxiFare]()
                .withTimestampAssigner(
                    new SerializableTimestampAssigner[TaxiFare] {
                        override def extractTimestamp(
                            fare: TaxiFare,
                            streamRecordTimestamp: Long
                        ): Long = fare.startTime.toEpochMilli
                    }
                )

            Utils.discard {
                env
                    .addSource(source)
                    .assignTimestampsAndWatermarks(watermarkStrategy)
                    .map((fare: TaxiFare) => (fare.driverId, fare.tip))
                    .keyBy(_._1)
                    .window(TumblingEventTimeWindows.of(Time.hours(1)))
                    .reduce (
                        (fare1: (Long, Float), fare2: (Long, Float)) => {
                            (fare1._1, fare1._2 + fare2._2)
                        },
                        new WrapWithWindowInfo
                    )
                    .windowAll(TumblingEventTimeWindows.of(Time.hours(1)))
                    .maxBy(2)
                    .addSink(sink)
            }

            env.execute()
        }
    }

    class WrapWithWindowInfo() extends ProcessWindowFunction[
        (Long, Float), (Long, Long, Float), Long, TimeWindow
    ] {
        override def process(
            key: Long, 
            ctx: Context, 
            elements: Iterable[(Long, Float)], 
            out: Collector[(Long, Long, Float)]
        ): Unit = {
            val tipSum = elements.iterator.next()._2
            out.collect((ctx.window.getEnd, key, tipSum))
        }
    }
}